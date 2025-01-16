import React from 'react';
import * as moduleHashes from 'ts-examples/moduleHashes.ts';
import * as counterMessages from 'ts-examples/counterMessages.ts';
import counterStateGenerator from 'ts-examples/counter_state.generator.0.ts';
import { arrConcat, EMPTY_ARR } from 'scaffold/src/util/buffer.ts';
import { FetchMode, FetchService } from 'scaffold/src/FetchService.ts';
import { BlockBuilder } from 'scaffold/src/BlockBuilder.ts';
import { LocalGeneratorService } from 'scaffold/src/LocalGeneratorService.ts';
import { UiContext } from './context.ts';
import { error } from 'scaffold/src/util/functional.ts';
import { bin2str, str2bin } from 'scaffold/src/util/buffer.ts';
import { QaDebugger } from 'scaffold/src/QaDebugger.ts';
import Explorer from './Explorer.tsx';
import { rootHash } from 'scaffold/src/hashes.ts';
import { Hash, HASH_REGEX } from 'scaffold/src/util/Hash.ts';

export default () => {
  const { ctx } = React.useContext(UiContext) ?? error('No context!');
  const [hash, setHash] = React.useState('');
  const [imageSrc, setImageSrc] = React.useState<undefined | string>();

  React.useEffect(() => {
    if (!HASH_REGEX.test(hash)) {
      setImageSrc(undefined);
      return;
    }

    const { release } = ctx.get(FetchService).fetch({
      contractHash: rootHash,
      params: Hash.fromHex(hash).toBytes(),
    }, {
      onBody: (body) =>
        body !== undefined &&
        setImageSrc(URL.createObjectURL(new Blob([body]))),
    });
    return () => release();
  }, [ctx, hash]);

  return (
    <>
      <div>
        <input
          type='file'
          accept='image/*'
          capture='environment'
          onChange={(e) => {
            if (e.target.files?.length === 1) {
              e.target.files[0].arrayBuffer().then((buf) => {
                const body = new Uint8Array(buf);
                const hash = Hash.digest(body);
                setHash(hash.toHex());

                ctx.get(BlockBuilder).publishSingleDraft({
                  body,
                  satisfies: [{
                    contractHash: rootHash,
                    params: hash.toBytes(),
                  }],
                });
              });
            }
          }}
        />

        <input
          type='text'
          value={hash}
          onChange={(e) => setHash(e.target.value)}
        />

        {imageSrc !== undefined ? <img src={imageSrc} /> : null}
      </div>
      <Explorer />
    </>
  );
};
