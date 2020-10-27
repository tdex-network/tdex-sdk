import * as TDEX from '../src/index';
import { Trade, IdentityType, throwErrorIfSwapFail } from '../src/index';
import {
  TradeCompleteReply,
  TradeProposeReply,
} from 'tdex-protobuf/generated/js/trade_pb';
import { SwapFail } from 'tdex-protobuf/generated/js/swap_pb';
import * as assert from 'assert';

const signingKeyWIF = 'cQ1KJtXR2WB9Mpn6AEmeUK4yWeXAzwVX7UNJgQCF9anj3SrxjryV';
const blindingKeyWIF = 'cQ1KJtXR2WB9Mpn6AEmeUK4yWeXAzwVX7UNJgQCF9anj3SrxjryV';

describe('TDEX SDK', () => {
  it('Should throw if arguments not given', () => {
    expect(() => new TDEX.Trade({})).toThrow();
  });

  it('Should not throw', () => {
    const trade = new Trade({
      providerUrl: 'localhost:9945',
      explorerUrl: 'https://nigiri.network',
      identity: {
        chain: 'regtest',
        type: IdentityType.PrivateKey,
        value: {
          signingKeyWIF,
          blindingKeyWIF,
        },
      },
    });
    expect(trade).toMatchObject({
      chain: 'regtest',
      verbose: false,
      providerUrl: 'localhost:9945',
      explorerUrl: 'https://nigiri.network',
    });
  });

  describe('TraderClient', () => {
    const swapFail = new SwapFail();
    swapFail.setId('00011101');
    swapFail.setFailureCode(666);
    swapFail.setFailureMessage('COVID');

    describe('TradePropose', () => {
      const tradeProposeReply = new TradeProposeReply();
      tradeProposeReply.setSwapFail(swapFail);

      const tradeProposeReplyWithoutSwapFail = new TradeProposeReply();

      it('should throw an error if there is SwapFail in TradeProposeReply', () => {
        assert.throws(() => throwErrorIfSwapFail(tradeProposeReply));
      });

      it('should not throw an error if there is no SwapFail in TradeProposeReply', () => {
        assert.doesNotThrow(() =>
          throwErrorIfSwapFail(tradeProposeReplyWithoutSwapFail)
        );
      });
    });

    describe('TradeComplete', () => {
      const tradeCompleteReply = new TradeCompleteReply();
      tradeCompleteReply.setSwapFail(swapFail);

      const tradeCompleteReplyWithoutSwapFail = new TradeCompleteReply();

      it('should throw an error if there is SwapFail in TradeCompleteReply', () => {
        assert.throws(() => throwErrorIfSwapFail(tradeCompleteReply));
      });

      it('should not throw an error if there is no SwapFail in TradeCompleteReply', () => {
        assert.doesNotThrow(() =>
          throwErrorIfSwapFail(tradeCompleteReplyWithoutSwapFail)
        );
      });
    });
  });
});
