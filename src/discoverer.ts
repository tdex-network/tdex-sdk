import { Discovery, DiscoveryOpts } from 'discovery';
import TraderClientInterface from 'grpcClientInterface';

export interface DiscovererInterface {
  clients: TraderClientInterface[];
  discovery: Discovery;
  discover(opts: DiscoveryOpts): Promise<TraderClientInterface[]>;
}

export class Discoverer implements DiscovererInterface {
  clients: TraderClientInterface[];
  discovery: Discovery;
  errorHandler?: (err: any) => Promise<void>;

  constructor(
    clients: TraderClientInterface[],
    discovery: Discovery,
    errorHandler?: (err: any) => Promise<void>
  ) {
    this.clients = clients;
    this.discovery = discovery;
    this.errorHandler = errorHandler;
  }

  async discover(opts: DiscoveryOpts): Promise<TraderClientInterface[]> {
    return this.discovery(this.clients, opts, this.errorHandler);
  }
}
