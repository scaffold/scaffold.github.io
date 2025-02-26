import React from 'react';
import { renderToReadableStream } from 'react-dom/server';
import { ensureDir, walk } from '@std/fs';
import { join } from '@std/path';
import { encodeHex } from '@std/encoding';
import * as esbuild from 'npm:esbuild@0.24.2';
import { denoPlugins } from 'jsr:@luca/esbuild-deno-loader@^0.11.1';
import { Page } from './src/pages.ts';

// https://esbuild.github.io/getting-started/#wasm
// TODO: Use https://nanojsx.io/ to build?
// TODO: Use deno_emit to build?

const outDir = join(import.meta.dirname ?? '.', 'build');

// const initDir = Deno.remove(outDir, { recursive: true })
//   .catch((err) => console.warn(err));
const initDir = Promise.resolve();

const makeBootstrapTsx = (tsxPath: string) => `
  import React from 'react';
  import { hydrateRoot } from 'react-dom/client';
  import Component from '${join(Deno.cwd(), tsxPath)}';
  hydrateRoot(document, <Component />);
`;

const buildHtml = async (
  htmlPath: string,
  Component: React.ComponentType,
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
    format: 'iife',
    // mangleProps: //i,
    // mangleQuoted: true,
    // reserveProps: /^__.*__$/,
    minify: ['1', 'true', 'yes'].includes(
      Deno.env.get('MINIFY')?.toLowerCase() ?? '',
    ),
    target: 'esnext',
    // treeShaking: true,
    outfile: jsPath,
  });

  await Deno.remove(tmp);
};

const buildPage = async (filepath: string) => {
  await initDir;

  const { default: Component, page }: {
    default: React.ComponentType;
    page: Page;
  } = await import('./' + filepath);
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
    buildHtml(htmlPath, Component, join('/js', hash + '.js')),
    buildJs(jsPath, './' + filepath),
  ]);
};

const walkOptions = { includeDirs: false, exts: ['.tsx'] };
const tasks = [initDir];
for await (const entry of walk('./pages/', walkOptions)) {
  tasks.push(buildPage(entry.path).catch((err) => console.error(err)));
}

// Deno.env.get('CI') || tasks.push(
//   new Deno.Command(Deno.execPath(), {
//     cwd: '../scaffold/',
//     args: [
//       'doc',
//       '--html',
//       '--name=Scaffold',
//       `--output=${outDir}/docs/`,
//       'src/',
//       'plugins/',
//     ],
//   }).spawn().status.then(() => {}),
// );

await Promise.all(tasks);

await esbuild.stop();

if (Deno.env.get('CI')) {
  Deno.exit(0);
}
