//import Swap from './swap';
export interface CoreInterface {
  verbose?: Boolean;
  chain?: string;
  providerUrl?: string;
  explorerUrl?: string;
}

export default class Core {
  public verbose?: Boolean = false;
  public chain?: string = 'regtest';
  public providerUrl?: string;
  public explorerUrl?: string;

  constructor(data?: SafePick<Core>) {
    Object.assign(this, data);
  }
}

type NonMethodKeys<T> = ({
  [P in keyof T]: T[P] extends Function ? never : P;
} & { [x: string]: never })[keyof T];
type SafePick<T> = Pick<T, NonMethodKeys<T>>;
