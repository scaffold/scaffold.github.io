import React from 'react';
import { Hash, HashPrimitive } from 'scaffold/src/util/Hash.ts';
import { ReactiveRecordSet } from 'scaffold/src/record_sets/ReactiveRecordSet.ts';
import { UiContext } from './context.ts';
import { error } from 'scaffold/src/util/functional.ts';
import { mapPut, multimapPop, multimapPut } from 'scaffold/src/util/map.ts';
import { Column } from './TableView.tsx';

const keys = new WeakMap<WeakKey, number>();
let nextKey = 0;
const getKey = (obj: WeakKey) => mapPut(keys, obj, () => nextKey++);

export default <RecordType extends object>(
  { set, record, columns, expandRow }: {
    set: ReactiveRecordSet<RecordType>;
    record: RecordType;
    columns: Column<RecordType>[];
    expandRow(row: RecordType): React.ReactNode;
  },
) => {
  const { hashHoverCbs } = React.useContext(UiContext) ?? error('No context!');
  const [isHovered, setHovered] = React.useState(false);
  const [_, forceUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    set.onUpdate(record, forceUpdate);
    return () => set.offUpdate(record, forceUpdate);
  }, [set, record, forceUpdate]);

  React.useEffect(() => {
    if ('hash' in record && record.hash instanceof Hash) {
      const key = record.hash.toPrimitive();
      multimapPut(hashHoverCbs, key, setHovered);
      return () => multimapPop(hashHoverCbs, key, setHovered);
    }
  }, [record, hashHoverCbs, setHovered]);

  const rowBorderStyle = {
    borderTop: '1px solid silver',
    // borderBottom: row.getIsExpanded() ? undefined : '1px solid silver',
  };

  return (
    <>
      <tr
        key={getKey(record)}
        style={isHovered ? { ...rowBorderStyle, backgroundColor: '#DDD' } : rowBorderStyle}
      >
        {columns.map((col, idx) => (
          <td
            key={idx}
            style={{ padding: '0 4px', overflowX: 'auto', maxWidth: 1000 }}
          >
            {col.cell(record)}
          </td>
        ))}
      </tr>
      {
        /* {row.getIsExpanded() && (
        <tr
          style={isHovered
            ? { backgroundColor: '#DDD' }
            : { borderBottom: '1px solid silver' }}
        >
          <td
            colSpan={row.getVisibleCells().length}
            style={{ padding: '0 4px' }}
          >
            {expandRow(row.original)}
          </td>
        </tr>
      )} */
      }
    </>
  );
};
