import { Psbt, Transaction } from 'liquidjs-lib';
import * as messages from 'tdex-protobuf/generated/js/trade_pb';

/**
 * Generates a random id of a fixed length.
 * @param length size of the string id.
 */
export function makeid(length: number): string {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function decodePsbt(
  psetBase64: string
): { psbt: Psbt; transaction: Transaction } {
  let psbt: Psbt;
  try {
    psbt = Psbt.fromBase64(psetBase64);
  } catch (ignore) {
    throw new Error('Invalid psbt');
  }

  const bufferTx = psbt.data.globalMap.unsignedTx.toBuffer();
  const transaction = Transaction.fromBuffer(bufferTx);
  return {
    psbt,
    transaction,
  };
}

export function getClearTextTorProxyUrl(
  torProxyEndpoint: string,
  url: URL
): string {
  // get just_onion_host_without_dot_onion
  const splitted = url.hostname.split('.');
  splitted.pop();
  const onionPubKey = splitted.join('.');

  return `${torProxyEndpoint}/${onionPubKey}`;
}

/**
 * used to inspect TradePropose or TradeComplete reply messages
 * @param tradeReply TradePropose or TradeComplete protobuf messages
 * @param reject the promise's reject function
 */
export function rejectIfSwapFail(
  tradeReply: messages.TradeProposeReply | messages.TradeCompleteReply,
  reject: (reason?: any) => void
): boolean {
  const swapFail = tradeReply.getSwapFail();
  if (swapFail) {
    const errorMessage = `SwapFail for message id=${swapFail.getId()}. Failure code ${swapFail.getFailureCode()} | reason: ${swapFail.getFailureMessage()}`;
    reject(errorMessage);
    return true;
  }

  return false;
}
