import axios from 'axios';
import { ECPair, networks, payments, Psbt, confidential } from 'liquidjs-lib';
//Types
import { ECPairInterface } from 'liquidjs-lib/types/ecpair';
import { Network } from 'liquidjs-lib/types/networks';

export interface WalletInterface {
  keyPair: ECPairInterface;
  privateKey: string;
  publicKey: string;
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
  sign(psbtBase64: string): string;
  toHex(psbtBase64: string): string;
}

export default class Wallet implements WalletInterface {

  keyPair: ECPairInterface;
  privateKey: string;
  publicKey: string;
  address: string;
  script: string;
  network: Network;


  static createTx = createTx;
  static fromWIF = fromWIF;
  static coinselect = coinselect;
  static decodePsbt = decodePsbt;


  constructor(args: any) {
    const { network, keyPair }: { network: string, keyPair: ECPairInterface | undefined } = args;

    if (!keyPair)
      this.keyPair = ECPair.makeRandom({
        network: network ? (networks as any)[network] : networks.liquid
      });
    else
      this.keyPair = keyPair;

    this.privateKey = this.keyPair.privateKey!.toString('hex');
    this.publicKey = this.keyPair.publicKey!.toString('hex');

    this.network = this.keyPair.network;
    const { address, output } = payments.p2wpkh({
      pubkey: this.keyPair.publicKey,
      network: this.network
    });
    this.address = address!;
    this.script = output!.toString('hex');
  }

  updateTx(
    psbtBase64: string,
    inputs: Array<any>,
    inputAmount: number,
    outputAmount: number,
    inputAsset: string,
    outputAsset: string): string {

    let psbt = decodePsbt(psbtBase64);

    inputs = inputs.filter((utxo: any) => utxo.asset === inputAsset);
    const { unspents, change } = coinselect(inputs, inputAmount);

    unspents.forEach((i: any) => psbt.addInput(({
      // if hash is string, txid, if hash is Buffer, is reversed compared to txid
      hash: i.txid,
      index: i.vout,
      //The scriptPubkey and the value only are needed.
      witnessUtxo: {
        script: Buffer.from(this.script, 'hex'),
        asset: Buffer.concat([
          Buffer.from("01", "hex"), //prefix for unconfidential asset
          Buffer.from(inputAsset, "hex").reverse(),
        ]),
        value: confidential.satoshiToConfidentialValue(i.value),
        nonce: Buffer.from('00', 'hex')
      }
    } as any)));

    psbt.addOutput({
      script: Buffer.from(this.script, 'hex'),
      value: confidential.satoshiToConfidentialValue(outputAmount),
      asset: Buffer.concat([
        Buffer.from("01", "hex"), //prefix for unconfidential asset
        Buffer.from(outputAsset, "hex").reverse(),
      ]),
      nonce: Buffer.from('00', 'hex')
    });

    if (change > 0) {
      psbt.addOutput({
        script: Buffer.from(this.script, 'hex'),
        value: confidential.satoshiToConfidentialValue(change),
        asset: Buffer.concat([
          Buffer.from("01", "hex"), //prefix for unconfidential asset
          Buffer.from(inputAsset, "hex").reverse(),
        ]),
        nonce: Buffer.from('00', 'hex')
      })
    }


    const base64 = psbt.toBase64();
    return base64;
  }

  sign(psbtBase64: string): string {
    const psbt = decodePsbt(psbtBase64);

    const index = psbt.data.inputs.findIndex(p => p.witnessUtxo!.script.toString('hex') === this.script)

    psbt.signInput(index, this.keyPair);

    if (!psbt.validateSignaturesOfInput(index))
      throw new Error('Invalid signature');

    psbt.finalizeInput(index);

    return psbt.toBase64();
  }

  toHex(psbtBase64: string): string {
    const psbt = decodePsbt(psbtBase64);

    return psbt.extractTransaction().toHex();
  }
  
}


function fromWIF(wif: string, network?: string): WalletInterface {

  const _network = network ? (networks as any)[network] : networks.liquid

  try {

    const keyPair = ECPair.fromWIF(wif, _network);
    return new Wallet({ keyPair });

  } catch (ignore) {

    throw new Error('Invalid keypair');

  }
}

function createTx(): string {
  let psbt = new Psbt();

  return psbt.toBase64()
}

function decodePsbt(psbtBase64:string) : Psbt {
  let psbt: Psbt
  try {
    psbt = Psbt.fromBase64(psbtBase64);
  } catch (ignore) {
    throw new Error('Invalid psbt');
  }
  return psbt
}

export async function fetchUtxos(address: string, url: string): Promise<any> {
  return (await axios.get(`${url}/address/${address}/utxo`)).data
}



export async function fetchBalances(address: string, url: string) {
  const utxos = await fetchUtxos(address, url);
  return utxos.reduce((storage: { [x: string]: any; }, item: { [x: string]: any; value: any; }) => {
    // get the first instance of the key by which we're grouping
    var group = item["asset"];

    // set `storage` for this instance of group to the outer scope (if not empty) or initialize it
    storage[group] = storage[group] || 0;

    // add this item to its group within `storage`
    storage[group] += (item.value);

    // return the updated storage to the reduce function, which will then loop through the next 
    return storage;
  }, {}); // {} is the initial value of the storage
}

function coinselect(utxos: Array<any>, amount: number) {
  let unspents = [];
  let availableSat = 0;
  let change = 0;


  for (let i = 0; i < utxos.length; i++) {
    const utxo = utxos[i]
    unspents.push({ txid: utxo.txid, vout: utxo.vout, value: utxo.value, asset: utxo.asset })
    availableSat += utxo.value

    if (availableSat >= amount)
      break;
  };

  if (availableSat < amount)
    throw new Error("You do not have enough in your wallet");

  change = availableSat - amount;

  return { unspents, change } 
};
