import { Trade, IdentityType, TradeType } from '../src/index';

const signingKeyWIF = 'cQ1KJtXR2WB9Mpn6AEmeUK4yWeXAzwVX7UNJgQCF9anj3SrxjryV';
const blindingKeyWIF = 'cQ1KJtXR2WB9Mpn6AEmeUK4yWeXAzwVX7UNJgQCF9anj3SrxjryV';

const market = {
  baseAsset: '5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225',
  quoteAsset:
    '822be5ee6a7a457719dce6d862ce9d98ef180f6f6ba01451699bb3ebf276f14a',
};

describe.skip('Integration tests with a local daemon', () => {
  test('Should get the preview of a trade of a daemon with AMM', async () => {
    const trade = new Trade({
      providerUrl: 'localhost:9945',
      explorerUrl: 'localhost:3001',
      identity: {
        chain: 'regtest',
        type: IdentityType.PrivateKey,
        value: { signingKeyWIF, blindingKeyWIF },
      },
    });

    const preview = await trade.preview({
      market,
      tradeType: TradeType.SELL,
      amount: 5000000,
    });

    expect(preview).toStrictEqual({
      assetToBeSent: market.baseAsset,
      amountToBeSent: 5000000,
      assetToReceive: market.quoteAsset,
      amountToReceive: 23869047,
    });
  });

  test('Should sell some LBTCs with a daemon', async () => {
    // address
    //el1qqfv793wyh4wcz4eys9y9vu97hfdskgjedykn4jcv37qhgtjlm8xhdlfjj8mh8lrplllcwvka0tu5yyywaptwztawfdeqzdwys
    // blidning
    // 48566cd9b86dfd4107d615bc4b929fc63347d72238a16844e657c60fe4593ffc
    const trade = new Trade({
      providerUrl: 'localhost:9945',
      explorerUrl: 'http://localhost:3001',
      identity: {
        chain: 'regtest',
        type: IdentityType.PrivateKey,
        value: { signingKeyWIF, blindingKeyWIF },
      },
    });

    try {
      const txid = await trade.sell({
        market,
        amount: 500000,
      });
      console.log(txid)
      expect(txid).toBeDefined();
    } catch (e) {
      console.error(e);
    }

    //await sleep(1500);

    /*     const params3 = {
          market,
          amount: 400000,
          //address: 'ert1ql5eframnl3slllu8xtwh472zzz8ws4hpm49ta9',
          privateKey: 'cQ1KJtXR2WB9Mpn6AEmeUK4yWeXAzwVX7UNJgQCF9anj3SrxjryV',
        };
        const txid3 = await trade.buy(params3);
        expect(txid3).toBeDefined(); */
  }, 60000);
});
