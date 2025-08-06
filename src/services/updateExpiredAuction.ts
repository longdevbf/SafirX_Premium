/**
 * Utility functions for auction status management
 */

export const updateExpiredAuctions = async () => {
  try {
    const response = await fetch('/api/auctions/update-expired', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (!response.ok) {
      console.warn('Failed to update expired auctions')
    }
    
    return await response.json()
  } catch (error) {
    console.warn('Error updating expired auctions:', error)
    return { success: false }
  }
}

export const calculateTimeLeft = (endTime: number) => {
  const now = Math.floor(Date.now() / 1000)
  const timeLeft = endTime - now
  
  if (timeLeft <= 0) return "Ended"
  
  const days = Math.floor(timeLeft / 86400)
  const hours = Math.floor((timeLeft % 86400) / 3600)
  const minutes = Math.floor((timeLeft % 3600) / 60)
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export const isAuctionEnded = (endTime: number) => {
  return Math.floor(Date.now() / 1000) >= endTime
}