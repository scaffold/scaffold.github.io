import React from 'react';
import Html from '../src/Html.tsx';
import { baseUrl } from '../config.ts';

import { colors as page } from '../src/pages.ts';
export { page };

export default () => (
  <Html title='Scaffold' canonicalUrl={`${baseUrl}${page.path}`}>
    <div style={{ width: '40rem', backgroundColor: 'white', padding: '2rem' }}>
      <div
        style={{ height: '4rem', backgroundColor: '#15079C', color: 'white' }}
      >
        Navy Blue Clarity, Possibility, Speed, #15079C
      </div>
      <div
        style={{ height: '4rem', backgroundColor: '#8CB3F2', color: 'black' }}
      >
        Sky Blue Pioneer, Leader, Creative, #8CB3F2
      </div>
      <div
        style={{ height: '4rem', backgroundColor: '#EEF0AD', color: 'black' }}
      >
        Pale Yellow Collaborator, Bridge, Developer, #EEF0AD
      </div>
      <div
        style={{ height: '4rem', backgroundColor: '#D12D0E', color: 'black' }}
      >
        Burnt Orange Trust, Foundation, Expert, #D12D0E
      </div>
      <div
        style={{ height: '4rem', backgroundColor: '#372733', color: 'white' }}
      >
        #372733
      </div>
    </div>
  </Html>
);
