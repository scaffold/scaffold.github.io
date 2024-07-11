import React from 'react';
import Html from '../src/Html.tsx';
import { baseUrl } from '../config.ts';
import Social from '../src/Social.tsx';
import SblProvider from '../src/SblProvider.tsx';

import { social as page } from '../src/pages.ts';
export { page };

export default () => (
  <Html
    title='Scaffold - social example'
    canonicalUrl={`${baseUrl}${page.path}`}
  >
    <SblProvider>
      <Social />
    </SblProvider>
  </Html>
);
