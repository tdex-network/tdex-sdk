import { networks } from 'liquidjs-lib';
import { TraderClient } from './../src/grpcClient';
import * as TDEX from '../src/index';
import { Trade, IdentityType } from '../src/index';
import { TradeType } from 'tdex-protobuf/generated/js/types_pb';

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
    let traderClient = new TraderClient('http://localhost:9945');

    describe('TradePropose', () => {
      it('should reject if the Swap fails', () => {});
    });
  });
});
