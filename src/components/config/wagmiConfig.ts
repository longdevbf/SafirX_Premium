
import { http } from 'wagmi';
import { sapphireTestnet } from 'wagmi/chains';
import { createSapphireConfig , sapphireHttpTransport} from '@oasisprotocol/sapphire-wagmi-v2';

export const config = createSapphireConfig({
  sapphireConfig: {
    replaceProviders: true,
  },
  chains: [sapphireTestnet],
  transports: {
    [sapphireTestnet.id]: sapphireHttpTransport(),
  },
});
