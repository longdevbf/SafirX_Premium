"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
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

  const fetchUser = useCallback(async (retryCount = 0) => {
    if (!address || !isConnected) {
      setUser(null)
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      // Thử fetch user data
      const response = await fetch(`/api/users?address=${address}`)
      
      if (response.ok) {
        // User đã tồn tại
        const data = await response.json()
        setUser(data.user)
        return
      }

      if (response.status === 404) {
        // User chưa tồn tại, tự động tạo mới
        const createResponse = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ address })
        })

        if (!createResponse.ok) {
          const errorData = await createResponse.json()
          throw new Error(errorData.error || 'Failed to create new user')
        }

        const createData = await createResponse.json()
        // Set user data từ response của create API
        if (createData.user) {
          setUser(createData.user)
          return
        }
      }

      // Lỗi khác
      throw new Error(`HTTP ${response.status}: Failed to fetch user data`)

    } catch (err) {
   //   //('Error in fetchUser:', err)
      
      // Retry logic cho network errors (tối đa 2 lần retry)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      if (retryCount < 2 && (err instanceof TypeError || errorMessage.includes('Network'))) {
        setTimeout(() => fetchUser(retryCount + 1), 1000) // Retry sau 1 giây
        return
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [address, isConnected])

  useEffect(() => {
    fetchUser()
  }, [address, isConnected, fetchUser])

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

