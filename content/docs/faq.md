---
title: FAQ
description: Is this a blockchain? What about malicious peers? Fair questions, direct answers.
---

# FAQ

## Is this a blockchain?

No — and the difference is structural, not branding. Blockchains serialize the
world into one totally-ordered chain, which is why they mine, why they have
blocks-per-second ceilings, and why transactions wait in line. Scaffold's state
is a **tree**: branches grow in parallel, and consensus accumulates as
verification work continues. There is no mining and no global ordering to fight
over.

There is a native token — usage is priced in it, peers earn it by hosting and
verifying, and it denominates collateral. But the token exists to price compute
and correctness, not to be a currency.

## What stops a peer from lying?

Money. Every response carries collateral staked on its correctness. Any peer
can re-run the computation later — WASM is deterministic, so the check is
byte-for-byte — and a mismatch slashes the liar's collateral, paying part of it
to whoever caught the error. A peer that stakes 100× the query's value to
answer it has no profitable way to cheat.

## Does my app's code run on strangers' machines?

Contracts do, yes — that's the point. But contracts are sandboxed WASM with no
ambient authority: they see their parameters and the block data the host feeds
them, nothing else. The peer running your contract can't reach into your app,
and your contract can't reach into the peer.

## What about private data?

Don't put it in a contract call. Scaffold's first targets are computations that
are public or pseudonymous by nature — content resolution, shared game state,
public queries. Encrypted and private computation patterns are design work for
after mainnet.

## Do my users have to opt in?

Running a Scaffold app *is* participating — the app's contracts run in your
users' tabs, in web workers they're already paying for, bounded by the
browser's own resource limits. There's no installer and no background process.
A tab that closes leaves the network; nothing persists.

## Browsers only?

No. The same package runs in Deno and Node, and a server connects as a peer
like any other client. Most production apps will keep a server as a source of
truth for rare queries and let the network handle the hot path.

## When can I use it?

The reference implementation and a local development network work today. The
**public testnet opens July 31, 2026** — seeded peers, `@scaffold/core` on npm,
and the explorer. **Mainnet — with collateral enforcement and dispute
resolution in production — lands December 31, 2026.** Until mainnet, don't
ship anything that needs real economic guarantees.
