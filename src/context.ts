import { createContext } from 'react';
import { Context } from 'scaffold/src/Context.ts';
import { Hash, HashPrimitive } from 'scaffold/src/util/Hash.ts';

export interface UiContext {
  ctx: Context;

  selectedHash?: Hash;
  setSelectedHash(hash?: Hash): void;

  hashHoverCbs: Map<HashPrimitive, ((hovered: boolean) => void)[]>;
  setHoveredHash(hash?: Hash): void;
}

export const UiContext = createContext<UiContext | undefined>(undefined);
