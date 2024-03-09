import React from 'react';
import * as moduleHashes from 'ts-examples/moduleHashes.ts';
import * as counterMessages from 'ts-examples/counterMessages.ts';
import counterStateGenerator from 'ts-examples/counter_state.generator.0.ts';
import { EMPTY_ARR } from 'scaffold/src/util/buffer.ts';
import { FetchMode, FetchService } from 'scaffold/src/FetchService.ts';
import { BlockBuilder } from 'scaffold/src/BlockBuilder.ts';
import { LocalGeneratorService } from 'scaffold/src/LocalGeneratorService.ts';
import { UiContext } from './context.ts';
import { error } from 'scaffold/src/util/functional.ts';
import { bin2str, str2bin } from 'scaffold/src/util/buffer.ts';
import { QaDebugger } from 'scaffold/src/QaDebugger.ts';
import Explorer from './Explorer.tsx';

/*
// QJS
// const initialContractHex =
//   '2699c934e05e42c7937c17bfa8d0f70cb8b65f47a5330e512df5f3b621a99709';
// const initialParams =
//   `qjs /ext/:f53424c00000000000000000000000000000000000000000000000000726f6f74/:fea2d95c07417afcedd35a10a3308361949261518b0518e2d98af1fce61b3464b.js`;

// Python
// const initialContractHex =
//   'cacf09f92d88a091f3729059f389bc0ec59d82c4b2be83ab7d08ad3849d4a9cc';
// const initialParams =
//   `python /ext/:f53424c00000000000000000000000000000000000000000000000000726f6f74/:f9e7cf4f3dfd247d2fb32f150195cf10433cf8b9bd17e2c1b18eccaa41a38b3ef.py`;

// Hello
const initialContractHex =
  '0f82ceb6b057bbe5d9e66003c4b725c97c56e804764f3538d9251d4d80c6eb20';
const initialParams = 'joel';

const contractHashes = Object.entries({ ...constants, ...moduleHashes });

const player = Hash.digest(client.ctx.config.selfPrivateKey);

// If we comment either of these out, the server should pick up the slack
client.ctx.get(LocalGeneratorService).addGenerator(
  moduleHashes.hello_wasm_hash,
  helloGenerator,
);
client.ctx.get(LocalGeneratorService).addGenerator(
  moduleHashes.thrust_game_wasm_hash,
  thrustGameGenerator,
);
client.ctx.get(LocalGeneratorService).addGenerator(
  moduleHashes.thrust_maze_wasm_hash,
  thrustMazeGenerator,
);

client.ctx.get(QaDebugger).addDebugger(
  'ThrustInit',
  moduleHashes.thrust_init_wasm_hash,
  (params) => thrustMessages.InitParams.decode(params),
  (answer) => thrustMessages.InitAnswer.decode(answer),
);
client.ctx.get(QaDebugger).addDebugger(
  'ThrustInput',
  moduleHashes.thrust_input_wasm_hash,
  (params) => thrustMessages.InputParams.decode(params),
  (answer) => thrustMessages.InputAnswer.decode(answer),
);
client.ctx.get(QaDebugger).addDebugger(
  'ThrustGame',
  moduleHashes.thrust_game_wasm_hash,
  (params) => thrustMessages.GameParams.decode(params),
  (answer) => thrustMessages.GameAnswer.decode(answer),
);
client.ctx.get(QaDebugger).addDebugger(
  'ThrustMaze',
  moduleHashes.thrust_maze_wasm_hash,
  (params) => thrustMessages.MazeParams.decode(params),
  (answer) => thrustMessages.MazeAnswer.decode(answer),
);

const startGame = () => {
  const body = thrustMessages.InitAnswer.encode({
    nonce: Hash.random(),
    init_time: BigInt(Date.now()),
  });
  const match = Hash.digest(body);
  const verifier = {
    contractHash: moduleHashes.thrust_init_wasm_hash,
    params: match.toBytes(),
  };
  client.ctx.get(BlockBuilder).publishPersistentDraft({
    body,
    satisfies: [verifier],
  });
  return match;
};
*/

export default () => {
  const { ctx } = React.useContext(UiContext) ?? error('No context!');
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    ctx.get(LocalGeneratorService).addGenerator(
      moduleHashes.counter_state_generator_0_js_hash,
      counterStateGenerator,
    );
    ctx.get(QaDebugger).addDebugger(
      'CounterState',
      moduleHashes.counter_state_generator_0_js_hash,
      (params) => bin2str(params),
      (answer) => counterMessages.State.decode(answer),
    );

    const { release } = ctx.get(FetchService).fetch({
      contractHash: moduleHashes.counter_state_generator_0_js_hash,
      params: str2bin('state'),
    }, {
      mode: FetchMode.Latest,
      onBody: (body) =>
        body !== undefined &&
        setCount(Number(counterMessages.State.decode(body).total)),
    });
    return () => release();
  }, [ctx]);

  return (
    <>
      <div>
        <button
          style={{
            backgroundColor: '#333',
            borderRadius: '4px',
            margin: '8px',
            padding: '4px 12px',
            width: '50px',
            height: '40px',
          }}
          onClick={() =>
            ctx.get(BlockBuilder).publishPersistentDraft({
              outputs: [{
                verifier: {
                  contractHash: moduleHashes.counter_state_generator_0_js_hash,
                  params: str2bin('input'),
                },
                amount: 1n,
                detail: counterMessages.Input.encode({ action: 'dec' }),
              }],
            })}
        >
          -1
        </button>

        <span
          style={{
            backgroundColor: '#333',
            borderRadius: '4px',
            margin: '8px',
            padding: '4px 12px',
            width: '50px',
            height: '40px',
          }}
        >
          {count}
        </span>

        <button
          style={{
            backgroundColor: '#333',
            borderRadius: '4px',
            margin: '8px',
            padding: '4px 12px',
            width: '50px',
            height: '40px',
          }}
          onClick={() =>
            ctx.get(BlockBuilder).publishPersistentDraft({
              outputs: [{
                verifier: {
                  contractHash: moduleHashes.counter_state_generator_0_js_hash,
                  params: str2bin('input'),
                },
                amount: 1n,
                detail: counterMessages.Input.encode({ action: 'inc' }),
              }],
            })}
        >
          +1
        </button>
      </div>
      <Explorer />
    </>
  );
};
