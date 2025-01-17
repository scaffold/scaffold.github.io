import React from 'react';
import SblClient from './SblClient.ts';
import { Hash, HashPrimitive } from 'scaffold/src/util/Hash.ts';
import BlockTableView from './BlockTableView.tsx';
import * as moduleHashes from 'ts-examples/moduleHashes.ts';
import * as constants from 'scaffold/src/hashes.ts';
import { bin2str, str2bin } from 'scaffold/src/util/buffer.ts';
import { FetchService } from 'scaffold/src/FetchService.ts';
import { LocalGeneratorService } from 'scaffold/src/LocalGeneratorService.ts';
// import * as thrustMessages from '../../examples/ts/thrustMessages.ts';
// import helloGenerator from '../../examples/ts/hello.generator.0.ts';
// import thrustGameGenerator from '../../examples/ts/thrust_game.generator.0.ts';
// import thrustMazeGenerator from '../../examples/ts/thrust_maze.generator.0.ts';
import { BlockBuilder } from 'scaffold/src/BlockBuilder.ts';
import { QaDebugger } from 'scaffold/src/QaDebugger.ts';
import Input from './Input.tsx';
import { LitigationService } from 'scaffold/src/LitigationService.ts';
import { defaultNetwork } from 'scaffold/src/Config.ts';
import CodeDemo from './CodeDemo.tsx';
import ReactiveSvgRenderer from './ReactiveSvgRenderer.tsx';
import { FactService } from 'scaffold/src/FactService.ts';
import * as pages from './pages.ts';
import * as collatzMessages from 'scaffold/src/contracts/collatzMessages.ts';
import { collatzHash } from 'scaffold/src/hashes.ts';
import { UiContext } from './context.ts';
import Tab from './Tab.tsx';
import CountMetric from './CountMetric.tsx';
import { multimapCall } from 'scaffold/src/util/map.ts';
import SblProvider from './SblProvider.tsx';
import { error } from 'scaffold/src/util/functional.ts';
import { Context } from 'scaffold/src/Context.ts';
import WorkerTableView from './WorkerTableView.tsx';
import SignalingTableView from './SignalingTableView.tsx';
import ConnectionTableView from './ConnectionTableView.tsx';
import EmitterTableView from './EmitterTableView.tsx';
import UnspentOutputTableView from './UnspentOutputTableView.tsx';

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

const enum Section {
  Blocks,
  Tasks,
  Workers,
  Contests,
  Drafts,
  Contracts,
  UnspentOutputs,
  Peers,
  Connections,
  Signalers,
  Emitters,
  Logs,
  Configuration,
}

const sectionRenderers = {
  [Section.Blocks]: (ctx: Context) => (
    <>
      <ReactiveSvgRenderer />
      <BlockTableView />
    </>
  ),
  [Section.Tasks]: (ctx: Context) => undefined,
  [Section.Workers]: (ctx: Context) => <WorkerTableView />,
  [Section.Contests]: (ctx: Context) => undefined,
  [Section.Drafts]: (ctx: Context) => undefined,
  [Section.Contracts]: (ctx: Context) => undefined,
  [Section.UnspentOutputs]: (ctx: Context) => <UnspentOutputTableView />,
  [Section.Peers]: (ctx: Context) => undefined,
  [Section.Connections]: (ctx: Context) => <ConnectionTableView />,
  [Section.Signalers]: (ctx: Context) => <SignalingTableView />,
  [Section.Emitters]: (ctx: Context) => <EmitterTableView />,
  [Section.Logs]: (ctx: Context) => undefined,
  [Section.Configuration]: (ctx: Context) => undefined,
};

export default () => {
  const { ctx } = React.useContext(UiContext) ?? error('No context!');
  const [section, setSection] = React.useState(Section.Blocks);

  return (
    <>
      <div>
        <Tab
          text='Blocks'
          onClick={() => setSection(Section.Blocks)}
          getCount={() => ctx.get(FactService).hackyGetBlocksMatching().length}
        />
        <Tab text='Tasks' onClick={() => setSection(Section.Tasks)} />
        <Tab text='Workers' onClick={() => setSection(Section.Workers)} />
        <Tab text='Contests' onClick={() => setSection(Section.Contests)} />
        <Tab text='Drafts' onClick={() => setSection(Section.Drafts)} />
        <Tab text='Contracts' onClick={() => setSection(Section.Contracts)} />
        <Tab
          text='Unspent outputs'
          onClick={() => setSection(Section.UnspentOutputs)}
        />
        <Tab text='Peers' onClick={() => setSection(Section.Peers)} />
        <Tab
          text='Connections'
          onClick={() => setSection(Section.Connections)}
        />
        <Tab text='Signalers' onClick={() => setSection(Section.Signalers)} />
        <Tab text='Emitters' onClick={() => setSection(Section.Emitters)} />
        <Tab text='Logs' onClick={() => setSection(Section.Logs)} />
        <Tab
          text='Configuration'
          onClick={() => setSection(Section.Configuration)}
        />
      </div>

      {sectionRenderers[section](ctx)}
    </>
  );

  /*
  const [url, setUrl] = React.useState(
    new URL(window.location ? window.location.href : 'http://localhost/'),
  );
  const [network, setNetwork] = React.useState<string>(
    url.searchParams.get('network') ?? defaultNetwork,
  );
  const [selectedContract, selectContract] = React.useState<string>(
    initialContractHex,
  );
  const [params, setParams] = React.useState<string>(initialParams);
  const [body, setBody] = React.useState<string>('');
  const gameHex = url.searchParams.get('game');

  const [selectedHash, setSelectedHash] = React.useState<HashPrimitive>();
  const [hoveredHash, setHoveredHash] = React.useState<HashPrimitive>();

  const gameHash = React.useMemo(() => gameHex && Hash.fromHex(gameHex), [
    gameHex,
  ]);

  return (
    <>
      <div style={{ width: '100%' }}>
        <a href={pages.explorer.path}>
          Reset
        </a>
        <br />

        <Input label='Network' value={network} setValue={setNetwork} />
        <button
          onClick={() => {
            const newUrl = new URL(url);
            newUrl.searchParams.set('network', network);
            window.location.href = newUrl.toString();
          }}
        >
          Go
        </button>
        <br />

        <a
          href='#'
          onClick={() => {
            const newUrl = new URL(url);
            newUrl.searchParams.set('game', startGame().toHex());
            window.history.pushState({}, '', newUrl);
            setUrl(newUrl);
          }}
        >
          New Game
        </a>
        <br />

        <button
          onClick={() => {
            client.ctx.get(BlockBuilder).publishSingleDraft({});
          }}
        >
          Publish empty block
        </button>
        <button
          onClick={() => {
            client.ctx.get(BlockBuilder).publishSingleDraft({
              body: str2bin('abc'),
              satisfies: [{
                contractHash: constants.rootHash,
                params: Hash.digest('abc').toBytes(),
              }],
            });
          }}
        >
          Publish normal block
        </button>
        <button
          onClick={async () => {
            const badBlock = await client.ctx.get(BlockBuilder)
              .publishSingleDraft({
                body: str2bin('abc'),
                satisfies: [{
                  contractHash: constants.rootHash,
                  params: Hash.random().toBytes(),
                }],
              });
            client.ctx.get(LitigationService)
              .litigate(badBlock, [], 'VALID_CHALLENGE');
          }}
        >
          Publish bad block
        </button>
        <button
          onClick={() => {
            const start = Date.now();
            let count = 0;
            const cb = () => {
              client.ctx.get(BlockBuilder).publishSingleDraft({});
              count++;
              const duration = Date.now() - start;
              console.log(
                `Published ${count} blocks in ${duration / 1000} seconds (${
                  Math.round(count / duration * 1000)
                } blocks/sec); ${client.ctx.get(FactService).getSize()} remain`,
              );
            };
            const itvl = setInterval(cb, 1);
            (window as any).clr = () => clearInterval(itvl);
          }}
        >
          Run stress
        </button>
        <button onClick={() => client.ctx.get(FrontierService2).mergeAll()}>
          Merge frontier
        </button>

        <br />
        <select
          value={selectedContract}
          onChange={(e) => selectContract(e.target.value)}
        >
          {contractHashes.map(([name, hash]) => (
            <option value={hash.toHex()}>{name} ({hash.toHex()})</option>
          ))}
        </select>
        <br />
        <Input label='Params' value={params} setValue={setParams} />
        <button
          onClick={() =>
            client.ctx.get(FetchService).fetch(
              {
                // contractHash: Hash.fromHex(selectedContract!),
                // params: str2bin(params),
                contractHash: collatzHash,
                params: collatzMessages.Params.encode({ num: 10n }),
              },
              // TODO: Why isn't this being picked up on the work queue?
              // It's because there's no generators registered.
              // Need to make a generatorHash and register them.
              // Does the same WASM act as both a generator and a contract?
              { internalIncentive: 1n, externalIncentive: 1n },
              (body) => console.log(body),
            )}
        >
          REQUEST
        </button>
        <br />
        <Input label='Body' value={body} setValue={setBody} />
        <button
          onClick={() =>
            client.ctx.get(BlockBuilder).publishSingleDraft({
              body: str2bin(body),
              satisfies: [{
                contractHash: Hash.fromHex(selectedContract!),
                params: str2bin(params),
              }],
            })}
        >
          PROVIDE
        </button>

        <br />

        <button onClick={() => client.close()}>STOP</button>
        <br />

        <FactView
          ctx={client.ctx}
          selectedHash={selectedHash}
          setSelectedHash={setSelectedHash}
          hoveredHash={hoveredHash}
          setHoveredHash={setHoveredHash}
        />

        <BlockTableView
          ctx={client.ctx}
          selectedHash={selectedHash}
          setSelectedHash={setSelectedHash}
          hoveredHash={hoveredHash}
          setHoveredHash={setHoveredHash}
        />

        {gameHash && (
          <>
            Game ID: <pre style={{ display: 'inline' }}>{gameHex}</pre>
            {
              <ThrustView
                sbl={client.ctx}
                match={gameHash}
                player={player}
              />
            }
          </>
        )}

        <CodeDemo
          ctx={client.ctx}
          setSelectedHash={setSelectedHash}
          setHoveredHash={setHoveredHash}
        />

        <SvgRenderer
          ctx={client.ctx}
          setSelectedHash={setSelectedHash}
          setHoveredHash={setHoveredHash}
        />
      </div>
    </>
  );
  */
};
