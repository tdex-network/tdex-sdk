import axios from 'axios';
import {
  Network,
  networks,
  payments,
  Psbt,
  confidential,
  Transaction,
} from 'liquidjs-lib';
import { fromAssetHash, toAssetHash } from './utils';
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
    outputAsset: string,
    outputAddress: string,
    changeAddress: string
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
    const pset = new Psbt({ network: this.network });
    return pset.toBase64();
  }

  updateTx(
    psetBase64: string,
    unspents: Array<UtxoInterface>,
    inputAmount: number,
    outputAmount: number,
    inputAsset: string,
    outputAsset: string,
    outputAddress: string,
    changeAddress: string
  ): string {
    let pset: Psbt;
    try {
      pset = Psbt.fromBase64(psetBase64);
    } catch (ignore) {
      throw new Error('Invalid pset');
    }

    unspents = unspents.filter(
      (utxo: UtxoInterface) => utxo.asset === inputAsset
    );
    const { selectedUnspents, change } = coinselect(unspents, inputAmount);

    selectedUnspents.forEach((i: UtxoInterface) =>
      pset.addInput({
        // if hash is string, txid, if hash is Buffer, is reversed compared to txid
        hash: i.txid,
        index: i.vout,
        //The scriptPubkey and the value only are needed.
        witnessUtxo: {
          script: i.script,
          asset: fromAssetHash(inputAsset),
          value: confidential.satoshiToConfidentialValue(i.value!),
          nonce: Buffer.from('00', 'hex'),
        },
      } as any)
    );

    pset.addOutput({
      address: outputAddress,
      value: confidential.satoshiToConfidentialValue(outputAmount),
      asset: outputAsset,
      nonce: Buffer.from('00', 'hex'),
    });

    if (change > 0) {
      pset.addOutput({
        address: changeAddress,
        value: confidential.satoshiToConfidentialValue(change),
        asset: fromAssetHash(inputAsset),
        nonce: Buffer.from('00', 'hex'),
      });
    }

    return pset.toBase64();
  }

  static toHex(psetBase64: string): string {
    let pset: Psbt;
    try {
      pset = Psbt.fromBase64(psetBase64);
    } catch (ignore) {
      throw new Error('Invalid pset');
    }

    pset.validateSignaturesOfAllInputs();
    pset.finalizeAllInputs();

    return pset.extractTransaction().toHex();
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

export interface UtxoInterface {
  txid: string;
  vout: number;
  asset?: string;
  value?: number;
  assetcommitment?: string;
  valuecommitment?: string;
  script?: string | Buffer;
}

export async function fetchTxHex(txId: string, url: string): Promise<string> {
  return (await axios.get(`${url}/tx/${txId}/hex`)).data;
}

export async function fetchUtxos(
  address: string,
  url: string
): Promise<Array<UtxoInterface>> {
  return (await axios.get(`${url}/address/${address}/utxo`)).data;
}

export async function fetchAndUnblindUtxos(
  address: string,
  blindPrivKey: string,
  url: string
): Promise<Array<UtxoInterface>> {
  const blindedUtxos = await fetchUtxos(address, url);
  const prevoutHexes = await Promise.all(
    blindedUtxos.map((utxo: UtxoInterface) => fetchTxHex(utxo.txid, url))
  );

  const unblindedUtxos = blindedUtxos.map(
    (blindedUtxo: UtxoInterface, index: number) => {
      const prevout = Transaction.fromHex(String(prevoutHexes[index])).outs[
        blindedUtxo.vout
      ];

      const unblindedUtxo = confidential.unblindOutput(
        prevout.nonce,
        Buffer.from(blindPrivKey, 'hex'),
        prevout.rangeProof!,
        prevout.value,
        prevout.asset,
        prevout.script
      );

      return {
        txid: blindedUtxo.txid,
        vout: blindedUtxo.vout,
        asset: toAssetHash(unblindedUtxo.asset),
        value: parseInt(unblindedUtxo.value, 10),
        script: prevout.script,
      };
    }
  );
  return unblindedUtxos;
}

export async function fetchBalances(
  address: string,
  blindPrivKey: string,
  url: string
) {
  const utxoInterfaces = await fetchAndUnblindUtxos(address, blindPrivKey, url);
  return (utxoInterfaces as any).reduce(
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

export function coinselect(utxos: Array<UtxoInterface>, amount: number) {
  let unspents = [];
  let availableSat = 0;
  let change = 0;

  for (let i = 0; i < utxos.length; i++) {
    const utxo = utxos[i];

    if (!utxo.value || !utxo.asset)
      throw new Error('Coin selection needs unblinded outputs');

    unspents.push({
      txid: utxo.txid,
      vout: utxo.vout,
      value: utxo.value,
      asset: utxo.asset,
    });
    availableSat += utxo.value;

    if (availableSat >= amount) break;
  }

  if (availableSat < amount)
    throw new Error('You do not have enough in your wallet');

  change = availableSat - amount;

  return { selectedUnspents: unspents, change };
}
