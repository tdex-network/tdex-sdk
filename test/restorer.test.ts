import EsploraIdentityRestorer from '../src/identityRestorer';
import { faucet } from './_regtest';

import * as assert from 'assert';

jest.setTimeout(15000);

const addressToFaucet =
  'AzpqS7wVhDLhohSr3xmEWthdYBm9vtrzQeZ3TmjTLoCSCyJn6TjA1VMuDSLwdFeCRY7LVxPvwgDNJmGc';

const addressToNotFaucet =
  'AzpjnpWdDRSFnWC4Ymzwn3b8srTf7aLVRt5Ci13K5KpsUFkGTNQA6qHwxRNGDWH5gztp7wu3cEnZciY2';

describe('EsploraIdentityRestorer', () => {
  describe('EsploraIdentityRestorer.addressHasBeenUsed', () => {
    it('should return true if the address has txs', async () => {
      await faucet(addressToFaucet);
      const restorer = new EsploraIdentityRestorer();
      const result = await restorer.addressHasBeenUsed(addressToFaucet);
      assert.deepStrictEqual(result, true);
    });

    it('should return false if the address has no txs', async () => {
      const restorer = new EsploraIdentityRestorer();
      const result = await restorer.addressHasBeenUsed(addressToNotFaucet);
      assert.deepStrictEqual(result, false);
    });
  });
});
