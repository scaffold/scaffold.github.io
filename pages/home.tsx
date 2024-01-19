import React from 'react';
import Home from '../src/Home.tsx';
import Html from '../src/Html.tsx';
import { baseUrl } from '../config.ts';

import { home as page } from '../src/pages.ts';
export { page };

export default () => (
  <Html title='Scaffold' canonicalUrl={`${baseUrl}${page.path}`}>
    <Home />
  </Html>
);
