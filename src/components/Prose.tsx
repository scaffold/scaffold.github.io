import { useEffect, useRef } from 'react';

/** How long the button holds its "copied" checkmark. */
const RESET_MS = 1600;

async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // navigator.clipboard is undefined outside a secure context, which is how
    // the site looks when previewed over plain http on a phone on the LAN.
    const staging = document.createElement('textarea');
    staging.value = text;
    staging.setAttribute('readonly', '');
    staging.style.cssText = 'position:fixed;top:-9999px;opacity:0';
    document.body.append(staging);
    staging.select();
    try {
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      staging.remove();
    }
  }
}

/**
 * Renders a prerendered markdown body and wires up its code-block copy
 * buttons. The buttons are baked into the HTML by plugins/markdown.ts so they
 * survive prerendering, which means they can't carry React handlers — one
 * delegated listener on the article covers every block on the page.
 */
export function Prose({ html }: { html: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const timers = new Map<HTMLButtonElement, number>();

    async function onClick(event: MouseEvent) {
      const target = event.target as Element | null;
      const button = target?.closest<HTMLButtonElement>('button.code-copy');
      if (!button) return;

      if (!(await writeClipboard(button.dataset.copy ?? ''))) return;

      button.classList.add('copied');
      button.setAttribute('aria-label', 'Copied');
      clearTimeout(timers.get(button));
      timers.set(
        button,
        window.setTimeout(() => {
          button.classList.remove('copied');
          button.setAttribute('aria-label', 'Copy code');
          timers.delete(button);
        }, RESET_MS),
      );
    }

    root.addEventListener('click', onClick);
    return () => {
      root.removeEventListener('click', onClick);
      timers.forEach((id) => clearTimeout(id));
    };
  }, [html]);

  return <article ref={ref} className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
