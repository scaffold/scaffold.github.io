import React from 'react';
import { RenderService } from 'scaffold/src/RenderService.ts';
import { UiContext } from './context.ts';
import { error } from 'scaffold/src/util/functional.ts';

export default ({}: {}) => {
  const { ctx } = React.useContext(UiContext) ?? error('No context!');

  const [svgs, addSvg] = React.useReducer(
    (svgs: string[], add: string) => [...svgs, add],
    [],
  );
  const [idx, incIdx] = React.useReducer(
    (idx: number, inc: number) =>
      Math.max(0, Math.min(idx, svgs.length - 1)) + inc,
    Infinity,
  );

  const clampedIdx = Math.max(0, Math.min(idx, svgs.length - 1));

  return (
    <div style={{ width: '100%' }}>
      <button onClick={() => ctx.get(RenderService).renderSvg().then(addSvg)}>
        Take SVG snapshot
      </button>
      <br />
      {svgs.length > 0
        ? (
          <>
            <button onClick={() => incIdx(-1)}>{'<< '}</button>
            {clampedIdx + 1} / {svgs.length}
            <button onClick={() => incIdx(1)}>{' >>'}</button>
          </>
        )
        : undefined}
      <div dangerouslySetInnerHTML={{ __html: svgs[clampedIdx] ?? '' }}></div>
    </div>
  );
};
