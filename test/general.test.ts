import * as TDEX from '../src/index';
import { walletFromAddresses } from '../src/wallet';

describe('TDEX SDK', () => {
  it('Init', () => {
    const swap = new TDEX.Swap();
    expect(swap).toMatchObject({ chain: 'regtest', verbose: false });
  });

  it('Can create a Wallet from addresses', () => {
    const addrs = [
      {
        confidentialAddress:
          'el1qqfv793wyh4wcz4eys9y9vu97hfdskgjedykn4jcv37qhgtjlm8xhdlfjj8mh8lrplllcwvka0tu5yyywaptwztawfdeqzdwys',
        blindingPrivateKey:
          '48566cd9b86dfd4107d615bc4b929fc63347d72238a16844e657c60fe4593ffc',
      },
    ];

    const wallet = walletFromAddresses(addrs, 'regtest');
    expect(wallet.addresses[0].confidentialAddress).toStrictEqual(
      addrs[0].confidentialAddress
    );
    expect(wallet.scripts[0]).toStrictEqual(
      '0014fd3291f773fc61ffff8732dd7af942108ee856e1'
    );
  });
});
