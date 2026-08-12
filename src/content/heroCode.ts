/**
 * Source for the hero code window. This is the single source of truth — to
 * change a snippet, just edit the plain text in SOURCE below. Monaco tokenizes
 * it on the client; there's no separately-maintained highlighted copy.
 */

export type Lang = 'rust' | 'as' | 'go';
export type Step = 'contract' | 'build' | 'run';

/** Selectable contract languages, shown bottom-left of the code window. */
export const LANGS: { id: Lang; label: string }[] = [
  { id: 'rust', label: 'Rust' },
  { id: 'as', label: 'AssemblyScript' },
  { id: 'go', label: 'Go' },
];

/** Planned-but-not-yet language, shown disabled with a SOON tag. */
export const SOON_LANG = {
  label: 'Python',
  note: 'SOON',
  title: 'Planned — via WASI',
};

/** Filename shown in the window's top-right meta bar. */
export const FILES: Record<Step, Record<Lang, string>> = {
  contract: { rust: 'lib.rs', as: 'contract.ts', go: 'contract.go' },
  build: { rust: 'build · sh', as: 'build · sh', go: 'build · sh' },
  run: { rust: 'main.ts', as: 'main.ts', go: 'main.ts' },
};

/** Monaco language id per (step, language) — drives syntax highlighting. */
export const MONACO_LANG: Record<Step, Record<Lang, string>> = {
  contract: { rust: 'rust', as: 'typescript', go: 'go' },
  build: { rust: 'shell', as: 'shell', go: 'shell' },
  run: { rust: 'typescript', as: 'typescript', go: 'typescript' },
};

// ---- Snippets -----------------------------------------------------
// The Run step is identical for every language — callers never care what a
// contract is written in.

const RUN = `import { Scaffold, makeBrowserConfig } from 'scaffold.io';

// Connect to the Scaffold network.
const scaffold = new Scaffold(makeBrowserConfig());

// Any WASM contract, addressed by its hash.
const contract = '3338be694f50c5f338814986cdf0686453a888b84f424d792af4b9202398f392';

// Contracts natively process byte arrays, but expose serializers to make development easier
const params = await scaffold.serializeParamsObj(contract, { name: 'World' });

// Routed to a peer that has the contract; the peer
// runs it and returns the collateralized result.
await scaffold.fetch({
  contract,
  params,
  onResult: async (result) => {
    const { message } = await result.parse();
    console.log(message); // → "Hello World!"
  },
});`;

const CONTRACT_RUST = `// A Scaffold contract: a pure, deterministic function,
// compiled to WASM and addressed by the hash of its bytes.
mod scaffold;

contract_name!(b"Greeter");

#[no_mangle]
pub extern fn hello() {
  let mut params = Vec::new();
  scaffold::read_params(&mut params);

  let name = String::from_utf8(params).unwrap();
  scaffold::require_body(format!("Hello {}!", name).as_bytes());
}`;

const CONTRACT_AS = `// A Scaffold contract in AssemblyScript — TypeScript
// syntax, no runtime, compiled straight to WASM by asc.
import { readParams, requireBody, contractName } from './scaffold';

contractName('Greeter');

export function hello(): void {
  const name = String.UTF8.decode(readParams());
  requireBody(String.UTF8.encode(\`Hello \${name}!\`));
}`;

const CONTRACT_GO = `// A Scaffold contract in Go, compiled to WASM with TinyGo.
// Ordinary Go: \`go test\` and benchmarks work as you'd expect.
package main

import "scaffold"

//export hello
func hello() {
  name := string(scaffold.ReadParams())
  scaffold.RequireBody([]byte("Hello " + name + "!"))
}

func main() {}`;

const BUILD_RUST = `# Compile the contract to WASM
cargo build --release --target wasm32-unknown-unknown

# Publish it to the network
scaffold put target/wasm32-unknown-unknown/release/greeter.wasm
# → 0xdda8ecfd22ea2b9fd670cd43cadd553e…`;

const BUILD_AS = `# Compile the contract to WASM
asc contract.ts -O3 --runtime stub -o greeter.wasm

# Publish it to the network
scaffold put greeter.wasm
# → 0xdda8ecfd22ea2b9fd670cd43cadd553e…`;

const BUILD_GO = `# Compile the contract to WASM with TinyGo
tinygo build -o greeter.wasm -target=wasm-unknown ./

# Publish it to the network
scaffold put greeter.wasm
# → 0xdda8ecfd22ea2b9fd670cd43cadd553e…`;

export const SOURCE: Record<Step, Record<Lang, string>> = {
  contract: { rust: CONTRACT_RUST, as: CONTRACT_AS, go: CONTRACT_GO },
  build: { rust: BUILD_RUST, as: BUILD_AS, go: BUILD_GO },
  run: { rust: RUN, as: RUN, go: RUN },
};
