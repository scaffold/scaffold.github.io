import type { ReactNode } from 'react';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import type { LinksFunction, MetaFunction } from 'react-router';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import tokensHref from './styles/tokens.css?url';
import siteHref from './styles/site.css?url';

const FONTS =
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap';

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  { rel: 'stylesheet', href: FONTS },
  { rel: 'stylesheet', href: tokensHref },
  { rel: 'stylesheet', href: siteHref },
  { rel: 'icon', type: 'image/png', href: '/logomark-black.png' },
  { rel: 'alternate', type: 'application/rss+xml', title: 'Scaffold Blog', href: '/blog/feed.xml' },
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

// Applies the persisted theme before paint so there's no flash and no
// hydration mismatch (React doesn't render data-mode, so it won't reconcile it).
const THEME_INIT = `document.documentElement.dataset.mode = localStorage.getItem('scaffold-mode') || 'light';`;

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="raw">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
    <>
      <Nav />
      <Outlet />
      <Footer />
    </>
  );
}
