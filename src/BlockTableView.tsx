import React from 'react';
import { Context } from 'scaffold/src/Context.ts';
import { Logger } from 'scaffold/src/Logger.ts';
import { bin2hex } from 'scaffold/src/util/hex.ts';
import { QaDebugger } from 'scaffold/src/QaDebugger.ts';
import { Hash, HashPrimitive } from 'scaffold/src/util/Hash.ts';
import { trunc } from 'scaffold/src/util/string.ts';
import { BlockInput, BlockOutput } from 'scaffold/src/messages.ts';
import {
  BlockFact,
  Collateralization,
  FactSource,
} from 'scaffold/src/FactMeta.ts';
import { FactService } from 'scaffold/src/FactService.ts';
import { BlockService } from 'scaffold/src/BlockService.ts';
import HashView from './HashView.tsx';
import { CollateralUtil } from 'scaffold/src/CollateralUtil.ts';
import { WeightService } from 'scaffold/src/WeightService.ts';
import { BlockMetrics } from 'scaffold/src/BlockMetrics.ts';
import { BalanceService } from 'scaffold/src/BalanceService.ts';
import { BlockRecordSet } from 'scaffold/src/record_sets/BlockRecordSet.ts';
import TableView, { Column } from './TableView.tsx';
import { UiContext } from './context.ts';
import { error } from 'scaffold/src/util/functional.ts';
import { VerifierHelper } from 'scaffold/src/VerifierHelper.ts';

const wrapAccessor =
  <T,>(fn: (block: BlockFact) => T) => (block: BlockFact) => {
    try {
      return fn(block);
    } catch (err) {
      console.error(err);
      return '?';
    }
  };

const formatRange = (range: { min: bigint; max: bigint }) =>
  range.min !== range.max ? `${range.min}-${range.max}` : `${range.min}`;

export default ({}: {}) => {
  const { ctx, setSelectedHash, setHoveredHash } =
    React.useContext(UiContext) ?? error('No context!');

  const columns = React.useMemo<Column<BlockFact>[]>(() => [
    {
      header: 'hash',
      cell: (block) => (
        <>
          <a href='#' onClick={() => setSelectedHash(block.hash)}>
            <span style={{ fontFamily: 'monospace' }}>
              {block.hash.toHex().slice(0, 10)}
            </span>
          </a>
          <br />
          <a href='#' onClick={() => ctx.get(FactService).forget(block)}>
            Forget
          </a>
        </>
      ),
    },
    {
      header: 'name',
      cell: (block) => (
        <span
          onClick={() => {
            (window as any).selectedBlock = block;
          }}
        >
          {block.sillyName}
        </span>
      ),
    },
    // {
    //   header: 'timestamp',
    //   accessorFn: (block) =>
    //     // new Date(Number(block.timestamp)).toLocaleString(),
    //     new Date(Number(block.timestamp)).toISOString(),
    //   cell: (props) => <pre>{props.getValue<string>()}</pre>,
    // },
    {
      header: 'source',
      cell: (block) => ({
        [FactSource.Genesis]: 'genesis',
        [FactSource.Bootstrap]: 'bootstrap',
        // [FactSource.Building]: 'building',
        [FactSource.Local]: 'local',
        [FactSource.Remote]: 'remote',
        [FactSource.Storage]: 'storage',
      }[block.source]),
    },
    // {
    //   header: 'verifier contract hash',
    //   accessorFn: ({ val }) =>
    //     ctx.get(QaDebugger).debugQuestion(val.verifier)?.dbgContract ||
    //     val.verifier.contractHash.toHex(),
    //   cell: (props) => <pre>{trunc(props.getValue<string>())}</pre>,
    // },
    // {
    //   header: 'verifier params',
    //   accessorFn: ({ val }) => {
    //     const dbg = ctx.get(QaDebugger).debugQuestion(val.verifier)
    //       ?.dbgParams;
    //     return dbg
    //       ? ctx.get(Logger).serialize(dbg, 0)
    //       : bin2hex(val.verifier.params);
    //   },
    //   cell: (props) => <pre>{trunc(props.getValue<string>())}</pre>,
    // },

    // input:
    // $50: 7786d3c1b2.0: accountHash/78c87b2352

    {
      header: 'inputs',
      cell: (block) => (
        <ol>
          {block.inputs.map((input) => {
            const output = ctx.get(BlockService).get(input.blockHash, false)
              ?.outputs[input.outputIdx];
            return (
              <li>
                <span
                  style={{ fontFamily: 'monospace', whiteSpace: 'nowrap' }}
                >
                  ${output ? Number(output.amount) : '?'}
                  {': '}
                  <HashView
                    hash={input.blockHash}
                    setHoveredHash={setHoveredHash}
                    setSelectedHash={setSelectedHash}
                  />.{input.outputIdx}
                  {output
                    ? `: ${ctx.get(QaDebugger).debugVerifier(output.verifier)}`
                    : null}
                </span>
              </li>
            );
          })}
        </ol>
      ),
    },

    // output:
    // $50: accountHash/78c87b2352: 7786d3c1b2.0; 7786d3c1b2.1

    {
      header: 'outputs',
      cell: (block) => (
        <ol>
          {block.outputs.map((output, outputIdx) => {
            const claims = block.outputClaims[outputIdx];

            return (
              <li>
                <span
                  style={{ fontFamily: 'monospace', whiteSpace: 'nowrap' }}
                >
                  ${Number(output.amount)}
                  {': '}
                  {ctx.get(QaDebugger).debugVerifier(output.verifier)}/
                  {bin2hex(output.detail).slice(0, 10)}
                  {claims.length
                    ? (
                      <>
                        {claims.flatMap((claim, idx) => [
                          idx ? '; ' : ': ',
                          <HashView
                            hash={claim.block.hash}
                            setHoveredHash={setHoveredHash}
                            setSelectedHash={setSelectedHash}
                          />,
                        ])}
                      </>
                    )
                    : null}
                </span>
              </li>
            );
          })}
        </ol>
      ),
    },
    {
      header: 'body',

      cell: (block) => (
        <pre>{trunc(block.bodies.map((_, groupIdx) =>
          ctx.get(QaDebugger).debugBody(block, groupIdx)
        ).join(', '), 16)}</pre>
      ),
    },
    {
      header: 'frontier vote',
      cell: (block) => (
        <HashView
          hash={block.frontierVote}
          setHoveredHash={setHoveredHash}
          setSelectedHash={setSelectedHash}
        />
      ),
    },
    {
      header: 'block size',
      cell: (block) => block.data.byteLength,
    },
    {
      header: 'colls',
      cell: (block) => (
        <ol>
          {block.collateralizations.map((ctz) => (
            <li>
              <HashView
                hash={ctz.collateralBlock.hash}
                setHoveredHash={setHoveredHash}
                setSelectedHash={setSelectedHash}
              />
            </li>
          ))}
        </ol>
      ),
    },

    // {
    //   header: 'is valid',
    //   cell: (block) =>
    //     CollateralUtil.isValid(
    //         CollateralUtil.buildTree(block.collateralizations),
    //       )
    //       ? 'yes'
    //       : 'no',
    // },
    // {
    //   header: 'canonicality',
    //   cell: wrapAccessor((block) => {
    //     const x = ctx.get(WeightService).getCanonicality(block).canonicality;
    //     return x >= 0n ? <strong>{Number(x)}</strong> : Number(x);
    //   }),
    // },
    // {
    //   header: 'ancestor weight',
    //   cell: wrapAccessor((block) =>
    //     Number(ctx.get(WeightService).getAncestorWeight(block))
    //   ),
    // },
    {
      header: 'tree weights',
      cell: wrapAccessor((block) => block.frontierDetail.treeWeights.join(',')),
    },
    // {
    //   header: 'self',
    //   cell: wrapAccessor((block) =>
    //     formatRange(ctx.get(WeightService).getSelfWeight(block))
    //   ),
    // },
    // {
    //   header: 'self offset',
    //   cell: wrapAccessor((block) =>
    //     formatRange(ctx.get(WeightService).getSelfOffset(block))
    //   ),
    // },
    // {
    //   header: 'desc weight',
    //   cell: wrapAccessor((block) =>
    //     Number(ctx.get(WeightService).getDescendant(block).weight)
    //   ),
    // },

    {
      header: 'selfW',
      cell: (block) => Number(ctx.get(BlockMetrics).get(block, 'selfWeight')),
    },
    {
      header: 'voterW',
      cell: (block) =>
        ctx.get(BlockMetrics).get(block, 'voterWeight').join(','),
    },
    {
      header: 'totalW',
      cell: (block) => Number(ctx.get(BlockMetrics).get(block, 'totalWeight')),
    },
    {
      header: 'selfP',
      cell: (block) => Number(ctx.get(BlockMetrics).get(block, 'selfPenalty')),
    },
    {
      header: 'treeP',
      cell: (block) => Number(ctx.get(BlockMetrics).get(block, 'treePenalty')),
    },
    {
      header: 'totalP',
      cell: (block) => Number(ctx.get(BlockMetrics).get(block, 'totalPenalty')),
    },
  ], [ctx]);

  return (
    <TableView
      recordSet={ctx.get(BlockRecordSet)}
      columns={columns}
      expandRow={(block) => (
        <>
          <pre>{ctx.get(Logger).serialize(block, 2, 72)}</pre>
          <pre>Backtrace: {block.backtrace}</pre>
        </>
      )}
    />
  );
};
