interface WalletClient {
  IsAllowedWord: (word: string) => boolean;
  MountFS: (resolve: (value: boolean | PromiseLike<boolean>) => void) => void;
  GeneratePhrase: () => string;
}

type BeamModuleType = () => Promise<{
  WasmWalletClient: WalletClient
}>;

export class WasmWallet {
  private WalletClient: WalletClient | null = null;

  mount = async (BeamModule: BeamModuleType): Promise<boolean> => {
    const module = await BeamModule();
    this.WalletClient = module.WasmWalletClient;

    return new Promise((resolve) => {
      this.WalletClient?.MountFS(resolve);
    });
  };

  isAllowedWord = (
    word: string, callback?: () => void
  ): boolean => {
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
