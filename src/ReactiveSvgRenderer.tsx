import React from 'react';
import { HashPrimitive } from 'scaffold/src/util/Hash.ts';
import { Context } from 'scaffold/src/Context.ts';
import { RenderService } from 'scaffold/src/RenderService.ts';
import { UiContext } from './context.ts';
import { error } from 'scaffold/src/util/functional.ts';
import { BlockRecordSet } from 'scaffold/src/record_sets/BlockRecordSet.ts';

export default ({}: {}) => {
  const { ctx } = React.useContext(UiContext) ?? error('No context!');
  const [enabled, setEnabled] = React.useState(false);

  const [svg, setSvg] = React.useState('');

  React.useEffect(() => {
    if (enabled) {
      const cb = () => ctx.get(RenderService).renderSvg().then(setSvg);
      cb();

      ctx.get(BlockRecordSet).onAdd(cb);
      ctx.get(BlockRecordSet).onRemove(cb);

      return () => {
        ctx.get(BlockRecordSet).offAdd(cb);
        ctx.get(BlockRecordSet).offRemove(cb);
      };
    }
  }, [ctx, enabled]);

  return enabled
    ? (
      <>
        <button onClick={() => setEnabled(false)}>
          Disable graph visualization
        </button>
        <div
          style={{ width: '100%' }}
          dangerouslySetInnerHTML={{ __html: svg }}
        >
        </div>
      </>
    )
    : (
      <button onClick={() => setEnabled(true)}>
        Enable graph visualization
      </button>
    );
};
