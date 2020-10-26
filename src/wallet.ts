import axios from 'axios';
import {
  Network,
  networks,
  payments,
  address,
  Psbt,
  confidential,
  Transaction,
} from 'liquidjs-lib';
import { Output } from 'liquidjs-lib/types/transaction';
import { AddressInterface } from 'types';

/**
 * Wallet abstraction.
 */
export interface WalletInterface {
  network: Network;
  addresses: AddressInterface[];
  blindingPrivateKeyByScript: Record<string, Buffer>;
  createTx(): string;
  updateTx(
    psetBase64: string,
    unspents: Array<UtxoInterface>,
    inputAmount: number,
    outputAmount: number,
    inputAsset: string,
    outputAsset: string,
    outputAddress: AddressInterface,
    changeAddress: AddressInterface
  ): any;
}

/**
 * Implementation of Wallet Interface.
 * @member network type of network (regtest...)
 * @member addresses list of AddressInterface.
 * @member blindingPrivateKeyByScript a map scriptPubKey --> blindingPrivateKey.
 * @method createTx init empty PSET.
 * @method updateTx update a PSET with outputs and inputs (for Swap tx).
 */
export class Wallet implements WalletInterface {
  network: Network;
  addresses: AddressInterface[] = [];
  blindingPrivateKeyByScript: Record<string, Buffer> = {};

  constructor({
    addresses,
    network,
  }: {
    addresses: AddressInterface[];
    network: Network;
  }) {
    this.network = network;
    this.addresses = addresses;
    addresses.forEach((a: AddressInterface) => {
      const scriptHex = payments
        .p2wpkh({
          confidentialAddress: a.confidentialAddress,
          network,
        })
        .output!.toString('hex');
      this.blindingPrivateKeyByScript[scriptHex] = Buffer.from(
        a.blindingPrivateKey,
        'hex'
      );
    });
  }

  /**
   * Returns an empty liquidjs lib Psbt instance.
   */
  createTx(): string {
    const pset = new Psbt({ network: this.network });
    return pset.toBase64();
  }

  /**
   *
   * @param psetBase64 the Pset to update, base64 encoded.
   * @param unspents unspent that will be used to found the transaction.
   * @param inputAmount the amount to found with unspents.
   * @param inputAsset the assetHash of inputs.
   * @param outputAmount the amount to send via output.
   * @param outputAsset the asset hash of output.
   * @param outputAddress the address that will receive the `outputAmount` of `outputAsset`.
   * @param changeAddress the change address.
   */
  updateTx(
    psetBase64: string,
    unspents: Array<UtxoInterface>,
    inputAmount: number,
    outputAmount: number,
    inputAsset: string,
    outputAsset: string,
    outputAddress: AddressInterface,
    changeAddress: AddressInterface
  ): any {
    let pset: Psbt;
    try {
      pset = Psbt.fromBase64(psetBase64);
    } catch (ignore) {
      throw new Error('Invalid pset');
    }

    const { selectedUnspents, change } = coinselect(
      unspents,
      inputAmount,
      inputAsset
    );

    let inputBlindingKeys: Record<string, Buffer> = {};
    let outputBlindingKeys: Record<string, Buffer> = {};

    selectedUnspents.forEach((i: UtxoInterface) => {
      pset.addInput({
        // if hash is string, txid, if hash is Buffer, is reversed compared to txid
        hash: i.txid,
        index: i.vout,
        //We put here the blinded prevout
        witnessUtxo: i.prevout!,
      } as any);

      // we update the inputBlindingKeys map after we add an input to the transaction
      const scriptHex = i.prevout!.script.toString('hex');
      inputBlindingKeys[scriptHex] = this.blindingPrivateKeyByScript[scriptHex];
    });

    const receivingScript = address
      .toOutputScript(outputAddress.confidentialAddress, this.network)
      .toString('hex');

    // The receiving output
    pset.addOutput({
      script: receivingScript,
      value: confidential.satoshiToConfidentialValue(outputAmount),
      asset: outputAsset,
      nonce: Buffer.from('00', 'hex'),
    });

    // we update the outputBlindingKeys map after we add the receiving output to the transaction
    outputBlindingKeys[receivingScript] = Buffer.from(
      outputAddress.blindingPrivateKey,
      'hex'
    );

    if (change > 0) {
      const changeScript = address
        .toOutputScript(changeAddress.confidentialAddress, this.network)
        .toString('hex');

      // Change
      pset.addOutput({
        script: changeScript,
        value: confidential.satoshiToConfidentialValue(change),
        asset: inputAsset,
        nonce: Buffer.from('00', 'hex'),
      });

      // we update the outputBlindingKeys map after we add the change output to the transaction
      outputBlindingKeys[changeScript] = Buffer.from(
        changeAddress.blindingPrivateKey,
        'hex'
      );
    }

    return {
      psetBase64: pset.toBase64(),
      inputBlindingKeys,
      outputBlindingKeys,
    };
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

/**
 * Factory: list of addresses --to--> Wallet
 * @param addresses a list of addressInterface.
 * @param network network type
 */
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
  prevout?: Output;
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
        asset: (unblindedUtxo.asset.reverse() as Buffer).toString('hex'),
        value: parseInt(unblindedUtxo.value, 10),
        prevout: prevout,
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

/**
 * Select a set of unspent in `utxos` such as sum(utxo.value) >= `amount` && where utxo.asset = `asset`.
 * Returns change and selected unspent outputs.
 * @param utxos the unspents to search in.
 * @param amount the amount of coin to search.
 * @param asset the asset hash.
 */
export function coinselect(
  utxos: Array<UtxoInterface>,
  amount: number,
  asset: string
) {
  let unspents = [];
  let availableSat = 0;
  let change = 0;

  for (let i = 0; i < utxos.length; i++) {
    const utxo = utxos[i];

    if (!utxo.value || !utxo.asset)
      throw new Error('Coin selection needs unblinded outputs');

    if (!utxo.prevout) throw new Error('UtxoInterface: Prevout is mandatory');

    if (utxo.asset !== asset) continue;

    unspents.push({
      txid: utxo.txid,
      vout: utxo.vout,
      value: utxo.value,
      asset: utxo.asset,
      prevout: utxo.prevout,
    });
    availableSat += utxo.value;

    if (availableSat >= amount) break;
  }

  if (availableSat < amount)
    throw new Error('You do not have enough in your wallet');

  change = availableSat - amount;

  return { selectedUnspents: unspents, change };
}
