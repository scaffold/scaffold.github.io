import React from 'react';
import CodeView from '../CodeView.tsx';

const jsCode = `
import { Scaffold, browserConfig } from 'https://github.com/scaffold/scaffold/raw/v1.0.0/index.ts';

// Connect to the scaffold network
const scaffold = new Scaffold(browserConfig);

// The hash of your WASM binary
const greeterContract = 'dda8ecfd22ea2b9fd670cd43cadd553ebfe35dac89a5552ab15fd1cf3eca21bd';

// Transparently load-balances between running (1) on the local device, (2) on a peer, or (3) on a server
scaffold.fetch(
  \`scf://\${greeterContract}/hello.from_str.World/to_str.body\`,
  (response) => console.log(response), // Prints \`Hello World!\`
);
`;

const rustCode = `
// Import the scaffold library
mod scaffold;

// Create a WASM custom section with some helpful debug information
contract_name!(b"Greeter");

// This functions as both a generator (creating blocks) and a verifier (of other nodes' blocks)
#[no_mangle]
pub extern fn hello() {
  // Load parameters
  let mut params: Vec<u8> = Vec::new();
  scaffold::read_params(&mut params);

  // Deserialize params
  let name = String::from_utf8(params).unwrap();
  
  // Compute result
  let result = format!("Hello {}!", name);

  // Serialize result
  scaffold::require_body(result.as_bytes());
}
`;

const shCode = `
# Create a WASM binary
cargo build --release

# Upload the WASM to the scaffold network
scaffold put target/wasm32-unknown-unknown/release/greeter.wasm
# Prints dda8ecfd22ea2b9fd670cd43cadd553ebfe35dac89a5552ab15fd1cf3eca21bd, which is used in main.js
`;

const files = {
  'main.js': jsCode,
  'lib.rs': rustCode,
  'build.sh': shCode,
};

export default () => (
  <CodeView
    files={files}
    style={{ margin: 'auto', marginBottom: '50px', minWidth: '60em' }}
  />
);
