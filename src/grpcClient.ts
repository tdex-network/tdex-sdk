import * as web from './grpcNodeClient';
import * as node from './grpcNodeClient';

const isBrowser = () => {
  try {
    return window !== undefined;
  } catch (e) {
    return false;
  }
}

export const TraderClient = isBrowser() ? web.TraderClient : node.TraderClient;
