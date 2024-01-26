import React from 'react';
import { HashPrimitive } from 'scaffold/src/util/Hash.ts';
import { Context } from 'scaffold/src/Context.ts';
import { RenderService } from 'scaffold/src/RenderService.ts';

export default ({ ctx, setHoveredHash, setSelectedHash }: {
  ctx: Context;
  setHoveredHash: (primitive?: HashPrimitive) => void;
  setSelectedHash: (primitive?: HashPrimitive) => void;
}) => {
  const [svg, setSvg] = React.useState('');

  return (
    <div>
      <button onClick={() => ctx.get(RenderService).renderSvg().then(setSvg)}>
        Refresh SVG
      </button>
      <div dangerouslySetInnerHTML={{ __html: svg }}></div>
    </div>
  );
};
