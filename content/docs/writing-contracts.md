---
title: Writing contracts
description: The contract ABI, the Rust and AssemblyScript SDKs, and how to build and publish.
---

# Writing contracts

A Scaffold contract is a WebAssembly module that exports a handful of functions
and imports its environment from the host. You can write one in any language
that compiles to WASM; the **Rust** and **AssemblyScript** SDKs wrap the ABI in
idiomatic helpers. WASI support — bringing Python, JavaScript, Go, and Ruby —
is planned.

## The shape of a contract

A contract module:

- exports an allocator (`alloc`) the host uses to pass data in;
- exports entry points the host calls (`run`, plus optional `walk_*` /
  `build_*` functions);
- imports host functions to read its parameters, fetch claims, and emit
  results.

Static facts — output namespaces, ABI version, resource limits — don't live in
the module. They're record outputs on the contract's introducing block, so
peers can read them without instantiating the WASM.

## Rust

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

Build for the `wasm32-unknown-unknown` target:

```bash
cargo build --release --target wasm32-unknown-unknown
```

## AssemblyScript

```typescript
// Built with AssemblyScript (asc)
import { readParams, requireBody, contractName } from './scaffold';

contractName('Greeter');

export function hello(): void {
  const name = String.UTF8.decode(readParams());
  const result = `Hello ${name}!`;

  requireBody(String.UTF8.encode(result));
}
```

```bash
asc contract.ts -O3 --runtime stub -o greeter.wasm
```

The `--runtime stub` flag keeps the module small — contracts are short-lived,
so memory is never freed, and a bump allocator is all you need.

## Determinism rules

Verification re-runs your contract and compares output byte-for-byte, so
contracts must be deterministic:

- No wall-clock time — use the host's `timestamp()`, which returns the block
  timestamp.
- No randomness unless it's seeded from inputs.
- No floating-point operations whose results vary across platforms; stick to
  integer math where possible.

If two honest peers can disagree about your output, your collateral is at risk
from your own code. The SDKs are designed to make the deterministic path the
easy path.

## Publish

```bash output=2
scaffold put greeter.wasm
# → 0xdda8ecfd22ea2b9fd670cd43cadd553e…
```

The returned hash is the contract's permanent address. Publishing is
append-only — to ship new behavior, publish a new contract and point your app
at the new hash.
