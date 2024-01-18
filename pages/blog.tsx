import React from 'react';
import Html from '../src/Html.tsx';
import { baseUrl } from '../config.ts';

export const path = '/blog.html';

export default () => (
  <Html title='Scaffold - blog' canonicalUrl={`${baseUrl}${path}`}>
    Blog
  </Html>
);
