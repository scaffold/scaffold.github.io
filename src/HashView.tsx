import React from 'react';
import { Hash, HashPrimitive } from 'scaffold/src/util/Hash.ts';

// https://stackoverflow.com/questions/20993947/prevent-a-specific-child-div-from-expanding-the-parent-div
// Fill container and highlight first 8 bytes

export default ({ hash, setHoveredHash, setSelectedHash }: {
  hash: Hash;
  setHoveredHash: (hash?: Hash) => void;
  setSelectedHash: (hash?: Hash) => void;
}) => (
  <span style={{ fontFamily: 'monospace' }}>
    <a
      href='#'
      onMouseOver={() => setHoveredHash(hash)}
      onMouseOut={() => setHoveredHash(undefined)}
      onClick={() => setSelectedHash(hash)}
    >
      {hash.toHex().slice(0, 10)}
    </a>
  </span>
);
