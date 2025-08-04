// src/hooks/use-balance.ts
import { useBalance } from 'wagmi'

export function useWalletBalance(address: string | undefined) {
  const { data: balance, isLoading, error } = useBalance({
    address: address as `0x${string}`,
    query: { enabled: !!address }
  })
  
  return {
    balance: balance ? parseFloat(balance.formatted) : 0,
    formatted: balance ? `${parseFloat(balance.formatted).toFixed(2)} ${balance.symbol}` : "0.00 ROSE",
    isLoading,
    error
  }
}