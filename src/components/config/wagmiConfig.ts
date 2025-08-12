
import { http } from 'wagmi';
import { sapphire } from 'wagmi/chains';
import { createSapphireConfig , sapphireHttpTransport} from '@oasisprotocol/sapphire-wagmi-v2';

export const config = createSapphireConfig({
  sapphireConfig: {
    replaceProviders: true,
  },
  chains: [sapphire],
  transports: {
    [sapphire.id]: sapphireHttpTransport(),
  },
});
