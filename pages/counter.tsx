import React from 'react';
import Html from '../src/Html.tsx';
import { baseUrl } from '../config.ts';
import Counter from '../src/Counter.tsx';
import SblProvider from '../src/SblProvider.tsx';

import { counter as page } from '../src/pages.ts';
export { page };

export default () => (
  <Html
    title='Scaffold - counter example'
    canonicalUrl={`${baseUrl}${page.path}`}
  >
    <SblProvider>
      <Counter />
    </SblProvider>
  </Html>
);
