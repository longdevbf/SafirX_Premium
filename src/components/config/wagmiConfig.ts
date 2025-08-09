import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { metaMaskWallet, phantomWallet } from '@rainbow-me/rainbowkit/wallets';
import { http } from 'wagmi';
import { sapphire, sapphireTestnet } from 'wagmi/chains';
import { createSapphireConfig } from '@oasisprotocol/sapphire-wagmi-v2';

// Create connectors with only MetaMask
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommend',
      wallets: [metaMaskWallet],
    },
  ],
  {
    appName: 'SafirX Premium',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '12345',
  }
);

export const config = createSapphireConfig({
  sapphireConfig: {},
  connectors,
  chains: [sapphireTestnet],
  transports: {
    [sapphireTestnet.id]: http(),
  },
});