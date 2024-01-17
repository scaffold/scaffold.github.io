import React from 'react';

export default () => (
  <div className='flex flex-row self-stretch text-center my-16'>
    <div className='flex-1 bg-sky text-night'>
      <h2 className='text-balance text-5xl my-10'>The web needs servers.</h2>
      <h3 className='text-balance text-3xl my-10'>Right?</h3>
    </div>
    <div className='flex-1'>
      <h2 className='text-balance text-5xl my-10'>Nope.</h2>
      <h3 className='text-balance text-3xl my-10'>
        We can move it all to the browser.
      </h3>
    </div>
  </div>
);
