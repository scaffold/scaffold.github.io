import React from 'react';
import SblClient from '../SblClient.ts';
import { Hash, HashPrimitive } from 'scaffold/src/util/Hash.ts';
import * as moduleHashes from 'ts-examples/moduleHashes.ts';
import * as constants from 'scaffold/src/constants.ts';
import { bin2str, str2bin } from 'scaffold/src/util/buffer.ts';
import { FetchService } from 'scaffold/src/FetchService.ts';
import { LocalGeneratorService } from 'scaffold/src/LocalGeneratorService.ts';
import * as thrustMessages from '../../../examples/ts/thrustMessages.ts';
import helloGenerator from '../../../examples/ts/hello.generator.0.ts';
import thrustGameGenerator from '../../../examples/ts/thrust_game.generator.0.ts';
import thrustMazeGenerator from '../../../examples/ts/thrust_maze.generator.0.ts';
import { BlockBuilder } from 'scaffold/src/BlockBuilder.ts';
import { QaDebugger } from 'scaffold/src/QaDebugger.ts';
import Input from '../Input.tsx';
import { LitigationService } from 'scaffold/src/LitigationService.ts';
import { FrontierService2 } from 'scaffold/src/FrontierService2.ts';
import { defaultNetwork } from 'scaffold/src/Config.ts';
import { FactService } from 'scaffold/src/FactService.ts';
import * as pages from '../pages.ts';
import * as collatzMessages from 'scaffold/src/contracts/collatzMessages.ts';
import { collatzHash } from 'scaffold/src/constants.ts';
import ThrustView from './ThrustView.tsx';
import { UiContext } from '../context.ts';
import { error } from 'scaffold/src/util/functional.ts';
import { Context } from 'scaffold/src/Context.ts';

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

const startGame = (ctx: Context) => {
  const body = thrustMessages.InitAnswer.encode({
    nonce: Hash.random(),
    initTime: BigInt(Date.now()),
  });
  const match = Hash.digest(body);
  const verifier = {
    contractHash: moduleHashes.thrust_init_wasm_hash,
    params: match.toBytes(),
  };
  ctx.get(BlockBuilder).publishPersistentDraft({
    body,
    satisfies: [verifier],
  });
  return match;
};

export default () => {
  const { ctx } = React.useContext(UiContext) ?? error('No context!');
  React.useEffect(() => {
    // If we comment either of these out, the server should pick up the slack
    ctx.get(LocalGeneratorService).addGenerator(
      moduleHashes.hello_wasm_hash,
      helloGenerator,
    );
    ctx.get(LocalGeneratorService).addGenerator(
      moduleHashes.thrust_game_wasm_hash,
      thrustGameGenerator,
    );
    ctx.get(LocalGeneratorService).addGenerator(
      moduleHashes.thrust_maze_wasm_hash,
      thrustMazeGenerator,
    );

    ctx.get(QaDebugger).addDebugger(
      'ThrustInit',
      moduleHashes.thrust_init_wasm_hash,
      (params) => thrustMessages.InitParams.decode(params),
      (answer) => thrustMessages.InitAnswer.decode(answer),
    );
    ctx.get(QaDebugger).addDebugger(
      'ThrustInput',
      moduleHashes.thrust_input_wasm_hash,
      (params) => thrustMessages.InputParams.decode(params),
      (answer) => thrustMessages.InputAnswer.decode(answer),
    );
    ctx.get(QaDebugger).addDebugger(
      'ThrustGame',
      moduleHashes.thrust_game_wasm_hash,
      (params) => thrustMessages.GameParams.decode(params),
      (answer) => thrustMessages.GameAnswer.decode(answer),
    );
    ctx.get(QaDebugger).addDebugger(
      'ThrustMaze',
      moduleHashes.thrust_maze_wasm_hash,
      (params) => thrustMessages.MazeParams.decode(params),
      (answer) => thrustMessages.MazeAnswer.decode(answer),
    );
  }, [ctx]);

  const [url, setUrl] = React.useState(
    new URL(
      globalThis.location ? globalThis.location.href : 'http://localhost/',
    ),
  );
  const gameHex = url.searchParams.get('game');

  const gameHash = React.useMemo(() =>
    gameHex &&
    Hash.fromHex(gameHex), [gameHex]);

  return (
    <div style={{ width: '100%' }}>
      <a href={pages.thrust.path}>
        Reset
      </a>

      <span>{' '}</span>

      <a
        href='#'
        onClick={() => {
          const newUrl = new URL(url);
          newUrl.searchParams.set('game', startGame(ctx).toHex());
          globalThis.history.pushState({}, '', newUrl);
          setUrl(newUrl);
        }}
      >
        New Game
      </a>
      <br />

      {gameHash && (
        <>
          Game ID: <pre style={{ display: 'inline' }}>{gameHex}</pre>
          <ThrustView
            sbl={ctx}
            match={gameHash}
            player={Hash.digest(ctx.config.selfPrivateKey)}
          />
        </>
      )}
    </div>
  );
};
