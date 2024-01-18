import React from 'react';
import Html from '../src/Html.tsx';
import { baseUrl } from '../config.ts';

export const path = '/';

export default () => (
  <Html title='Scaffold' canonicalUrl={`${baseUrl}${path}`}>
    <div className='h-16 self-stretch flex flex-row bg-dark gap-8 p-2'>
      <a href='/'>
        <img
          className='block h-full'
          src='/scaffold_logo_horizontal_white.png'
        />
      </a>

      <div className='flex-1'></div>
    </div>

    <div className='flex-1'></div>

    <h3 className='text-white text-4xl'>
      Coming soon!
    </h3>

    <div className='flex-1'></div>
  </Html>
);
