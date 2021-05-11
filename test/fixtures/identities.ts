import {
  AddressInterface,
  IdentityInterface,
  IdentityOpts,
  IdentityType,
  IdentityRestorerInterface,
  EsploraIdentityRestorer,
  networks,
  PrivateKey,
} from 'ldk';
import { ECPair, ECPairInterface, payments, Network, Psbt } from 'liquidjs-lib';

class Identity {
  static DEFAULT_RESTORER: IdentityRestorerInterface = new EsploraIdentityRestorer();
  network: Network;
  type: IdentityType;
  restorer: IdentityRestorerInterface;

  constructor(args: IdentityOpts) {
    if (!args.chain || !networks.hasOwnProperty(args.chain)) {
      throw new Error('Network is missing or not valid');
    }

    if (!args.type || !(args.type in IdentityType)) {
      throw new Error('Type is missing or not valid');
    }

    this.network = (networks as Record<string, Network>)[args.chain];
    this.type = args.type;

    // set the restorer if the user specified it.
    if (args.restorer) {
      this.restorer = args.restorer;
    } else {
      this.restorer = Identity.DEFAULT_RESTORER;
    }
  }

  async blindPsetWithBlindKeysGetter(
    getBlindingKeyPair: (
      script: Buffer
    ) => { publicKey: Buffer; privateKey: Buffer },
    psetBase64: string,
    outputsToBlind: number[],
    outputsPubKeys?: Map<number, string>,
    inputsBlindingDataLike?: Map<number, any>
  ): Promise<string> {
    console.log(
      getBlindingKeyPair,
      psetBase64,
      outputsToBlind,
      outputsPubKeys,
      inputsBlindingDataLike
    );
    return '';
  }
}

export class Legacy extends Identity implements IdentityInterface {
  private signingKeyPair: ECPairInterface;
  private blindingKeyPair: ECPairInterface;

  private confidentialAddress: string;
  private blindingPrivateKey: string;
  private scriptPubKey: Buffer;

  readonly isRestored: Promise<boolean> = new Promise(() => true);

  constructor(args: IdentityOpts) {
    super(args);

    this.signingKeyPair = this.decodeFromWif(args.value.signingKeyWIF);
    this.blindingKeyPair = this.decodeFromWif(args.value.blindingKeyWIF);

    const p2pkh = payments.p2pkh({
      pubkey: this.signingKeyPair.publicKey,
      blindkey: this.blindingKeyPair.publicKey,
      network: this.network,
    });

    this.confidentialAddress = p2pkh.confidentialAddress!;
    this.blindingPrivateKey = this.blindingKeyPair.privateKey!.toString('hex');
    this.scriptPubKey = p2pkh.output!;
  }

  async blindPset(
    psetBase64: string,
    outputsToBlind: number[],
    outputsPubKeys?: Map<number, string>,
    inputsBlindingDataLike?: Map<number, any>
  ): Promise<string> {
    return super.blindPsetWithBlindKeysGetter(
      (script: Buffer) => this.getBlindingKeyPair(script),
      psetBase64,
      outputsToBlind,
      outputsPubKeys,
      inputsBlindingDataLike
    );
  }

  isAbleToSign(): boolean {
    return true;
  }

  private getBlindingKeyPair(
    script: Buffer
  ): { publicKey: Buffer; privateKey: Buffer } {
    if (!script.equals(this.scriptPubKey)) {
      throw new Error(script + ' is unknown by the PrivateKey Identity');
    }

    return {
      publicKey: this.blindingKeyPair.publicKey,
      privateKey: this.blindingKeyPair.privateKey!,
    };
  }

  private decodeFromWif(wif: string): ECPairInterface {
    return ECPair.fromWIF(wif, this.network);
  }

  private getAddress(): AddressInterface {
    return {
      confidentialAddress: this.confidentialAddress,
      blindingPrivateKey: this.blindingPrivateKey,
      derivationPath: undefined,
    };
  }

  async getNextAddress(): Promise<AddressInterface> {
    return this.getAddress();
  }

  async getNextChangeAddress(): Promise<AddressInterface> {
    return this.getAddress();
  }

  async getBlindingPrivateKey(script: string): Promise<string> {
    const scriptPubKeyBuffer = Buffer.from(script, 'hex');
    if (!scriptPubKeyBuffer.equals(this.scriptPubKey)) {
      throw new Error('The script is not PrivateKey.scriptPubKey.');
    }

    return this.blindingPrivateKey;
  }

  async signPset(psetBase64: string): Promise<string> {
    const pset = Psbt.fromBase64(psetBase64);
    const indexOfInputs: number[] = [];

    for (let index = 0; index < pset.data.inputs.length; index++) {
      const input = pset.data.inputs[index];
      if (input.witnessUtxo) {
        if (input.witnessUtxo.script.equals(this.scriptPubKey)) {
          indexOfInputs.push(index);
        }
      } else {
        indexOfInputs.push(index);
      }
    }

    // sign all the inputs asynchronously
    await Promise.all(
      indexOfInputs.map((index: number) =>
        pset.signInputAsync(index, this.signingKeyPair)
      )
    );

    return pset.toBase64();
  }

  async getAddresses(): Promise<AddressInterface[]> {
    return [
      {
        confidentialAddress: this.confidentialAddress,
        blindingPrivateKey: this.blindingPrivateKey,
        derivationPath: undefined,
      },
    ];
  }
}

export class WrappedSegwit extends Identity implements IdentityInterface {
  private signingKeyPair: ECPairInterface;
  private blindingKeyPair: ECPairInterface;

  private confidentialAddress: string;
  private blindingPrivateKey: string;
  private scriptPubKey: Buffer;

  readonly isRestored: Promise<boolean> = new Promise(() => true);

  constructor(args: IdentityOpts) {
    super(args);

    this.signingKeyPair = this.decodeFromWif(args.value.signingKeyWIF);
    this.blindingKeyPair = this.decodeFromWif(args.value.blindingKeyWIF);

    const p2wpkh = payments.p2wpkh({
      pubkey: this.signingKeyPair.publicKey,
      blindkey: this.blindingKeyPair.publicKey,
      network: this.network,
    });

    const p2sh = payments.p2sh({
      redeem: p2wpkh,
      blindkey: this.blindingKeyPair.publicKey,
      network: this.network,
    });

    this.confidentialAddress = p2sh.confidentialAddress!;
    this.blindingPrivateKey = this.blindingKeyPair.privateKey!.toString('hex');
    this.scriptPubKey = p2sh.output!;
  }

  async blindPset(
    psetBase64: string,
    outputsToBlind: number[],
    outputsPubKeys?: Map<number, string>,
    inputsBlindingDataLike?: Map<number, any>
  ): Promise<string> {
    return super.blindPsetWithBlindKeysGetter(
      (script: Buffer) => this.getBlindingKeyPair(script),
      psetBase64,
      outputsToBlind,
      outputsPubKeys,
      inputsBlindingDataLike
    );
  }

  isAbleToSign(): boolean {
    return true;
  }

  private getBlindingKeyPair(
    script: Buffer
  ): { publicKey: Buffer; privateKey: Buffer } {
    if (!script.equals(this.scriptPubKey)) {
      throw new Error(script + ' is unknown by the PrivateKey Identity');
    }

    return {
      publicKey: this.blindingKeyPair.publicKey,
      privateKey: this.blindingKeyPair.privateKey!,
    };
  }

  private decodeFromWif(wif: string): ECPairInterface {
    return ECPair.fromWIF(wif, this.network);
  }

  private getAddress(): AddressInterface {
    return {
      confidentialAddress: this.confidentialAddress,
      blindingPrivateKey: this.blindingPrivateKey,
      derivationPath: undefined,
    };
  }

  async getNextAddress(): Promise<AddressInterface> {
    return this.getAddress();
  }

  async getNextChangeAddress(): Promise<AddressInterface> {
    return this.getAddress();
  }

  async getBlindingPrivateKey(script: string): Promise<string> {
    const scriptPubKeyBuffer = Buffer.from(script, 'hex');
    if (!scriptPubKeyBuffer.equals(this.scriptPubKey)) {
      throw new Error('The script is not PrivateKey.scriptPubKey.');
    }

    return this.blindingPrivateKey;
  }

  async signPset(psetBase64: string): Promise<string> {
    const pset = Psbt.fromBase64(psetBase64);
    const indexOfInputs: number[] = [];

    for (let index = 0; index < pset.data.inputs.length; index++) {
      const input = pset.data.inputs[index];
      if (input.witnessUtxo) {
        if (input.witnessUtxo.script.equals(this.scriptPubKey)) {
          indexOfInputs.push(index);
        }
      } else {
        indexOfInputs.push(index);
      }
    }

    // sign all the inputs asynchronously
    await Promise.all(
      indexOfInputs.map((index: number) =>
        pset.signInputAsync(index, this.signingKeyPair)
      )
    );

    return pset.toBase64();
  }

  async getAddresses(): Promise<AddressInterface[]> {
    return [
      {
        confidentialAddress: this.confidentialAddress,
        blindingPrivateKey: this.blindingPrivateKey,
        derivationPath: undefined,
      },
    ];
  }
}

export const proposerP2PKH = new Legacy({
  chain: 'regtest',
  type: IdentityType.PrivateKey,
  value: {
    blindingKeyWIF: 'cPNMJD4VyFnQjGbGs3kcydRzAbDCXrLAbvH6wTCqs88qg1SkZT3J',
    signingKeyWIF: 'cRdrvnPMLV7CsEak2pGrgG4MY7S3XN1vjtcgfemCrF7KJRPeGgW6',
  },
});

export const proposerP2SH = new WrappedSegwit({
  chain: 'regtest',
  type: IdentityType.PrivateKey,
  value: {
    blindingKeyWIF: 'cPNMJD4VyFnQjGbGs3kcydRzAbDCXrLAbvH6wTCqs88qg1SkZT3J',
    signingKeyWIF: 'cRdrvnPMLV7CsEak2pGrgG4MY7S3XN1vjtcgfemCrF7KJRPeGgW6',
  },
});

export const proposerP2WPKH = new PrivateKey({
  chain: 'regtest',
  type: IdentityType.PrivateKey,
  value: {
    blindingKeyWIF: 'cPNMJD4VyFnQjGbGs3kcydRzAbDCXrLAbvH6wTCqs88qg1SkZT3J',
    signingKeyWIF: 'cRdrvnPMLV7CsEak2pGrgG4MY7S3XN1vjtcgfemCrF7KJRPeGgW6',
  },
});
