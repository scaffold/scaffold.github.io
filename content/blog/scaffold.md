---
title: Scaffold
date: '2024-01-08'
author: Joel
---

This is the primary model of computation today:
<img style="background-color: #FFF;" src="/public/blog/scaffold-2024-01-08/small-architecture.svg" />

This works well, up to a point. When we scale, we have to build/buy more
servers:
<img style="background-color: #FFF;" src="/public/blog/scaffold-2024-01-08/large-architecture.svg" />

But what if we move the cloud to the client?
<img style="background-color: #FFF;" src="/public/blog/scaffold-2024-01-08/scaffold-architecture.svg" />

That's the vision behind scaffold - to reduce O(N) servers to O(1); maybe even eliminate them in some cases.

What are the challenges to such a model?

- Connectivity. Instead of connecting to a well-known domain name, you need to connect to other online peers.
- Trust. You must expect some proportion of peers to be byzantine (meaning they don't play by the rules of the protocol).
- Scalability. Decentralized protocols today require a subset of nodes with O(N) resources, where N = the operations that the network has performed. This limits the total size of the network.
- Development environment. Today's cloud is the product of years of design and iteration. Anything claiming to be a replacement needs to be unopinionated, flexible, and provide the primitives needed to both compose new environments and ultimately build applications on top of it.

## Connectivity

## Trust

## Scalability

## Development Environment

The crux of our issue is we need to provide amortized correctness guarantees for
computational results from untrusted peers. We can do this by ensuring that the
expected profit of a correct result is greater than the expected profit of an
incorrect result. There are two types of computations:

1. Easily verifiable, for example by verifying a signature or verifying a hash
   digest; the bitcoin POW falls into this category. Unfortunately these
   computations tend to be far less useful than the second kind.
2. Not easily verifiable, for example simulating one second of physics in a game
   world. Verifying this requires re-running the computation, but luckily, we
   don't have to verify every computation if the penalty for an incorrect answer
   is far larger than the payoff for a correct answer. For example, if the
   payoff is $0.001 and the penalty is $1, and we verify 1% of answers, the
   expected penalty for submitting an incorrect answer is $0.01, 10x larger than
   the payoff. Thus, peers are incentivized to provide correct answers.

But how do we come to consensus on the validity of a computation? The first
thing to note is that answers should be evaluated via deterministic, sandboxed
programs. WASM fits in nicely here. Secondly, peers can vote by posting
collateral. This vote is either FOR or AGAINST the answer, and is forfeit if you
lose, however if you win you're distributed your share of the opposition's
collateral, proportional to your vote.

Collateral is posted via transactions. Transactions, both on scaffold and on
blockchains, are difficult to verify because we need the entire ledger to
determine whether the sender has sufficient funds. In our case, this falls into
the hard-to-verify category (2), which we solve in the same way as noted above,
by ensuring that the expected profit of sending an invalid transaction is
negative.

A few tricks are necessary. Firstly, to incentivize verification, we actually
incentivize invalid answers. If a peer successfully sneaks an invalid answer
past verification, and flags their own answer as invalid, they win a largish
jackpot, approximately 1000x larger than their posted collateral.

Secondly, we must ensure that each answer is verifiable within a bounded time.
We do this by collecting each answer into a tree structure, built bottom-up and
left-to-right. With 128 answers, our tree will be 7 levels deep, ensuring each
answer has an equal chance of verification, and is reachable via 7 hash lookups.

Thirdly, each answer attests to the existence of its hashes in addition to the
validity of its computations. If a hash is not well-known, peers will vote
AGAINST the answer. These hashes form a DAG-like structure, on top of the tree
structure mentioned earlier.

Scaffold is not a blockchain. It is not designed for fast consensus; in fact the
opposite is desirable in many cases - in order to use answers optimistically,
before we've been able to verify them, we need to be able to easily re-write the
graph if they're incorrect. Scaffold is not a cryptocurrency. While it does use
coins, due to the slow consensus, they aren't useful for large transactions. The
small transactions used for incentivizing computation are the perfect use case.

Concretely, scaffold will be a TypeScript library, running in the browser and
behaving similarly to `fetch()`. Internally, it connects to other peers via
WebRTC. It accepts and builds upon received answers optimistically, expecting
them to be correct and rectifying the situation quickly if not.

This is a very high-level rough outline of scaffold and some of the key
solutions I've stumbled upon over the last year of ideation/development. If
you're interested please contact me at joel@scaffold.io.
