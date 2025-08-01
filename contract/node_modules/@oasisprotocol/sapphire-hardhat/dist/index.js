"use strict";
// SPDX-License-Identifier: Apache-2.0
Object.defineProperty(exports, "__esModule", { value: true });
exports.sapphireMainnet = exports.sapphireTestnet = exports.sapphireLocalnet = void 0;
const sapphire_paratime_1 = require("@oasisprotocol/sapphire-paratime");
const config_1 = require("hardhat/config");
exports.sapphireLocalnet = {
    url: sapphire_paratime_1.NETWORKS.localnet.defaultGateway,
    chainId: sapphire_paratime_1.NETWORKS.localnet.chainId,
};
exports.sapphireTestnet = {
    url: sapphire_paratime_1.NETWORKS.testnet.defaultGateway,
    chainId: sapphire_paratime_1.NETWORKS.testnet.chainId,
};
exports.sapphireMainnet = {
    url: sapphire_paratime_1.NETWORKS.mainnet.defaultGateway,
    chainId: sapphire_paratime_1.NETWORKS.mainnet.chainId,
};
(0, config_1.extendEnvironment)((hre) => {
    const { chainId } = hre.network.config;
    const rpcUrl = 'url' in hre.network.config ? hre.network.config.url : '';
    if (chainId) {
        if (!sapphire_paratime_1.NETWORKS[chainId])
            return;
    }
    else {
        if (!/sapphire/i.test(rpcUrl))
            return;
        console.warn('The Hardhat config for the network with `url`', rpcUrl, 'did not specify `chainId`.', 'The RPC URL looks like it may be Sapphire, so `@oasisprotocol/sapphire-hardhat` has been activated.', 'You can prevent this from happening by setting a non-Sapphire `chainId`.');
    }
    hre.network.provider = (0, sapphire_paratime_1.wrapEthereumProvider)(hre.network.provider);
});
//# sourceMappingURL=index.js.map