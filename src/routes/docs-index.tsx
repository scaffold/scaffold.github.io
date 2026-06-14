import { Navigate } from 'react-router';

// /docs is client-only (excluded from prerender); redirect to the first page.
export default function DocsIndex() {
  return <Navigate to="/docs/getting-started" replace />;
}
