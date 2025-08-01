import { BytesLike } from './ethersutils.js';
import { KeyFetcher } from './calldatapublickey.js';
import { Cipher } from './cipher.js';
export interface EIP1193_RequestArguments {
    readonly method: string;
    readonly params?: readonly unknown[] | object;
}
export type EIP1193_RequestFn = (args: EIP1193_RequestArguments) => Promise<unknown>;
export type Legacy_SendFn = (...args: unknown[]) => Promise<unknown>;
export type Legacy_Provider = {
    send: Legacy_SendFn;
};
export type EIP2696_EthereumProvider = {
    request: EIP1193_RequestFn;
};
export declare function isEthereumProvider<T extends object>(p: T): p is T & EIP2696_EthereumProvider;
export declare function isLegacyProvider<T extends object>(p: T): p is T & Legacy_Provider;
export interface SapphireWrapOptions {
    fetcher: KeyFetcher;
    enableSapphireSnap?: boolean;
}
export interface SapphireWrapConfig extends Omit<SapphireWrapOptions, 'fetcher'> {
    fetcher?: KeyFetcher;
}
export declare function fillOptions(options: SapphireWrapConfig | undefined): SapphireWrapOptions;
declare const SAPPHIRE_WRAPPED_ETHEREUMPROVIDER: "#SAPPHIRE_WRAPPED_ETHEREUMPROVIDER";
export declare function isWrappedEthereumProvider<P extends EIP2696_EthereumProvider>(p: P): p is P & {
    [SAPPHIRE_WRAPPED_ETHEREUMPROVIDER]: SapphireWrapOptions;
};
/**
 * Wrap an EIP-1193 or EIP-2696 compatible provider with Sapphire encryption
 *
 * ```typescript
 * const provider = wrapEthereumProvider(window.ethereum);
 * ```
 *
 * @param upstream Provides a send() or request() function
 * @param options (optional) Re-use parameters from other providers
 * @returns Sapphire wrapped provider
 */
export declare function wrapEthereumProvider<P extends EIP2696_EthereumProvider>(upstream: P, options?: SapphireWrapConfig): P;
export declare function detectSapphireSnap(provider: EIP2696_EthereumProvider): Promise<"npm:@oasisprotocol/sapphire-snap" | undefined>;
export declare function notifySapphireSnap(snapId: string, cipher: Cipher, transactionData: BytesLike, options: SapphireWrapOptions, provider: EIP2696_EthereumProvider): Promise<void>;
declare const SAPPHIRE_EIP1193_REQUESTFN: "#SAPPHIRE_EIP1193_REQUESTFN";
export declare function isWrappedRequestFn<P extends EIP2696_EthereumProvider['request']>(p: P): p is P & {
    [SAPPHIRE_EIP1193_REQUESTFN]: SapphireWrapOptions;
};
export declare function isCallDataPublicKeyQuery(params?: object | readonly unknown[]): boolean | undefined;
/**
 * Creates an EIP-1193 compatible request() function
 * @param provider Upstream EIP-1193 provider to forward requests to
 * @param options
 * @returns
 */
export declare function makeSapphireRequestFn(provider: EIP2696_EthereumProvider, options?: SapphireWrapOptions): EIP2696_EthereumProvider['request'];
export declare function makeTaggedProxyObject<T extends object>(upstream: T, propname: string, options: SapphireWrapOptions, hooks?: Record<string, any>): T;
export {};
//# sourceMappingURL=provider.d.ts.map