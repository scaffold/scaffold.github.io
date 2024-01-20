import React from 'react';
import SblClient from './SblClient.ts';
import FetchService from 'scaffold/src/FetchService.ts';
import { rootHash } from 'scaffold/src/constants.ts';
import Hash from 'scaffold/src/util/Hash.ts';
import FactService from 'scaffold/src/FactService.ts';
import { BlockFact, FactType } from 'scaffold/src/FactMeta.ts';
import WeightService from 'scaffold/src/WeightService.ts';
import Context from 'scaffold/src/Context.ts';
import { BlockInput } from 'scaffold/src/messages.ts';
import BlockService from 'scaffold/src/BlockService.ts';

interface BlockOutput {
  block: BlockFact;
  outputIdx: number;
}

const client = new SblClient();

const getBest = <OptionType extends { block: BlockFact }>(
  ctx: Context,
  options: Iterable<OptionType>,
) => {
  let bestScore: bigint | undefined;
  let bestDescendant: OptionType | undefined;
  for (const opt of options) {
    const score = ctx.get(WeightService).getCanonicality(opt.block);
    if (bestDescendant === undefined || score > bestScore!) {
      bestScore = score;
      bestDescendant = opt;
    }
  }
  return bestDescendant;
};
const tracePath = (ctx: Context, incentives: BlockOutput[]) => {
  const path: BlockFact[] = [];
  let output: BlockOutput | undefined = getBest(ctx, incentives);

  while (output !== undefined) {
    path.push(output.block);
    const claims = output.block.outputClaims[output.outputIdx];
    const best = getBest(ctx, claims);
    if (best === undefined) {
      break;
    }
    output = { block: best.block, outputIdx: best.block.frontierOutputIdx };
  }

  // TODO: Trace path in one loop, by always choosing the highest-weight descendant, either a parent or frontier voter.

  while (output !== undefined) {
    path.push(output.block);
    const claims = output.block.frontierVoters.map((x) => ({ block: x }));
    const best = getBest(ctx, claims);
    if (best === undefined) {
      break;
    }
    output = { block: best.block, outputIdx: best.block.frontierOutputIdx };
  }

  return path;
};

export default ({ ctx }: { ctx: Context }) => {
  const [isRunning, setRunning] = React.useState(false);
  const [incentives, addIncentive] = React.useReducer<
    React.Reducer<BlockOutput[], BlockOutput>
  >((arr, incentive) => [...arr, incentive], []);
  const [path, setPath] = React.useState<BlockFact[]>([]);

  React.useEffect(() => {
    if (isRunning) {
      const itvl = setInterval(() => {
        const newPath = tracePath(ctx, incentives);
        if (
          newPath.length !== path.length ||
          newPath.some((x, i) => x !== path[i])
        ) {
          setPath(newPath);
        }
      }, 100);
      return () => clearInterval(itvl);
    }
  }, [isRunning]);

  return (
    <div>
      <button
        onClick={() => {
          setRunning(!isRunning);

          if (!isRunning) {
            client.ctx.get(FetchService).fetch(
              { contract_hash: rootHash, params: Hash.digest('abc').toBytes() },
              {
                onIncentiveBlock: (block, outputIdx) =>
                  addIncentive({ block, outputIdx }),
              },
              (x) => console.log(x),
            );
          }
        }}
      >
        Run
      </button>
      <ol>
        {path.map((x) => (
          <li>{x.hash.toHex().slice(0, 8)} @ {x.frontierParams.level}</li>
        ))}
      </ol>
    </div>
  );
};

// The incentive block
// The response block
// The collateral block
// The descending frontier chain
// The total derived work / canonicality

// Every N ms, trace the longest descending canonical path, starting with a
