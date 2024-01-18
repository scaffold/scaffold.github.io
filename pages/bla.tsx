import React from 'react';
import Html from '../src/Html.tsx';
import { baseUrl } from '../config.ts';

export const path = '/bla/test.html';

export default () => (
  <Html title='Scaffold - Bla' canonicalUrl={`${baseUrl}${path}`}>
    Why hello there
  </Html>
);
