---
title: Concepts
description: The five ideas Scaffold is built from — contracts, blocks, the tree, verification, and collateral.
---

# Concepts

Scaffold is built from five ideas. Each is simple on its own; the protocol is
what they do together.

## Contracts

A **contract** is a WebAssembly module published to the network and addressed by
the hash of its bytes. Content addressing gives three properties for free:

- **Immutability.** A hash names exactly one program, forever. Calling
  `0xdda8…` always runs the same code.
- **Cacheability.** Any peer can keep a copy of any contract; the address never
  goes stale.
- **Verifiability.** Because the binary is deterministic and identified by its
  hash, any peer can re-run a computation and compare results byte-for-byte.

Contracts run sandboxed in web workers — they get parallel compute without
touching the main thread, and they can only see what the host hands them.

## Blocks and the tree

State lives in a **tree of immutable blocks**, not a chain. Each block is
content-addressed, like contracts. Branches grow in parallel: two transactions
that don't touch each other never wait on each other, so there's no global
ordering bottleneck, no mining, and no blocks-per-second ceiling.

A contract's **introducing block** also carries its metadata — output
namespaces, ABI version, resource limits — as record outputs, so peers can read
facts about a contract without instantiating it.

## Generation and verification

Every computation happens in one of two modes:

- **Generation** — a peer runs a contract to produce a new result, staking
  collateral on its correctness.
- **Verification** — a peer re-runs a past computation and checks that the
  recorded result matches. Determinism makes this exact: same binary, same
  inputs, same bytes out.

Verification is Scaffold's proof of work. Instead of hashing puzzles, peers earn
by checking each other — work that secures the network is work the network
actually needs.

## Collateral

Every generated result carries **collateral** — value the responding peer
stakes on being right. If a later verification finds a mismatch, the collateral
is slashed and paid to whoever caught the error.

The trust model follows from the economics: a peer that stakes a dollar to
answer a one-cent query has put 100× the query's value at risk. Results aren't
trusted because a quorum voted; they're trusted because lying is priced, and the
incentive to catch a lie is always on the table.

## Peers and transport

There is one kind of node. Browsers, CLIs, and servers all speak the same
protocol: hold contracts and blocks, answer calls, verify others. Transport is
**WebRTC** for peer-to-peer connections with **WebSockets** as dial-in and
fallback.

Your server, if you keep one, connects as a peer like any other — a source of
truth for rare queries while the network absorbs the hot path. Capacity scales
with adoption: every user who opens your app adds compute to it.
