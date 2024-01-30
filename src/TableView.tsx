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
import { ReactiveRecordSet } from 'scaffold/src/util/ReactiveRecordSet.ts';
import { UiContext } from './context.ts';
import { error } from 'scaffold/src/util/functional.ts';
import RowView from './RowView.tsx';

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

// TODO: Move ctx and hoveredHash to context
// TODO: Pass Service in & subscribe to data here?
export default <RecordType extends { hash?: Hash }>(
  { recordSet, columns, expandRow }: {
    recordSet: ReactiveRecordSet<RecordType>;
    columns: ColumnDef<RecordType>[];
    expandRow(row: RecordType): React.ReactNode;
  },
) => {
  const { ctx } = React.useContext(UiContext) ?? error('No context!');
  const [records, setRecords] = React.useState<RecordType[]>([
    ...recordSet.getAll(),
  ]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  React.useEffect(() => {
    const addCb = (record: RecordType) => setRecords((arr) => [...arr, record]);
    const removeCb = (record: RecordType) =>
      setRecords((arr) => arr.filter((el) => el !== record));

    recordSet.onAdd(addCb);
    recordSet.onRemove(removeCb);

    return () => {
      recordSet.offAdd(addCb);
      recordSet.offRemove(removeCb);
    };
  }, [recordSet]);

  const table = useReactTable<RecordType>({
    data: records,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowCanExpand: () => true,
    debugTable: true,
  });

  const { rows } = table.getRowModel();

  return (
    <table style={{ borderCollapse: 'collapse' }}>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder ? null : (
                    <div
                      {...{
                        className: header.column.getCanSort()
                          ? 'cursor-pointer select-none'
                          : '',
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      <>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </>
                      <>
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? null}
                      </>
                    </div>
                  )}
                </th>
              );
            })}
          </tr>
        ))}
      </thead>
      <tbody>
        {rows.map((row) => (
          <RowView set={recordSet} row={row} expandRow={expandRow} />
        ))}
      </tbody>
    </table>
  );
};
