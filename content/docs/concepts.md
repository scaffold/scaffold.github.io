---
title: Concepts
description: The ideas that Scaffold is built upon.
---

# Concepts

> These concepts are somewhat simplified; there's a number of things not covered and omitted in favor of giving a high-level overview of the most important ideas.

## Blocks

Scaffold's atomic unit is a block. It holds claims and outputs. Each claim references a single other block's output, and each output may only be claimed at most once. Each claim and output carries an amount of coins, and the total amount of coins claimed by a block and output by that block must be equal. This is the store of value that supports much of what Scaffold does.

An output carries a predicate, which basically says what kind of blocks may claim the output. For example, a signature predicate says that only blocks signed by a specific public key may claim the output and the associated coins. Effectively, this holds funds for a specific address or account.

Output predicates are also how you request a computation. The predicate carries the "question", and says that only blocks containing an answer are eligible to claim the output. The output's coins serve as incentive for someone else to perform the computation, generate the answer, and claim the output.

## The block graph

As mentioned previously, blocks are connected by their claims and outputs, and the resulting structure forms a directed acyclic graph (DAG). Furthermore, the graph is organized into a forest; a O(log(N))-sized set of trees. You can imagine this as a list of trees of exponentially decreasing size, with older blocks being in larger trees to the left, and newer blocks being added to smaller trees to the right. As trees grow, they merge into larger trees. This process is called "aggregation", and it's the foundation of efficient "views" of very large sets of blocks.

The block graph is intentionally sparse. Most leaf blocks and small aggregations will be forgotten relatively quickly, while larger aggregation blocks will persist longer and on more peers.

A single genesis block outputs N coins. At any given time, the total number of unclaimed outputs should sum to N. This is often not the case, as it's common for multiple peers to generate blocks claiming the same output. This is rectified by 2 mechanisms, one for recent double-claims and one for older double-claims.

A recent double-claim is typically pretty visible, since the UTXO set should be relatively well-circulated. These 2 blocks will be marked as conflicting by peers that see both, and only one of them will be aggregated into the canonical forest.

Let's say a double-claim is missed and gets aggregated into the canonical forest. Millions of blocks will be built on top of it, making it impossible to rectify by rewriting the graph. This case is covered by aggregation insurance - coins required to be locked in reserves by the aggregation blocks, and burned to cover any double-spend which was missed by the aggregation process. This serves both as a rectification mechanism and an incentive for aggregators to probe their subtrees for double-claims before aggregating them.

## Contracts

Contracts are central to almost everything that Scaffold does. They are used to generate blocks, verify received blocks, and weight subsets of the block grapht to determine consensus. A contract can be understood as a simple `run(env: ContractEnv): void` method that either succeeds or throws an error. The contract calls methods of the `env` object to interact with Scaffold.

There are two modes that contracts operate under, that are mostly invisible to the contract itself: generation and verification. A contract running in generation mode will call methods on the `env` object and, assuming the contract completes, will result in a new block being generated and published to the network. Let's say another Scaffold instance or peer receives the new block. It will call the same contract in verification mode, which will call the exact same sequence of methods on the new `env` object. Scaffold will either accept or reject the block based on whether the contract completes successfully and whether the called methods exactly match the provided block.

For example, one of the methods is `setResult(value: Uint8Array): void`. In generation mode, this method adds a new "result" field to the block being generated. In verification mode, this method checks that the "result" field on the block matches the provided value.

## Contract specification

A contract is a JSON blob published to the network and addressed by the hash of its bytes. It looks something like this:

```json
{
  "modules": {
    "base": {
      "version": 20250510,
      "entries": {
        "run": "<layerKey>:<exportName>",
        ...
      },
      "memories": {
        "<memoryName>": { "initial": 16, "maximum": 4096, "shared": true }
      }
    },
    "layers": [
      {
        "key": "<layerKey>",
        "wasmHash": "<64-char hex content hash>",
        "import": {
          "<ns>.<field>": "<layerKey>:<exportName>",
          "<ns>.<field>": "base:<scaffoldMethod>",
          "<prefix>.*": "<layerKey>:<exportPrefix>*"
        }
      },
      ...
    ]
  }
}
```

A contract consists of a set of layers, each one a WebAssembly instance of a blob addressed by its hash. Layers can be wired together by linking their imports and exports. For example, if layer `program` contains import `"wasi_snapshot_preview1.fd_read": "wasi_shim:fd_read"`, then when `program` calls the imported `wasi_snapshot_preview1.fd_read`, it will call `wasi_shim`'s `fd_read` export.

`base` is a pseudo-layer that exports methods used to both generate blocks and verify them. For example, `base:set_result` may be imported and called by a layer.

Finally, multiple memories may be created and imported as needed. Browsers have pretty good support for [multiple memories](https://github.com/WebAssembly/multi-memory) today, but compiler toolchains are a little behind. If it's difficult for you to compile a multi-memory WASM module, you may use Scaffold's memory accessor function feature by appending `@read` or `@write` to the memory name. A function will be assigned to the import, allowing you to read and write to the external memory without importing it.

```json
"import": {
  "program_mem.read_bytes": "program:memory@read",
  "program_mem.write_bytes": "program:memory@write",
  ...
}
```

> Note: Today, as of Aug 12, 2026, WASM contracts are still in development and disabled. Only a few static contracts defined in JavaScript are able to be executed.
