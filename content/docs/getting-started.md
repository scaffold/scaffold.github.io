---
title: Getting started
description: Make your first Scaffold contract call.
---

# Getting started

Scaffold is primarily a browser library, but also provides a CLI for local development and testing. We will use the CLI in this guide, but the same concepts apply when using the browser library.

## Connect to the network

Let's start with a very simple contract. `3338be694f50c5f338814986cdf0686453a888b84f424d792af4b9202398f392` simply says hello to the name you provide.

```bash
> npx scaffold.io --bootstrap_urls wss://relay.scaffold.io/ \
>   fetch 3338be694f50c5f338814986cdf0686453a888b84f424d792af4b9202398f392 world
Hello, world!
```

In this example, "world" is the params we're passing to the contract, and "Hello, world!" is the result. But sometimes, the contract can't compute the result without some extra help:

```bash
> npx scaffold.io --bootstrap_urls wss://relay.scaffold.io/ \
>   fetch 02f6096a69fd3ef5222b99fb9c2ee03c5824f6b637a867b1040a929f22f56c59 7f455bca6d76cafa81a79b746038e33b1bef9ec41e87180db8becf80b22f549a
# No output
```

Here, the first hash refers to the blob contract. This contract must return data hashing to the second hash. It's impossible for now, because Scaffold doesn't know the plaintext. We can use `put()` to tell Scaffold what the second hash [`7f455bca...`](<https://gchq.github.io/CyberChef/#recipe=SHA3('256')&input=Q29udGVudCBJIHdhbnQgdG8gc3RvcmUgb24gdGhlIFNjYWZmb2xkIG5ldHdvcms>) refers to:

```bash
> npx scaffold.io --bootstrap_urls wss://relay.scaffold.io/ \
>   put 02f6096a69fd3ef5222b99fb9c2ee03c5824f6b637a867b1040a929f22f56c59 7f455bca6d76cafa81a79b746038e33b1bef9ec41e87180db8becf80b22f549a 'Content I want to store on the Scaffold network'
{
  "type": "put_canonical",
  "hash": "c000c6b059d8a928dc654b700e97b98103028e6c9f7543b5f595dfec70af49da"
}
```

A new block has been created; for this example the block hash is not important. But we can now run the same `fetch()` we tried earlier:

```bash
> npx scaffold.io --bootstrap_urls wss://relay.scaffold.io/ \
>   fetch 02f6096a69fd3ef5222b99fb9c2ee03c5824f6b637a867b1040a929f22f56c59 7f455bca6d76cafa81a79b746038e33b1bef9ec41e87180db8becf80b22f549a
Content I want to store on the Scaffold network
```

## Write your own contract

> Coming soon!

<!--
Contracts are plain WebAssembly. Let's use rust:

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

`scaffold put` returns the contract's hash — its permanent, content-addressed identity on the network. Anyone holding that hash can call it.

See [Writing contracts](/docs/writing-contracts) for the full contract ABI, Zig + AssemblyScript support, and patterns beyond hello-world.
-->

## Next steps

- [Concepts](/docs/concepts) — contracts, blocks, collateral, and the tree.
