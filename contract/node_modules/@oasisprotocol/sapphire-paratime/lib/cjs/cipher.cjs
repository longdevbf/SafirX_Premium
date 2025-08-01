"use strict";
// SPDX-License-Identifier: Apache-2.0
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCalldataEnveloped = exports.EnvelopeError = exports.X25519DeoxysII = exports.Cipher = exports.CipherKind = void 0;
const cborg_1 = require("cborg");
const deoxysii_1 = __importDefault(require("@oasisprotocol/deoxysii"));
const sha512_1 = require("@noble/hashes/sha512");
const hmac_1 = require("@noble/hashes/hmac");
const utils_1 = require("@noble/hashes/utils");
const munacl_js_1 = require("./munacl.cjs");
const ethersutils_js_1 = require("./ethersutils.cjs");
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
    if (!(0, ethersutils_js_1.isBytesLike)(example) || !(0, ethersutils_js_1.isBytesLike)(output)) {
        throw new Error('Not byteslike data!');
    }
    if (typeof example === 'string') {
        if (typeof output === 'string') {
            return output;
        }
        return (0, ethersutils_js_1.hexlify)(output);
    }
    if (typeof output === 'string') {
        return (0, ethersutils_js_1.hexlify)(output);
    }
    return output;
}
var CipherKind;
(function (CipherKind) {
    CipherKind[CipherKind["X25519DeoxysII"] = 1] = "X25519DeoxysII";
})(CipherKind = exports.CipherKind || (exports.CipherKind = {}));
function formatFailure(fail) {
    if (fail.message)
        return fail.message;
    return `Call failed in module '${fail.module}' with code '${fail.code}'`;
}
class Cipher {
    /** Encrypts the plaintext and encodes it for sending. */
    encryptCall(calldata, nonce) {
        // Txs without data are just balance transfers, and all data in those is public.
        if (calldata === undefined || calldata === null || calldata.length === 0)
            return '';
        if (!(0, ethersutils_js_1.isBytesLike)(calldata)) {
            throw new Error('Attempted to sign tx having non-byteslike data.');
        }
        const innerEnvelope = (0, cborg_1.encode)({ body: (0, ethersutils_js_1.getBytes)(calldata) });
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
        return asBytesLike(calldata, (0, cborg_1.encode)(envelope));
    }
    decryptCall(envelopeBytes) {
        const envelope = (0, cborg_1.decode)((0, ethersutils_js_1.getBytes)(envelopeBytes));
        if (!isEnvelopeFormatOk(envelope)) {
            throw new EnvelopeError('Unexpected non-envelope!');
        }
        const result = this.decrypt(envelope.body.nonce, envelope.body.data);
        const inner = (0, cborg_1.decode)(result);
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
            const inner = (0, cborg_1.encode)(innerFail ? { fail: innerFail } : { ok });
            const { nonce, ciphertext: data } = this.encrypt(inner);
            // Outer envelope is plaintext
            const envelope = (0, cborg_1.encode)({
                ok: { nonce, data },
            });
            return envelope;
        }
        if (outerFail) {
            // Outer failures are returned in plaintext
            return (0, cborg_1.encode)({ fail: outerFail });
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
        const envelope = (0, cborg_1.decode)((0, ethersutils_js_1.getBytes)(callResult));
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
        const inner = (0, cborg_1.decode)(this.decrypt(nonce, data));
        if (inner.ok) {
            return asBytesLike(callResult, (0, ethersutils_js_1.getBytes)(inner.ok));
        }
        if (inner.fail) {
            throw new EnvelopeError(formatFailure(inner.fail), inner.fail);
        }
        throw new EnvelopeError(`Unexpected inner call result: ${JSON.stringify(inner)}`, inner);
    }
}
exports.Cipher = Cipher;
/**
 * A {@link Cipher} that derives a shared secret using X25519 and then uses DeoxysII for encrypting using that secret.
 *
 * This is the default cipher.
 */
class X25519DeoxysII extends Cipher {
    /** Creates a new cipher using an ephemeral keypair stored in memory. */
    static ephemeral(peerPublicKey, epoch) {
        const keypair = (0, munacl_js_1.boxKeyPairFromSecretKey)((0, utils_1.randomBytes)(munacl_js_1.crypto_box_SECRETKEYBYTES));
        return new X25519DeoxysII(keypair, (0, ethersutils_js_1.getBytes)(peerPublicKey), epoch);
    }
    static fromSecretKey(secretKey, peerPublicKey, epoch) {
        const keypair = (0, munacl_js_1.boxKeyPairFromSecretKey)((0, ethersutils_js_1.getBytes)(secretKey));
        return new X25519DeoxysII(keypair, (0, ethersutils_js_1.getBytes)(peerPublicKey), epoch);
    }
    constructor(keypair, peerPublicKey, epoch) {
        super();
        this.kind = CipherKind.X25519DeoxysII;
        this.publicKey = keypair.publicKey;
        this.ephemeralKey = keypair.secretKey;
        this.epoch = epoch;
        // Derive a shared secret using X25519 (followed by hashing to remove ECDH bias).
        const keyBytes = hmac_1.hmac
            .create(sha512_1.sha512_256, new TextEncoder().encode('MRAE_Box_Deoxys-II-256-128'))
            .update((0, munacl_js_1.naclScalarMult)(keypair.secretKey, peerPublicKey))
            .digest().buffer;
        this.secretKey = new Uint8Array(keyBytes);
        this.cipher = new deoxysii_1.default.AEAD(new Uint8Array(this.secretKey)); // deoxysii owns the input
    }
    encrypt(plaintext, nonce = (0, utils_1.randomBytes)(deoxysii_1.default.NonceSize)) {
        const ciphertext = this.cipher.encrypt(nonce, plaintext);
        return { nonce, ciphertext };
    }
    decrypt(nonce, ciphertext) {
        return this.cipher.decrypt(nonce, ciphertext);
    }
}
exports.X25519DeoxysII = X25519DeoxysII;
// -----------------------------------------------------------------------------
// Determine if the CBOR encoded calldata is a signed query or an evelope
class EnvelopeError extends Error {
    constructor(message, response) {
        super(message);
        this.response = response;
    }
}
exports.EnvelopeError = EnvelopeError;
function isEnvelopeFormatOk(envelope) {
    const { format, body } = envelope;
    if (!body || !format) {
        throw new EnvelopeError('No body or format specified', envelope);
    }
    if (format !== CipherKind.X25519DeoxysII) {
        throw new EnvelopeError('Not encrypted format', envelope);
    }
    if ((0, ethersutils_js_1.isBytesLike)(body))
        throw new EnvelopeError('Requires struct body', envelope);
    if (!(0, ethersutils_js_1.isBytesLike)(body.data))
        throw new EnvelopeError('No body data', envelope);
    return true;
}
function isCalldataEnveloped(calldata) {
    if (calldata === undefined) {
        return false;
    }
    try {
        const envelope = (0, cborg_1.decode)((0, ethersutils_js_1.getBytes)(calldata));
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
exports.isCalldataEnveloped = isCalldataEnveloped;
//# sourceMappingURL=cipher.js.map