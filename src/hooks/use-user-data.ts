import { useState, useEffect } from 'react';

interface UserData {
  address: string;
  name: string;
  username?: string;
  bio?: string;
  avatar?: string;
  banner?: string;
  created: number;
  sold: number;
  total_volume: number;
  followed: number;
  follower: number;
  created_at: string;
}

export function useUserData(address: string | undefined) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/users?address=${address}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        }
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      //('Error fetching user:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [address]);

  return { 
    user, 
    isLoading, 
    error, 
    refreshUser: fetchUser 
  };
}