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
import { BalanceService } from 'scaffold/src/BalanceService.ts';
import { ReactiveRecordSet } from 'scaffold/src/record_sets/ReactiveRecordSet.ts';
import { UiContext } from './context.ts';
import { error } from 'scaffold/src/util/functional.ts';
import RowView from './RowView.tsx';

export interface Column<RecordType extends object> {
  header: React.ReactNode;
  cell(record: RecordType): React.ReactNode;
}

// TODO: Move ctx and hoveredHash to context
// TODO: Pass Service in & subscribe to data here?
export default <RecordType extends object>({ recordSet, columns, expandRow }: {
  recordSet: ReactiveRecordSet<RecordType>;
  columns: Column<RecordType>[];
  expandRow(row: RecordType): React.ReactNode;
}) => {
  const { ctx } = React.useContext(UiContext) ?? error('No context!');
  const records = React.useRef<Set<RecordType> | undefined>();
  const [_, forceUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    const addCb = (record: RecordType) => {
      records.current!.add(record);
      forceUpdate();
    };
    const removeCb = (record: RecordType) => {
      records.current!.delete(record);
      forceUpdate();
    };

    records.current = new Set(recordSet.getAll());
    recordSet.onAdd(addCb);
    recordSet.onRemove(removeCb);

    forceUpdate();

    return () => {
      recordSet.offRemove(removeCb);
      recordSet.offAdd(addCb);
      records.current = undefined;
    };
  }, [recordSet]);

  return (
    <table style={{ borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {columns.map((col, idx) => <th key={idx}>{col.header}</th>)}
        </tr>
      </thead>
      <tbody>
        {records.current !== undefined &&
          [...records.current].map((record) => (
            <RowView
              set={recordSet}
              record={record}
              columns={columns}
              expandRow={expandRow}
            />
          ))}
      </tbody>
    </table>
  );
};
