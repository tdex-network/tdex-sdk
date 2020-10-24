import axios from 'axios';

export interface IdentityRestorerInterface {
  addressHasBeenUsed(address: string): Promise<boolean>;
}

export class EsploraIdentityRestorer implements IdentityRestorerInterface {
  static DEFAULT_ESPLORA_ENDPOINT: string = 'http://localhost:3001';

  private esploraEndpoint: string =
    EsploraIdentityRestorer.DEFAULT_ESPLORA_ENDPOINT;

  constructor(endpoint?: string) {
    if (endpoint) {
      this.esploraEndpoint = endpoint;
    }
  }

  private getAddressPath(address: string): string {
    return `${this.esploraEndpoint}/address/${address}/txs`;
  }

  async addressHasBeenUsed(address: string): Promise<boolean> {
    const path: string = this.getAddressPath(address);
    return axios
      .get(path)
      .then(({ data }) => (data.length > 0 ? true : false))
      .catch(() => false);
  }
}
