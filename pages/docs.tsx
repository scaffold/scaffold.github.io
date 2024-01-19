import React from 'react';
import Html from '../src/Html.tsx';
import { baseUrl } from '../config.ts';

import { docs as page } from '../src/pages.ts';
export { page };

export default () => (
  <Html
    title='Scaffold - documentation'
    canonicalUrl={`${baseUrl}${page.path}`}
  >
    Docs
  </Html>
);
