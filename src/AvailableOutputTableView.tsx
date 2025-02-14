import React from 'react';
import { Logger } from 'scaffold/src/Logger.ts';
import TableView, { Column } from './TableView.tsx';
import { UiContext } from './context.ts';
import { error } from 'scaffold/src/util/functional.ts';
import { AvailableOutputRecordSet } from 'scaffold/src/record_sets/AvailableOutputRecordSet.ts';
import { InputSpec } from 'scaffold/src/BlockBuilder.ts';
import { Verifier } from 'scaffold/src/messages.ts';
import { QueueRecord } from 'scaffold/src/record_sets/QueueRecordSet.ts';
import { QaDebugger } from 'scaffold/src/QaDebugger.ts';

export default ({}: {}) => {
  const { ctx, setSelectedHash, setHoveredHash } = React.useContext(UiContext) ??
    error('No context!');

  const columns = React.useMemo<Column<QueueRecord<Verifier, InputSpec>>[]>(
    () => [
      {
        header: 'key',
        cell: (rec) => ctx.get(QaDebugger).debugVerifier(rec.queue.key),
      },
      {
        header: 'pending size',
        cell: (rec) => rec.queue.pending.length,
      },
      {
        header: 'handler size',
        cell: (rec) => rec.queue.handlers.length,
      },
      {
        header: 'throughput count',
        cell: (rec) => rec.throughputCount,
      },
    ],
    [],
  );

  return (
    <TableView
      recordSet={ctx.get(AvailableOutputRecordSet)}
      columns={columns}
      expandRow={(state) => (
        <>
          <pre>{ctx.get(Logger).serialize(state, 2, 72)}</pre>
          <pre>EXPAND</pre>
        </>
      )}
    />
  );
};
