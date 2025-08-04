"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useWallet } from './walletContext'

interface UserData {
  address: string
  name: string
  username?: string
  bio?: string
  avatar?: string
  banner?: string
  created: number
  sold: number
  total_volume: number
  followed: number
  follower: number
  created_at: string
}

interface UserContextType {
  user: UserData | null
  isLoading: boolean
  error: string | null
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { address, isConnected } = useWallet()

  const fetchUser = async () => {
    if (!address || !isConnected) {
      setUser(null)
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/users?address=${address}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found')
        }
        throw new Error('Failed to fetch user data')
      }

      const data = await response.json()
      setUser(data.user)
    } catch (err) {
      console.error('Error fetching user:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [address, isConnected])

  // Reset user when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setUser(null)
      setError(null)
    }
  }, [isConnected])

  return (
    <UserContext.Provider value={{ 
      user, 
      isLoading, 
      error, 
      refreshUser: fetchUser 
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}