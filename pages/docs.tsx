import React from 'react';
import Html from '../src/Html.tsx';
import { baseUrl } from '../config.ts';

export const path = '/docs.html';

export default () => (
  <Html title='Scaffold - documentation' canonicalUrl={`${baseUrl}${path}`}>
    Docs
  </Html>
);
