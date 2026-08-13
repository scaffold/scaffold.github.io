---
title: FAQ
description: Some common questions about Scaffold
---

# FAQ

## Is this a cryptocurrency?

Yes, technically. Scaffold is a distributed store of value, and implements all of the operations that a cryptocurrency would.

However, Scaffold was not built to be a cryptocurrency. It was built to be a foundation for distributed, verifiable computation. While most other cryptocurrencies are aimed at fast-finality high-volume transactions, Scaffold is aimed at the lower-finality micropayments for incentives and collateral supporting these computations.

## Is this a blockchain?

No. Scaffold's blocks are organized into a DAG, or a forest (a set of trees), depending on how you look at it. Either way, there's no linear chain of blocks. This has a number of advantages, most notably a lack of transaction limits and node's resource usage. I should note that today, as of Aug 2026, I have not done any stress testing to fully back up these claims, however the O(log(N)) scaling is a main goal of this project.

## What stops a peer from lying?

Money. Every response carries collateral staked on its correctness. WASM is deterministic (well, not totally, but Scaffold contracts aren't allowed to use the non-deterministic parts), so any invalidity is (ideally) found and quickly rectified. The collateral is forfeit and paid to the verifier who found the invalidity.

What if an invalidity isn't found? Recall that blocks get aggregated, and the aggregation insures all sub-block's validity. An aggregation atomically places new collateral and releases the old collateral for the sub-blocks or sub-aggregations. Once the block has been re-insured, the malicious publisher is now incentivized to flag his own invalid block, claiming both the stolen funds and a reward from the (lazy) aggregator. He'll pay closer attention next time.

Of course, the idea is that this game plays out millions of times a second, an endless battle between aggregators and publishers. With correctly tuned incentives, the steady state is that a small fraction of blocks are published invalid (likely around 0.1%), with most of those being immediataely caught by aggregators, and an even smaller percentage aggregated before being flagged and rectified.

## What about private data?

Private data is tricky. Data may be encrypted inside a block, but only the public-facing block is elegible to participate in verification. In other words, there aren't any constraints on the data inside the encryption.

Scaffold's first targets are computations that are public or pseudonymous by nature — content resolution, shared game state, public queries. Encrypted and private computation patterns will likely emerge over time; I'm not sure exactly what it will look like.

## What does it look like to end users?

It looks exactly like any other web app. Scaffold is simply a replacement for `window.fetch()`; users will see no difference.

## Does Scaffold fully eliminate servers?

Not totally. Servers will still be needed to interact with existing systems and to pin data that may be less frequently replicated by the network. Scaffold's goal is to reduce your required cloud resources from O(N) to O(log(N)). Most production apps will keep a server running a Scaffold node as a backup for rarer queries and let the network handle the frequent ones. A lot of real-world data fits [Zipf's law](https://en.wikipedia.org/wiki/Zipf%27s_law), meaning even a few common queries handled by the Scaffold network will dramatically decrease the cost of serving the rest.

## Is it secure?

Definitely not yet. Please don't use it for anything other than experimentation and fun (it is indeed quite fun).
