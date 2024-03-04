import React from 'react';
import { Logger } from 'scaffold/src/Logger.ts';
import { bin2hex } from 'scaffold/src/util/hex.ts';
import TableView, { Column } from './TableView.tsx';
import { UiContext } from './context.ts';
import { error } from 'scaffold/src/util/functional.ts';
import { SignalingRecordSet } from 'scaffold/src/record_sets/SignalingRecordSet.ts';
import { LogEntry } from 'scaffold/src/WorkerDriverService.ts';
import { SignalingState } from 'scaffold/src/SignalingService.ts';

export default ({}: {}) => {
  const { ctx } = React.useContext(UiContext) ?? error('No context!');

  const columns = React.useMemo<Column<SignalingState>[]>(() => [
    {
      header: 'nonce',
      cell: (state) => bin2hex(state.signalingNonce).slice(0, 10),
    },
    {
      header: 'logs',
      cell: (state) => (
        <ol>
          {(state.log ?? [{ message: `Signaling logging is not enabled!` }])
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
      recordSet={ctx.get(SignalingRecordSet)}
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
