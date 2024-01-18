import React from 'react';
import Html from '../src/Html.tsx';
import { baseUrl } from '../config.ts';

export const path = '/faq.html';

export default () => (
  <Html title='Scaffold - FAQ' canonicalUrl={`${baseUrl}${path}`}>
    FAQ
  </Html>
);
