import React from 'react';
import SplashHeader from './sections/SplashHeader.tsx';
import CodeExample from './sections/CodeExample.tsx';
import Nope from './sections/Nope.tsx';
import FeatureCard from './sections/FeatureCard.tsx';
import ScaffoldLogo from './ScaffoldLogo.tsx';
import { path as comingSoonPath } from '../pages/coming_soon.tsx';
import { path as explorerPath } from '../pages/explorer.tsx';
import { path as docsPath } from '../pages/docs.tsx';
import { path as faqPath } from '../pages/faq.tsx';

const enableLinks = false;

export default () => (
  <>
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
        href={comingSoonPath}
        className='text-inherit no-underline m-4 self-center font-medium hover:underline'
      >
        Get started
      </a>

      {enableLinks
        ? (
          <>
            <a
              href={explorerPath}
              className='text-inherit no-underline m-4 self-center font-medium hover:underline'
            >
              Explorer
            </a>
            <a
              href={docsPath}
              className='text-inherit no-underline m-4 self-center font-medium hover:underline'
            >
              Docs
            </a>
            <a
              href={faqPath}
              className='text-inherit no-underline m-4 self-center font-medium hover:underline'
            >
              FAQ
            </a>
            <a
              href='https://github.com/scaffold/scaffold'
              target='_blank'
              className='text-inherit no-underline m-4 self-center font-medium hover:underline'
            >
              Github
            </a>

            <div></div>
          </>
        )
        : undefined}

      {/*Balance: ${Number(ctx.get(BalanceService).getLiquidBalance())}*/}
    </div>

    <SplashHeader />
    <CodeExample />
    <Nope />

    <FeatureCard title='Why?'>
      We created Scaffold to eliminate the hosting-related obstacles to building
      online services/platforms (commercial, social, multiplayer gaming, etc.).
      Traditional centralized hosting often demands significant financial
      resources, resulting in the need for ads or monetization, and in many
      cases even that is not enough (see{' '}
      <a
        href='https://en.wikipedia.org/wiki/Ello_(social_network)'
        target='_blank'
      >
        Ello
      </a>{' '}
      or{' '}
      <a href='https://en.wikipedia.org/wiki/Flattr' target='_blank'>Flattr</a>
      {' '}
      for recent examples). By moving the cloud to the client, as long as there
      are users, there is service.
    </FeatureCard>

    <FeatureCard title='How does it work?'>
      <ol className='list-disc pl-3'>
        <li>
          Scaffold is a TS library that replaces{' '}
          <a
            href='https://developer.mozilla.org/en-US/docs/Web/API/fetch'
            target='_blank'
          >
            <code className='leading-none'>fetch()</code>
          </a>. It connects to other users transparently using WebRTC and
          WebSockets.
        </li>
        <li>
          Your users' browsers trade compute power with each other and the
          entire Scaffold network, by running WASM lambdas inside web workers.
        </li>
        <li>
          Responses are transparently accompanied by collateral, which serves to
          incentivize verification and disincentivizes deception.
        </li>
        <li>
          Collateral is implemented by a transaction layer, reaching consensus
          as further work continues to be done.
        </li>
      </ol>
    </FeatureCard>

    <FeatureCard title='Static data'>
      Scaffold serves static data in its sleep. Peers compete to serve your
      users first and win a posted incentive. Static data verifies easily, by
      hash, signature, or even something more intricate if desired.
      {/* Show code. Run. */}
    </FeatureCard>

    <FeatureCard title='Dynamic lambdas'>
      Scaffold can run any computation that compiles to WASM. Modules can use a
      number of ABIs, including WASI, Emscripten, or the raw Scaffold block
      interface. Your lambdas seamlessly load-balance between running on-device,
      on-peer, or on-server.
    </FeatureCard>

    <FeatureCard title='Cheap, fast, and scalable'>
      <ol className='list-disc pl-3'>
        <li>Stop paying GCP and AWS. Let your users be your cloud.</li>
        <li>
          From the beginning Scaffold's #1 design goal has been speed and
          simplicity. We don't compromise on this.
        </li>
        <li>
          Your users load balance automatically into the entire Scaffold
          network.
        </li>
      </ol>
    </FeatureCard>

    <FeatureCard title='How does my server fit in?'>
      Your server connects to the Scaffold network like any other client. You
      can use it as a source of truth, connecting to your database and
      responding primarily to infrequent/rare queries, while the Scaffold
      network handles the more{' '}
      <a href='https://en.wikipedia.org/wiki/Zipf%27s_law' target='_blank'>
        recurring/common
      </a>{' '}
      ones.
    </FeatureCard>

    <FeatureCard title='Is this a cryptocurrency?'>
      Yes. However,
      <ol className='list-disc pl-3'>
        <li>
          As stated in "Why?", Scaffold's #1 goal is computation. Not currency.
          The world has enough of those. However we believe a store of value is
          necessary: to perform computations (not just returning
          easily-verifiable static content) on non-trusted platforms (browsers),
          you have to incentivize correct answers and disincentivize incorrect
          answers. This requires some kind of transferrable store of value.
        </li>
        <li>
          Many (if not all) of existing cryptocurrencies were created to achieve
          distributed consensus (usually to enable the creation of a token), at
          the cost of speed and throughput. We do the opposite - we prioritize
          speed first and consensus second. Large transactions will be finalized
          much more slowly, but this isn't a problem because we're using
          extremely small transactions to incentivize computation.
        </li>
        <li>
          It's not a blockchain, but a block tree. No one will ever download or
          verify the entire tree. This means it's fast and energy-efficient.
        </li>
      </ol>
    </FeatureCard>

    <div>&nbsp;</div>
  </>
);
