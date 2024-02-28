import React from 'react';
import { flexRender, Row } from 'tanstack-table';
import { Hash, HashPrimitive } from 'scaffold/src/util/Hash.ts';
import { ReactiveRecordSet } from 'scaffold/src/util/ReactiveRecordSet.ts';
import { UiContext } from './context.ts';
import { error } from 'scaffold/src/util/functional.ts';
import { mapPut, multimapPut } from 'scaffold/src/util/map.ts';

export default <RecordType extends object>({ set, row, expandRow }: {
  set: ReactiveRecordSet<RecordType>;
  row: Row<RecordType>;
  expandRow(row: RecordType): React.ReactNode;
}) => {
  const { hashHoverCbs } = React.useContext(UiContext) ?? error('No context!');
  const [isHovered, setHovered] = React.useState(false);
  const [_, forceUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    set.onUpdate(row.original, forceUpdate);
    return () => set.offUpdate(row.original, forceUpdate);
  }, [set, row.original, forceUpdate]);

  React.useEffect(() => {
    if ('hash' in row.original && row.original.hash instanceof Hash) {
      const key = row.original.hash.toPrimitive();
      multimapPut(hashHoverCbs, key, setHovered);
      return () => multimapPut(hashHoverCbs, key, setHovered);
    }
  }, [row.original, hashHoverCbs, setHovered]);

  const rowBorderStyle = {
    borderTop: '1px solid silver',
    borderBottom: row.getIsExpanded() ? undefined : '1px solid silver',
  };

  return (
    <>
      <tr
        key={row.id}
        style={isHovered
          ? { ...rowBorderStyle, backgroundColor: '#DDD' }
          : rowBorderStyle}
      >
        {row.getVisibleCells().map((cell) => {
          return (
            <td
              key={cell.id}
              style={{ padding: '0 4px', overflowX: 'auto', maxWidth: 1000 }}
            >
              <>
                {flexRender(
                  cell.column.columnDef.cell,
                  cell.getContext(),
                )}
              </>
            </td>
          );
        })}
      </tr>
      {row.getIsExpanded() && (
        <tr
          style={isHovered
            ? { backgroundColor: '#DDD' }
            : { borderBottom: '1px solid silver' }}
        >
          {/* 2nd row is a custom 1 cell row */}
          <td
            colSpan={row.getVisibleCells().length}
            style={{ padding: '0 4px' }}
          >
            {expandRow(row.original)}
          </td>
        </tr>
      )}
    </>
  );
};
