import React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from 'tanstack-table';
import { useVirtual } from 'tanstack-virtual';
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
import { BalanceService } from 'scaffold/src/BalanceService.ts';
import { BlockRecordSet } from 'scaffold/src/BlockRecordSet.ts';
import TableView from './TableView.tsx';
import { UiContext } from './context.ts';
import { error } from 'scaffold/src/util/functional.ts';

const getBlocks = (ctx: Context) =>
  ctx.get(FactService).hackyGetBlocksMatching();

const wrapAccessor =
  <T,>(fn: (block: BlockFact) => T) => (block: BlockFact) => {
    try {
      return fn(block);
    } catch (err) {
      console.error(err);
      return '?';
    }
  };

export default ({}: {}) => {
  const { ctx, setSelectedHash, setHoveredHash } =
    React.useContext(UiContext) ?? error('No context!');

  const columns = React.useMemo<ColumnDef<BlockFact>[]>(() => [
    {
      header: 'hash',
      accessorFn: (block) => block.hash.toHex(),
      cell: (props) => (
        <a
          href='#'
          onClick={() => {
            !props.row.getIsExpanded() &&
              setSelectedHash(props.row.original.hash);
            props.row.toggleExpanded();
          }}
        >
          <span style={{ fontFamily: 'monospace' }}>
            {props.getValue<string>().slice(0, 10)}
          </span>
        </a>
      ),
    },
    {
      header: 'name',
      accessorFn: (block) => block.sillyName,
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
      accessorFn: (block) => block.source,
      cell: (props) => ({
        [FactSource.Genesis]: 'genesis',
        [FactSource.Bootstrap]: 'bootstrap',
        // [FactSource.Building]: 'building',
        [FactSource.Local]: 'local',
        [FactSource.Remote]: 'remote',
        [FactSource.Storage]: 'storage',
      }[props.getValue<FactSource>()]),
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
      accessorFn: (block) => block.inputs,
      cell: (props) => (
        <ol>
          {props.getValue<BlockInput[]>().map((input) => {
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
                    ? `: ${
                      ctx.get(QaDebugger).debugQuestion(output.verifier)
                        ?.dbgContract ??
                        output.verifier.contractHash.toHex().slice(0, 10)
                    }/${bin2hex(output.verifier.params).slice(0, 10)}`
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
      accessorFn: (block) => block,
      cell: (props) => (
        <ol>
          {props.getValue<BlockFact>().outputs.map((output, outputIdx) => {
            const claims = props.getValue<BlockFact>().outputClaims[outputIdx];

            return (
              <li>
                <span
                  style={{ fontFamily: 'monospace', whiteSpace: 'nowrap' }}
                >
                  ${Number(output.amount)}
                  {': '}
                  {ctx.get(QaDebugger).debugQuestion(output.verifier)
                    ?.dbgContract ??
                    output.verifier.contractHash.toHex().slice(0, 10)}/
                  {bin2hex(output.verifier.params).slice(0, 10)}
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
      header: 'throughput',
      accessorFn: (block) =>
        block.outputs.reduce((acc, output) => acc + output.amount, 0n),
    },
    {
      header: 'body sizes',
      accessorFn: (block) => block.bodies.map((x) => x.byteLength).join(','),
    },
    {
      header: 'body',
      accessorFn: (block) => {
        const dbg = ctx.get(QaDebugger).debugAnswer(block)?.dbgAnswer;
        return dbg
          ? ctx.get(Logger).serialize(dbg, 0)
          : block.bodies.map((x) => bin2hex(x)).join(', ');
      },
      cell: (props) => <pre>{trunc(props.getValue<string>(), 16)}</pre>,
    },
    {
      header: 'frontier vote',
      accessorFn: (block) => block.frontierVote,
      cell: (props) => (
        <HashView
          hash={props.getValue<Hash>()}
          setHoveredHash={setHoveredHash}
          setSelectedHash={setSelectedHash}
        />
      ),
    },
    {
      header: 'block size',
      accessorFn: (block) => block.data.byteLength,
    },
    {
      header: 'collateralizations',
      accessorFn: (block) => block.collateralizations,
      cell: (props) => (
        <ol>
          {props.getValue<Collateralization[]>().map((ctz) => (
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
    {
      header: 'is valid',
      accessorFn: (block) =>
        CollateralUtil.isValid(
            CollateralUtil.buildTree(block.collateralizations),
          )
          ? 'yes'
          : 'no',
    },
    {
      header: 'canonicality',
      accessorFn: wrapAccessor((block) =>
        ctx.get(WeightService).getCanonicality(block)
      ),
      cell: (props) => {
        const x = props.getValue<bigint | string>();
        if (typeof x === 'string') {
          return x;
        } else if (x >= 0) {
          return <strong>{Number(x)}</strong>;
        } else {
          return Number(x);
        }
      },
    },
    {
      header: 'ancestor weight',
      accessorFn: wrapAccessor((block) =>
        ctx.get(WeightService).getAncestorWeight(block).minWeight
      ),
    },
    {
      header: 'tree weights',
      accessorFn: wrapAccessor((block) =>
        block.frontierDetail.treeWeights.join(',')
      ),
    },
    {
      header: 'self weight min',
      accessorFn: wrapAccessor((block) =>
        ctx.get(WeightService).getSelfWeight(block).minWeight
      ),
    },
    {
      header: 'self weight max',
      accessorFn: wrapAccessor((block) =>
        ctx.get(WeightService).getSelfWeight(block).maxWeight
      ),
    },
    {
      header: 'descendant weight',
      accessorFn: wrapAccessor((block) =>
        ctx.get(WeightService).getDescendantWeight(block).minWeight
      ),
    },
  ], []);

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
