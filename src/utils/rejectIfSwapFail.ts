import * as messagesV1 from '../api-spec/protobuf/gen/js/tdex/v1/trade_pb';
import * as messagesV2 from '../api-spec/protobuf/gen/js/tdex/v2/trade_pb';

/**
 * used to inspect ProposeTrade/CompleteTrade
 * reply messages
 * @param tradeReply ProposeTrade/CompleteTrade protobuf messages
 * @param reject the promise's reject function
 */
export function rejectIfSwapFailV1(
  tradeReply:
    | messagesV1.ProposeTradeResponse
    | messagesV1.CompleteTradeResponse,
  reject: (reason?: any) => void
): boolean {
  const swapFail = tradeReply.swapFail;
  if (swapFail) {
    const errorMessage = `SwapFail for message id=${swapFail.id}. Failure code ${swapFail.failureCode} | reason: ${swapFail.failureMessage}`;
    reject(errorMessage);
    return true;
  }
  return false;
}

/**
 * used to inspect ProposeTrade/CompleteTrade
 * reply messages
 * @param tradeReply ProposeTrade/CompleteTrade protobuf messages
 * @param reject the promise's reject function
 */
export function rejectIfSwapFailV2(
  tradeReply:
    | messagesV2.ProposeTradeResponse
    | messagesV2.CompleteTradeResponse,
  reject: (reason?: any) => void
): boolean {
  const swapFail = tradeReply.swapFail;
  if (swapFail) {
    const errorMessage = `SwapFail for message id=${swapFail.id}. Failure code ${swapFail.failureCode} | reason: ${swapFail.failureMessage}`;
    reject(errorMessage);
    return true;
  }
  return false;
}
