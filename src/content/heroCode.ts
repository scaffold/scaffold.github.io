/**
 * Hand-marked code for the hero code window, using the design system's
 * span classes (kw/str/com/fn/num/punct). The Run tab is identical for
 * every language — callers never care what a contract is written in.
 * Later this becomes editable + runnable in place.
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
export const SOON_LANG = { label: 'Python', note: 'SOON', title: 'Planned — via WASI' };

export const FILES: Record<Step, Record<Lang, string>> = {
  contract: { rust: 'lib.rs', as: 'contract.ts', go: 'contract.go' },
  build: { rust: 'build · sh', as: 'build · sh', go: 'build · sh' },
  run: { rust: 'main.ts', as: 'main.ts', go: 'main.ts' },
};

const RUN_TS = `<span class="kw">import</span> <span class="punct">{</span> Scaffold<span class="punct">,</span> browserConfig <span class="punct">}</span> <span class="kw">from</span> <span class="str">'@scaffold/core'</span><span class="punct">;</span>

<span class="com">// Connect to the Scaffold network.</span>
<span class="kw">const</span> scaffold <span class="punct">=</span> <span class="kw">new</span> <span class="fn">Scaffold</span><span class="punct">(</span>browserConfig<span class="punct">);</span>

<span class="com">// Any WASM contract, addressed by its hash.</span>
<span class="kw">const</span> greeter <span class="punct">=</span> <span class="str">'0xdda8ecfd22ea…'</span><span class="punct">;</span>

<span class="com">// Routed to a peer that has the contract; the peer</span>
<span class="com">// runs it and returns the collateralized result.</span>
<span class="kw">const</span> hello <span class="punct">=</span> <span class="kw">await</span> scaffold<span class="punct">.</span><span class="fn">fetch</span><span class="punct">({</span>
  contractHash<span class="punct">:</span> greeter<span class="punct">,</span>
  params<span class="punct">:</span> <span class="str">'World'</span><span class="punct">,</span>
<span class="punct">});</span>

<span class="fn">console</span><span class="punct">.</span><span class="fn">log</span><span class="punct">(</span>hello<span class="punct">.</span><span class="fn">text</span><span class="punct">());</span> <span class="com">// → "Hello World!"</span>`;

const CONTRACT_RUST = `<span class="com">// A Scaffold contract: a pure, deterministic function,</span>
<span class="com">// compiled to WASM and addressed by the hash of its bytes.</span>
<span class="kw">mod</span> scaffold<span class="punct">;</span>

<span class="fn">contract_name!</span><span class="punct">(</span><span class="str">b"Greeter"</span><span class="punct">);</span>

<span class="kw">#[no_mangle]</span>
<span class="kw">pub extern fn</span> <span class="fn">hello</span><span class="punct">()</span> <span class="punct">{</span>
  <span class="kw">let mut</span> params <span class="punct">=</span> <span class="fn">Vec</span><span class="punct">::</span><span class="fn">new</span><span class="punct">();</span>
  scaffold<span class="punct">::</span><span class="fn">read_params</span><span class="punct">(&amp;</span><span class="kw">mut</span> params<span class="punct">);</span>

  <span class="kw">let</span> name <span class="punct">=</span> <span class="fn">String</span><span class="punct">::</span><span class="fn">from_utf8</span><span class="punct">(</span>params<span class="punct">).</span><span class="fn">unwrap</span><span class="punct">();</span>
  scaffold<span class="punct">::</span><span class="fn">require_body</span><span class="punct">(</span><span class="fn">format!</span><span class="punct">(</span><span class="str">"Hello {}!"</span><span class="punct">,</span> name<span class="punct">).</span><span class="fn">as_bytes</span><span class="punct">());</span>
<span class="punct">}</span>`;

const CONTRACT_AS = `<span class="com">// A Scaffold contract in AssemblyScript — TypeScript</span>
<span class="com">// syntax, no runtime, compiled straight to WASM by asc.</span>
<span class="kw">import</span> <span class="punct">{</span> readParams<span class="punct">,</span> requireBody<span class="punct">,</span> contractName <span class="punct">}</span> <span class="kw">from</span> <span class="str">'./scaffold'</span><span class="punct">;</span>

<span class="fn">contractName</span><span class="punct">(</span><span class="str">'Greeter'</span><span class="punct">);</span>

<span class="kw">export function</span> <span class="fn">hello</span><span class="punct">():</span> <span class="kw">void</span> <span class="punct">{</span>
  <span class="kw">const</span> name <span class="punct">=</span> <span class="fn">String.UTF8.decode</span><span class="punct">(</span><span class="fn">readParams</span><span class="punct">());</span>
  <span class="fn">requireBody</span><span class="punct">(</span><span class="fn">String.UTF8.encode</span><span class="punct">(</span><span class="str">\`Hello \${name}!\`</span><span class="punct">));</span>
<span class="punct">}</span>`;

const CONTRACT_GO = `<span class="com">// A Scaffold contract in Go, compiled to WASM with TinyGo.</span>
<span class="com">// Ordinary Go: \`go test\` and benchmarks work as you'd expect.</span>
<span class="kw">package</span> main

<span class="kw">import</span> <span class="str">"scaffold"</span>

<span class="com">//export hello</span>
<span class="kw">func</span> <span class="fn">hello</span><span class="punct">()</span> <span class="punct">{</span>
  name <span class="punct">:=</span> <span class="kw">string</span><span class="punct">(</span>scaffold<span class="punct">.</span><span class="fn">ReadParams</span><span class="punct">())</span>
  scaffold<span class="punct">.</span><span class="fn">RequireBody</span><span class="punct">([]</span><span class="kw">byte</span><span class="punct">(</span><span class="str">"Hello "</span> <span class="punct">+</span> name <span class="punct">+</span> <span class="str">"!"</span><span class="punct">))</span>
<span class="punct">}</span>

<span class="kw">func</span> <span class="fn">main</span><span class="punct">()</span> <span class="punct">{}</span>`;

const BUILD_RUST = `<span class="com"># Compile the contract to WASM</span>
cargo build <span class="kw">--release</span> <span class="kw">--target</span> wasm32-unknown-unknown

<span class="com"># Publish it to the network</span>
scaffold put target/wasm32-unknown-unknown/release/greeter.wasm
<span class="com"># → 0xdda8ecfd22ea2b9fd670cd43cadd553e…</span>`;

const BUILD_AS = `<span class="com"># Compile the contract to WASM</span>
asc contract.ts <span class="kw">-O3</span> <span class="kw">--runtime</span> stub <span class="kw">-o</span> greeter.wasm

<span class="com"># Publish it to the network</span>
scaffold put greeter.wasm
<span class="com"># → 0xdda8ecfd22ea2b9fd670cd43cadd553e…</span>`;

const BUILD_GO = `<span class="com"># Compile the contract to WASM with TinyGo</span>
tinygo build <span class="kw">-o</span> greeter.wasm <span class="kw">-target=</span>wasm-unknown ./

<span class="com"># Publish it to the network</span>
scaffold put greeter.wasm
<span class="com"># → 0xdda8ecfd22ea2b9fd670cd43cadd553e…</span>`;

export const CODE: Record<Step, Record<Lang, string>> = {
  contract: { rust: CONTRACT_RUST, as: CONTRACT_AS, go: CONTRACT_GO },
  build: { rust: BUILD_RUST, as: BUILD_AS, go: BUILD_GO },
  run: { rust: RUN_TS, as: RUN_TS, go: RUN_TS },
};
