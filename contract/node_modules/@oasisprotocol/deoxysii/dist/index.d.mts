declare const KeySize = 32;
declare const NonceSize = 15;
declare const TagSize = 16;
/**
 * The AEAD implementation.
 * As much as possible (as long as the key does not change), instances should
 * be reused as deriving the K contribution of the Sub-Tweak Key is relatively
 * expensive.
 */
declare class AEAD {
    protected derivedKs: Uint8Array[];
    constructor(key: Uint8Array);
    encrypt(nonce: Uint8Array, plaintext?: Uint8Array | null, associatedData?: Uint8Array | null): Uint8Array;
    decrypt(nonce: Uint8Array, ciphertext: Uint8Array, associatedData?: Uint8Array | null): Uint8Array;
}
declare const ErrKeySize = "deoxysii: invalid key size";
declare const ErrNonceSize = "deoxysii: invalid nonce size";
declare const ErrOpen = "deoxysii: message authentication failure";

type deoxysii_AEAD = AEAD;
declare const deoxysii_AEAD: typeof AEAD;
declare const deoxysii_ErrKeySize: typeof ErrKeySize;
declare const deoxysii_ErrNonceSize: typeof ErrNonceSize;
declare const deoxysii_ErrOpen: typeof ErrOpen;
declare const deoxysii_KeySize: typeof KeySize;
declare const deoxysii_NonceSize: typeof NonceSize;
declare const deoxysii_TagSize: typeof TagSize;
declare namespace deoxysii {
  export { deoxysii_AEAD as AEAD, deoxysii_ErrKeySize as ErrKeySize, deoxysii_ErrNonceSize as ErrNonceSize, deoxysii_ErrOpen as ErrOpen, deoxysii_KeySize as KeySize, deoxysii_NonceSize as NonceSize, deoxysii_TagSize as TagSize };
}

export { AEAD, ErrKeySize, ErrNonceSize, ErrOpen, KeySize, NonceSize, TagSize, deoxysii as default };
