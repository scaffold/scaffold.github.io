import type { ReactNode } from 'react';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import type { LinksFunction, MetaFunction } from 'react-router';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { ScaffoldProvider } from './lib/scaffold';
import tokensHref from './styles/tokens.css?url';
import siteHref from './styles/site.css?url';

const FONTS =
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap';

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  { rel: 'stylesheet', href: FONTS },
  { rel: 'stylesheet', href: tokensHref },
  { rel: 'stylesheet', href: siteHref },
  { rel: 'icon', type: 'image/png', href: '/logomark-black.png' },
  {
    rel: 'alternate',
    type: 'application/rss+xml',
    title: 'Scaffold Blog',
    href: '/blog/feed.xml',
  },
];

export const meta: MetaFunction = () => [
  { title: 'Scaffold — Foundation for the distributed web' },
  {
    name: 'description',
    content:
      'Scaffold is a browser-native protocol that turns your users into infrastructure. WASM contracts, WebRTC transport, results verified by economic collateral.',
  },
  { property: 'og:type', content: 'website' },
  { property: 'og:url', content: 'https://scaffold.io' },
];

// Applies the persisted theme to <html> before paint, so there's no flash of
// the wrong mode. This intentionally diverges the DOM from the server markup
// (it adds data-mode), so the <html> element below sets suppressHydrationWarning
// — otherwise React 19 treats the added attribute as a hydration mismatch and
// discards the prerendered tree. suppressHydrationWarning scopes to this element's
// own attributes only, so real content mismatches are still reported.
const THEME_INIT = `document.documentElement.dataset.mode = localStorage.getItem('scaffold-mode') || 'light';`;

// Import map so the hero "Run" code's `import … from 'scaffold.io'` resolves in
// the browser. runCode.ts imports the snippet as a blob: URL, so the specifier
// is resolved natively by the page — it never goes through Vite, which is why a
// real network URL is needed here rather than a bundler alias.
//
// jsDelivr's `+esm` endpoint serves the package Rollup-bundled into a single
// self-contained module (the published `esm/mod.js` is a 158-file tree of
// relative imports, so linking it directly would cost 158 requests). Note that
// esm.sh does NOT work for this package: its entry references a ./Scaffold.mjs
// that 404s, tripping on the `.ts` keys in the package's exports map.
//
// __SCAFFOLD_VERSION__ is inlined by Vite from the scaffold.io dependency in
// package.json (see vite.config.ts), so the CDN build always matches the
// installed one.
const SCAFFOLD_IMPORTMAP = JSON.stringify({
  imports: {
    'scaffold.io': `https://cdn.jsdelivr.net/npm/scaffold.io@${__SCAFFOLD_VERSION__}/+esm`,
  },
});

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="raw" data-mode="light" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          type="importmap"
          dangerouslySetInnerHTML={{ __html: SCAFFOLD_IMPORTMAP }}
        />
        <Meta />
        <Links />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ScaffoldProvider>
      <Nav />
      <Outlet />
      <Footer />
    </ScaffoldProvider>
  );
}
