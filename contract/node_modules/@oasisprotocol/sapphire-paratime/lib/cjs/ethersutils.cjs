"use strict";
// SPDX-License-Identifier: MIT
// https://github.com/ethers-io/ethers.js/blob/main/LICENSE.md
// This file avoids importing the Ethers library
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromQuantity = exports.hexlify = exports.getBytes = exports.isBytesLike = exports.isHexString = void 0;
/**
 *  Returns true if %%value%% is a valid [[HexString]].
 *
 *  If %%length%% is ``true`` or a //number//, it also checks that
 *  %%value%% is a valid [[DataHexString]] of %%length%% (if a //number//)
 *  bytes of data (e.g. ``0x1234`` is 2 bytes).
 */
function isHexString(value, length) {
    if (typeof value !== 'string' || !value.match(/^0x[0-9A-Fa-f]*$/)) {
        return false;
    }
    if (typeof length === 'number' && value.length !== 2 + 2 * length) {
        return false;
    }
    if (length === true && value.length % 2 !== 0) {
        return false;
    }
    return true;
}
exports.isHexString = isHexString;
/**
 *  Returns true if %%value%% is a valid representation of arbitrary
 *  data (i.e. a valid [[DataHexString]] or a Uint8Array).
 */
function isBytesLike(value) {
    return isHexString(value, true) || value instanceof Uint8Array;
}
exports.isBytesLike = isBytesLike;
/**
 *  Get a typed Uint8Array for %%value%%. If already a Uint8Array
 *  the original %%value%% is returned; if a copy is required copy=true
 */
function getBytes(value, name, copy) {
    if (value instanceof Uint8Array) {
        if (copy) {
            return new Uint8Array(value);
        }
        return value;
    }
    if (typeof value === 'string' && value.match(/^0x([0-9a-f][0-9a-f])*$/i)) {
        const result = new Uint8Array((value.length - 2) / 2);
        let offset = 2;
        for (let i = 0; i < result.length; i++) {
            result[i] = parseInt(value.substring(offset, offset + 2), 16);
            offset += 2;
        }
        return result;
    }
    throw new Error(`invalid BytesLike value ${name !== null && name !== void 0 ? name : ''}`);
}
exports.getBytes = getBytes;
const HexCharacters = '0123456789abcdef';
/**
 *  Returns a [[DataHexString]] representation of %%data%%.
 */
function hexlify(data) {
    const bytes = getBytes(data);
    let result = '0x';
    for (let i = 0; i < bytes.length; i++) {
        const v = bytes[i];
        result += HexCharacters[(v & 0xf0) >> 4] + HexCharacters[v & 0x0f];
    }
    return result;
}
exports.hexlify = hexlify;
/**
 * A //Quantity// does not have and leading 0 values unless the value is
 * the literal value `0x0`. This is most commonly used for JSSON-RPC
 * numeric values.
 *
 * It will parse '0x' prefixed hex strings, base-10 encoded numbers and numbers.
 *
 * @param quantity
 * @returns Quantity as an integer
 */
function fromQuantity(quantity) {
    if (typeof quantity === 'string') {
        if (quantity.startsWith('0x')) {
            return parseInt(quantity, 16);
        }
        return parseInt(quantity); // Assumed to be base 10
    }
    return quantity;
}
exports.fromQuantity = fromQuantity;
//# sourceMappingURL=ethersutils.js.map