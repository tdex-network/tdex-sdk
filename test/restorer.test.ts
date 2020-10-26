import EsploraIdentityRestorer from '../src/identityRestorer';
import { faucet } from './_regtest';

import * as assert from 'assert';

jest.setTimeout(15000);

const address =
  'AzpqS7wVhDLhohSr3xmEWthdYBm9vtrzQeZ3TmjTLoCSCyJn6TjA1VMuDSLwdFeCRY7LVxPvwgDNJmGc';

describe('EsploraIdentityRestorer', () => {
  describe('EsploraIdentityRestorer.addressHasBeenUsed', () => {
    it('should return true if the address has txs', async () => {
      await faucet(address);
      const restorer = new EsploraIdentityRestorer();
      const result = await restorer.addressHasBeenUsed(address);
      assert.deepStrictEqual(result, true);
    });
  });
});
