// eslint-disable-next-line
var isBrowser = new Function("try { return this === window; } catch (e) { return false; } }");

const client = isBrowser()
  ? require('./grpcWebClient')
  : require('./grpcNodeClient');

export default client.TraderClient;
