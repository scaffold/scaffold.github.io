import React from 'react';
import Html from '../src/Html.tsx';
import { baseUrl } from '../config.ts';
import Explorer from '../src/Explorer.tsx';

export const path = '/explorer.html';

export default () => (
  <Html title='Scaffold - graph explorer' canonicalUrl={`${baseUrl}${path}`}>
    <Explorer />
  </Html>
);
