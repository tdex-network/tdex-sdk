import axios from 'axios';
import { Network, networks, payments, Psbt, confidential } from 'liquidjs-lib';
//Libs
import { AddressInterface } from './identity';

export interface WalletInterface {
  network: Network;
  addresses: AddressInterface[];
  scripts: string[];
  createTx(): string;
  updateTx(
    psetBase64: string,
    unspents: Array<any>,
    inputAmount: number,
    outputAmount: number,
    inputAsset: string,
    outputAsset: string
  ): string;
}

export class Wallet implements WalletInterface {
  network: Network;
  addresses: AddressInterface[];
  scripts: string[];
  constructor({
    addresses,
    network,
  }: {
    addresses: AddressInterface[];
    network: Network;
  }) {
    this.network = network;
    this.addresses = addresses;
    this.scripts = addresses.map((a: AddressInterface) =>
      payments
        .p2wpkh({
          confidentialAddress: a.confidentialAddress,
          network,
        })
        .output!.toString('hex')
    );
  }

  createTx(): string {
    const psbt = new Psbt({ network: this.network });
    return psbt.toBase64();
  }

  updateTx(
    psetBase64: string,
    unspents: Array<any>,
    inputAmount: number,
    outputAmount: number,
    inputAsset: string,
    outputAsset: string
  ): string {
    let psbt: Psbt;
    try {
      psbt = Psbt.fromBase64(psetBase64);
    } catch (ignore) {
      throw new Error('Invalid psbt');
    }

    unspents = unspents.filter((utxo: any) => utxo.asset === inputAsset);
    //TODO do coinselection on unblinded utxos and use inputAmount as target
    console.log(inputAmount);
    const script = '';
    const change = 0;

    unspents.forEach((i: any) =>
      psbt.addInput({
        // if hash is string, txid, if hash is Buffer, is reversed compared to txid
        hash: i.txid,
        index: i.vout,
        //The scriptPubkey and the value only are needed.
        witnessUtxo: {
          script: Buffer.from(script, 'hex'),
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
      script: Buffer.from(script, 'hex'),
      value: confidential.satoshiToConfidentialValue(outputAmount),
      asset: Buffer.concat([
        Buffer.from('01', 'hex'), //prefix for unconfidential asset
        Buffer.from(outputAsset, 'hex').reverse(),
      ]),
      nonce: Buffer.from('00', 'hex'),
    });

    if (change > 0) {
      psbt.addOutput({
        script: Buffer.from(script, 'hex'),
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

  static toHex(psetBase64: string): string {
    let psbt: Psbt;
    try {
      psbt = Psbt.fromBase64(psetBase64);
    } catch (ignore) {
      throw new Error('Invalid psbt');
    }

    psbt.validateSignaturesOfAllInputs();
    psbt.finalizeAllInputs();

    return psbt.extractTransaction().toHex();
  }
}

export function walletFromAddresses(
  addresses: AddressInterface[],
  network?: string
): WalletInterface {
  const _network = network
    ? (networks as Record<string, Network>)[network]
    : networks.liquid;

  try {
    return new Wallet({
      addresses,
      network: _network,
    });
  } catch (ignore) {
    throw new Error('fromAddress: Invalid addresses list or network');
  }
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
