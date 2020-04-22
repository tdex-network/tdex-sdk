import axios from 'axios';
import { ECPair, networks, payments, Psbt, confidential } from 'liquidjs-lib';
//Libs
import { coinselect } from './utils';
//Types
import { ECPairInterface } from 'liquidjs-lib/types/ecpair';
import { Network } from 'liquidjs-lib/types/networks';

export interface WatchOnlyWalletInterface {
  address: string;
  script: string;
  network: Network;
  updateTx(
    psbtBase64: string,
    inputs: Array<any>,
    inputAmount: number,
    outputAmount: number,
    inputAsset: string,
    outputAsset: string
  ): string;
}

export class WatchOnlyWallet implements WatchOnlyWalletInterface {
  network: networks.Network;
  address: string;
  script: string;
  constructor({ address, network }: { address: string; network: string }) {
    const currentNetwork: Network = network
      ? (networks as any)[network]
      : networks.liquid;
    this.network = currentNetwork;

    const payment = payments.p2wpkh({ address, network: currentNetwork });

    this.address = payment.address!;
    this.script = payment.output!.toString('hex');
  }

  static createTx = createTx;
  static toHex = toHex;

  updateTx(
    psbtBase64: string,
    inputs: Array<any>,
    inputAmount: number,
    outputAmount: number,
    inputAsset: string,
    outputAsset: string
  ): string {
    let psbt: Psbt;
    try {
      psbt = Psbt.fromBase64(psbtBase64);
    } catch (ignore) {
      throw new Error('Invalid psbt');
    }

    inputs = inputs.filter((utxo: any) => utxo.asset === inputAsset);
    const { unspents, change } = coinselect(inputs, inputAmount);

    unspents.forEach((i: any) =>
      psbt.addInput({
        // if hash is string, txid, if hash is Buffer, is reversed compared to txid
        hash: i.txid,
        index: i.vout,
        //The scriptPubkey and the value only are needed.
        witnessUtxo: {
          script: Buffer.from(this.script, 'hex'),
          asset: Buffer.concat([
            Buffer.from('01', 'hex'), //prefix for unconfidential asset
            Buffer.from(inputAsset, 'hex').reverse(),
          ]),
          value: confidential.satoshiToConfidentialValue(i.value),
          nonce: Buffer.from('00', 'hex'),
        },
      } as any)
    );

    psbt.addOutput({
      script: Buffer.from(this.script, 'hex'),
      value: confidential.satoshiToConfidentialValue(outputAmount),
      asset: Buffer.concat([
        Buffer.from('01', 'hex'), //prefix for unconfidential asset
        Buffer.from(outputAsset, 'hex').reverse(),
      ]),
      nonce: Buffer.from('00', 'hex'),
    });

    if (change > 0) {
      psbt.addOutput({
        script: Buffer.from(this.script, 'hex'),
        value: confidential.satoshiToConfidentialValue(change),
        asset: Buffer.concat([
          Buffer.from('01', 'hex'), //prefix for unconfidential asset
          Buffer.from(inputAsset, 'hex').reverse(),
        ]),
        nonce: Buffer.from('00', 'hex'),
      });
    }

    const base64 = psbt.toBase64();
    return base64;
  }
}

export interface WalletInterface extends WatchOnlyWalletInterface {
  keyPair: ECPairInterface;
  privateKey: string;
  publicKey: string;
  sign(psbtBase64: string): string;
}

export class Wallet extends WatchOnlyWallet implements WalletInterface {
  keyPair: ECPairInterface;
  privateKey: string;
  publicKey: string;

  static fromWIF = fromWIF;

  constructor({
    network,
    address,
    keyPair,
  }: {
    network: string;
    address: string;
    keyPair: ECPairInterface | undefined;
  }) {
    super({ network, address });

    if (!keyPair) this.keyPair = ECPair.makeRandom({ network: this.network });
    else this.keyPair = keyPair;

    this.privateKey = this.keyPair.privateKey!.toString('hex');
    this.publicKey = this.keyPair.publicKey!.toString('hex');
  }

  updateTx = super.updateTx;

  sign(psbtBase64: string): string {
    let psbt: Psbt;
    try {
      psbt = Psbt.fromBase64(psbtBase64);
    } catch (ignore) {
      throw new Error('Invalid psbt');
    }

    const index = psbt.data.inputs.findIndex(
      p => p.witnessUtxo!.script.toString('hex') === this.script
    );

    psbt.signInput(index, this.keyPair);

    if (!psbt.validateSignaturesOfInput(index))
      throw new Error('Invalid signature');

    return psbt.toBase64();
  }
}

function fromWIF(wif: string, network?: string): WalletInterface {
  const _network = network ? (networks as any)[network] : networks.liquid;

  try {
    const keyPair = ECPair.fromWIF(wif, _network);
    return new Wallet({ keyPair });
  } catch (ignore) {
    throw new Error('Invalid keypair');
  }
}

function createTx(): string {
  const psbt = new Psbt();
  return psbt.toBase64();
}

function toHex(psbtBase64: string): string {
  let psbt: Psbt;
  try {
    psbt = Psbt.fromBase64(psbtBase64);
  } catch (ignore) {
    throw new Error('Invalid psbt');
  }

  psbt.validateSignaturesOfAllInputs();
  psbt.finalizeAllInputs();

  return psbt.extractTransaction().toHex();
}

export async function fetchUtxos(address: string, url: string): Promise<any> {
  return (await axios.get(`${url}/address/${address}/utxo`)).data;
}

export async function fetchBalances(address: string, url: string) {
  const utxos = await fetchUtxos(address, url);
  return utxos.reduce(
    (storage: { [x: string]: any }, item: { [x: string]: any; value: any }) => {
      // get the first instance of the key by which we're grouping
      var group = item['asset'];

      // set `storage` for this instance of group to the outer scope (if not empty) or initialize it
      storage[group] = storage[group] || 0;

      // add this item to its group within `storage`
      storage[group] += item.value;

      // return the updated storage to the reduce function, which will then loop through the next
      return storage;
    },
    {}
  ); // {} is the initial value of the storage
}
