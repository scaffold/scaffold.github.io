import React from 'react';
import Home from '../src/Home.tsx';
import Html from '../src/Html.tsx';
import { baseUrl } from '../config.ts';

export const path = '/';

export default () => (
  <Html title='Scaffold - Home' canonicalUrl={`${baseUrl}${path}`}>
    <Home />
  </Html>
);
