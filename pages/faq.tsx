import React from 'react';
import Html from '../src/Html.tsx';
import { baseUrl } from '../config.ts';

import { faq as page } from '../src/pages.ts';
export { page };

export default () => (
  <Html title='Scaffold - FAQ' canonicalUrl={`${baseUrl}${page.path}`}>
    FAQ
  </Html>
);
