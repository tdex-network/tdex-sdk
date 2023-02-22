import * as ecc from 'tiny-secp256k1';

import * as TDEX from '../src/index';
import { Trade, IdentityType } from '../src';
import {
  CompleteTradeResponse,
  ProposeTradeResponse,
} from '../src/api-spec/protobuf/gen/js/tdex/v1/trade_pb';
import { SwapFail } from '../src/api-spec/protobuf/gen/js/tdex/v1/swap_pb';
import * as assert from 'assert';
import { faucet, sleep } from './_regtest';
import { rejectIfSwapFail } from '../src/utils';
import secp256k1 from '@vulpemventures/secp256k1-zkp';

jest.setTimeout(30000);

const signingKeyWIF = 'cQ1KJtXR2WB9Mpn6AEmeUK4yWeXAzwVX7UNJgQCF9anj3SrxjryV';
const blindingKeyWIF = 'cQ1KJtXR2WB9Mpn6AEmeUK4yWeXAzwVX7UNJgQCF9anj3SrxjryV';

const identityOpts: () => Promise<IdentityOpts<PrivateKeyOpts>> = async () => {
  const zkp = await secp256k1();
  return {
    chain: 'regtest',
    type: IdentityType.PrivateKey,
    opts: {
      signingKeyWIF,
      blindingKeyWIF,
    },
    ecclib: ecc,
    zkplib: zkp,
  };
};

describe('TDEX SDK', () => {
  let utxos: UnblindedOutput[] = [];

  beforeAll(async () => {
    const zkp = await secp256k1();
    const identity = new PrivateKey(await identityOpts());
    const addr = await identity.getNextAddress();
    await faucet(addr.confidentialAddress);
    await sleep(3000);
    const addresses = await identity.getAddresses();
    utxos = await fetchAndUnblindUtxos(
      ecc,
      zkp,
      addresses,
      'http://localhost:3001'
    );
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
    const swapFail = SwapFail.create({
      id: '00011101',
      failureCode: 666,
      failureMessage: 'COVID',
    });
    describe('ProposeTrade', () => {
      const proposeTradeResponse = ProposeTradeResponse.create({
        swapFail: swapFail,
      });
      const proposeTradeResponseWithoutSwapFail = ProposeTradeResponse.create();

      it('should throw an error if there is SwapFail in ProposeTradeResponse', () => {
        assert.rejects(
          () =>
            new Promise((_, reject) =>
              rejectIfSwapFail(proposeTradeResponse, reject)
            )
        );
      });

      it('should not throw an error if there is no SwapFail in ProposeTradeResponse', () => {
        assert.doesNotReject(
          () =>
            new Promise((_, reject) =>
              rejectIfSwapFail(proposeTradeResponseWithoutSwapFail, reject)
            )
        );
      });
    });

    describe('CompleteTrade', () => {
      const completeTradeResponse = CompleteTradeResponse.create({
        swapFail: swapFail,
      });
      const completeTradeResponseWithoutSwapFail = CompleteTradeResponse.create();

      it('should throw an error if there is SwapFail in CompleteTradeResponse', () => {
        assert.rejects(
          () =>
            new Promise((_, reject) =>
              rejectIfSwapFail(completeTradeResponse, reject)
            )
        );
      });

      it('should not throw an error if there is no SwapFail in CompleteTradeResponse', () => {
        assert.doesNotReject(
          () =>
            new Promise((_, reject) =>
              rejectIfSwapFail(completeTradeResponseWithoutSwapFail, reject)
            )
        );
      });
    });
  });
});
