// SPDX-License-Identifier: Apache-2.0
import { decode as cborDecode, encode as cborEncode } from 'cborg';
import deoxysii from '@oasisprotocol/deoxysii';
import { sha512_256 } from '@noble/hashes/sha512';
import { hmac } from '@noble/hashes/hmac';
import { randomBytes } from '@noble/hashes/utils';
import { boxKeyPairFromSecretKey, crypto_box_SECRETKEYBYTES, naclScalarMult, } from './munacl.js';
import { isBytesLike, getBytes, hexlify } from './ethersutils.js';
/**
 * Some Ethereum libraries are picky about hex encoding vs Uint8Array
 *
 * The ethers BytesLike type can be either, if the request came as a hex encoded
 * string we should return hex encoded string, if request came as Uint8Array we
 * should return one.
 *
 * Notably hardhat-ignition doesn't work well with Uint8Array responses
 *
 * @param example Some example data, where we should return the same type
 * @param output Output data
 * @returns Output data, as either hex encoded 0x-prefixed string, or Uint8Array
 */
function asBytesLike(example, output) {
    if (!isBytesLike(example) || !isBytesLike(output)) {
        throw new Error('Not byteslike data!');
    }
    if (typeof example === 'string') {
        if (typeof output === 'string') {
            return output;
        }
        return hexlify(output);
    }
    if (typeof output === 'string') {
        return hexlify(output);
    }
    return output;
}
export var CipherKind;
(function (CipherKind) {
    CipherKind[CipherKind["X25519DeoxysII"] = 1] = "X25519DeoxysII";
})(CipherKind || (CipherKind = {}));
function formatFailure(fail) {
    if (fail.message)
        return fail.message;
    return `Call failed in module '${fail.module}' with code '${fail.code}'`;
}
export class Cipher {
    /** Encrypts the plaintext and encodes it for sending. */
    encryptCall(calldata, nonce) {
        // Txs without data are just balance transfers, and all data in those is public.
        if (calldata === undefined || calldata === null || calldata.length === 0)
            return '';
        if (!isBytesLike(calldata)) {
            throw new Error('Attempted to sign tx having non-byteslike data.');
        }
        const innerEnvelope = cborEncode({ body: getBytes(calldata) });
        let ciphertext;
        ({ ciphertext, nonce } = this.encrypt(innerEnvelope, nonce));
        const envelope = {
            format: this.kind,
            body: {
                pk: this.publicKey,
                nonce,
                data: ciphertext,
                epoch: this.epoch,
            },
        };
        return asBytesLike(calldata, cborEncode(envelope));
    }
    decryptCall(envelopeBytes) {
        const envelope = cborDecode(getBytes(envelopeBytes));
        if (!isEnvelopeFormatOk(envelope)) {
            throw new EnvelopeError('Unexpected non-envelope!');
        }
        const result = this.decrypt(envelope.body.nonce, envelope.body.data);
        const inner = cborDecode(result);
        return asBytesLike(envelopeBytes, inner.body);
    }
    encryptResult(ok, innerFail, outerFail) {
        if (ok || innerFail) {
            if ((ok && innerFail) || outerFail) {
                throw new EnvelopeError('Conflicting result envelope', {
                    ok,
                    innerFail,
                    outerFail,
                });
            }
            // Inner envelope is encrypted
            const inner = cborEncode(innerFail ? { fail: innerFail } : { ok });
            const { nonce, ciphertext: data } = this.encrypt(inner);
            // Outer envelope is plaintext
            const envelope = cborEncode({
                ok: { nonce, data },
            });
            return envelope;
        }
        if (outerFail) {
            // Outer failures are returned in plaintext
            return cborEncode({ fail: outerFail });
        }
        throw new EnvelopeError('Cannot encrypt result with no data or failures!', {
            ok,
            innerFail,
            outerFail,
        });
    }
    /** Decrypts the data contained within a hex-encoded serialized envelope. */
    decryptResult(callResult) {
        var _a;
        const envelope = cborDecode(getBytes(callResult));
        if (envelope.fail) {
            throw new EnvelopeError(formatFailure(envelope.fail), envelope.fail);
        }
        // Unencrypted results will have `ok` as bytes, not a struct
        if (envelope.ok &&
            (typeof envelope.ok === 'string' || envelope.ok instanceof Uint8Array)) {
            throw new EnvelopeError('Received unencrypted envelope', envelope);
        }
        // Encrypted result will have `ok` as a CBOR encoded struct
        const { nonce, data } = (_a = envelope.ok) !== null && _a !== void 0 ? _a : envelope.unknown;
        const inner = cborDecode(this.decrypt(nonce, data));
        if (inner.ok) {
            return asBytesLike(callResult, getBytes(inner.ok));
        }
        if (inner.fail) {
            throw new EnvelopeError(formatFailure(inner.fail), inner.fail);
        }
        throw new EnvelopeError(`Unexpected inner call result: ${JSON.stringify(inner)}`, inner);
    }
}
/**
 * A {@link Cipher} that derives a shared secret using X25519 and then uses DeoxysII for encrypting using that secret.
 *
 * This is the default cipher.
 */
export class X25519DeoxysII extends Cipher {
    /** Creates a new cipher using an ephemeral keypair stored in memory. */
    static ephemeral(peerPublicKey, epoch) {
        const keypair = boxKeyPairFromSecretKey(randomBytes(crypto_box_SECRETKEYBYTES));
        return new X25519DeoxysII(keypair, getBytes(peerPublicKey), epoch);
    }
    static fromSecretKey(secretKey, peerPublicKey, epoch) {
        const keypair = boxKeyPairFromSecretKey(getBytes(secretKey));
        return new X25519DeoxysII(keypair, getBytes(peerPublicKey), epoch);
    }
    constructor(keypair, peerPublicKey, epoch) {
        super();
        this.kind = CipherKind.X25519DeoxysII;
        this.publicKey = keypair.publicKey;
        this.ephemeralKey = keypair.secretKey;
        this.epoch = epoch;
        // Derive a shared secret using X25519 (followed by hashing to remove ECDH bias).
        const keyBytes = hmac
            .create(sha512_256, new TextEncoder().encode('MRAE_Box_Deoxys-II-256-128'))
            .update(naclScalarMult(keypair.secretKey, peerPublicKey))
            .digest().buffer;
        this.secretKey = new Uint8Array(keyBytes);
        this.cipher = new deoxysii.AEAD(new Uint8Array(this.secretKey)); // deoxysii owns the input
    }
    encrypt(plaintext, nonce = randomBytes(deoxysii.NonceSize)) {
        const ciphertext = this.cipher.encrypt(nonce, plaintext);
        return { nonce, ciphertext };
    }
    decrypt(nonce, ciphertext) {
        return this.cipher.decrypt(nonce, ciphertext);
    }
}
// -----------------------------------------------------------------------------
// Determine if the CBOR encoded calldata is a signed query or an evelope
export class EnvelopeError extends Error {
    constructor(message, response) {
        super(message);
        this.response = response;
    }
}
function isEnvelopeFormatOk(envelope) {
    const { format, body } = envelope;
    if (!body || !format) {
        throw new EnvelopeError('No body or format specified', envelope);
    }
    if (format !== CipherKind.X25519DeoxysII) {
        throw new EnvelopeError('Not encrypted format', envelope);
    }
    if (isBytesLike(body))
        throw new EnvelopeError('Requires struct body', envelope);
    if (!isBytesLike(body.data))
        throw new EnvelopeError('No body data', envelope);
    return true;
}
export function isCalldataEnveloped(calldata) {
    if (calldata === undefined) {
        return false;
    }
    try {
        const envelope = cborDecode(getBytes(calldata));
        if (!isEnvelopeFormatOk(envelope)) {
            throw new EnvelopeError('Bogus Sapphire enveloped data found in transaction!');
        }
        return true;
    }
    catch (e) {
        if (e instanceof EnvelopeError)
            throw e;
    }
    return false;
}
//# sourceMappingURL=cipher.js.map