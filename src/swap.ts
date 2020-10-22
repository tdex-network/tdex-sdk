import Core from './core';
import * as proto from 'tdex-protobuf/generated/js/swap_pb';
import * as jspb from 'google-protobuf';

import {
  makeid,
  toNumber,
  decodePsbt,
  isConfidentialOutput,
  unblindOutput,
} from './utils';
import { Output } from 'liquidjs-lib/types/transaction';

// type for BlindingKeys
type BlindKeysMap = Record<string, Buffer>;

// define the Swap.request arguments.
interface requestOpts {
  assetToBeSent: string;
  amountToBeSent: number;
  assetToReceive: string;
  amountToReceive: number;
  psbtBase64: string;
  inputBlindingKeys?: BlindKeysMap;
  outputBlindingKeys?: BlindKeysMap;
}

// define the Swap.accept arguments.
interface acceptOpts {
  message: Uint8Array;
  psbtBase64: string;
  inputBlindingKeys?: BlindKeysMap;
  outputBlindingKeys?: BlindKeysMap;
}

/**
 * The Swap class implements the Swap TDEX protocol i.e swap.request, swap.accept and swap.complete.
 * @see https://github.com/TDex-network/tdex-specs/blob/master/03-swap-protocol.md
 */
export class Swap extends Core {
  static parse = parse;

  /**
   * Create and serialize a SwapRequest Message.
   * @param args the args of swap.request see requestOpts.
   */
  request({
    amountToBeSent,
    assetToBeSent,
    amountToReceive,
    assetToReceive,
    psbtBase64,
    inputBlindingKeys,
    outputBlindingKeys,
  }: requestOpts): Uint8Array {
    // Check amounts
    const msg = new proto.SwapRequest();
    msg.setId(makeid(8));
    msg.setAmountP(amountToBeSent);
    msg.setAssetP(assetToBeSent);
    msg.setAmountR(amountToReceive);
    msg.setAssetR(assetToReceive);
    msg.setTransaction(psbtBase64);

    if (inputBlindingKeys) {
      // set the input blinding keys
      Object.entries(inputBlindingKeys).forEach(([key, value]) => {
        msg.getInputBlindingKeyMap().set(key, Uint8Array.from(value));
      });
    }

    if (outputBlindingKeys) {
      // set the output blinding keys
      Object.entries(outputBlindingKeys).forEach(([key, value]) => {
        msg.getOutputBlindingKeyMap().set(key, Uint8Array.from(value));
      });
    }

    // check the message content and transaction.
    compareMessagesAndTransaction(msg);

    if (this.verbose) console.log(msg.toObject());

    return msg.serializeBinary();
  }

  /**
   * Create and serialize an accept message.
   * @param args the Swap.accept args, see AcceptOpts.
   */
  accept({
    message,
    psbtBase64,
    inputBlindingKeys,
    outputBlindingKeys,
  }: acceptOpts): Uint8Array {
    // deserialize message parameter to get the SwapRequest message.
    const msgRequest = proto.SwapRequest.deserializeBinary(message);
    // Build Swap Accept message
    const msgAccept = new proto.SwapAccept();
    msgAccept.setId(makeid(8));
    msgAccept.setRequestId(msgRequest.getId());
    msgAccept.setTransaction(psbtBase64);

    if (inputBlindingKeys) {
      // set the input blinding keys
      Object.entries(inputBlindingKeys).forEach(([key, value]) => {
        msgAccept.getInputBlindingKeyMap().set(key, Uint8Array.from(value));
      });
    }

    if (outputBlindingKeys) {
      // set the output blinding keys
      Object.entries(outputBlindingKeys).forEach(([key, value]) => {
        msgAccept.getOutputBlindingKeyMap().set(key, Uint8Array.from(value));
      });
    }

    // compare messages and transaction data
    compareMessagesAndTransaction(msgRequest, msgAccept);

    if (this.verbose) console.log(msgAccept.toObject());

    // serialize the SwapAccept message.
    return msgAccept.serializeBinary();
  }

  /**
   * create and serialize a SwapComplete message.
   * @param args contains the SwapAccept message + the base64 encoded transaction.
   */
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
      `Either SwapRequest.amount_r or SwapRequest.asset_r do not match the provided psbt (amount: ${msgRequest.getAmountR()}, asset: ${msgRequest.getAssetR()})`
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
        `Either SwapRequest.amount_p or SwapRequest.asset_p do not match the provided psbt amount=${msgRequest.getAmountP()} asset=${msgRequest.getAssetP()}`
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
  const assetBuffer: Buffer = Buffer.from(asset, 'hex').reverse();
  return outputs.some((o: Output) => {
    // unblind first if confidential ouput
    const isConfidential = isConfidentialOutput(o);
    if (isConfidential === true) {
      const blindKey: Buffer = outputBlindKeys[o.script.toString('hex')];
      // if no blinding keys for the confidential ouput --> return false
      if (blindKey === undefined)
        throw new Error(`no blind key for ${o.script.toString('hex')}`);
      try {
        const { value: unblindValue, asset: unblindAsset } = unblindOutput(
          o,
          blindKey
        );
        // check unblind value and unblind asset
        return (
          unblindValue === value && assetBuffer.equals(unblindAsset.slice(1))
        );
      } catch (_) {
        // if unblind fail --> return false
        return false;
      }
    }
    // check value and asset
    const isAsset: boolean = assetBuffer.equals(o.asset.slice(1));
    const isValue: boolean = toNumber(o.value) === value;
    return isAsset && isValue;
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
  const assetBuffer: Buffer = Buffer.from(asset, 'hex').reverse();
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
          i.witnessUtxo.value = unblindValue;
          i.witnessUtxo.asset = unblindAsset;
        }
        return i;
      })
      // filter inputs by asset
      .filter((i: any) => {
        return assetBuffer.equals(i.witnessUtxo.asset.slice(1));
      })
      // get the value
      .map((i: any) => {
        const valAsNumber: number =
          i.witnessUtxo.value instanceof Buffer
            ? toNumber(i.witnessUtxo!.value)
            : i.witnessUtxo!.value;
        return valAsNumber;
      })
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
export function blindKeysMap(
  jspbMap: jspb.Map<string, string | Uint8Array>
): BlindKeysMap | undefined {
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
