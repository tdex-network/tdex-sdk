import {
  fetchAndUnblindUtxos,
  greedyCoinSelector,
  IdentityOpts,
  PrivateKey,
  PrivateKeyOpts,
  UnblindedOutput,
} from 'ldk';
import * as TDEX from '../src/index';
import { Trade, IdentityType } from '../src/index';
import {
  CompleteTradeReply,
  ProposeTradeReply,
} from './api-spec/generated/js/tdex/v1/trade_pb';
import { SwapFail } from './api-spec/generated/js/tdex/v1/swap_pb';
import * as assert from 'assert';
import { faucet, sleep } from './_regtest';
import { rejectIfSwapFail } from '../src/utils';

jest.setTimeout(30000);

const signingKeyWIF = 'cQ1KJtXR2WB9Mpn6AEmeUK4yWeXAzwVX7UNJgQCF9anj3SrxjryV';
const blindingKeyWIF = 'cQ1KJtXR2WB9Mpn6AEmeUK4yWeXAzwVX7UNJgQCF9anj3SrxjryV';

const identityOpts: IdentityOpts<PrivateKeyOpts> = {
  chain: 'regtest',
  type: IdentityType.PrivateKey,
  opts: {
    signingKeyWIF,
    blindingKeyWIF,
  },
};

const identity = new PrivateKey(identityOpts);

describe('TDEX SDK', () => {
  let utxos: UnblindedOutput[] = [];

  beforeAll(async () => {
    const addr = await identity.getNextAddress();
    await faucet(addr.confidentialAddress);
    await sleep(3000);
    const addresses = await identity.getAddresses();
    utxos = await fetchAndUnblindUtxos(addresses, 'http://localhost:3001');
  });

  it('Should throw if no utxos', () => {
    expect(
      () =>
        new TDEX.Trade({
          utxos: [],
          explorerUrl: 'https://nigiri.network',
          providerUrl: 'localhost:9945',
          coinSelector: greedyCoinSelector(),
        })
    ).toThrow();
  });

  it('Should not throw', () => {
    const trade = new Trade({
      providerUrl: 'localhost:9945',
      explorerUrl: 'https://nigiri.network',
      coinSelector: greedyCoinSelector(),
      utxos,
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

    describe('ProposeTrade', () => {
      const proposeTradeReply = new ProposeTradeReply();
      proposeTradeReply.setSwapFail(swapFail);

      const proposeTradeReplyWithoutSwapFail = new ProposeTradeReply();

      it('should throw an error if there is SwapFail in ProposeTradeReply', () => {
        assert.rejects(
          () =>
            new Promise((_, reject) =>
              rejectIfSwapFail(proposeTradeReply, reject)
            )
        );
      });

      it('should not throw an error if there is no SwapFail in ProposeTradeReply', () => {
        assert.doesNotReject(
          () =>
            new Promise((_, reject) =>
              rejectIfSwapFail(proposeTradeReplyWithoutSwapFail, reject)
            )
        );
      });
    });

    describe('TradeComplete', () => {
      const completeTradeReply = new CompleteTradeReply();
      completeTradeReply.setSwapFail(swapFail);

      const completeTradeReplyWithoutSwapFail = new CompleteTradeReply();

      it('should throw an error if there is SwapFail in CompleteTradeReply', () => {
        assert.rejects(
          () =>
            new Promise((_, reject) =>
              rejectIfSwapFail(completeTradeReply, reject)
            )
        );
      });

      it('should not throw an error if there is no SwapFail in CompleteTradeReply', () => {
        assert.doesNotReject(
          () =>
            new Promise((_, reject) =>
              rejectIfSwapFail(completeTradeReplyWithoutSwapFail, reject)
            )
        );
      });
    });
  });
});
