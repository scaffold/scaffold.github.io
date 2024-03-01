import React from 'react';
import { Logger } from 'scaffold/src/Logger.ts';
import { bin2hex } from 'scaffold/src/util/hex.ts';
import TableView, { Column } from './TableView.tsx';
import { UiContext } from './context.ts';
import { error } from 'scaffold/src/util/functional.ts';
import { ConnectionRecordSet } from 'scaffold/src/record_sets/ConnectionRecordSet.ts';
import { LogEntry } from 'scaffold/src/WorkerDriverService.ts';
import { Connection } from 'scaffold/src/ConnectionService.ts';
import { EMPTY_ARR } from 'scaffold/src/util/buffer.ts';

export default ({}: {}) => {
  const { ctx, setSelectedHash, setHoveredHash } =
    React.useContext(UiContext) ?? error('No context!');

  const columns = React.useMemo<Column<Connection>[]>(() => [
    {
      header: 'public key',
      // cell: (conn) => bin2hex(conn.peer.publicKey ?? EMPTY_ARR),
      cell: (conn) =>
        conn.remotePublicKey !== undefined
          ? bin2hex(conn.remotePublicKey)
          : '?',
    },
    {
      header: 'client nonce',
      cell: (conn) => conn.remoteClientNonce ?? '?',
    },
    {
      header: 'protocol',
      cell: (conn) => conn.protocol,
    },
    {
      header: 'sent facts',
      cell: (conn) => conn.sendReliableCount + conn.sendFastCount,
    },
    {
      header: 'received facts',
      cell: (conn) => conn.recvCount,
    },
    {
      header: 'last recv timestamp',
      cell: (conn) => conn.lastRecvTimestamp,
    },
    {
      header: 'is connected',
      cell: (conn) => conn.isConnected ? 'yes' : 'no',
    },
  ], []);

  return (
    <TableView
      recordSet={ctx.get(ConnectionRecordSet)}
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
