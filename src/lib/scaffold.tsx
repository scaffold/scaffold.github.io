/**
 * The site's shared Scaffold node.
 *
 * Held at module scope and handed to the tree by <ScaffoldProvider> (mounted in
 * root.tsx), so anything can read it with useScaffold() / useScaffoldMetrics()
 * without prop-drilling or booting a second node.
 *
 * It starts lazily — the first hook call or start() boots it, so pages that show
 * nothing from it never pay for one. There's one node per document: it survives
 * client-side navigation (every in-app <Link> is a SPA transition), and dies on
 * a hard reload or in a new tab.
 *
 * Everything from scaffold.io is loaded with dynamic imports, which keeps it out
 * of the Node prerender pass (react-router.config.ts has ssr: false + prerender)
 * and out of every page's initial bundle. Adding a static `import … from
 * 'scaffold.io/…'` up here would undo both.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import type { Metrics } from 'scaffold.io/roles/MetricsRole.ts';
import type { Scaffold } from 'scaffold.io/Scaffold.ts';

export type { Metrics };

// ---- Module-level singleton --------------------------------------------

let node: Scaffold | null = null;
let booting: Promise<Scaffold> | null = null;
let metrics: Metrics | null = null;

const listeners = new Set<() => void>();

function emit() {
  for (const listener of [...listeners]) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

async function boot(): Promise<Scaffold> {
  const [{ Scaffold, makeBrowserConfig }, { MetricsRole }, { WebsocketClientTransport }] =
    await Promise.all([
      import('scaffold.io'),
      import('scaffold.io/roles/MetricsRole.ts'),
      import('scaffold.io/plugins/WebsocketClientTransport.ts'),
    ]);

  const config = makeBrowserConfig();
  const scaffold = new Scaffold({
    ...config,
    roles: [...(config.roles ?? []), MetricsRole],
  });

  scaffold.startTransport(new WebsocketClientTransport(), (signal) => {
    console.log(`WebSocket client announce: ${signal}`);
  });
  scaffold.connect('ws://127.0.0.1:8314/');

  const ctx = scaffold.getContext();

  ctx.get(MetricsRole).onMetrics((m) => {
    metrics = m;
    emit();
  });

  node = scaffold;
  emit();

  // Dev affordance: poke at the live node from the browser console.
  if (import.meta.env.DEV) {
    (globalThis as { scaffold?: Scaffold }).scaffold = scaffold;
  }

  return scaffold;
}

/**
 * Start the shared node, or return the one already starting/started. Safe to
 * call repeatedly; the browser only ever gets one node. Never call during
 * render on the server — it touches browser-only APIs.
 */
export function startScaffold(): Promise<Scaffold> {
  return (booting ??= boot());
}

/** The shared node once it's up, or null. Non-reactive; for use outside React. */
export function getScaffold(): Scaffold | null {
  return node;
}

// ---- React bindings ------------------------------------------------------

interface ScaffoldContextValue {
  /** The node, once it's up. */
  scaffold: Scaffold | null;
  /** Stable across renders — safe as a bare useEffect dependency. */
  start: () => Promise<Scaffold>;
}

const ScaffoldContext = createContext<ScaffoldContextValue>({
  scaffold: null,
  start: startScaffold,
});

/**
 * Owns the node's lifecycle and publishes it to the tree. Deliberately does NOT
 * boot on mount: the node costs a WASM runtime, a genesis load and a socket, and
 * most pages never show a figure from it. It starts the first time a component
 * asks — useScaffold() / useScaffoldMetrics(), or start() by hand — so a visitor
 * reading the docs never pays for one.
 *
 * Metrics are read straight from the module store by useScaffoldMetrics(), so a
 * metrics tick re-renders only the components that display one, not the app.
 */
export function ScaffoldProvider({ children }: { children: ReactNode }) {
  const [scaffold, setScaffold] = useState<Scaffold | null>(node);

  const start = useCallback(() => {
    const booted = startScaffold();
    booted.then(setScaffold, (err) =>
      console.error('Scaffold node failed to start:', err),
    );
    return booted;
  }, []);

  const value = useMemo(() => ({ scaffold, start }), [scaffold, start]);

  return (
    <ScaffoldContext.Provider value={value}>
      {children}
    </ScaffoldContext.Provider>
  );
}

/**
 * Start the shared node on demand. The callback is stable, and starting twice is
 * a no-op — use this when the node is wanted on an event (a button, a route
 * transition) rather than on mount.
 */
export function useStartScaffold(): () => Promise<Scaffold> {
  return useContext(ScaffoldContext).start;
}

/**
 * Boots the shared node on mount and returns it, or null while it's still
 * starting (and during prerender). Calling this is what opts a page in.
 */
export function useScaffold(): Scaffold | null {
  const { scaffold, start } = useContext(ScaffoldContext);
  useEffect(() => void start(), [start]);
  return scaffold;
}

/**
 * The node's live metrics, or null until it has reported for the first time.
 * Boots the node on mount, like useScaffold(). Callers should render a
 * placeholder for null rather than substituting zeros — a zero is a claim about
 * the network, null just means "not measured yet".
 */
export function useScaffoldMetrics(): Metrics | null {
  const start = useStartScaffold();
  useEffect(() => void start(), [start]);
  return useSyncExternalStore(
    subscribe,
    () => metrics,
    () => null,
  );
}
