import * as TDEX from '../src/index';
import { getClearTextTorProxyUrl } from '../src/utils';

describe('TDEX SDK', () => {
  it('Init', () => {
    const swap = new TDEX.Swap();
    expect(swap).toMatchObject({ chain: 'regtest', verbose: false });
  });

  it('convert a onion URL into a tor2web proxy url', () => {
    const TOR_PROXY_ENDPOINT = `https://myproxy.mydomain.com`;

    const proxiedOnionUrl = getClearTextTorProxyUrl(
      TOR_PROXY_ENDPOINT,
      new URL('http://somewhereintothe.onion:9945')
    );

    expect(proxiedOnionUrl).toStrictEqual(
      TOR_PROXY_ENDPOINT + '/somewhereintothe'
    );
  });
});
