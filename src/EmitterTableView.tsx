import React from 'react';
import { Logger } from 'scaffold/src/Logger.ts';
import { bin2hex } from 'scaffold/src/util/hex.ts';
import TableView, { Column } from './TableView.tsx';
import { UiContext } from './context.ts';
import { error } from 'scaffold/src/util/functional.ts';
import { EmitterRecord, EmitterRecordSet } from 'scaffold/src/record_sets/EmitterRecordSet.ts';
import { emptyPoolSentinel, factGeneratorType } from 'scaffold/src/FactEmitter.ts';
import { FactEmitter } from 'scaffold/src/FactEmitter.ts';

const FactEmitterStats = () => {
  const { ctx } = React.useContext(UiContext) ?? error('No context!');
  const [size, setSize] = React.useState(0);
  const [zeroRatio, setZeroRatio] = React.useState(0);
  const [heapViolations, setHeapViolations] = React.useState(0);

  React.useEffect(() => {
    const itvl = setInterval(() => {
      setSize(ctx.get(FactEmitter).getSize());
      setZeroRatio(ctx.get(FactEmitter).estimateZeroRatio());
      setHeapViolations(ctx.get(FactEmitter).countHeapViolations());
    }, 100);

    return () => clearInterval(itvl);
  }, []);

  return (
    <>
      <div>
        Size: {size}
        <span style={{ display: 'inline-block', width: 100 }}></span>
        Zero ratio: {(zeroRatio * 100).toFixed(2)}%
        <span style={{ display: 'inline-block', width: 100 }}></span>
        Heap violations: {heapViolations}
      </div>
    </>
  );
};

export default ({}: {}) => {
  const { ctx, setSelectedHash, setHoveredHash } = React.useContext(UiContext) ??
    error('No context!');

  const columns = React.useMemo<Column<EmitterRecord>[]>(() => [
    {
      header: 'type',
      cell: (record) =>
        record.item === emptyPoolSentinel
          ? 'empty sentinel'
          : record.item.type === factGeneratorType
          ? record.item.describe().name
          : record.item.typeStr,
    },
    {
      header: 'source',
      cell: (record) =>
        record.item === emptyPoolSentinel
          ? ''
          : record.item.type === factGeneratorType
          ? ''
          : record.item.sourceStr,
    },
    {
      header: 'fact hash / generator detail',
      cell: (record) =>
        record.item === emptyPoolSentinel
          ? ''
          : record.item.type === factGeneratorType
          ? record.item.describe().detail
          : `${record.item.hash.toHex().slice(0, 10)} / ${record.item.sillyName}`,
    },
    {
      header: 'send count',
      cell: (record) =>
        record.item === emptyPoolSentinel
          ? ''
          : record.item.type === factGeneratorType
          ? record.item.describe().emits
          : record.item.toConnections.length,
    },
    {
      header: 'value',
      cell: (record) => record.value,
    },
    {
      header: 'size',
      cell: (record) => record.size,
    },
    {
      header: 'throttle',
      cell: (record) => record.throttle ?? '',
    },
    {
      header: 'weight',
      cell: (record) => record.weight,
    },
    {
      header: 'updates',
      cell: (record) => record.updates,
    },
    {
      header: 'skips',
      cell: (record) => record.skips,
    },
    {
      header: 'emits',
      cell: (record) => record.emits,
    },
  ], []);

  return (
    <>
      <FactEmitterStats />
      <TableView
        recordSet={ctx.get(EmitterRecordSet)}
        columns={columns}
        expandRow={(state) => (
          <>
            <pre>{ctx.get(Logger).serialize(state, 2, 72)}</pre>
            <pre>EXPAND</pre>
          </>
        )}
      />
    </>
  );
};
