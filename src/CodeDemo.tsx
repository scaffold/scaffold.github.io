import React from 'react';
import SblClient from './SblClient.ts';
import { FetchService } from 'scaffold/src/FetchService.ts';
import { rootHash } from 'scaffold/src/constants.ts';
import { Hash, HashPrimitive } from 'scaffold/src/util/Hash.ts';
import { FactService } from 'scaffold/src/FactService.ts';
import { BlockFact, FactType } from 'scaffold/src/FactMeta.ts';
import { WeightService } from 'scaffold/src/WeightService.ts';
import { Context } from 'scaffold/src/Context.ts';
import { BlockInput } from 'scaffold/src/messages.ts';
import { BlockService } from 'scaffold/src/BlockService.ts';
import { RootContract } from 'scaffold/src/contracts/RootContract.ts';
import { str2bin } from 'scaffold/src/util/buffer.ts';
import HashView from './HashView.tsx';

interface BlockOutput {
  block: BlockFact;
  outputIdx: number;
}

const getBest = <OptionType extends { block: BlockFact }>(
  ctx: Context,
  options: Iterable<OptionType>,
) => {
  let bestScore: bigint | undefined;
  let bestDescendant: OptionType | undefined;
  for (const opt of options) {
    const score =
      ctx.get(WeightService).getCanonicality(opt.block).canonicality;
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
    const claims = output.block.frontierVoters.map((x) => ({ block: x }));
    const best = getBest(ctx, claims);
    if (best === undefined) {
      break;
    }
    output = { block: best.block, outputIdx: best.block.frontierOutputIdx };
    path.push(output.block);
  }

  return path;
};

export default ({ ctx, setHoveredHash, setSelectedHash }: {
  ctx: Context;
  setHoveredHash: (hash?: Hash) => void;
  setSelectedHash: (hash?: Hash) => void;
}) => {
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
            for (const provider of ctx.config.contractProviders) {
              if (provider instanceof RootContract) {
                provider.addData(str2bin('abc'));
              }
            }

            ctx.get(FetchService).fetch(
              { contractHash: rootHash, params: Hash.digest('abc').toBytes() },
              {
                onIncentiveBlock: (block, outputIdx) =>
                  addIncentive({ block, outputIdx }),
                onBody: (body) => console.log(body),
              },
            );
          }
        }}
      >
        Run
      </button>
      <ol>
        {path.map((x) => (
          <li>
            <HashView
              hash={x.hash}
              setHoveredHash={setHoveredHash}
              setSelectedHash={setSelectedHash}
            />{' '}
            @ {x.frontierParams.level}
          </li>
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
