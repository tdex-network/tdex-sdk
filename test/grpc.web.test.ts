import { TraderClient } from '../src/grpcClient.web';

describe('grpc client', () => {
  test('Should use the tor proxy if onion endpoin is given', async () => {
    const client = new TraderClient('localhost:9945');
    expect(client.providerUrl).toStrictEqual('localhost:9945');

    const clientWithOnion = new TraderClient(
      'http://somewhereintothe.onion:9945'
    );
    expect(clientWithOnion.providerUrl).toStrictEqual(
      'https://proxy.tdex.network/somewhereintothe'
    );
  });
});
