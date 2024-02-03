import React from 'react';
import Thrust from '../src/thrust/Thrust.tsx';
import Html from '../src/Html.tsx';
import { baseUrl } from '../config.ts';
import SblProvider from '../src/SblProvider.tsx';

import { thrust as page } from '../src/pages.ts';
export { page };

export default () => (
  <Html title='Thrust' canonicalUrl={`${baseUrl}${page.path}`}>
    <SblProvider>
      <Thrust />
    </SblProvider>
  </Html>
);
