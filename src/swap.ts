import Wallet from './wallet';

import Core from './core';
import * as proto from '../proto/swap_pb';
import { Transaction, confidential } from 'liquidjs-lib';

export class Swap extends Core {
  request({
    assetToBeSent,
    amountToBeSent,
    assetToReceive,
    amountToReceive,
    psbtBase64,
    opts,
  }: {
    assetToBeSent: string;
    amountToBeSent: number;
    assetToReceive: string;
    amountToReceive: number;
    psbtBase64: string;
    opts?: Object;
  }): Uint8Array | string {
    const psbt = Wallet.decodePsbt(psbtBase64);
    // Check amounts
    amountToBeSent = toSatoshi(amountToBeSent);
    amountToReceive = toSatoshi(amountToReceive);

    const msg = new proto.SwapRequest();
    msg.setId(makeid(8));
    msg.setAmountP(amountToBeSent);
    msg.setAssetP(assetToBeSent);
    msg.setAmountR(amountToReceive);
    msg.setAssetR(assetToReceive);

    // TODO Validate the psbt and check if given
    // amountR & assetR are present in tx outputs
    const countUtxos = psbt.data.inputs
      .map((i: any) => toNumber(i.witnessUtxo!.value))
      .reduce((a: any, b: any) => a + b, 0);
    if (countUtxos < amountToBeSent)
      throw new Error('cumulative utxos count is not enough to cover amount_p');

    const bufferTx = psbt.data.globalMap.unsignedTx.toBuffer();
    const tx = Transaction.fromBuffer(bufferTx);
    const outputR = tx.outs.find(
      o =>
        toNumber(o.value) === amountToReceive &&
        toAssetHash(o.asset) === assetToReceive
    );
    if (!outputR)
      throw new Error('amount_r and asset_r do not match the provided psbt');
    msg.setTransaction(psbtBase64);

    if (this.verbose) console.log(msg.toObject());

    if (opts && (opts! as any).format === 'json')
      return JSON.stringify(msg.toObject());

    return msg.serializeBinary();
  }

  parse({ message, type }: { message: Uint8Array; type: string }): string {
    let msg: any;
    try {
      msg = (proto as any)[type].deserializeBinary(message);
    } catch (e) {
      throw new Error(`Not valid message of expected type ${type}`);
    }

    return JSON.stringify(msg.toObject(), undefined, 2);
  }

  accept({
    message,
    psbtBase64,
    opts,
  }: {
    message: Uint8Array;
    psbtBase64: string;
    opts?: Object;
  }): Uint8Array | string {
    const psbt = Wallet.decodePsbt(psbtBase64);

    const msg = proto.SwapRequest.deserializeBinary(message);

    if (opts && (opts! as any).format === 'json')
      return JSON.stringify(msg.toObject());

    return psbt.toBase64();
  }
}

function toAssetHash(x: Buffer): string {
  const withoutFirstByte = x.slice(1);
  return withoutFirstByte.reverse().toString('hex');
}

function toNumber(x: Buffer): number {
  return confidential.confidentialValueToSatoshi(x);
}

function toSatoshi(x: number): number {
  return Math.floor(x * Math.pow(10, 8));
}

function makeid(length: number): string {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
