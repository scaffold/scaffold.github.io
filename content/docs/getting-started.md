---
title: Getting started
description: Make your first Scaffold contract call.
---

# Getting started

Scaffold is primarily a browser library, but also provides a CLI for local development and testing. We will use both in this guide.

## Install

```bash
npm install @scaffold/core
```

The package runs in every modern browser, Deno, and Node. No native dependencies —
the runtime is WebAssembly all the way down.

## Connect to the network

```typescript
import { Scaffold, browserConfig } from '@scaffold/core';

// Connect to the Scaffold network.
const scaffold = new Scaffold(browserConfig);
```

`browserConfig` dials seed peers over WebSockets, then upgrades to WebRTC mesh
connections as it discovers peers. In Node or Deno, use `serverConfig` instead —
servers connect like any other client.

## Call a contract

Every contract is addressed by the hash of its WASM bytes. Calling one looks like
a fetch:

```typescript
// Any WASM contract, addressed by its hash.
const greeter = '0xdda8ecfd22ea…';

// The request routes to a peer that has the contract;
// the peer runs it and returns the collateralized result.
const hello = await scaffold.fetch({
  contractHash: greeter,
  params: 'World',
});

console.log(hello.text()); // → "Hello World!"
```

The call runs on-device if the contract is cached locally, otherwise on the
nearest peer that has it. Either way, the result comes back with collateral
staked on its correctness — see [Concepts](/docs/concepts) for how verification
works.

## Write your own contract

Contracts are plain WebAssembly. The Rust SDK is the most complete today:

```rust
// Import the scaffold library
mod scaffold;

contract_name!(b"Greeter");

#[no_mangle]
pub extern fn hello() {
  let mut params = Vec::new();
  scaffold::read_params(&mut params);

  let name = String::from_utf8(params).unwrap();
  let result = format!("Hello {}!", name);

  scaffold::require_body(result.as_bytes());
}
```

Build and publish it:

```bash
cargo build --release --target wasm32-unknown-unknown
scaffold put target/wasm32-unknown-unknown/release/greeter.wasm
# → 0xdda8ecfd22ea2b9fd670cd43cadd553e…
```

`scaffold put` returns the contract's hash — its permanent, content-addressed
identity on the network. Anyone holding that hash can call it; nobody can change
what it does.

See [Writing contracts](/docs/writing-contracts) for the full contract ABI,
AssemblyScript support, and patterns beyond hello-world.

## Next steps

- [Concepts](/docs/concepts) — contracts, blocks, collateral, and the tree.
- [Writing contracts](/docs/writing-contracts) — the contract ABI in depth.
- [FAQ](/docs/faq) — "is this a blockchain?" and other fair questions.
