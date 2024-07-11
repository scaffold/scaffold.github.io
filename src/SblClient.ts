import { secp } from 'scaffold/src/util/secp.ts';
import { Context } from 'scaffold/src/Context.ts';
import {
  Config,
  defaultNetwork,
  makeDefaultConfig,
} from 'scaffold/src/Config.ts';
import { ConnectionService } from 'scaffold/src/ConnectionService.ts';
import { bin2hex, hex2bin } from 'scaffold/src/util/hex.ts';
import * as log from '$std/log/mod.ts';
import { WebsocketClientProvider } from 'scaffold/plugins/WebsocketClientProvider.ts';
import { WebrtcProvider } from 'scaffold/plugins/WebrtcProvider.ts';
import { LocalStorageProvider } from 'scaffold/plugins/LocalStorageProvider.ts';
import { NetworkService } from 'scaffold/src/NetworkService.ts';
import { NullStorageProvider } from 'scaffold/plugins/NullStorageProvider.ts';
import {
  GenesisService,
  sharedGenesisData,
} from 'scaffold/src/GenesisService.ts';

import { enableDevtoolsFormatter } from 'scaffold/plugins/devtoolsFormatterPlugin.ts';
enableDevtoolsFormatter();

// window['Deno'] = {};

const getNetwork = () =>
  new URLSearchParams(window.location ? window.location.search : '')
    .get('network') ?? defaultNetwork;

const getPrivateKey = () => {
  const query = new URLSearchParams(
    window.location ? window.location.search : '',
  );

  const pk = query.get('pk') ?? '';
  if (pk) {
    return hex2bin(pk);
  }

  const pkId = query.get('pkid') ?? '';
  if (pkId) {
    const hex = localStorage.getItem(`sbl_pk_${pkId}`);
    if (hex) {
      return hex2bin(hex);
    } else {
      const key = secp.utils.randomPrivateKey();
      localStorage.setItem(`sbl_pk_${pkId}`, bin2hex(key));
      return key;
    }
  }

  return secp.utils.randomPrivateKey();
};

export default class SblClient {
  public ctx: Context;

  constructor() {
    const selfPrivateKey = getPrivateKey();
    // console.log('Private key:', bin2hex(selfPrivateKey));

    const config: Config = {
      ...makeDefaultConfig(),

      network: getNetwork(),
      debugName: 'SblClient',
      userdata: JSON.stringify({
        name: window.location ? window.location.search : '',
      }),
      selfPrivateKey,

      logLevel: 'Deno' in window ? log.LogLevels.WARN : log.LogLevels.DEBUG,

      workerPath: window.location
        ? new URL('./worker.js', window.location.href).href
        : undefined,

      networkProviders: [new WebsocketClientProvider(), new WebrtcProvider()],
      // storageProvider: new LocalStorageProvider(),
      storageProvider: new NullStorageProvider(),
      // contractProviders: [],
    };

    this.ctx = new Context(config);

    (window as any).ctx = this.ctx;
    (window as any).get = (match: string) => {
      match = match.toLowerCase();
      const candidates = [...this.ctx.debugGetAll().entries()].filter((
        [{ name }],
      ) => name.toLowerCase().includes(match));
      if (candidates.length !== 1) {
        throw new Error(
          `Not exactly one candidate module: ${
            JSON.stringify(candidates.map(([{ name }]) => name))
          }`,
        );
      }
      return candidates[0][1];
    };

    this.ctx.get(GenesisService).ingestGenesis(sharedGenesisData);

    if (window.location) {
      const url = new URL(window.location.href);
      url.protocol = { 'http:': 'ws:', 'https:': 'wss:' }[url.protocol]!;
      url.port = '8314';
      this.ctx.get(NetworkService).persistConnection(
        'websocket@0.0.1/client',
        url.origin,
      );
    }

    // const params = this.ctx.get(EpochContract).makeParams(10n);
    // this.ctx.get(QuestionService).getCanonical(
    //   Hash.fromHex(
    //     'afc9b31d9f3f3645ae563606e1ddbe4b0e72b247e3bc9dff6251f5ee8961ae48',
    //   ),
    //   params,
    //   (answer) => console.log(answer),
    // );
  }

  // public get(
  //   contractHash: Hash,
  //   contractParams: Uint8Array,
  //   onAnswer: (answer: Answer) => void,
  // ) {
  //   this.ctx.get(QuestionService).getCanonical({
  //     contract_hash: contractHash,
  //     params: contractParams,
  //   }, onAnswer);
  // }

  public close() {
    return this.ctx.destruct();
  }
}
