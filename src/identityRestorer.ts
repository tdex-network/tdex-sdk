import Axios from 'axios';
import axios from 'axios';

export interface IdentityRestorerInterface {
  addressHasBeenUsed(address: string): Promise<boolean>;
  addressesHaveBeenUsed(addresses: string[]): Promise<boolean[]>;
}

export default class EsploraIdentityRestorer
  implements IdentityRestorerInterface {
  static DEFAULT_ESPLORA_ENDPOINT: string = 'http://localhost:3001';

  private esploraEndpoint: string =
    EsploraIdentityRestorer.DEFAULT_ESPLORA_ENDPOINT;

  constructor(endpoint?: string) {
    if (endpoint) {
      this.esploraEndpoint = endpoint;
    }
  }

  addressesHaveBeenUsed = async (addresses: string[]) => {
    return Axios.all(addresses.map(this.addressHasBeenUsed));
  };

  addressHasBeenUsed = async (address: string) => {
    return axios
      .get(`${this.esploraEndpoint}/address/${address}/txs`)
      .then(
        // resolve
        ({ data }) => (data.length > 0 ? true : false),
        // reject
        _ => false
      )
      .catch(() => false);
  };
}
