import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@oasisprotocol/sapphire-hardhat"; 
import "@nomicfoundation/hardhat-verify"; // Thay thế dòng cũ
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    sapphire: {
      url: "https://sapphire.oasis.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 0x5afe, // 23294
      gasPrice: 100000000000, // 100 gwei
      timeout: 60000,
      httpHeaders: {
        "User-Agent": "hardhat"
      }
    },
    sapphireTestnet: {
      url: "https://testnet.sapphire.oasis.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 0x5aff, // 23295
      gasPrice: 100000000000, // 100 gwei
      timeout: 120000,
      httpHeaders: {
        "User-Agent": "hardhat"
      }
    },
    sapphireLocal: {
      url: "http://localhost:8545",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 0x5afd, // 23293
      timeout: 30000,
    },
  },
  sourcify: {
    enabled: true,
    apiUrl: "https://sourcify.dev/server",
    browserUrl: "https://repo.sourcify.dev",
  }
};

export default config;