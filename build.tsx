import React from 'react';
import { renderToReadableStream } from 'react-server';
import { ensureDir, walk } from 'https://deno.land/std@0.212.0/fs/mod.ts';
import { join } from 'https://deno.land/std@0.212.0/path/mod.ts';
import { bundle } from 'https://deno.land/x/emit@0.33.0/mod.ts';
import Hash from '../scaffold/src/util/Hash.ts';
import denoJson from './deno.json' with { type: 'json' };

const outDir = './static/build/';

interface Page {
  default: React.ComponentType;
  path: string;
}

const emptyDir = Deno.remove(outDir, { recursive: true });

const makeBootstrapTsx = (tsxPath: string) => `
  import React from 'react';
  import ReactDOM from 'react-dom';
  import Component from '${tsxPath}';
  ReactDOM.hydrate(<Component />, document);
`;

const buildHtml = async (
  htmlPath: string,
  { default: Component }: Page,
  jsPath: string,
) => {
  const html = await renderToReadableStream(<Component />, {
    bootstrapModules: [jsPath],
  });
  await Deno.writeFile(htmlPath, html);
};

const buildJs = async (jsPath: string, page: Page, tsxPath: string) => {
  const tmp = await Deno.makeTempFile({ suffix: '.tsx' });
  await Deno.writeTextFile(tmp, makeBootstrapTsx(tsxPath));

  const result = await bundle(tmp, {
    /** Allow remote modules to be loaded or read from the cache. */
    allowRemote: true,
    /** The cache root to use, overriding the default inferred `DENO_DIR`. */
    // cacheRoot: undefined,
    /** The setting to use when loading sources from the Deno cache. */
    // cacheSetting: undefined,
    /** Compiler options which can be set when bundling. */
    compilerOptions: {
      checkJs: true,
      /** Determines if reflection meta data is emitted for legacy decorators or
       * not.  Defaults to `false`. */
      // emitDecoratorMetadata: true,
      importsNotUsedAsValues: 'remove',
      /** When set, instead of writing out a `.js.map` file to provide source maps,
       * the source map will be embedded the source map content in the `.js` files.
       *
       * Although this results in larger JS files, it can be convenient in some
       * scenarios. For example, you might want to debug JS files on a webserver
       * that doesn’t allow `.map` files to be served. */
      // inlineSourceMap: false,
      /** When set, the original content of the `.ts` file as an embedded string in
       * the source map (using the source map’s `sourcesContent` property).
       *
       * This is often useful in the same cases as `inlineSourceMap`. */
      // inlineSources: false,
      /** Controls how JSX constructs are emitted in JavaScript files. This only
       * affects output of JS files that started in `.jsx` or `.tsx` files. */
      jsx: 'jsx',
      /** Changes the function called in `.js` files when compiling JSX Elements
       * using the classic JSX runtime. The most common change is to use `"h"` or
       * `"preact.h"`. */
      // jsxFactory: 'preact.h',
      /** Specify the JSX fragment factory function to use when targeting react JSX
       * emit with jsxFactory compiler option is specified, e.g. `Fragment`. */
      // jsxFragmentFactory: 'Fragment',
      /** Enables the generation of sourcemap files. */
      // sourceMap: false,
    },
    /** An [import-map](https://deno.land/manual/linking_to_external_code/import_maps#import-maps)
     * which will be applied to the imports, or the URL of an import map, or the
     * path to an import map */
    importMap: {
      /** Base URL to resolve import map specifiers. It Is always treated as a
       * directory. Defaults to the file URL of `Deno.cwd()`. */
      // baseUrl: undefined,
      /** Specifiers of the import map. */
      imports: denoJson.imports,
      /** Overrides of the specifiers for the provided scopes. */
      // scopes: undefined,
    },
    /** Override the default loading mechanism with a custom loader. This can
     * provide a way to use "in-memory" resources instead of fetching them
     * remotely. */
    // load: undefined,
    /** Minify compiled code, default false. */
    // minify: true,
    /** Should the emitted bundle be an ES module or an IIFE script. The default
     * is `"module"` to output a ESM module. */
    type: 'module',
  });

  await Deno.writeTextFile(jsPath, result.code);
};

const buildPage = async (filepath: string) => {
  await emptyDir;

  const page: Page = await import('./' + filepath);
  const hash = Hash.digest(page.path).toHex().slice(0, 16);

  const entries = page.path.split('/');
  const filename = entries.pop() || 'index.html';

  const dirPath = join(outDir, ...entries);
  const htmlPath = join(dirPath, filename);
  const jsPath = join(outDir, 'js', hash + '.js');

  await ensureDir(dirPath);

  await Promise.all([
    buildHtml(htmlPath, page, jsPath),
    buildJs(jsPath, page, './' + filepath),
  ]);
};

const walkOptions = { includeDirs: false, exts: ['.tsx'] };
const tasks = [emptyDir];
for await (const entry of walk('./pages/', walkOptions)) {
  tasks.push(buildPage(entry.path));
}

await Promise.all(tasks);
