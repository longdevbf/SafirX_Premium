export declare const crypto_box_SECRETKEYBYTES: 32;
export declare const crypto_box_PUBLICKEYBYTES: 32;
export declare const crypto_scalarmult_BYTES: 32;
export declare const crypto_scalarmult_SCALARBYTES: 32;
export declare class MuNaclError extends Error {
}
export interface BoxKeyPair {
    publicKey: Uint8Array;
    secretKey: Uint8Array;
}
export declare function naclScalarMult(n: Uint8Array, p: Uint8Array): Uint8Array;
export declare function naclScalarMultBase(n: Uint8Array): Uint8Array;
export declare function boxKeyPairFromSecretKey(secretKey: Uint8Array): BoxKeyPair;
//# sourceMappingURL=munacl.d.ts.map