import type { EIP2696_EthereumProvider } from './provider.js';
import { Cipher, X25519DeoxysII } from './cipher.js';
export type RawCallDataPublicKeyResponseResult = {
    key: string;
    checksum: string;
    signature: string;
    epoch: number;
};
export type RawCallDataPublicKeyResponse = {
    result: RawCallDataPublicKeyResponseResult;
};
export declare class FetchError extends Error {
    readonly response?: unknown;
    constructor(message: string, response?: unknown);
}
export interface CallDataPublicKey {
    key: Uint8Array;
    checksum: Uint8Array;
    signature: Uint8Array;
    epoch: number;
    chainId: number;
    fetched: Date;
}
/**
 * Picks the most user-trusted runtime calldata public key source based on what
 * connections are available.
 *
 * NOTE: MetaMask does not support Web3 methods it doesn't know about, so we
 *       have to fall-back to fetch()ing directly via the default chain gateway.
 */
export declare function fetchRuntimePublicKey(args: {
    upstream: EIP2696_EthereumProvider;
}): Promise<CallDataPublicKey>;
/**
 * Retrieves calldata public keys from RPC provider
 */
export declare class KeyFetcher {
    readonly timeoutMilliseconds: number;
    pubkey?: CallDataPublicKey;
    constructor(timeoutMilliseconds?: number);
    /**
     * Retrieve cached key if possible, otherwise fetch a fresh one
     *
     * @param upstream Upstream ETH JSON-RPC provider
     * @returns calldata public key
     */
    fetch(upstream: EIP2696_EthereumProvider): Promise<CallDataPublicKey>;
    cipher(upstream: EIP2696_EthereumProvider): Promise<Cipher>;
    cipherSync(): X25519DeoxysII;
}
//# sourceMappingURL=calldatapublickey.d.ts.map