export interface CoreInterface {
    verbose?: Boolean;
    chain?: string;
    providerUrl?: string;
    explorerUrl?: string;
}
export default class Core {
    verbose?: Boolean;
    chain?: string;
    providerUrl?: string;
    explorerUrl?: string;
    constructor(data?: SafePick<Core>);
}
declare type NonMethodKeys<T> = ({
    [P in keyof T]: T[P] extends Function ? never : P;
} & {
    [x: string]: never;
})[keyof T];
declare type SafePick<T> = Pick<T, NonMethodKeys<T>>;
export {};
