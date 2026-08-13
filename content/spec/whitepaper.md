---
title: Whitepaper
description: Working draft of the Scaffold protocol
---

# Scaffold

> This document is a work in progress. Most of the high-level ideas are relatively stable, but many of the details still need refinement and clarity.

## 1. Abstract

Scaffold is a protocol for trusted distributed computation. Work is published as blocks, which are accepted optimistically and organized into a balanced forest by aggregators. Aggregators sample random blocks in the tree to evaluate its risk, and if they're confident they insure the tree. There's always an active insurance for any given block; if an aggregator finds a fault (invalid computation, double-spend, etc), they present a proof to the currently active insurance and receive a reward. The failing block is disqualified and its throughput burned to allow another claim on the incorrectly claimed outputs. Consensus weight is real, measured verification cost, estimated by unbiased sampling and evaluation of the sampled blocks. The balanced forest gives O(log N) claim resolution, inclusion proofs, and trust decisions. The result is a protocol light enough for browsers to achieve fast consensus.

## 2. Introduction

Scaffold is a protocol enabling trusted distributed computation: a client wants to rely on the result of a computation it did not run.

The classical answer is replication. Blockchains have every validator re-execute every transaction, which makes trust unconditional but caps global throughput at the capacity of a single validator and prices every computation at N times its actual cost. The optimistic answer is verify-by-exception: accept results by default, let anyone challenge, and punish provable faults — the approach of optimistic rollups and Truebit-style verification games.

Scaffold prices the risk associated with possibly invalid blocks instead of mandating validity. Every block pays a fee on the order of its own verification cost. Aggregators admit blocks into the canonical structure by posting insurance over them, without necessarily requiring that the entire tree is valid. Probers sample subtrees hunting for faults and are paid out of that insurance when they find one — and the supply of faults is itself endogenous: rational authors occasionally publish invalid blocks precisely to farm insurers who didn't probe, and this deception game (§7) is what keeps verification funded when organic faults are rare. Crucially, a discovered fault does not unwind the ledger: the faulting block is disqualified, the output it claimed is freed to be claimed again, and the insurance burns the block's throughput so that total value stays conserved (§5). Work honestly built on top of a fault is left alone. Trust in a block is therefore a quantitative statement — how much verified weight is stacked on it, and how much insurance stands behind it — rather than a binary statement about validation.

The storage space required from a node is also O(log N); most blocks can be forgotten freely once its short-term insurance has evaporated.

Compared to optimistic rollups, there is no distinguished sequencer and no L1 to appeal to — the challenge game and its collateral _are_ the base layer. There is also no fixed challenge window: detection probability compounds as weight accumulates, and insurance prices the residual risk (§8). Compared to Truebit, disputes resolve through a simple voting system rather than an interactive on-chain referee.

## 3. Model and assumptions

### 3.1 Participants

- **Authors** create blocks: they claim outputs, satisfy contracts, perform the actual computation, and attach an aggregation fee.
- **Aggregators** claim the aggregation outputs of similarly-sized trees, posting insurance over the subtrees they merge, and earn fees (§7).
- **Probers** sample subtrees, verify blocks, and hunt for faults in exchange for rewards. Probing is not a standalone profession: at equilibrium, random third-party bounty hunting is unprofitable (Appendix E), and detection lives with the aggregator probing before risk transfer, the strategic deceiver self-reporting at it, and the victim challenging after it (§7, §8.1).
- **Clients** resolve claims and decide trust from a block's aggregation chain and its visible insurance — O(log N) work, never re-execution (§11).

The roles overlap freely; a single node typically acts as all four.

### 3.2 The Joule

Scaffold's native token is the Joule. It serves double duty as the unit of value (outputs, fees, insurance) and the unit of weight: verification cost — CPU time of the WASM, memory, other resources — is evaluated in Joules (§6.1). The identification is deliberate: every security argument in §6 and §10 reduces to comparing a computation cost against a token amount, and a shared unit keeps those comparisons honest. All amounts in this paper are Joules.

### 3.3 Peer model

Peers gossip blocks; a block is a signed, immutable byte array addressed by hash. Peers execute WASM to generate and verify blocks. Peers connect over WebRTC and WebSocket, although the protocol leaves this open to extension. All peers have the same privileges; server-class peers may exist for performance but have no extra protocol capabilities.

Peers synchronize by connecting to at least one trusted peer. Peers should be able to persist blocks locally, notably blocks and aggregators containing their pending UTXOs. Although aggregators are incentivized to serve UTXOs it is not required. Long-term, most blocks are expected to be forgotten.

## 4. Data structures

### 4.1 Blocks

The atomic unit in scaffold is a block. A block is an immutable byte array, typically represented by its hash. A block has a number of properties, and looks something like this:

```typescript
interface Block {
  anchor: Hash;
  chain: { weight: bigint; throughput: bigint }[];
  aggregates: { block: Hash; outputCount: bigint }[];
  claims: bigint[];
  refs: bigint[];
  outputs: {
    contractHash: Hash;
    params: bytearray;
    body?: bytearray;
    amount: bigint;
  }[];
  timestampMs: number;
}
```

**Outputs.** An output describes funds that are only able to be retrieved by a block satisfying the given contract and parameters. Amount must be non-negative (although relaxing this restriction has some interesting mechanics we could investigate in the future — §13). Contract semantics, `ALLOWED_PRODUCERS`, and the `stalling` flag are covered in §9. The conservation rule on outputs is in §5.2.

**Timestamp.** This must be greater than or equal to the timestamps of the anchor and all aggregated blocks. Time semantics and time-locks are covered in §9.7.

**Serialization, signing, and identity.** A block's fields are serialized into a byte array (not necessarily canonically); the author signs a digest of those bytes and the signature is appended; the block hash is the hash of the serialized fields and the signature. The author's public key can be recovered from the signature, which means every block carries an unforgeable binding to the key that produced it.

**Blocks are immutable.** Changing any field requires a new signature, and both the change and the new signature change the hash. Any modifications produce a new block.

### 4.2 Anchors and the anchor chain

The anchor is a hash to another, larger block. Following anchors recursively gives the anchor chain: a sequence of tree roots increasing in size, terminating at the genesis block, which is defined to have infinite size. A block's **reach** is what that chain makes addressable — its own tree (§4.3), plus the tree of every block on the chain. Reach is what the anchor exists to buy, and everything a block is structurally responsible for has to fall inside it:

1. Every output it claims or references, so that §4.5 can resolve the index.
2. The anchor of every block it aggregates.

The first is the obvious one: you cannot spend what you cannot name. The second is what makes reach compose. A block inherits its aggregates' claims — it has to sum their throughput into its chain array, below — so it needs to see whatever they saw. Constraining only each aggregate's anchor suffices, because every aggregate imposed the same rule on its own aggregates; applied down the tree, it guarantees that every claim made anywhere inside a block's tree resolves inside that block's reach. Without it a buried block could claim from a tree its aggregator cannot see, and throughput the aggregator is obliged to declare would have nowhere to land.

Reach only grows as you anchor: a block inherits its anchor's reach and adds its own tree. The flip side is that two blocks in different trees that nothing has merged yet are in nobody's reach at once, so a block wanting to claim from both simply waits for the aggregation that merges them (§7).

**The chain array.** The chain array specifies different properties of blocks in the anchor chain. `chain[0]` refers to the anchor. `chain[1]` refers to anchor.anchor, and so on. Beyond the end of the array, any remaining anchor chain blocks implicitly receive `{weight: 0, throughput: 0}`. Knowing that a tree doesn't claim any coins from an anchor chain link is actually pretty useful, because it lets walkers skip subsets of the tree that don't claim anything from outside a larger tree (§11.3).

**Weight** refers to the amount of work descendant of that chain entry (by anchor). Basically, for every block in the subtree (excluding the root itself), propagate its work to its anchor until it reaches a chain entry. Then it's placed into the `weight` property at that position. Example:

- The anchor chain is G <- A <- B <- C
- B aggregates B0 and B1
- A <- B0 <- B1 (B0 anchors A and B1 anchors B0)
- C aggregates C0, C1, and C2
- C0 has work 5 and anchors B0
- C1 has work 12 and anchors B1
- C2 has work 50 and anchors B
- THEN C's weight chain would be `[{weight: 50}, {weight: 17}]`

Walking the propagation explicitly:

- C2 anchors B. B is on C's anchor chain, at position 0, so C2's 50 lands in `chain[0]`.
- C0 anchors B0. B0 is _not_ on C's anchor chain, so the work propagates to B0's own anchor, A. A is `chain[1]`, so the 5 lands there.
- C1 anchors B1 → B1's anchor is B0 → B0's anchor is A: `chain[1]` again, adding 12.
- If it had any, C's work would not be included.
- Hence `[{weight: 50}, {weight: 17}]`. In general: each subtree block's work walks up _its own_ anchor chain until it first hits a block on the root's anchor chain, and is attributed at that position.

**Throughput** refers to the amount of coins claimed from the tree represented by that root. Example:

- The anchor chain is G <- A <- B <- C
- A aggregates A0 and A1
- C aggregates C0 and C1
- C0 claims 5 coins from A0
- C1 claims 12 coins from B1
- THEN C's throughput chain would be `[{throughput: 12}, {throughput: 5}]`

Walking it: `chain[0]` covers claims from B's tree, which is {B, B0, B1} (B aggregates B0 and B1 — trees are formed by aggregation, not anchoring, so A is not in it). C1's 12 from B1 lands there. `chain[1]` covers A's tree {A, A0, A1}; C0's 5 from A0 lands there. Trees of distinct anchor-chain roots are disjoint (every block is aggregated exactly once), so the attribution is unambiguous.

### 4.3 Aggregation and the forest

Every block is aggregated exactly once, which means its hash is included in exactly one other block's aggregates array. This forms a tree structure. We say a tree T "includes" another block B if either T === B or at least one (there should only be one) of T's aggregates includes B. This is a recursive definition and informally simply reports whether B is contained in the aggregation tree of T.

Care is taken to aggregate similarly-sized trees, ensuring the tree is balanced. As we will see, this gives us O(log N) proofs and queries in a number of areas.

The aggregates array is used solely to look up claims (§4.5). The aggregation output of each of the aggregated blocks must be claimed, and only those aggregation outputs. If there's N aggregates, there must be N claimed aggregation outputs. The `outputCount` is the total number of outputs created by the entire subtree, which may be claimed or unclaimed. It must be the sum of the aggregated block's output array length and each of its own aggregate's `outputCount`. A correct `outputCount` is what keeps claim resolution tree-scoped (§4.5), so mis-declaring it is a hard fault (§5.1).

The aggregates array should be ordered in order of descendant weight, highest to lowest (the penalty for misordering is in §5.3 and Appendix C). The mechanics and economics of _creating_ aggregations are in §7.

### 4.4 The canonical ordering

The anchor -> subtrees -> self gives the canonical ordering of the graph represented by a block S:

```python
def traverse_tree(block: Block):
    for agg in block.aggregates:
        yield from traverse_tree(agg.block)
    yield block
def traverse_graph(block: Block):
    if not is_genesis(block):
        yield from traverse_graph(block.anchor)
    yield from traverse_tree(block)
```

This ordering is what assigns priority among conflicting claims: the first spend of an output in canonical order is the legitimate one, and all later spends are disqualified (§6.4).

### 4.5 The global output space and claims

A claim signifies that the block fulfills the contract and parameters specified by the referenced output. A claim is an index, and is resolved recursively by this formula:

```typescript
function resolveClaim(
  block: Block,
  claim: bigint,
): { block: Block; outputIndex: number } {
  const outputCount = BigInt(block.outputs.length);
  if (claim < outputCount) {
    return { block, outputIndex: Number(claim) };
  }
  claim -= outputCount;

  for (const agg of block.aggregates.toReversed()) {
    if (claim < agg.outputCount) {
      return resolveClaim(resolveBlock(agg.block), claim);
    }
    claim -= agg.outputCount;
  }

  return resolveClaim(resolveBlock(block.anchor), claim);
}
```

This is equivalent to indexing into the following implicit output space defined wrt a block:

```python
def generate_tree_space(block: Block):
    yield from block.outputs
    for agg in reversed(block.aggregates):
        yield from generate_tree_space(agg.block)
def generate_output_space(block: Block):
    yield from generate_tree_space(block)
    if not is_genesis(block):
        yield from generate_output_space(block.anchor)
def resolve_claim(block: Block, claim: int):
    return list(generate_output_space(block))[claim]
```

Note the output space is ordered, with more recent outputs having lower indices and older outputs having higher indices. Immediately claiming an output on the same block is possible; this is called a self-claim.

Alternative claim addressings (block hash + index; `{chainHops, treePath, outputIndex}` tuples; indexing the _unclaimed_ vector) were considered and rejected — see Appendix B for the designs and why.

### 4.6 The merkle claimed/unclaimed mask

Indexing the _unclaimed_ output vector (Appendix B, option 4) would have made double-spends unaddressable, at the cost of heavy claim-mask machinery in every client. Option 3 omits this necessity, since it indexes into a global output vector, containing both claimed and unclaimed outputs. The transformation from one block's output space into another's is a simple addition.

Detecting double-spends was a big benefit of the claim mask. This is mostly useful for aggregation, when an aggregator wants to know that he won't have to pay out double-spend claims. We can still do this, keeping a claimed/unclaimed bitvector in a merkle tree on each block, without affecting claim lookups.

It's very simple; each block's merkle tree encodes a bitvector with a 1 set if that output index is claimed in an aggregate. The bitvector's length is `anchor.output_space_size + SUM(aggregate[*].created_outputs)`. Notably it does not include outputs or claims of the block itself. The merkle tree root is stored in the aggregation output body.

There are two access paths, and they never meet: **light clients** resolve claims purely additively through the output space and never touch the mask; **aggregators** maintain the mask to detect double-spends before posting insurance (§7), and prove claimed/unclaimed status against it when contests need it.

### 4.7 Refs

Whereas claims point only to unclaimed outputs, refs point to any output. They act as a kind of "activity log" allowing reproducability for the data fed to the contract. The exact semantics of this are still unspecified.

## 5. Validity and faults

### 5.1 Validity rules

A block is valid iff:

1. **Structure.** Its anchor points to a larger tree than itself; every block it claims or references, and the anchor of every block it aggregates, lies in its reach (§4.2); its timestamp is ≥ the timestamps of its anchor and all aggregated blocks.
2. **Conservation.** The sum of its output amounts exactly equals the sum of its claimed output amounts (§5.2).
3. **Contracts.** Every claim satisfies the claimed output's contract and parameters (§9); `ALLOWED_PRODUCERS` restrictions are respected; if it aggregates or anchors a stalled block, it claims all of that block's stalling outputs (§9.6).
4. **Aggregation correctness.** Its aggregates' `outputCount`s and its chain array's weights and throughputs are correctly summed; each aggregated tree is smaller than 60% of the aggregate (§7); no block appears twice (structurally excluded anyway — the duplicate's aggregation output would be double-spent).

Ordering of the aggregates array (heaviest-first, §4.3) is deliberately _not_ a validity rule — misordering is a soft penalty (§5.3).

### 5.2 Conservation and burns

The sum of output amounts must exactly equal the sum of claimed output amounts. The aggregation fee is itself just an output (addressed to the aggregation contract, §7), so conservation is block-local and needs no special cases.

Faults create discrepancies, and the v2 rule is that a discovered fault does not invalidate the aggregation containing it. Misdirected funds — a block invalidly claiming an output, or the loser of a double-spend — are disqualified, which frees the claimed output to be spent a second time, and the insurance burns the disqualified block's throughput to keep total value constant. Work built downstream of the fault is left alone; the burn pays for its keep.

### 5.3 Fault taxonomy

**Hard faults** disqualify a block, burn its throughput, and pay the finder out of insurance (§8):

- **Invalidity.** The block fails verification — a claim doesn't satisfy its contract, or a rule of §5.1 is broken.
- **Double-spend.** More than one block claims the same output. All spends following the first one (in the canonical traversal of the tree) are disqualified. A double-spend is an invalidity _of the aggregator_: the fault is attributed to — and paid by the insurance of — the aggregation that admitted the later claim.
- **Uninsured aggregation.** If an aggregator A does not correctly sum the throughputs of its aggregated blocks, we say the aggregated blocks are "uninsured". The aggregator A fails validation, is disqualified, and the aggregated blocks may be aggregated again. This simply falls out of the invalidity logic, but it should be noted that once an aggregator has been disqualified (fails validation or double-spends), the path is broken: its children and grandchildren are no longer eligible to claim insurance. Although this should hold for all kinds of disqualifications, the most important one is if throughput is not correctly summed. This should be clearly visible from the aggregation path, and any paths without correctly summed throughput are simply invalid. If this did not hold, a very large sub-block could be "hidden" inside an aggregation with low declared throughput, meaning it's never probed; this large sub-block should not be eligible to claim insurance payouts (§10.7).

**Soft penalties** reduce canonicality without disqualification:

- **Misordering.** Aggregates not ordered heaviest-first. A misordered aggregation is treated similarly to a disqualification for canonicality purposes, although its disqualification doesn't get aggregated like an invalidity or double-spend does.

### 5.4 Disqualification semantics and claim regeneration

Locally, a peer should give each claim a canonicality of `descendant_weight + self_weight - disqualification_penalty - misordering_penalty` (developed in §6.3), where:

- `disqualification_penalty = IF(disqualified, throughput * disqualification_factor, 0)`
- `misordering_penalty = IF(misordered, throughput * misordering_factor, 0)`

An invalid block or a double-spend loser gets marked "disqualified" in some aggregator. Then:

- Disqualified blocks are no longer eligible to be marked in a double-spend or as invalid — each block pays for at most one fault.
- The disqualified block's canonicality gets decremented by its throughput, which gets burned.
- Any negative canonicality is flagged and propagates to descendants, which makes the whole downstream uncanonical.
- A disqualified block doesn't participate in double-spends, so you can regenerate the claim: the new block behaves exactly the same as it would have if it had been generated originally.

> Note that although negative canonicalities propagate to descendants, invalidities don't. This is because lots of work could be built on an invalid block, and in this case we leave that work alone, while freeing up the original output to be claimed again. On the other hand if the descendant work doesn't exceed the throughput, the canonicality will become negative and that WILL propagate downstream, effectively making the whole branch uncanonical.

### 5.5 Rectification economics

The incentive structure must satisfy:

```
generation_cost + verification_cost <= throughput <= rectification_amount
```

The `rectification_amount` should be approximately equal to the value of a correct solution minus the value of an incorrect solution.

Invalidity insurance payout:

- Burn `throughput` -> `{disqualify, block_hash}`, which disqualifies the block
- Pays `O(throughput)` for reward
- Note: the whole block's throughput is used, not just the claim

Double-spend insurance payout:

- Burn `throughput` -> `{disqualify, block_hash}`, which disqualifies the block
- Pays `O(throughput)` for reward
- Note: the whole block's throughput is used, not just the claim

Including or not including a double-spend depends on the fees. If the fees are large enough to compensate for the payout, we can include both.

> 💡 The reward is pinned as `α · throughput` for a protocol constant α (the finder's share), paid _on top of_ the burn: the insurer's total outlay per fault is `(1+α) · throughput`. Self-reporting your own fault is deliberately profitable when the insurer is someone else; that is the deception game.

## 6. Weight and consensus

### 6.1 What weight is

A block's weight is its verification cost, evaluated in Joules: typically proportional to the CPU time taken to run the WASM, but it could also be based on memory usage or other resources. It's locally defined and may be noisy, but consistent weight evaluations across nodes are desired and will make consensus more efficient.

Weight is Scaffold's analog of proof-of-work: the scarce, physically real resource behind canonicality. Where PoW spends energy on hash preimages, Scaffold's weight is the cost of the useful computation itself, plus the cost of verifying it. Its two load-bearing properties:

1. It is verifiable by sampling — any peer can re-run a block and measure its cost.
2. It cannot be inflated by declaration (§6.2). Declared weights steer sampling; they never enter the estimate.

### 6.2 Sampling-based weight verification

Blocks are aggregated into trees. Trees can declare arbitrary weight, so instead of trusting it, peers sample and evaluate locally. Peers descend a tree by sampling, at each branch choosing children proportional to their aggregation fee. Once a leaf is reached, the peer verifies the block and measures the cost (cpu usage, memory, etc). This propagates back up the tree, scaling up by the inverse probability of sampling each child, until the root has an estimate. This can occur multiple times to get a more accurate measurement.

```python
def sampleSubtree(node, lam) -> Estimate:   # lam = budget knob
    est = Estimate.empty()                  # n=0, value 0  (additive identity)

    pi0 = inclusion_prob(node.declaredWeights[0], lam)
    if bernoulli(pi0):
        est += estimateSelf(node) / pi0

    for k, child in enumerate(node.children):
        pik = inclusion_prob(node.declaredWeights[k+1], lam)
        if bernoulli(pik):
            est += sampleSubtree(child, lam) / pik

    return est
```

This is a **per-slot Horvitz–Thompson estimator**: every slot — the node's own work and each child subtree — is gated behind an independent Bernoulli coin with inclusion probability π derived from its declared weight and the budget knob λ, and each included measurement is scaled by 1/π. The estimator is unbiased for the true total weight _regardless of the declarations_: E[X · 1{included} / π] = X. Declarations control only where the sampling budget goes, never the expectation.

That is the entire defense against byzantine declaration. Over-declaring a subtree's weight raises its inclusion probability — it gets probed more, its measured contribution is scaled down by the larger π, and (fees being proportional to declared cost) it pays more — with zero effect on the expected estimate. Under-declaring hides a subtree from probing, but forged declarations can only move variance and lose weight, never gain it. Two refinements follow directly:

- Estimates are carried as `{value, variance, n}` structs and composed, not bare scalars — composition, adaptive budget allocation, and confidence intervals all need the variance. Per-child sampling streams must be independent; a single shared descending path breaks the variance-sum identity.
- Peers credit a subtree its **lower confidence bound**, not its point estimate. This turns the adversary's only remaining lever — variance inflation — against them: any forged declaration widens the interval and reduces credited weight, making honest proportional declaration the unique credit-maximizing strategy (and the zero-variance point).

The one thing sampling cannot hide is money: throughput must be exactly summed up the aggregation chain (§5.3), so a large spend is visible in the chain array regardless of its declared weight. You can hide computation; you cannot hide value.

### 6.3 Canonicality

Locally, a peer gives each claim the canonicality

```
canonicality = descendant_weight + self_weight - disqualification_penalty - misordering_penalty
```

where `descendant_weight + self_weight` is sampled, verified weight from descendant trees (§6.2), credited at the lower confidence bound, and the penalties are per §5.3–§5.4.

### 6.4 Fork choice, ordering, fault assignment

Conflicts (§5.3) include competing aggregations of the same aggregation output — that is what a "fork" looks like in a forest. Fork choice is per-conflict: each peer prefers the claim with the highest canonicality. Because weight is measured cost, out-competing an established claim requires actually out-spending its accumulated descendants; in practice the first-published claim attracts descendants first and stays ahead — which is precisely what makes fast probing and publishing profitable for aggregators (§7).

Fork choice determines ordering: the winning aggregation's canonical traversal (§4.4). Ordering determines fault assignment: the first claim of an output in canonical order is legitimate; every later one is disqualified (§5.4). The pipeline is strictly fork choice → ordering → fault assignment, and faults feed back into fork choice only through the canonicality penalties.

### 6.5 Finality

Informally: a deeply buried block — lots of descendant weight, usually quite old — is canonical and would be very difficult to make uncanonical. Proposed formalization: a claim is **A-final** if no set of newly created blocks with total verified weight ≤ A can make a conflicting claim canonical. A-finality is monotone (weight only accumulates) and strictly economic — like Nakamoto finality, never absolute. Disqualification burns make reversal attempts strictly lossy rather than merely unprofitable: the attacker's competing claim, if it loses, is itself disqualified and its throughput burned.

## 7. Aggregation

Every block except the genesis block has a single aggregation output, addressed to a well-known aggregation contract. The aggregation contract takes no parameters; this means any aggregator can claim any aggregation output. The amount represents a fee paid to the aggregator, mostly to cover the insurance they will post.

An aggregation block is simply a block that claims at least 2 similarly-sized aggregation outputs. This organizes the set of blocks into a forest; a set of trees. As new blocks get created, they get aggregated into a small tree, which will eventually get aggregated into a larger tree, etc. Each claimed block's size must be less than N% of the aggregate size, N% = 60% — this is the balance rule behind every O(log N) bound in the paper (and see the size-terminology flag in §4.2).

Aggregations serve 4 functions:

1. Ordering the tree of blocks
2. Aggregating weight for efficient descendant work computation
3. Insuring against double-spends in any block in their subtrees
4. Insuring against failing verifiers in any block in their subtrees

> Note: this also excludes aggregating the same block twice, as its aggregation output would be double-spent.

**Probing.** Before creating an aggregation, a peer needs to evaluate the risk/reward tradeoff. The reward is the fees paid via the aggregation outputs. The risk is the insurance they are placing, covering the blocks in their subtrees. They can reduce this risk by probing the subtrees, and if they find an issue they can claim a reward from the current insurer. Probing tries to measure 2 risks:

1. Double-spends (sampled via the frontier throughput and the claimed mask, §4.6 — but it also needs to look for double-spends against the already-insured subtrees)
2. Failing verifiers, sampled via §6.2's machinery, weighted by throughput

A failing query (ref, validity, etc) usually occurs while tree probing to evaluate insurability. A failing subset of N% of queries should be extrapolated to that percentage of blocks failing in the full subtree. Failing blocks mean you will pay insurance.

Probing should concentrate on the young frontier: only the youngest blocks of a subtree — those inside the detection horizon — still carry meaningful claim risk, while the old bulk is dead weight risk-wise (§8.3). Aggregators acting as bounty hunters against the current root concentrates detection hazard in spikes at merge times, which is a feature: it's the mechanism that front-loads the detection-delay distribution the insurance pricing depends on.

**Competition.** It's likely more than one peer may be probing and aggregating a given subtree. The one who becomes canonical and receives the reward is determined by the claim resolution logic, in the same way that any claim winner is determined: by the amount of derived work. Typically this is the first, so quick probers and publishers will be more profitable.

**The deception game.** If no one publishes invalid blocks, probing earns nothing; if probing earns nothing, aggregators stop probing; if no one probes, fraud is free. A perfectly honest network has zero verification incentive and is maximally vulnerable to the first attacker. Scaffold resolves this by _letting the attacker exist and pricing them_. A rational author can publish an invalid block, post collateral, pay the fee, and wait. If the aggregator probes and catches it (probability q), the block is rejected and the author's remaining collateral is claimed. If the aggregator misses, aggregation transfers the risk — the author's collateral is released, the aggregator's insurance now covers the block — and the author immediately proves their own block invalid, collecting the finder's reward `α·t` from the insurance that just accepted it.

Both sides mix, and the equilibrium (Appendix E) is self-correcting: the fraud rate settles at `p* ≈ v / ((1+α)·t + C)` — exactly high enough that the aggregator's probing pays for itself — and the probe rate settles at `q*` — exactly high enough that deception earns the honest payoff with higher variance, so risk-averse authors stay honest. If aggregators slack, deception turns strictly profitable and deceivers multiply until probing pays again. This is Truebit's forced-errors mechanism made endogenous: instead of the protocol injecting errors and taxing everyone for the jackpot, rational adversaries supply the errors and the jackpot is paid by exactly the aggregator who failed to probe.

Three properties are worth stating. First, equilibrium deception is _victimless by construction_: a rational deceiver invalidly claims their own outputs, because a stranger-victim would hold the fault proof too and race them for the reward — so the equilibrium taxes lazy insurers without touching users. Second, the expected fraud value per block is `p*·(1+α)·t ≈ v`: a block's expected fraud loss equals its verification cost, independent of throughput, which is what makes the risk component of the fee flat in v (below). Third, the game is the counterweight to the aggregation race: §6.4 rewards the fastest aggregator, and without deceivers, skipping the probe is pure speed advantage; with deceivers at rate p\*, fast-and-lazy is precisely the strategy that gets farmed.

**The fee.** Competition drives the fee to the aggregator's marginal cost, which has two components with different scaling:

```
f  ≈  a·v  +  b·t·D
```

The first term covers probing and equilibrium fraud losses, and both are proportional to _verification cost_, not throughput: probing costs q·v, and the expected fraud loss is p\*·(1+α)·t ≈ v (the equilibrium result above). The second term is capital carry: the insurer locks capital proportional to the block's throughput t for the coverage duration D, and locked capital has a price. For ordinary blocks the v-term dominates and "fee ≈ verification cost" is a good approximation; for high-throughput, cheap-to-verify blocks the capital term dominates — the correct repricing of what would otherwise be under-priced insurance.

Aggregation contracts specify a single output to a resolution contract.

## 8. Insurance

### 8.1 Two kinds of coverage

There are 2 kinds of insurance:

1. **Short-term serving insurance.** This is always the author's responsibility, and evaporates over a few minutes or hours. This supports inversions of hashes on the block (like refs and the anchor) and query-based validities (like non-uniqueness presentations), and pays a reward to anyone finding an issue. An invalidity proof requires only a path to the data that is requested.
2. **Long-term rectification insurance.** This responsibility is passed to aggregators, and never goes away. An invalidity proof requires the full proof of invalidity (the block and any other supporting blocks); as aggregators responsibility to keep and serve the block data is likely evaporated. This supports verification failures, and pays the disqualification burn.

The deeper cut is not duration but adjudicability: serving insurance covers _interactive_ claims — data availability and query-based checks, which can't be auto-adjudicated — while rectification insurance covers _provable_ faults, which can. The durations fall out as consequences.

**Serving collateral mechanics.** The author's serving collateral decays exponentially back to the author, `C(t) = C₀ · e^(−c·(now − block_timestamp))`, and is never transferred to an aggregator. Challenges double as data queries: to descend into a subtree, post a challenge bond on a hash; whoever holds the preimage responds, earning the bond, and the challenger gets the data — verification and graph traversal are one paid operation. If no one responds, unavailability is itself the fault and the challenger claims the decaying collateral. The decay is what makes data-hiding a dominated strategy: an honest self-flagger acts within seconds of risk transfer and collects nearly full value, while a wait-and-reveal attacker's prize rots away.

It's expected that a large fraction of blocks will be forgotten pretty quickly. This is why long-term insurance isn't responsible for data serving — with one necessary exception: **evidence custody**. A rectification claim requires the faulting block's data, and after the serving window the current insurer (who fetched the data to probe before insuring) may be its only custodian — with every incentive to withhold the evidence against themselves. Rectification insurance must therefore also pay on _unanswered availability challenges against insured claims_: the insurer either serves the data on demand, letting the challenger check validity, or the silence itself becomes the provable fault. Without this rule, computational faults become unprovable exactly when victims discover them (§10.3).

### 8.2 Structural coverage via the aggregation chain

The successive aggregations of a block are called the aggregation chain. Multiple aggregation chains may exist, for example when an aggregation output is claimed multiple times, but only one will be canonical. This chain is important for two reasons:

1. It proves that the block is well-known and trusted. A large, well-known aggregation root with insurance implies trust in the block.
2. It proves absence of discovered invalidity or double-spends. Both of those are encoded into an aggregation.

**Funding and payouts.** Insurance is parameterized by a target block hash, which is the tree root that it covers. Negative contest resolutions can be claimed, which give payouts. More funds can also be added. Once the target block gets aggregated, it requests the remaining insurance, which gets returned to the insurers, and the fee is distributed to who funded the payouts.

Payouts are drawn **sequentially (tranched)**: from the first fund to the last, first-loss capital absorbing payouts first and earning the larger fee share — this is how risk capital prices heterogeneous appetite, and it's barely more complex than the pro-rata alternative (drawn equally from the total pool, fees proportional to funding), which is recorded in Appendix B.

The target block's aggregator (which claims the last block in the insurance chain) includes block hashes (or paths, which might be smaller) of the newly disqualified blocks.

Remaining funds can always be withdrawn, but you lose fees. This allows insurers of non-canonical branches to regain their funds. Once this happens, that non-canonical branch loses trust because it lost insurance.

## 9. Appendices

### Appendix A: v1 → v2

One of the difficulties in an arbitrary DAG is that a large spend can be buried deep inside, and there's no way for a node to "discover" it and check whether it's valid or not. You can require the aggregator sum the internal size or throughput, but they could lie. The v1 solution was that the aggregation is canonical, not the internal block. The aggregation block contains all the information necessary for UTXO transformation. Even if a buried internal block is invalid, it's ignored once aggregated.

The v2 change is that instead of requiring the aggregate to be internally consistent and encoding everything needed to transform the UTXO vector, it simply solidifies the output and insures any future invalidities found inside its subtree. Contrary to v1, double-spends don't mean the aggregation is invalid, just that coins must be burned from the insurance to ensure the total throughput is constant. Inputs must equal outputs. Misdirected funds (for example a block invalidly claiming an output) are marked invalid, allowing the output to be spent a second time, and the insurance burns some funds to make the throughput equal.

> 💡 Weight attribution also changed: v1 attributed children's weight to aggregators; v2 attributes it to anchors (§4.2). The v2 behavior is more correct.

### Appendix B: Abandoned designs

**Claim addressing alternatives** (the chosen method is option 3, §4.5). In order from simplest to most powerful:

1. A simple block hash and output index. This is simple, yet does not prove that the claimed block is included in the anchor chain. Users desire to trust a block's contents, and they do this by seeing that the block's inputs (claims and refs) are insured by well-known blocks.
2. A 3-tuple of integers: `{ chainHops, treePath, outputIndex }`. The output is resolved by following `chainHops` chain anchors, then recursively taking `block.aggregates[(treePath % block.aggregates.length) - 1]` until the path is zero, then selecting the correct output. This works but feels less elegant than option 3. It would be implemented something like this:

```typescript
// Note locateBlock(block, 0, 0) -> block (a self-claim)
function locateBlock(block: Block, chainHops: number, treePath: bigint) {
  for (let i = 0; i < chainHops; i++) {
    block = block.anchor;
  }
  while (treePath !== 0n) {
    const child = treePath % BigInt(block.children.length);
    block = block.children[child];
    treePath /= BigInt(block.children.length);
  }
}
```

3. A single integer, an index into the entire output vector defined by the block, its anchor chain, and the anchor chain's subtrees. **This is the chosen method** (§4.5).
4. A single integer, an index into the UNCLAIMED output vector. This has the advantage of being unable to address the same claim twice, eliminating the possibility of double-spends. However, the unclaimed output space changes as claims land, so resolving an index through another block requires transforming it through a claim mask (potentially very large for a large aggregation), likely requiring hash inversions for a claim mask merkle tree — a lot of machinery for clients to run to simply resolve claims. The double-spend-detection benefit was recovered without the client cost by the merkle mask of §4.6.

**Aggregations recording the descendant weight of each subtree** (maybe the descendant weight contained in the aggregation, from other following subtrees) instead of the weight vector. After aggregation, little else should anchor to the children. But it's unclear this helps; you still have to compute the subtree weight somehow.

**Canonicality boosts** — boosting conflict resolution via a canonicality boost, block throughput metric, or claim throughput metric. These boosts have no cost to create, allowing an actor to add another claim to a deeply buried output with an arbitrarily large boost, invalidating a large subset of the graph. Even throughput-based modifiers are susceptible because the account contract can simply be used to generate arbitrarily large throughputs. (Later analysis partially rehabilitated boosts as a _liveness incentive_ — an under-collecting resolution has strictly less claimed weight and loses fork choice organically — but they are insufficient as a _safety mechanism_; safety needs the challenge windows / quorum certificates of §9.2.)

**Insurance payout as a boost to the replacement** — increasing the canonicality of a replacement block, instead of decreasing the canonicality of the invalid block (as currently specified). This seems a little more complex, and the resulting aggregation fee would differ from the original block's.

**Free-market vs selfish transaction partitioning.** One interesting way to partition the claims or outputs of a block is into free-market transactions and selfish transactions. A free-market transaction is one that anyone can claim with approximately the same amount of effort, like the aggregation contract. A selfish transaction is one that requires private knowledge to claim, like the signature contract. Generally we want to select claims that have more free-market outputs, since that encourages competition. The question is how to differentiate the two; a whitelist is pretty centralized and contracts can't really be trusted to flag themselves. One interesting solution is to consider conflicting claims' outputs. The difference in amounts between SHARED contract hashes can be considered a free market bonus, while contract hashes occurring on only one block are pessimistically considered selfish. A free-market flag can be used to allow a block to say an output is NOT free-market, even if the block happens to output to it.
