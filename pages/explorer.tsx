import React from 'react';
import Html from '../src/Html.tsx';
import { baseUrl } from '../config.ts';
import Explorer from '../src/Explorer.tsx';
import SblProvider from '../src/SblProvider.tsx';

import { explorer as page } from '../src/pages.ts';
export { page };

export default () => (
  <Html
    title='Scaffold - graph explorer'
    canonicalUrl={`${baseUrl}${page.path}`}
  >
    <SblProvider>
      <Explorer />
    </SblProvider>
  </Html>
);
