import { BoxKeyPair } from './munacl.js';
import { BytesLike } from './ethersutils.js';
export declare enum CipherKind {
    X25519DeoxysII = 1
}
export type InnerEnvelope = {
    body: Uint8Array;
};
export type Envelope = {
    format: CipherKind;
    body: {
        pk: Uint8Array;
        nonce: Uint8Array;
        data: Uint8Array;
        epoch?: number;
    };
};
export type AeadEnvelope = {
    nonce: Uint8Array;
    data: Uint8Array;
};
export type CallResult = {
    ok?: string | Uint8Array | AeadEnvelope;
    fail?: CallFailure;
    unknown?: AeadEnvelope;
};
export type CallFailure = {
    module: string;
    code: number;
    message?: string;
};
export declare abstract class Cipher {
    abstract kind: CipherKind;
    abstract publicKey: Uint8Array;
    abstract ephemeralKey: Uint8Array;
    abstract epoch?: number;
    abstract encrypt(plaintext: Uint8Array, nonce?: Uint8Array): {
        ciphertext: Uint8Array;
        nonce: Uint8Array;
    };
    abstract decrypt(nonce: Uint8Array, ciphertext: Uint8Array): Uint8Array;
    /** Encrypts the plaintext and encodes it for sending. */
    encryptCall(calldata?: BytesLike | null, nonce?: Uint8Array): BytesLike;
    decryptCall(envelopeBytes: BytesLike): BytesLike;
    encryptResult(ok?: Uint8Array, innerFail?: string, outerFail?: string): Uint8Array;
    /** Decrypts the data contained within a hex-encoded serialized envelope. */
    decryptResult(callResult: BytesLike): BytesLike;
}
/**
 * A {@link Cipher} that derives a shared secret using X25519 and then uses DeoxysII for encrypting using that secret.
 *
 * This is the default cipher.
 */
export declare class X25519DeoxysII extends Cipher {
    readonly kind = CipherKind.X25519DeoxysII;
    readonly publicKey: Uint8Array;
    readonly ephemeralKey: Uint8Array;
    readonly epoch: number | undefined;
    private cipher;
    secretKey: Uint8Array;
    /** Creates a new cipher using an ephemeral keypair stored in memory. */
    static ephemeral(peerPublicKey: BytesLike, epoch?: number): X25519DeoxysII;
    static fromSecretKey(secretKey: BytesLike, peerPublicKey: BytesLike, epoch?: number): X25519DeoxysII;
    constructor(keypair: BoxKeyPair, peerPublicKey: Uint8Array, epoch?: number);
    encrypt(plaintext: Uint8Array, nonce?: Uint8Array): {
        ciphertext: Uint8Array;
        nonce: Uint8Array;
    };
    decrypt(nonce: Uint8Array, ciphertext: Uint8Array): Uint8Array;
}
export declare class EnvelopeError extends Error {
    readonly response?: unknown;
    constructor(message: string, response?: unknown);
}
export declare function isCalldataEnveloped(calldata?: BytesLike): boolean;
//# sourceMappingURL=cipher.d.ts.map