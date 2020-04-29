import * as TDEX from '../src/index';
import { Wallet, WatchOnlyWallet } from '../src/wallet';

describe('TDEX SDK', () => {
  it('Init', () => {
    const swap = new TDEX.Swap();
    expect(swap).toMatchObject({ chain: 'regtest', verbose: false });
  });

  it('Can create a Wallet from wif', () => {
    const wallet = Wallet.fromWIF(
      'cQ1KJtXR2WB9Mpn6AEmeUK4yWeXAzwVX7UNJgQCF9anj3SrxjryV',
      'regtest'
    );
    expect(wallet).toBeDefined();
  });

  it('Can create a Watch Only Wallet from address', () => {
    const wallet = WatchOnlyWallet.fromAddress(
      'ert1ql5eframnl3slllu8xtwh472zzz8ws4hpm49ta9',
      'regtest'
    );
    expect(wallet.address).toStrictEqual(
      'ert1ql5eframnl3slllu8xtwh472zzz8ws4hpm49ta9'
    );
    expect(wallet.script).toStrictEqual(
      '0014fd3291f773fc61ffff8732dd7af942108ee856e1'
    );
  });

  test('Calculate expected amount given an amount_p', () => {
    // balanceP, balanceR, amountP, fee
    const expectedAmount = TDEX.calculateExpectedAmount(
      100000000,
      650000000000,
      10000,
      0.25
    );
    expect(expectedAmount).toStrictEqual(64831026);
  });

  test('Calculate propose amount given an amount_r', () => {
    // balanceP, balanceR, amountR, fee
    const proposeAmount = TDEX.calculateProposeAmount(
      650000000000,
      100000000,
      10000,
      0.25
    );
    expect(proposeAmount).toStrictEqual(65169000);
  });
});
