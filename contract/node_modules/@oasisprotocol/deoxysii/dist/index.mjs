var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/deoxysii.ts
var deoxysii_exports = {};
__export(deoxysii_exports, {
  AEAD: () => AEAD,
  ErrKeySize: () => ErrKeySize,
  ErrNonceSize: () => ErrNonceSize,
  ErrOpen: () => ErrOpen,
  KeySize: () => KeySize,
  NonceSize: () => NonceSize,
  TagSize: () => TagSize
});

// src/uint32.ts
function uint32_fromBytesBigEndian(highByte, secondHighByte, thirdHighByte, lowByte) {
  return (highByte << 24 | secondHighByte << 16 | thirdHighByte << 8 | lowByte) >>> 0;
}
function uint32_or(uint32val0, ...argv) {
  let result = uint32val0;
  for (const x of argv) {
    result = result | x;
  }
  return result >>> 0;
}
function uint32_and(uint32val0, ...argv) {
  let result = uint32val0;
  for (const x of argv) {
    result = result & x;
  }
  return result >>> 0;
}
function uint32_xor3(a, b, c) {
  return (a ^ b ^ c) >>> 0;
}
function uint32_xor2(a, b) {
  return (a ^ b) >>> 0;
}
function uint32_xor(uint32val0, ...argv) {
  let result = uint32val0;
  for (const x of argv) {
    result = result ^ x;
  }
  return result >>> 0;
}
function uint32_not(uint32val) {
  return ~uint32val >>> 0;
}
function uint32_shiftLeft(uint32val, numBits) {
  return uint32val << numBits >>> 0;
}
function uint32_shiftRight(uint32val, numBits) {
  return uint32val >>> numBits;
}
function uint32_rotateRight(uint32val, numBits) {
  return (uint32val >>> numBits | uint32val << 32 - numBits >>> 0) >>> 0;
}

// src/aes.ts
var oddsMask = uint32_fromBytesBigEndian(85, 85, 85, 85);
var evensMask = uint32_fromBytesBigEndian(170, 170, 170, 170);
var cl4 = uint32_fromBytesBigEndian(51, 51, 51, 51);
var ch4 = uint32_fromBytesBigEndian(204, 204, 204, 204);
var cl8 = uint32_fromBytesBigEndian(15, 15, 15, 15);
var ch8 = uint32_fromBytesBigEndian(240, 240, 240, 240);
var shiftRowsMask0 = uint32_fromBytesBigEndian(0, 0, 0, 255);
var shiftRowsMask1 = uint32_fromBytesBigEndian(0, 0, 252, 0);
var shiftRowsMask2 = uint32_fromBytesBigEndian(0, 0, 3, 0);
var shiftRowsMask3 = uint32_fromBytesBigEndian(0, 240, 0, 0);
var shiftRowsMask4 = uint32_fromBytesBigEndian(0, 15, 0, 0);
var shiftRowsMask5 = uint32_fromBytesBigEndian(192, 0, 0, 0);
var shiftRowsMask6 = uint32_fromBytesBigEndian(63, 0, 0, 0);
function newQ() {
  return new Uint32Array(8);
}
function addRoundKey(q, sk) {
  q[0] = uint32_xor2(q[0], sk[0]);
  q[1] = uint32_xor2(q[1], sk[1]);
  q[2] = uint32_xor2(q[2], sk[2]);
  q[3] = uint32_xor2(q[3], sk[3]);
  q[4] = uint32_xor2(q[4], sk[4]);
  q[5] = uint32_xor2(q[5], sk[5]);
  q[6] = uint32_xor2(q[6], sk[6]);
  q[7] = uint32_xor2(q[7], sk[7]);
}
function subBytes(q) {
  const x0 = q[7];
  const x1 = q[6];
  const x2 = q[5];
  const x3 = q[4];
  const x4 = q[3];
  const x5 = q[2];
  const x6 = q[1];
  const x7 = q[0];
  const y14 = uint32_xor2(x3, x5);
  const y13 = uint32_xor2(x0, x6);
  const y9 = uint32_xor2(x0, x3);
  const y8 = uint32_xor2(x0, x5);
  const t0 = uint32_xor2(x1, x2);
  const y1 = uint32_xor2(t0, x7);
  const y4 = uint32_xor2(y1, x3);
  const y12 = uint32_xor2(y13, y14);
  const y2 = uint32_xor2(y1, x0);
  const y5 = uint32_xor2(y1, x6);
  const y3 = uint32_xor2(y5, y8);
  const t1 = uint32_xor2(x4, y12);
  const y15 = uint32_xor2(t1, x5);
  const y20 = uint32_xor2(t1, x1);
  const y6 = uint32_xor2(y15, x7);
  const y10 = uint32_xor2(y15, t0);
  const y11 = uint32_xor2(y20, y9);
  const y7 = uint32_xor2(x7, y11);
  const y17 = uint32_xor2(y10, y11);
  const y19 = uint32_xor2(y10, y8);
  const y16 = uint32_xor2(t0, y11);
  const y21 = uint32_xor2(y13, y16);
  const y18 = uint32_xor2(x0, y16);
  const t2 = uint32_and(y12, y15);
  const t3 = uint32_and(y3, y6);
  const t4 = uint32_xor2(t3, t2);
  const t5 = uint32_and(y4, x7);
  const t6 = uint32_xor2(t5, t2);
  const t7 = uint32_and(y13, y16);
  const t8 = uint32_and(y5, y1);
  const t9 = uint32_xor2(t8, t7);
  const t10 = uint32_and(y2, y7);
  const t11 = uint32_xor2(t10, t7);
  const t12 = uint32_and(y9, y11);
  const t13 = uint32_and(y14, y17);
  const t14 = uint32_xor2(t13, t12);
  const t15 = uint32_and(y8, y10);
  const t16 = uint32_xor2(t15, t12);
  const t17 = uint32_xor2(t4, t14);
  const t18 = uint32_xor2(t6, t16);
  const t19 = uint32_xor2(t9, t14);
  const t20 = uint32_xor2(t11, t16);
  const t21 = uint32_xor2(t17, y20);
  const t22 = uint32_xor2(t18, y19);
  const t23 = uint32_xor2(t19, y21);
  const t24 = uint32_xor2(t20, y18);
  const t25 = uint32_xor2(t21, t22);
  const t26 = uint32_and(t21, t23);
  const t27 = uint32_xor2(t24, t26);
  const t28 = uint32_and(t25, t27);
  const t29 = uint32_xor2(t28, t22);
  const t30 = uint32_xor2(t23, t24);
  const t31 = uint32_xor2(t22, t26);
  const t32 = uint32_and(t31, t30);
  const t33 = uint32_xor2(t32, t24);
  const t34 = uint32_xor2(t23, t33);
  const t35 = uint32_xor2(t27, t33);
  const t36 = uint32_and(t24, t35);
  const t37 = uint32_xor2(t36, t34);
  const t38 = uint32_xor2(t27, t36);
  const t39 = uint32_and(t29, t38);
  const t40 = uint32_xor2(t25, t39);
  const t41 = uint32_xor2(t40, t37);
  const t42 = uint32_xor2(t29, t33);
  const t43 = uint32_xor2(t29, t40);
  const t44 = uint32_xor2(t33, t37);
  const t45 = uint32_xor2(t42, t41);
  const z0 = uint32_and(t44, y15);
  const z1 = uint32_and(t37, y6);
  const z2 = uint32_and(t33, x7);
  const z3 = uint32_and(t43, y16);
  const z4 = uint32_and(t40, y1);
  const z5 = uint32_and(t29, y7);
  const z6 = uint32_and(t42, y11);
  const z7 = uint32_and(t45, y17);
  const z8 = uint32_and(t41, y10);
  const z9 = uint32_and(t44, y12);
  const z10 = uint32_and(t37, y3);
  const z11 = uint32_and(t33, y4);
  const z12 = uint32_and(t43, y13);
  const z13 = uint32_and(t40, y5);
  const z14 = uint32_and(t29, y2);
  const z15 = uint32_and(t42, y9);
  const z16 = uint32_and(t45, y14);
  const z17 = uint32_and(t41, y8);
  const t46 = uint32_xor2(z15, z16);
  const t47 = uint32_xor2(z10, z11);
  const t48 = uint32_xor2(z5, z13);
  const t49 = uint32_xor2(z9, z10);
  const t50 = uint32_xor2(z2, z12);
  const t51 = uint32_xor2(z2, z5);
  const t52 = uint32_xor2(z7, z8);
  const t53 = uint32_xor2(z0, z3);
  const t54 = uint32_xor2(z6, z7);
  const t55 = uint32_xor2(z16, z17);
  const t56 = uint32_xor2(z12, t48);
  const t57 = uint32_xor2(t50, t53);
  const t58 = uint32_xor2(z4, t46);
  const t59 = uint32_xor2(z3, t54);
  const t60 = uint32_xor2(t46, t57);
  const t61 = uint32_xor2(z14, t57);
  const t62 = uint32_xor2(t52, t58);
  const t63 = uint32_xor2(t49, t58);
  const t64 = uint32_xor2(z4, t59);
  const t65 = uint32_xor2(t61, t62);
  const t66 = uint32_xor2(z1, t63);
  const s0 = uint32_xor2(t59, t63);
  const s6 = uint32_xor2(t56, uint32_not(t62));
  const s7 = uint32_xor2(t48, uint32_not(t60));
  const t67 = uint32_xor2(t64, t65);
  const s3 = uint32_xor2(t53, t66);
  const s4 = uint32_xor2(t51, t66);
  const s5 = uint32_xor2(t47, t65);
  const s1 = uint32_xor2(t64, uint32_not(s3));
  const s2 = uint32_xor2(t55, uint32_not(t67));
  q[7] = s0;
  q[6] = s1;
  q[5] = s2;
  q[4] = s3;
  q[3] = s4;
  q[2] = s5;
  q[1] = s6;
  q[0] = s7;
}
function shiftRows(q) {
  for (let i = 0; i < 8; i++) {
    const x = q[i];
    q[i] = uint32_or(
      uint32_and(x, shiftRowsMask0),
      uint32_shiftRight(uint32_and(x, shiftRowsMask1), 2),
      uint32_shiftLeft(uint32_and(x, shiftRowsMask2), 6),
      uint32_shiftRight(uint32_and(x, shiftRowsMask3), 4),
      uint32_shiftLeft(uint32_and(x, shiftRowsMask4), 4),
      uint32_shiftRight(uint32_and(x, shiftRowsMask5), 6),
      uint32_shiftLeft(uint32_and(x, shiftRowsMask6), 2)
    );
  }
}
function mixColumns(q) {
  const q0 = q[0];
  const q1 = q[1];
  const q2 = q[2];
  const q3 = q[3];
  const q4 = q[4];
  const q5 = q[5];
  const q6 = q[6];
  const q7 = q[7];
  const r0 = uint32_or(uint32_shiftRight(q0, 8), uint32_shiftLeft(q0, 24));
  const r1 = uint32_or(uint32_shiftRight(q1, 8), uint32_shiftLeft(q1, 24));
  const r2 = uint32_or(uint32_shiftRight(q2, 8), uint32_shiftLeft(q2, 24));
  const r3 = uint32_or(uint32_shiftRight(q3, 8), uint32_shiftLeft(q3, 24));
  const r4 = uint32_or(uint32_shiftRight(q4, 8), uint32_shiftLeft(q4, 24));
  const r5 = uint32_or(uint32_shiftRight(q5, 8), uint32_shiftLeft(q5, 24));
  const r6 = uint32_or(uint32_shiftRight(q6, 8), uint32_shiftLeft(q6, 24));
  const r7 = uint32_or(uint32_shiftRight(q7, 8), uint32_shiftLeft(q7, 24));
  q[0] = uint32_xor(q7, r7, r0, uint32_rotateRight(uint32_xor2(q0, r0), 16));
  q[1] = uint32_xor(
    q0,
    r0,
    q7,
    r7,
    r1,
    uint32_rotateRight(uint32_xor2(q1, r1), 16)
  );
  q[2] = uint32_xor(q1, r1, r2, uint32_rotateRight(uint32_xor2(q2, r2), 16));
  q[3] = uint32_xor(
    q2,
    r2,
    q7,
    r7,
    r3,
    uint32_rotateRight(uint32_xor2(q3, r3), 16)
  );
  q[4] = uint32_xor(
    q3,
    r3,
    q7,
    r7,
    r4,
    uint32_rotateRight(uint32_xor2(q4, r4), 16)
  );
  q[5] = uint32_xor(q4, r4, r5, uint32_rotateRight(uint32_xor2(q5, r5), 16));
  q[6] = uint32_xor(q5, r5, r6, uint32_rotateRight(uint32_xor2(q6, r6), 16));
  q[7] = uint32_xor(q6, r6, r7, uint32_rotateRight(uint32_xor2(q7, r7), 16));
}
function load4xU32(q, src) {
  const srcView = new DataView(src.buffer);
  q[0] = srcView.getUint32(0 + src.byteOffset, true);
  q[2] = srcView.getUint32(4 + src.byteOffset, true);
  q[4] = srcView.getUint32(8 + src.byteOffset, true);
  q[6] = srcView.getUint32(12 + src.byteOffset, true);
  q[1] = 0;
  q[3] = 0;
  q[5] = 0;
  q[7] = 0;
  ortho(q);
}
function load8xU32(q, src0, src1) {
  const src0View = new DataView(src0.buffer);
  const src1View = new DataView(src1.buffer);
  q[0] = src0View.getUint32(0 + src0.byteOffset, true);
  q[2] = src0View.getUint32(4 + src0.byteOffset, true);
  q[4] = src0View.getUint32(8 + src0.byteOffset, true);
  q[6] = src0View.getUint32(12 + src0.byteOffset, true);
  q[1] = src1View.getUint32(0 + src1.byteOffset, true);
  q[3] = src1View.getUint32(4 + src1.byteOffset, true);
  q[5] = src1View.getUint32(8 + src1.byteOffset, true);
  q[7] = src1View.getUint32(12 + src1.byteOffset, true);
  ortho(q);
}
function store4xU32(dst, q) {
  ortho(q);
  const dstView = new DataView(dst.buffer);
  dstView.setUint32(0 + dst.byteOffset, q[0], true);
  dstView.setUint32(4 + dst.byteOffset, q[2], true);
  dstView.setUint32(8 + dst.byteOffset, q[4], true);
  dstView.setUint32(12 + dst.byteOffset, q[6], true);
}
function store8xU32(dst0, dst1, q) {
  ortho(q);
  const dst0View = new DataView(dst0.buffer);
  const dst1View = new DataView(dst1.buffer);
  dst0View.setUint32(0 + dst0.byteOffset, q[0], true);
  dst0View.setUint32(4 + dst0.byteOffset, q[2], true);
  dst0View.setUint32(8 + dst0.byteOffset, q[4], true);
  dst0View.setUint32(12 + dst0.byteOffset, q[6], true);
  dst1View.setUint32(0 + dst1.byteOffset, q[1], true);
  dst1View.setUint32(4 + dst1.byteOffset, q[3], true);
  dst1View.setUint32(8 + dst1.byteOffset, q[5], true);
  dst1View.setUint32(12 + dst1.byteOffset, q[7], true);
}
function ortho(q) {
  for (let i = 0; i < 8; i += 2) {
    const q0 = q[i];
    const q1 = q[i + 1];
    q[i] = uint32_or(
      uint32_and(q0, oddsMask),
      uint32_shiftLeft(uint32_and(q1, oddsMask), 1)
    );
    q[i + 1] = uint32_or(
      uint32_shiftRight(uint32_and(q0, evensMask), 1),
      uint32_and(q1, evensMask)
    );
  }
  for (let i = 0; i < 8; i += 4) {
    const q0 = q[i];
    const q1 = q[i + 1];
    const q2 = q[i + 2];
    const q3 = q[i + 3];
    q[i] = uint32_or(
      uint32_and(q0, cl4),
      uint32_shiftLeft(uint32_and(q2, cl4), 2)
    );
    q[i + 2] = uint32_or(
      uint32_shiftRight(uint32_and(q0, ch4), 2),
      uint32_and(q2, ch4)
    );
    q[i + 1] = uint32_or(
      uint32_and(q1, cl4),
      uint32_shiftLeft(uint32_and(q3, cl4), 2)
    );
    q[i + 3] = uint32_or(
      uint32_shiftRight(uint32_and(q1, ch4), 2),
      uint32_and(q3, ch4)
    );
  }
  for (let i = 0; i < 4; i++) {
    const q0 = q[i];
    const q4 = q[i + 4];
    q[i] = uint32_or(
      uint32_and(q0, cl8),
      uint32_shiftLeft(uint32_and(q4, cl8), 4)
    );
    q[i + 4] = uint32_or(
      uint32_shiftRight(uint32_and(q0, ch8), 4),
      uint32_and(q4, ch8)
    );
  }
}
function rkeyOrtho(q, key) {
  const keyView = new DataView(key.buffer);
  for (let i = 0; i < 4; i++) {
    const x = keyView.getUint32(i * 4 + key.byteOffset, true);
    q[i * 2] = x;
    q[i * 2 + 1] = x;
  }
  ortho(q);
  for (let i = 0, j = 0; i < 4; i = i + 1, j = j + 2) {
    let x = uint32_or(
      uint32_and(q[j + 0], oddsMask),
      uint32_and(q[j + 1], evensMask)
    );
    let y = x;
    x = uint32_and(x, oddsMask);
    q[j] = uint32_or(x, uint32_shiftLeft(x, 1));
    y = uint32_and(y, evensMask);
    q[j + 1] = uint32_or(y, uint32_shiftRight(y, 1));
  }
}

// src/deoxysii.ts
var KeySize = 32;
var NonceSize = 15;
var TagSize = 16;
var stkSize = 16;
var rounds = 16;
var blockSize = 16;
var tweakSize = 16;
var prefixADBlock = 2;
var prefixADFinal = 6;
var prefixMsgBlock = 0;
var prefixMsgFinal = 4;
var prefixTag = 1;
var prefixShift = 4;
function xorBytes(dst, a, b, n) {
  for (let i = 0; i < n; i++) {
    dst[i] = a[i] ^ b[i];
  }
}
var rcons = new Uint8Array([
  47,
  94,
  188,
  99,
  198,
  151,
  53,
  106,
  212,
  179,
  125,
  250,
  239,
  197,
  145,
  57,
  114
]);
function h(t) {
  t.set(
    new Uint8Array([
      t[1],
      t[6],
      t[11],
      t[12],
      t[5],
      t[10],
      t[15],
      t[0],
      t[9],
      t[14],
      t[3],
      t[4],
      t[13],
      t[2],
      t[7],
      t[8]
    ])
  );
}
function lfsr2(t) {
  for (let i = 0; i < stkSize; i++) {
    const x = t[i];
    const x7 = x >> 7;
    const x5 = x >> 5 & 1;
    t[i] = x << 1 | x7 ^ x5;
  }
}
function lfsr3(t) {
  for (let i = 0; i < stkSize; i++) {
    const x = t[i];
    const x0 = x & 1;
    const x6 = x >> 6 & 1;
    t[i] = x >> 1 | (x0 ^ x6) << 7;
  }
}
function xorRC(t, i) {
  t[0] ^= 1;
  t[1] ^= 2;
  t[2] ^= 4;
  t[3] ^= 8;
  t[4] ^= rcons[i];
  t[5] ^= rcons[i];
  t[6] ^= rcons[i];
  t[7] ^= rcons[i];
}
function stkDeriveK(key, derivedKs) {
  const tk2 = key.subarray(16, 32);
  const tk3 = key.subarray(0, 16);
  xorBytes(derivedKs[0], tk2, tk3, stkSize);
  xorRC(derivedKs[0], 0);
  for (let i = 1; i <= rounds; i++) {
    lfsr2(tk2);
    h(tk2);
    lfsr3(tk3);
    h(tk3);
    xorBytes(derivedKs[i], tk2, tk3, stkSize);
    xorRC(derivedKs[i], i);
  }
}
function deriveSubTweakKeys(stks, derivedKs, tweak) {
  const tk1 = new Uint8Array(tweak);
  xorBytes(stks[0], derivedKs[0], tk1, stkSize);
  for (let i = 1; i <= rounds; i++) {
    h(tk1);
    xorBytes(stks[i], derivedKs[i], tk1, stkSize);
  }
}
function newStks() {
  const stks = [];
  for (let i = 0; i <= rounds; i++) {
    stks.push(new Uint8Array(16));
  }
  return stks;
}
function ct32_bcEncrypt(ciphertext, derivedKs, tweak, plaintext) {
  const stks = newStks();
  deriveSubTweakKeys(stks, derivedKs, tweak);
  const q = newQ();
  const stk = newQ();
  load4xU32(q, plaintext);
  load4xU32(stk, stks[0]);
  addRoundKey(q, stk);
  for (let i = 1; i <= rounds; i++) {
    subBytes(q);
    shiftRows(q);
    mixColumns(q);
    load4xU32(stk, stks[i]);
    addRoundKey(q, stk);
  }
  store4xU32(ciphertext, q);
}
function ct32_bcKeystreamx2(ciphertext, derivedKs, tweaks, nonce) {
  const stks = [newStks(), newStks()];
  for (let i = 0; i < 2; i++) {
    deriveSubTweakKeys(stks[i], derivedKs, tweaks[i]);
  }
  const q = newQ();
  const stk = newQ();
  rkeyOrtho(q, nonce);
  load8xU32(stk, stks[0][0], stks[1][0]);
  addRoundKey(q, stk);
  for (let i = 1; i <= rounds; i++) {
    subBytes(q);
    shiftRows(q);
    mixColumns(q);
    load8xU32(stk, stks[0][i], stks[1][i]);
    addRoundKey(q, stk);
  }
  store8xU32(ciphertext.subarray(0, 16), ciphertext.subarray(16, 32), q);
}
function ct32_bcTagx1(tag, derivedKs, tweak, plaintext) {
  const stks = newStks();
  deriveSubTweakKeys(stks, derivedKs, tweak);
  const q = newQ();
  const stk = newQ();
  load4xU32(q, plaintext);
  load4xU32(stk, stks[0]);
  addRoundKey(q, stk);
  for (let i = 1; i <= rounds; i++) {
    subBytes(q);
    shiftRows(q);
    mixColumns(q);
    load4xU32(stk, stks[i]);
    addRoundKey(q, stk);
  }
  const tagView = new DataView(tag.buffer);
  let tag0 = tagView.getUint32(0, true);
  let tag1 = tagView.getUint32(4, true);
  let tag2 = tagView.getUint32(8, true);
  let tag3 = tagView.getUint32(12, true);
  ortho(q);
  tag0 = uint32_xor2(tag0, q[0]);
  tag1 = uint32_xor2(tag1, q[2]);
  tag2 = uint32_xor2(tag2, q[4]);
  tag3 = uint32_xor2(tag3, q[6]);
  tagView.setUint32(0, tag0, true);
  tagView.setUint32(4, tag1, true);
  tagView.setUint32(8, tag2, true);
  tagView.setUint32(12, tag3, true);
}
function ct32_bcTagx2(tag, derivedKs, tweaks, plaintext) {
  const stks = [newStks(), newStks()];
  for (let i = 0; i < 2; i++) {
    deriveSubTweakKeys(stks[i], derivedKs, tweaks[i]);
  }
  const q = newQ();
  const stk = newQ();
  load8xU32(q, plaintext.subarray(0, 16), plaintext.subarray(16, 32));
  load8xU32(stk, stks[0][0], stks[1][0]);
  addRoundKey(q, stk);
  for (let i = 1; i <= rounds; i++) {
    subBytes(q);
    shiftRows(q);
    mixColumns(q);
    load8xU32(stk, stks[0][i], stks[1][i]);
    addRoundKey(q, stk);
  }
  const tagView = new DataView(tag.buffer);
  let tag0 = tagView.getUint32(0, true);
  let tag1 = tagView.getUint32(4, true);
  let tag2 = tagView.getUint32(8, true);
  let tag3 = tagView.getUint32(12, true);
  ortho(q);
  tag0 = uint32_xor3(tag0, q[0], q[1]);
  tag1 = uint32_xor3(tag1, q[2], q[3]);
  tag2 = uint32_xor3(tag2, q[4], q[5]);
  tag3 = uint32_xor3(tag3, q[6], q[7]);
  tagView.setUint32(0, tag0, true);
  tagView.setUint32(4, tag1, true);
  tagView.setUint32(8, tag2, true);
  tagView.setUint32(12, tag3, true);
}
function encodeTagTweak(out, prefix, blockNr) {
  out.set(new Uint8Array(12));
  new DataView(out.buffer).setUint32(12 + out.byteOffset, blockNr, false);
  out[0] = prefix << prefixShift;
}
function encodeEncTweak(out, tag, blockNr) {
  const tmp = new Uint8Array(4);
  new DataView(tmp.buffer).setUint32(0, blockNr, false);
  out.set(tag);
  out[0] |= 128;
  xorBytes(out.subarray(12, 16), out.subarray(12, 16), tmp, 4);
}
function newTweaks() {
  return [new Uint8Array(tweakSize), new Uint8Array(tweakSize)];
}
function e(derivedKs, nonce, dst, ad, msg) {
  const tweaks = newTweaks();
  let i = 0;
  let j = 0;
  let adLen = ad.length;
  const auth = new Uint8Array(TagSize);
  for (i = 0; adLen >= 2 * blockSize; i += 2) {
    encodeTagTweak(tweaks[0], prefixADBlock, i);
    encodeTagTweak(tweaks[1], prefixADBlock, i + 1);
    ct32_bcTagx2(
      auth,
      derivedKs,
      tweaks,
      ad.subarray(i * blockSize, (i + 2) * blockSize)
    );
    adLen -= 2 * blockSize;
  }
  for (; adLen >= blockSize; i++) {
    encodeTagTweak(tweaks[0], prefixADBlock, i);
    ct32_bcTagx1(
      auth,
      derivedKs,
      tweaks[0],
      ad.subarray(i * blockSize, (i + 1) * blockSize)
    );
    adLen -= blockSize;
  }
  if (adLen > 0) {
    encodeTagTweak(tweaks[0], prefixADFinal, i);
    const aStar = new Uint8Array(blockSize);
    aStar.set(ad.subarray(ad.length - adLen));
    aStar[adLen] = 128;
    ct32_bcTagx1(auth, derivedKs, tweaks[0], aStar);
  }
  let msgLen = msg.length;
  for (j = 0; msgLen >= 2 * blockSize; j += 2) {
    encodeTagTweak(tweaks[0], prefixMsgBlock, j);
    encodeTagTweak(tweaks[1], prefixMsgBlock, j + 1);
    ct32_bcTagx2(
      auth,
      derivedKs,
      tweaks,
      msg.subarray(j * blockSize, (j + 2) * blockSize)
    );
    msgLen -= 2 * blockSize;
  }
  for (; msgLen >= blockSize; j++) {
    encodeTagTweak(tweaks[0], prefixMsgBlock, j);
    ct32_bcTagx1(
      auth,
      derivedKs,
      tweaks[0],
      msg.subarray(j * blockSize, (j + 1) * blockSize)
    );
    msgLen -= blockSize;
  }
  if (msgLen > 0) {
    encodeTagTweak(tweaks[0], prefixMsgFinal, j);
    const mStar = new Uint8Array(blockSize);
    mStar.set(msg.subarray(msg.length - msgLen));
    mStar[msgLen] = 128;
    ct32_bcTagx1(auth, derivedKs, tweaks[0], mStar);
  }
  const encNonce = new Uint8Array(blockSize);
  encNonce.set(nonce, 1);
  encNonce[0] = prefixTag << prefixShift;
  ct32_bcEncrypt(auth, derivedKs, encNonce, auth);
  encNonce[0] = 0;
  msgLen = msg.length;
  const encBlks = new Uint8Array(2 * blockSize);
  for (j = 0; msgLen >= 2 * blockSize; j += 2) {
    encodeEncTweak(tweaks[0], auth, j);
    encodeEncTweak(tweaks[1], auth, j + 1);
    ct32_bcKeystreamx2(encBlks, derivedKs, tweaks, encNonce);
    xorBytes(
      dst.subarray(j * blockSize, (j + 2) * blockSize),
      msg.subarray(j * blockSize, (j + 2) * blockSize),
      encBlks,
      2 * blockSize
    );
    msgLen -= 2 * blockSize;
  }
  for (; msgLen >= blockSize; j++) {
    encodeEncTweak(tweaks[0], auth, j);
    ct32_bcEncrypt(encBlks, derivedKs, tweaks[0], encNonce);
    xorBytes(
      dst.subarray(j * blockSize, (j + 1) * blockSize),
      msg.subarray(j * blockSize, (j + 1) * blockSize),
      encBlks,
      blockSize
    );
    msgLen -= blockSize;
  }
  if (msgLen > 0) {
    encodeEncTweak(tweaks[0], auth, j);
    ct32_bcEncrypt(encBlks, derivedKs, tweaks[0], encNonce);
    xorBytes(
      dst.subarray(j * blockSize, msg.length),
      msg.subarray(j * blockSize),
      encBlks,
      msgLen
    );
  }
  dst.set(auth, msg.length);
}
function d(derivedKs, nonce, dst, ad, ct) {
  let ctLen = ct.length - TagSize;
  const ciphertext = ct.subarray(0, ctLen);
  const tag = ct.subarray(ctLen);
  let j = 0;
  const decTweaks = newTweaks();
  const decNonce = new Uint8Array(blockSize);
  decNonce.set(nonce, 1);
  const decBlks = new Uint8Array(2 * blockSize);
  for (j = 0; ctLen >= 2 * blockSize; j += 2) {
    encodeEncTweak(decTweaks[0], tag, j);
    encodeEncTweak(decTweaks[1], tag, j + 1);
    ct32_bcKeystreamx2(decBlks, derivedKs, decTweaks, decNonce);
    xorBytes(
      dst.subarray(j * blockSize, (j + 2) * blockSize),
      ciphertext.subarray(j * blockSize, (j + 2) * blockSize),
      decBlks,
      2 * blockSize
    );
    ctLen -= 2 * blockSize;
  }
  for (; ctLen >= blockSize; j++) {
    encodeEncTweak(decTweaks[0], tag, j);
    ct32_bcEncrypt(decBlks, derivedKs, decTweaks[0], decNonce);
    xorBytes(
      dst.subarray(j * blockSize, (j + 1) * blockSize),
      ciphertext.subarray(j * blockSize, (j + 1) * blockSize),
      decBlks,
      blockSize
    );
    ctLen -= blockSize;
  }
  if (ctLen > 0) {
    encodeEncTweak(decTweaks[0], tag, j);
    ct32_bcEncrypt(decBlks, derivedKs, decTweaks[0], decNonce);
    xorBytes(
      dst.subarray(j * blockSize),
      ciphertext.subarray(j * blockSize),
      decBlks,
      ctLen
    );
  }
  let i = 0;
  let adLen = ad.length;
  const tweaks = newTweaks();
  const auth = new Uint8Array(TagSize);
  for (i = 0; adLen >= 2 * blockSize; i += 2) {
    encodeTagTweak(tweaks[0], prefixADBlock, i);
    encodeTagTweak(tweaks[1], prefixADBlock, i + 1);
    ct32_bcTagx2(
      auth,
      derivedKs,
      tweaks,
      ad.subarray(i * blockSize, (i + 2) * blockSize)
    );
    adLen -= 2 * blockSize;
  }
  for (; adLen >= blockSize; i++) {
    encodeTagTweak(tweaks[0], prefixADBlock, i);
    ct32_bcTagx1(
      auth,
      derivedKs,
      tweaks[0],
      ad.subarray(i * blockSize, (i + 1) * blockSize)
    );
    adLen -= blockSize;
  }
  if (adLen > 0) {
    encodeTagTweak(tweaks[0], prefixADFinal, i);
    const aStar = new Uint8Array(blockSize);
    aStar.set(ad.subarray(ad.length - adLen));
    aStar[adLen] = 128;
    ct32_bcTagx1(auth, derivedKs, tweaks[0], aStar);
  }
  let msgLen = dst.length;
  for (j = 0; msgLen >= 2 * blockSize; j += 2) {
    encodeTagTweak(tweaks[0], prefixMsgBlock, j);
    encodeTagTweak(tweaks[1], prefixMsgBlock, j + 1);
    ct32_bcTagx2(
      auth,
      derivedKs,
      tweaks,
      dst.subarray(j * blockSize, (j + 2) * blockSize)
    );
    msgLen -= 2 * blockSize;
  }
  for (; msgLen >= blockSize; j++) {
    encodeTagTweak(tweaks[0], prefixMsgBlock, j);
    ct32_bcTagx1(
      auth,
      derivedKs,
      tweaks[0],
      dst.subarray(j * blockSize, (j + 1) * blockSize)
    );
    msgLen -= blockSize;
  }
  if (msgLen > 0) {
    encodeTagTweak(tweaks[0], prefixMsgFinal, j);
    const mStar = new Uint8Array(blockSize);
    mStar.set(dst.subarray(dst.length - msgLen));
    mStar[msgLen] = 128;
    ct32_bcTagx1(auth, derivedKs, tweaks[0], mStar);
  }
  decNonce[0] = prefixTag << prefixShift;
  ct32_bcEncrypt(auth, derivedKs, decNonce, auth);
  if (auth.length !== tag.length) {
    return false;
  }
  let eql = true;
  for (i = 0; i < auth.length; i++) {
    eql &= !(auth[i] ^ tag[i]);
  }
  return eql;
}
var AEAD = class {
  constructor(key) {
    __publicField(this, "derivedKs");
    if (key.length !== KeySize) {
      throw ErrKeySize;
    }
    this.derivedKs = newStks();
    stkDeriveK(key, this.derivedKs);
  }
  encrypt(nonce, plaintext = null, associatedData = null) {
    if (nonce.length !== NonceSize) {
      throw ErrNonceSize;
    }
    if (plaintext == null) {
      plaintext = zeroBuffer;
    }
    if (associatedData == null) {
      associatedData = zeroBuffer;
    }
    const dst = new Uint8Array(plaintext.length + TagSize);
    e(this.derivedKs, nonce, dst, associatedData, plaintext);
    return dst;
  }
  decrypt(nonce, ciphertext, associatedData = null) {
    if (nonce.length !== NonceSize) {
      throw ErrNonceSize;
    }
    if (ciphertext.length < TagSize) {
      throw ErrOpen;
    }
    if (associatedData == null) {
      associatedData = zeroBuffer;
    }
    const dst = new Uint8Array(ciphertext.length - TagSize);
    if (!d(this.derivedKs, nonce, dst, associatedData, ciphertext)) {
      dst.set(new Uint8Array(dst.length));
      throw ErrOpen;
    }
    return dst;
  }
};
var zeroBuffer = new Uint8Array(0);
var ErrKeySize = "deoxysii: invalid key size";
var ErrNonceSize = "deoxysii: invalid nonce size";
var ErrOpen = "deoxysii: message authentication failure";

// src/index.ts
var src_default = deoxysii_exports;
export {
  AEAD,
  ErrKeySize,
  ErrNonceSize,
  ErrOpen,
  KeySize,
  NonceSize,
  TagSize,
  src_default as default
};
/**
 * @license (c) Franz X Antesberger 2013
 */
