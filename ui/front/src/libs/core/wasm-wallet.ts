interface WalletClient {
  IsAllowedWord: (word: string) => boolean;
  MountFS: (resolve: (value: boolean | PromiseLike<boolean>) => void) => void;
  GeneratePhrase: () => string;
}

export class WasmWallet {
  private WalletClient: WalletClient | null = null;

  mount = async (): Promise<boolean> => {
    await this.injectScript('./wasm-client.js');
    const module = await window.BeamModule();
    this.WalletClient = module.WasmWalletClient;

    return new Promise((resolve) => {
      this.WalletClient?.MountFS(resolve);
    });
  };

  injectScript = async (url:string) => new Promise<void>((resolve, reject) => {
    const js = document.createElement('script');
    js.type = 'text/javascript';
    js.async = true;
    js.src = url;
    js.onload = () => resolve();
    js.onerror = (err) => reject(err);
    document.getElementsByTagName('body')[0].appendChild(js);
  });

  isAllowedWord = (word: string, callback?: () => void): boolean => {
    if (this.WalletClient) {
      if (callback) callback();
      return this.WalletClient.IsAllowedWord(word);
    }
    return false;
  };

  isAllowedSeed = (seed: string[]) => seed.map((el) => this.isAllowedWord(el));

  generateSeed = ():string | null => {
    if (this.WalletClient) return this.WalletClient.GeneratePhrase();
    return null;
  };
}
