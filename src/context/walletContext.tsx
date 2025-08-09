'use client';

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import {WalletContextType} from '@/interfaces/walletContextType';

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected} = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  // Tạo user khi kết nối ví thành công
  useEffect(() => {
    const createUserIfNotExists = async (walletAddress: string) => {
      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ address: walletAddress }),
        });

        const data = await response.json();
        
        if (response.ok) {
          if (data.exists) {

          } else {

          }
        } else {
          console.error('Error creating user:', data.error);
        }
      } catch (error) {
        console.error('Failed to create user:', error);
      }
    };

    if (isConnected && address) {
      createUserIfNotExists(address);
    }
  }, [isConnected, address]);

  const handleConnect = () => {
    if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  };

  const value = {
    isConnected,
    address,
    connect: handleConnect,
    disconnect,
    isLoading: isPending,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

