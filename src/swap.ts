import Core from './core';
import * as proto from '../proto/swap_pb';
import { makeid, toNumber, toSatoshi, toAssetHash, decodePsbt } from './utils';

export class Swap extends Core {
  static parse = parse;

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
    // Check amounts
    const amountToBeSentInSatoshi = toSatoshi(amountToBeSent);
    const amountToReceiveInSatoshi = toSatoshi(amountToReceive);

    const msg = new proto.SwapRequest();
    msg.setId(makeid(8));
    msg.setAmountP(amountToBeSentInSatoshi);
    msg.setAssetP(assetToBeSent);
    msg.setAmountR(amountToReceiveInSatoshi);
    msg.setAssetR(assetToReceive);

    compareMessagesAndTransaction(psbtBase64, msg);
    msg.setTransaction(psbtBase64);

    if (this.verbose) console.log(msg.toObject());

    if (opts && (opts! as any).format === 'json')
      return JSON.stringify(msg.toObject());

    return msg.serializeBinary();
  }

  /* accept({
    message,
    psbtBase64,
    opts,
  }: {
    message: Uint8Array;
    psbtBase64: string;
    opts?: Object;
  }): Uint8Array | string {

    const msg = proto.SwapRequest.deserializeBinary(message);
    compareMessagesAndTransaction(psbtBase64, msg);

    if (this.verbose) console.log(msg.toObject());

    if (opts && (opts! as any).format === 'json')
      return JSON.stringify(msg.toObject());

    return psbt.toBase64();
  } */
}

function compareMessagesAndTransaction(
  psbtBase64: string,
  msgRequest: proto.SwapRequest,
  msgAccept?: proto.SwapAccept
) {
  const { psbt, transaction } = decodePsbt(psbtBase64);

  const total = countUtxos(psbt.data.inputs, msgRequest.getAssetP());
  if (total < msgRequest.getAmountP())
    throw new Error(
      'Cumulative utxos count is not enough to cover SwapRequest.amount_p'
    );

  const outputFound = outputFoundInTransaction(
    transaction.outs,
    msgRequest.getAmountR(),
    msgRequest.getAssetR()
  );
  if (!outputFound)
    throw new Error(
      'Either SwapRequest.amount_r or SwapRequest.asset_r do not match the provided psbt'
    );

  if (msgAccept) {
    if (msgRequest.getId() !== msgAccept.getRequestId())
      throw new Error(
        'SwapRequest.id and SwapAccept.request_id are not the same'
      );
  }
}

function outputFoundInTransaction(
  outputs: Array<any>,
  value: number,
  asset: string
) {
  const found = outputs.find(
    (o: any) => toNumber(o.value) === value && toAssetHash(o.asset) === asset
  );

  return found !== undefined;
}

function countUtxos(utxos: Array<any>, asset: string): number {
  return utxos
    .filter((i: any) => toAssetHash(i.witnessUtxo!.asset) === asset)
    .map((i: any) => toNumber(i.witnessUtxo!.value))
    .reduce((a: any, b: any) => a + b, 0);
}

function parse({
  message,
  type,
}: {
  message: Uint8Array;
  type: string;
}): string {
  let msg: any;
  try {
    msg = (proto as any)[type].deserializeBinary(message);
  } catch (e) {
    throw new Error(`Not valid message of expected type ${type}`);
  }

  return JSON.stringify(msg.toObject(), undefined, 2);
}
