import React from 'react';
import Html from '../src/Html.tsx';
import { baseUrl } from '../config.ts';

import { blog as page } from '../src/pages.ts';
export { page };

export default () => (
  <Html title='Scaffold - blog' canonicalUrl={`${baseUrl}${page.path}`}>
    Blog
  </Html>
);
