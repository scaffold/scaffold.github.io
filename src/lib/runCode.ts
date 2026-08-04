/**
 * Execute editor source as an ES module in the browser and capture its console
 * output.
 *
 * The source is wrapped in a Blob and imported natively, so top-level `await`
 * works and any bare imports (e.g. `@scaffold/core`) resolve through the
 * page-level import map injected in root.tsx.
 *
 * The source is TypeScript, so it's passed through Sucrase (lazy-loaded) to
 * strip type annotations before running — a light, type-checking-free transform
 * that preserves ES module syntax. (The full `typescript` package isn't needed.)
 */
export type LogLevel = 'log' | 'info' | 'warn' | 'error';

export interface RunResult {
  logs: { level: LogLevel; text: string }[];
  error?: string;
}

function format(v: unknown): string {
  if (typeof v === 'string') return v;
  if (v instanceof Error) return `${v.name}: ${v.message}`;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

export async function runModule(source: string): Promise<RunResult> {
  const logs: RunResult['logs'] = [];
  const levels: LogLevel[] = ['log', 'info', 'warn', 'error'];
  const consoleObj = console as unknown as Record<
    LogLevel,
    (...args: unknown[]) => void
  >;
  const original = {} as Record<LogLevel, (...args: unknown[]) => void>;

  for (const level of levels) {
    original[level] = consoleObj[level];
    consoleObj[level] = (...args: unknown[]) => {
      logs.push({ level, text: args.map(format).join(' ') });
      original[level](...args);
    };
  }

  let url: string | undefined;
  try {
    const { transform } = await import('sucrase');
    const js = transform(source, { transforms: ['typescript'] }).code;
    const blob = new Blob([js], { type: 'text/javascript' });
    url = URL.createObjectURL(blob);
    await import(/* @vite-ignore */ url);
    return { logs };
  } catch (e) {
    return {
      logs,
      error: e instanceof Error ? `${e.name}: ${e.message}` : String(e),
    };
  } finally {
    for (const level of levels) consoleObj[level] = original[level];
    if (url) URL.revokeObjectURL(url);
  }
}
