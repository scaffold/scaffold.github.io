import secp from 'scaffold/src/util/secp.ts';
import Context from 'scaffold/src/Context.ts';
import Config, {
  defaultNetwork,
  makeDefaultConfig,
} from 'scaffold/src/Config.ts';
import ConnectionService from 'scaffold/src/ConnectionService.ts';
import { bin2hex, hex2bin } from 'scaffold/src/util/hex.ts';
import * as log from '$std/log/mod.ts';
import WebsocketClientProvider from 'scaffold/plugins/WebsocketClientProvider.ts';
import WebrtcProvider from 'scaffold/plugins/WebrtcProvider.ts';
import LocalStorageProvider from 'scaffold/plugins/LocalStorageProvider.ts';
import NetworkService from 'scaffold/src/NetworkService.ts';
import NullStorageProvider from 'scaffold/plugins/NullStorageProvider.ts';
import GenesisService, {
  sharedGenesisData,
} from 'scaffold/src/GenesisService.ts';
// import DefaultAppraisalProvider from 'scaffold/src/DefaultAppraisalProvider.ts';

// window['Deno'] = {};

const getNetwork = () =>
  new URLSearchParams(window.location ? window.location.search : '')
    .get('network') ?? defaultNetwork;

const getPrivateKey = () => {
  const pkid =
    new URLSearchParams(window.location ? window.location.search : '')
      .get('pkid') ?? '';
  const hex = localStorage.getItem(`sbl_pk_${pkid}`);
  if (hex) {
    return hex2bin(hex);
  } else {
    const key = secp.utils.randomPrivateKey();
    localStorage.setItem(`sbl_pk_${pkid}`, bin2hex(key));
    return key;
  }
};

export default class SblClient {
  public ctx: Context;

  constructor() {
    const config: Config = {
      ...makeDefaultConfig(),

      network: getNetwork(),
      debugName: 'SblClient',
      selfPrivateKey: getPrivateKey(),

      logLevel: 'Deno' in window ? log.LogLevels.WARNING : log.LogLevels.DEBUG,

      workerPath: window.location
        ? new URL('./worker.js', window.location.href).href
        : undefined,

      networkProviders: [new WebsocketClientProvider(), new WebrtcProvider()],
      // storageProvider: new LocalStorageProvider(),
      storageProvider: new NullStorageProvider(),
      // contractProviders: [],
    };

    this.ctx = new Context(config);

    this.ctx.get(GenesisService).ingestGenesis(sharedGenesisData);

    if (window.location) {
      const url = new URL(window.location.href);
      url.protocol = { 'http:': 'ws:', 'https:': 'wss:' }[url.protocol]!;
      url.port = '8314';
      this.ctx.get(NetworkService).initConnection(
        'websocket@0.0.1',
        hex2bin(
          '024148e8772a0a4ba2b8b4da9b609d224fd82b3cee0e7ea669ee6d7c306d7678e9',
        ),
      ).recvSignal(url.origin);
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
