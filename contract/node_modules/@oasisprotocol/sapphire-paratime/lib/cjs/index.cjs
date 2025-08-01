"use strict";
/** @packageDocumentation
 * The main export of this package is {@link wrap}.
 *
 * The {@link cipher} module contains additional ciphers you may use (most notably {@link cipher.Plain}, which can be used for transparency).
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NETWORKS = void 0;
__exportStar(require("./cipher.cjs"), exports);
__exportStar(require("./provider.cjs"), exports);
__exportStar(require("./ethersutils.cjs"), exports);
var networks_js_1 = require("./networks.cjs");
Object.defineProperty(exports, "NETWORKS", { enumerable: true, get: function () { return networks_js_1.NETWORKS; } });
__exportStar(require("./calldatapublickey.cjs"), exports);
__exportStar(require("./munacl.cjs"), exports);
//# sourceMappingURL=index.js.map