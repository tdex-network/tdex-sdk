import Core from './core';
import * as proto from 'tdex-protobuf/js/swap_pb';
import { makeid, toNumber, toAssetHash, decodePsbt } from './utils';

export class Swap extends Core {
  static parse = parse;

  request({
    assetToBeSent,
    amountToBeSent,
    assetToReceive,
    amountToReceive,
    psbtBase64,
  }: {
    assetToBeSent: string;
    amountToBeSent: number;
    assetToReceive: string;
    amountToReceive: number;
    psbtBase64: string;
  }): Uint8Array {
    // Check amounts

    const msg = new proto.SwapRequest();
    msg.setId(makeid(8));
    msg.setAmountP(amountToBeSent);
    msg.setAssetP(assetToBeSent);
    msg.setAmountR(amountToReceive);
    msg.setAssetR(assetToReceive);
    msg.setTransaction(psbtBase64);

    compareMessagesAndTransaction(msg);

    if (this.verbose) console.log(msg.toObject());

    return msg.serializeBinary();
  }

  accept({
    message,
    psbtBase64,
  }: {
    message: Uint8Array;
    psbtBase64: string;
  }): Uint8Array {
    const msgRequest = proto.SwapRequest.deserializeBinary(message);
    // Build Swap Accepr message
    const msgAccept = new proto.SwapAccept();
    msgAccept.setId(makeid(8));
    msgAccept.setRequestId(msgRequest.getId());
    msgAccept.setTransaction(psbtBase64);

    compareMessagesAndTransaction(msgRequest, msgAccept);

    if (this.verbose) console.log(msgAccept.toObject());

    return msgAccept.serializeBinary();
  }

  complete({
    message,
    psbtBase64,
  }: {
    message: Uint8Array;
    psbtBase64: string;
  }): Uint8Array {
    //First validate signatures
    const { psbt } = decodePsbt(psbtBase64);

    if (!psbt.validateSignaturesOfAllInputs())
      throw new Error('Signatures not valid');

    const msgAccept = proto.SwapAccept.deserializeBinary(message);
    //Build SwapComplete
    const msgComplete = new proto.SwapComplete();
    msgComplete.setId(makeid(8));
    msgComplete.setAcceptId(msgAccept.getId());
    msgComplete.setTransaction(psbtBase64);

    if (this.verbose) console.log(msgAccept.toObject());

    return msgComplete.serializeBinary();
  }
}

function compareMessagesAndTransaction(
  msgRequest: proto.SwapRequest,
  msgAccept?: proto.SwapAccept
) {
  const decodedFromRequest = decodePsbt(msgRequest.getTransaction());

  const totalP = countUtxos(
    decodedFromRequest.psbt.data.inputs,
    msgRequest.getAssetP()
  );
  if (totalP < msgRequest.getAmountP())
    throw new Error(
      'Cumulative utxos count is not enough to cover SwapRequest.amount_p'
    );

  const outputRFound = outputFoundInTransaction(
    decodedFromRequest.transaction.outs,
    msgRequest.getAmountR(),
    msgRequest.getAssetR()
  );
  if (!outputRFound)
    throw new Error(
      'Either SwapRequest.amount_r or SwapRequest.asset_r do not match the provided psbt'
    );

  if (msgAccept) {
    const decodedFromAccept = decodePsbt(msgAccept.getTransaction());
    if (msgRequest.getId() !== msgAccept.getRequestId())
      throw new Error(
        'SwapRequest.id and SwapAccept.request_id are not the same'
      );

    const totalR = countUtxos(
      decodedFromAccept.psbt.data.inputs,
      msgRequest.getAssetR()
    );
    if (totalR < msgRequest.getAmountR())
      throw new Error(
        'Cumulative utxos count is not enough to cover SwapRequest.amount_r'
      );

    const outputPFound = outputFoundInTransaction(
      decodedFromAccept.transaction.outs,
      msgRequest.getAmountP(),
      msgRequest.getAssetP()
    );
    if (!outputPFound)
      throw new Error(
        'Either SwapRequest.amount_p or SwapRequest.asset_p do not match the provided psbt'
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
