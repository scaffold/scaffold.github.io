---
title: The user is the cloud
date: '2026-06-12'
author: Joel
description: Introducing Scaffold — a browser-native protocol that turns your users into infrastructure. Testnet opens July 31.
---

Cloud spend is now the #2 expense at midsize IT companies, behind only payroll.
On average, organizations hand 10% of revenue to cloud providers; AWS alone
booked over $110B last year. We've collectively decided that every app — even
one whose users carry supercomputers in their pockets — must rent its compute
from three companies in Virginia.

Scaffold is a bet that this is a habit, not a law.

## The observation

Every modern browser runs WebAssembly at near-native speed, speaks WebRTC
peer-to-peer, and has web workers idling on multicore hardware. The machines
are already there. The bandwidth is already paid for. What's been missing is
the bridge: a way for applications to use that compute **with trust** — to know
that an answer computed on a stranger's machine is the right answer.

## The mechanism

Scaffold's answer is economic, not bureaucratic. A developer publishes a
WebAssembly contract, addressed by its hash. An application calls it through
`scaffold.fetch()`. The call routes over WebRTC to the nearest peer holding the
contract — often the user's own device — and the result comes back with
**collateral staked on its correctness**.

Because WASM is deterministic, any peer can re-run the same contract later and
compare byte-for-byte. Catch a wrong answer, and the liar's collateral is
slashed and partly paid to you. A peer that stakes a dollar to answer a
one-cent query has no profitable way to cheat. Trust isn't a committee; it's a
market that never closes.

Consensus lives in a tree, not a chain — branches grow in parallel, so there's
no mining and no global ordering bottleneck. Verification *is* the proof of
work, and it's work the network actually needs.

## What this buys you

For an indie developer: a viral app with no hosting bill, because every user
who shows up brings the capacity to serve themselves. For a startup:
infrastructure cost that starts at zero and stays there. For a mature product:
no origin to go down — and sub-100ms responses, because the nearest peer is
usually closer than the nearest region.

## Where we are

The protocol spec, the reference implementation, 819 passing tests, and a
working browser demo exist today. The **public testnet opens July 31, 2026**:
seeded peers, `@scaffold/core` on npm, and a live explorer. Mainnet — with
collateral enforcement running in production — lands December 31, 2026.

If you want to be early: [read the getting-started guide](/docs/getting-started),
skim [how it works](/how-it-works), and come argue with us on Discord. The
cloud's been renting your users' machines back to you long enough.
