import type { MetaFunction } from 'react-router';
import { NotFound } from '../components/NotFound';
import { pageMeta } from '../lib/meta';

export const meta: MetaFunction = () => pageMeta('404 — Scaffold');

export default NotFound;
