import React from 'react';
import Html from '../src/Html.tsx';
import { baseUrl } from '../config.ts';

export const path = '/explorer.html';

export default () => (
  <Html title='Scaffold - graph explorer' canonicalUrl={`${baseUrl}${path}`}>
    Graph explorer
  </Html>
);
