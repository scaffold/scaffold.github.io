import React from 'react';
import { renderToReadableStream } from 'react-server';
import { ensureDir, walk } from '$std/fs/mod.ts';
import { join } from '$std/path/mod.ts';
import { encodeHex } from '$std/encoding/hex.ts';
import * as esbuild from 'npm:esbuild';
import { denoPlugins } from 'https://deno.land/x/esbuild_deno_loader@0.8.3/mod.ts';

const outDir = './build/';

interface Page {
  default: React.ComponentType;
  path: string;
}

// const initDir = Deno.remove(outDir, { recursive: true })
//   .catch((err) => console.warn(err));
const initDir = Promise.resolve();

const makeBootstrapTsx = (tsxPath: string) => `
  import React from 'react';
  import ReactDOM from 'react-dom';
  import Component from '${join(Deno.cwd(), tsxPath)}';
  ReactDOM.hydrate(<Component />, document);
`;

const buildHtml = async (
  htmlPath: string,
  { default: Component }: Page,
  jsPath: string,
) => {
  await Deno.remove(htmlPath).catch((err) => {});
  const html = await renderToReadableStream(<Component />, {
    bootstrapModules: [jsPath],
  });
  await Deno.writeFile(htmlPath, html);
};

const buildJs = async (jsPath: string, tsxPath: string) => {
  const tmp = await Deno.makeTempFile({ suffix: '.tsx' });
  await Deno.writeTextFile(tmp, makeBootstrapTsx(tsxPath));

  await esbuild.build({
    plugins: denoPlugins({ configPath: join(Deno.cwd(), './deno.json') }),
    entryPoints: [tmp],
    bundle: true,
    // format: 'esm',
    outfile: jsPath,
  });

  await Deno.remove(tmp);
};

const buildPage = async (filepath: string) => {
  await initDir;

  const page: Page = await import('./' + filepath);
  const hash = encodeHex(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(page.path)),
  ).slice(0, 16);

  const entries = page.path.split('/');
  const filename = entries.pop() || 'index.html';

  const dirPath = join(outDir, ...entries);
  const htmlPath = join(dirPath, filename);
  const jsPath = join(outDir, 'js', hash + '.js');

  await ensureDir(dirPath);

  await Promise.all([
    buildHtml(htmlPath, page, join('/js', hash + '.js')),
    buildJs(jsPath, './' + filepath),
  ]);
};

const walkOptions = { includeDirs: false, exts: ['.tsx'] };
const tasks = [initDir];
for await (const entry of walk('./pages/', walkOptions)) {
  tasks.push(buildPage(entry.path).catch((err) => console.error(err)));
}

await Promise.all(tasks);
