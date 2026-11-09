import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { botchainTestnet, botchainMainnet } from './chains';

// Get projectId from environment or fallback to a standard development key
export const projectId =
  (import.meta.env.VITE_REOWN_PROJECT_ID as string) || 'b56e18d47c72ab683b10814fe9495694';

export const networks = [botchainTestnet, botchainMainnet] as const;

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [botchainTestnet, botchainMainnet],
});

export const metadata = {
  name: 'ServiceLog',
  description: 'Decentralized Service Record Management on BOT Chain',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://servicelog.dapp',
  icons: ['https://scan.bohr.life/favicon.ico'],
};

// Initialize AppKit modal
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [botchainTestnet, botchainMainnet],
  defaultNetwork: botchainTestnet,
  projectId,
  metadata,
  features: {
    analytics: false,
    email: false,
    socials: false,
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#10B981',
    '--w3m-color-mix': '#0A0D14',
    '--w3m-border-radius-master': '8px',
  },
});

