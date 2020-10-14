import Core from './core';
import * as proto from 'tdex-protobuf/js/swap_pb';
import * as jspb from 'google-protobuf';

import {
  makeid,
  toNumber,
  toAssetHash,
  decodePsbt,
  isConfidentialOutput,
  unblindOutput,
} from './utils';
import { Output } from 'liquidjs-lib/types/transaction';

// type for BlindingKeys
type BlindKeysMap = Record<string, Buffer>;

interface requestOpts {}

/**
 * The Swap class implements the Swap TDEX protocol
 * @see https://github.com/TDex-network/tdex-specs/blob/master/03-swap-protocol.md
 */
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

/**
 * Take a swap messages and check if the message's data is corresponding to the  msg's transaction.
 * @param msgRequest the swap request message.
 * @param msgAccept the swap accept message.
 */
function compareMessagesAndTransaction(
  msgRequest: proto.SwapRequest,
  msgAccept?: proto.SwapAccept
): void {
  // msg Request

  // decode the transaction.
  const decodedFromRequest = decodePsbt(msgRequest.getTransaction());

  // check the amount of the transaction
  const totalP = countUtxos(
    decodedFromRequest.psbt.data.inputs,
    msgRequest.getAssetP(),
    blindKeysMap(msgRequest.getInputBlindingKeyMap())
  );

  if (totalP < msgRequest.getAmountP())
    throw new Error(
      'Cumulative utxos count is not enough to cover SwapRequest.amount_p'
    );

  // check if the output if found in the transaction
  const outputRFound: boolean = outputFoundInTransaction(
    decodedFromRequest.transaction.outs,
    msgRequest.getAmountR(),
    msgRequest.getAssetR(),
    blindKeysMap(msgRequest.getOutputBlindingKeyMap())
  );

  if (!outputRFound)
    throw new Error(
      'Either SwapRequest.amount_r or SwapRequest.asset_r do not match the provided psbt'
    );

  // msg accept
  if (msgAccept) {
    // decode the tx and check the msg's ids
    const decodedFromAccept = decodePsbt(msgAccept.getTransaction());
    if (msgRequest.getId() !== msgAccept.getRequestId())
      throw new Error(
        'SwapRequest.id and SwapAccept.request_id are not the same'
      );

    // check the amount of utxos.
    const totalR = countUtxos(
      decodedFromAccept.psbt.data.inputs,
      msgRequest.getAssetR(),
      blindKeysMap(msgAccept.getInputBlindingKeyMap())
    );

    if (totalR < msgRequest.getAmountR())
      throw new Error(
        'Cumulative utxos count is not enough to cover SwapRequest.amount_r'
      );

    // check if there is an output found in the transaction.
    const outputPFound = outputFoundInTransaction(
      decodedFromAccept.transaction.outs,
      msgRequest.getAmountP(),
      msgRequest.getAssetP(),
      blindKeysMap(msgAccept.getOutputBlindingKeyMap())
    );

    if (!outputPFound)
      throw new Error(
        'Either SwapRequest.amount_p or SwapRequest.asset_p do not match the provided psbt'
      );
  }
}

/**
 * find an output in outputs corresponding to value and asset. Provide outputBlindKeys if output are blinded.
 * @param outputs the outputs to search in.
 * @param value value of the output.
 * @param asset hex encoded asset of the output.
 * @param outputBlindKeys optional, only if blinded outputs. Blinding keys map (scriptPukKey -> blindingKey).
 */
function outputFoundInTransaction(
  outputs: Array<Output>,
  value: number,
  asset: string,
  outputBlindKeys: BlindKeysMap = {}
): boolean {
  return outputs.some((o: Output) => {
    // unblind first if confidential ouput
    if (isConfidentialOutput(o)) {
      const blindKey: Buffer = outputBlindKeys[o.script.toString('hex')];
      if (blindKey === undefined)
        throw new Error('no blindKey for script: ' + o.script.toString('hex'));
      const { value: unblindValue, asset: unblindAsset } = unblindOutput(
        o,
        blindKey
      );
      // check unblind value and unblind asset
      return parseInt(unblindValue, 10) === value && unblindAsset === asset;
    }
    // check value and asset
    return toNumber(o.value) === value && toAssetHash(o.asset) === asset;
  });
}

/**
 * Returns the sum of the values of the given inputs' utxos.
 * @param utxos the inputs.
 * @param asset the asset to fetch value.
 * @param inputBlindKeys optional, the blinding keys using to unblind witnessUtxo if blinded.
 */
function countUtxos(
  utxos: Array<any>,
  asset: string,
  inputBlindKeys: BlindKeysMap = {}
): number {
  return (
    utxos
      // checks if witness utxo exists
      .filter((i: any) => i.witnessUtxo != null)
      // unblind confidential output.
      .map((i: any) => {
        if (isConfidentialOutput(i.witnessUtxo)) {
          const blindKey = inputBlindKeys[i.witnessUtxo.script.toString('hex')];
          if (blindKey === undefined) {
            throw new Error(
              'no blindKey for script: ' + i.witnessUtxo.script.toString('hex')
            );
          }
          const { value: unblindValue, asset: unblindAsset } = unblindOutput(
            i.witnessUtxo,
            blindKey
          );
          i.witnessUtxo.asset = unblindAsset;
          i.witnessUtxo.value = unblindValue;
        }
        return i;
      })
      // filter inputs by asset
      .filter((i: any) => {
        return toAssetHash(i.witnessUtxo!.asset) === asset;
      })
      // get the value
      .map((i: any) =>
        i.witnessUtxo.value instanceof Buffer
          ? toNumber(i.witnessUtxo!.value)
          : parseInt(i.witnessUtxo.value)
      )
      // apply reducer to values (add the values)
      .reduce((a: any, b: any) => a + b, 0)
  );
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

/**
 * Convert jspb's Map type to BlindKeysMap.
 * @param jspbMap the map to convert.
 */
function blindKeysMap(
  jspbMap: jspb.Map<string, string | Uint8Array>
): BlindKeysMap {
  const map: BlindKeysMap = {};
  jspbMap.forEach((entry: string | Uint8Array, key: string) => {
    const value: Buffer =
      entry instanceof Uint8Array
        ? Buffer.from(entry)
        : Buffer.from(entry, 'hex');

    map[key] = value;
  });
  return map;
}
