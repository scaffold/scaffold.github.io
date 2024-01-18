import React from 'react';
import { renderToReadableStream } from 'react-server';
import { ensureDir, walk } from 'https://deno.land/std@0.212.0/fs/mod.ts';
import { join } from 'https://deno.land/std@0.212.0/path/mod.ts';
import * as esbuild from 'npm:esbuild';
import { denoPlugins } from 'https://deno.land/x/esbuild_deno_loader@0.8.3/mod.ts';
import Hash from '../scaffold/src/util/Hash.ts';

const outDir = './static/build/';

interface Page {
  default: React.ComponentType;
  path: string;
}

const emptyDir = Deno.remove(outDir, { recursive: true })
  .catch((err) => console.warn(err));

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
  const html = await renderToReadableStream(<Component />, {
    bootstrapModules: [jsPath],
  });
  await Deno.writeFile(htmlPath, html);
};

const buildJs = async (jsPath: string, page: Page, tsxPath: string) => {
  const tmp = await Deno.makeTempFile({ suffix: '.tsx' });
  await Deno.writeTextFile(tmp, makeBootstrapTsx(tsxPath));

  await esbuild.build({
    plugins: denoPlugins({ configPath: join(Deno.cwd(), './deno.json') }),
    entryPoints: [tmp],
    bundle: true,
    // format: 'esm',
    outfile: jsPath,
  });
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
    buildHtml(htmlPath, page, join('/js', hash + '.js')),
    buildJs(jsPath, page, './' + filepath),
  ]);
};

const walkOptions = { includeDirs: false, exts: ['.tsx'] };
const tasks = [emptyDir];
for await (const entry of walk('./pages/', walkOptions)) {
  tasks.push(buildPage(entry.path));
}

await Promise.all(tasks);
