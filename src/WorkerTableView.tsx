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
import { Collateralization, FactSource } from 'scaffold/src/FactMeta.ts';
import { FactService } from 'scaffold/src/FactService.ts';
import { BlockService } from 'scaffold/src/BlockService.ts';
import HashView from './HashView.tsx';
import { CollateralUtil } from 'scaffold/src/CollateralUtil.ts';
import { WeightService } from 'scaffold/src/WeightService.ts';
import { BalanceService } from 'scaffold/src/BalanceService.ts';
import { BlockRecordSet } from 'scaffold/src/record_sets/BlockRecordSet.ts';
import TableView from './TableView.tsx';
import { UiContext } from './context.ts';
import { error } from 'scaffold/src/util/functional.ts';
import { WorkerRecordSet } from 'scaffold/src/record_sets/WorkerRecordSet.ts';
import { WorkerDriver } from 'scaffold/src/WorkerDriverService.ts';
import { LogEntry } from 'scaffold/src/WorkerDriverService.ts';

const getBlocks = (ctx: Context) =>
  ctx.get(FactService).hackyGetBlocksMatching();

const wrapAccessor =
  <T,>(fn: (worker: WorkerDriver) => T) => (worker: WorkerDriver) => {
    try {
      return fn(worker);
    } catch (err) {
      console.error(err);
      return '?';
    }
  };

export default ({}: {}) => {
  const { ctx, setSelectedHash, setHoveredHash } =
    React.useContext(UiContext) ?? error('No context!');

  const columns = React.useMemo<ColumnDef<WorkerDriver>[]>(() => [
    {
      header: 'logs',
      accessorFn: (block) => block.log ?? [],
      cell: (props) => (
        <ol>
          {props.getValue<LogEntry[]>().map(({ message }) => (
            <li>
              <pre>{message}</pre>
            </li>
          ))}
        </ol>
      ),
    },
  ], []);

  return (
    <TableView
      recordSet={ctx.get(WorkerRecordSet)}
      columns={columns}
      expandRow={(worker) => (
        <>
          <pre>{ctx.get(Logger).serialize(worker, 2, 72)}</pre>
          <pre>EXPAND</pre>
        </>
      )}
    />
  );
};
