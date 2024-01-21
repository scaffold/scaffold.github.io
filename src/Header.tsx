import React from 'react';
import ScaffoldLogo from './ScaffoldLogo.tsx';
import * as pages from './pages.ts';
import GithubLogo from './GithubLogo.tsx';

const enableLinks = true;

export default () => (
  <div
    style={{
      minHeight: '4rem',
      alignSelf: 'stretch',
      display: 'flex',
      flexDirection: 'row',
      backgroundColor: '#111',
      gap: '2rem',
      padding: '0.5rem',
    }}
  >
    <a href='/'>
      <ScaffoldLogo
        style={{ display: 'block', height: '100%' }}
        color='#8CB3F2'
      />
    </a>

    <div style={{ flex: '1' }}></div>

    <a
      href={pages.comingSoon.path}
      className='text-inherit no-underline m-4 self-center font-medium hover:underline'
    >
      Get started
    </a>

    {enableLinks
      ? (
        <>
          <a
            href={pages.explorer.path}
            className='text-inherit no-underline m-4 self-center font-medium hover:underline'
          >
            Explorer
          </a>
          <a
            href={pages.docs.path}
            className='text-inherit no-underline m-4 self-center font-medium hover:underline'
          >
            Docs
          </a>
          <a
            href={pages.faq.path}
            className='text-inherit no-underline m-4 self-center font-medium hover:underline'
          >
            FAQ
          </a>
          <a
            href='https://github.com/scaffold/scaffold'
            target='_blank'
          >
            <GithubLogo color='white' className='block m-3 h-6' />
          </a>

          <div></div>
        </>
      )
      : undefined}

    {/*Balance: ${Number(ctx.get(BalanceService).getLiquidBalance())}*/}
  </div>
);
