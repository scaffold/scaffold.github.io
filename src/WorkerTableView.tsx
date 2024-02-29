import React from 'react';
import { Logger } from 'scaffold/src/Logger.ts';
import TableView from './TableView.tsx';
import { UiContext } from './context.ts';
import { error } from 'scaffold/src/util/functional.ts';
import { WorkerRecordSet } from 'scaffold/src/record_sets/WorkerRecordSet.ts';
import { WorkerDriver } from 'scaffold/src/WorkerDriverService.ts';
import { LogEntry } from 'scaffold/src/WorkerDriverService.ts';
import { Column } from './TableView.tsx';

export default ({}: {}) => {
  const { ctx, setSelectedHash, setHoveredHash } =
    React.useContext(UiContext) ?? error('No context!');

  const columns = React.useMemo<Column<WorkerDriver>[]>(() => [
    {
      header: 'logs',
      cell: (driver) => (
        <ol>
          {(driver.log ?? [{ message: `Worker logging is not enabled!` }])
            .map(({ message }) => (
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
