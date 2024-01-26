import React from 'react';
import { HashPrimitive } from 'scaffold/src/util/Hash.ts';
import { Context } from 'scaffold/src/Context.ts';
import { RenderService } from 'scaffold/src/RenderService.ts';

export default ({ ctx, setHoveredHash, setSelectedHash }: {
  ctx: Context;
  setHoveredHash: (primitive?: HashPrimitive) => void;
  setSelectedHash: (primitive?: HashPrimitive) => void;
}) => {
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
    <div>
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
