/**
 *  Returns true if %%value%% is a valid [[HexString]].
 *
 *  If %%length%% is ``true`` or a //number//, it also checks that
 *  %%value%% is a valid [[DataHexString]] of %%length%% (if a //number//)
 *  bytes of data (e.g. ``0x1234`` is 2 bytes).
 */
export declare function isHexString(value: any, length?: number | boolean): value is `0x${string}`;
/**
 *  A [[HexString]] whose length is even, which ensures it is a valid
 *  representation of binary data.
 */
export type DataHexString = string;
/**
 *  A string which is prefixed with ``0x`` and followed by any number
 *  of case-agnostic hexadecimal characters.
 *
 *  It must match the regular expression ``/0x[0-9A-Fa-f]*\/``.
 */
export type HexString = string;
/**
 *  An object that can be used to represent binary data.
 */
export type BytesLike = DataHexString | Uint8Array;
/**
 *  Returns true if %%value%% is a valid representation of arbitrary
 *  data (i.e. a valid [[DataHexString]] or a Uint8Array).
 */
export declare function isBytesLike(value: any): value is BytesLike;
/**
 *  Get a typed Uint8Array for %%value%%. If already a Uint8Array
 *  the original %%value%% is returned; if a copy is required copy=true
 */
export declare function getBytes(value: BytesLike, name?: string, copy?: boolean): Uint8Array;
/**
 *  Returns a [[DataHexString]] representation of %%data%%.
 */
export declare function hexlify(data: BytesLike): string;
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
export declare function fromQuantity(quantity: number | string): number;
//# sourceMappingURL=ethersutils.d.ts.map