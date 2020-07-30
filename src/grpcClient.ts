import * as web from './grpcNodeClient';
import * as node from './grpcNodeClient';

// eslint-disable-next-line
const isBrowser = new Function(
  'try { return this === window; } catch (e) { return false; } }'
);

export const TraderClient = isBrowser() ? web.TraderClient : node.TraderClient;
