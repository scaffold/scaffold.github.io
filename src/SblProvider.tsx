import React from 'react';
import SblClient from './SblClient.ts';
import { Hash, HashPrimitive } from 'scaffold/src/util/Hash.ts';
import BlockTableView from './BlockTableView.tsx';
import { BlockBuilder } from 'scaffold/src/BlockBuilder.ts';
import ReactiveSvgRenderer from './ReactiveSvgRenderer.tsx';
import { UiContext } from './context.ts';
import { multimapCall } from 'scaffold/src/util/map.ts';
import WorkerTableView from './WorkerTableView.tsx';

interface HoverState {
  map: Map<HashPrimitive, ((hovered: boolean) => void)[]>;
  update(hash?: Hash): void;
}
const makeHoverState = (): HoverState => {
  const map = new Map<HashPrimitive, ((hovered: boolean) => void)[]>();
  let cur: Hash | undefined;
  const update = (hash?: Hash) => {
    if (hash !== cur) {
      if (cur !== undefined) {
        multimapCall(map, cur.toPrimitive(), false);
      }
      cur = hash;
      if (cur !== undefined) {
        multimapCall(map, cur.toPrimitive(), true);
      }
    }
  };
  return { map, update };
};

export default ({ children }: { children?: React.ReactNode }) => {
  const client = React.useRef<SblClient | undefined>();
  client.current ??= new SblClient();

  const [selectedHash, setSelectedHash] = React.useState<Hash | undefined>();

  const hoverState = React.useRef<HoverState | undefined>();
  hoverState.current ??= makeHoverState();

  return (
    <UiContext.Provider
      value={{
        ctx: client.current.ctx,
        selectedHash,
        setSelectedHash,
        hashHoverCbs: hoverState.current.map,
        setHoveredHash: hoverState.current.update,
      }}
    >
      {children}

      <button
        onClick={() =>
          client.current!.ctx.get(BlockBuilder).publishSingleDraft({})}
      >
        Publish empty block
      </button>

      <ReactiveSvgRenderer />

      <BlockTableView />

      <WorkerTableView />
    </UiContext.Provider>
  );
};
