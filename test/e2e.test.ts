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
});
