/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  ArrowLeft, 
  ExternalLink, 
  Timer, 
  Package,
  Users,
  Lock,
  Shield,
  Crown,
  CheckCircle,
  X,
  Loader2,
  Gavel,
  Clock,
  AlertCircle,
  AlertTriangle,
  Info,
  Eye,
  User,
  History,
  Target
} from "lucide-react"
import Image from "next/image"
import { useSealedBidAuction } from "@/hooks/use-auctions"
import { toast } from "react-hot-toast"
import { parseEther, formatEther } from "viem"
import { updateExpiredAuctions, calculateTimeLeft, isAuctionEnded } from "@/services/updateExpiredAuction"

// Transaction Success Toast Component
interface TransactionToastProps {
  isVisible: boolean
  txHash: string
  onClose: () => void
}

const TransactionToast = ({ isVisible, txHash, onClose }: TransactionToastProps) => {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (isVisible) {
      setProgress(100)
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(timer)
            onClose()
            return 0
          }
          return prev - 2
        })
      }, 100)

      return () => clearInterval(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  const explorerUrl = `https://explorer.oasis.io/testnet/sapphire/tx/${txHash}`

  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 transform ${
        isVisible 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <div className="bg-white border border-green-200 rounded-lg shadow-lg p-3 w-80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-semibold text-green-800">Transaction Successful</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded flex-1 mr-2 truncate">
            {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs"
            onClick={() => window.open(explorerUrl, '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            View
          </Button>
        </div>
        
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-green-500 h-1 rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// TYPE DEFINITIONS
interface ContractInfo {
  address?: string
  eth_address?: string
  name?: string
  symbol?: string
  type?: string
  total_supply?: string
  is_verified?: boolean
  verification_level?: string
}

interface NFTEnhanced {
  token_id: string
  name: string
  image: string
  description: string
  contract: ContractInfo
  owner: {
    oasis_address?: string
    eth_address?: string
  }
  creator?: string
  created_date?: string
  edition?: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
  external_url?: string
  metadata_uri?: string
  num_transfers?: number
  metadata_accessed?: string
  collection?: string
}

interface AuctionDetails {
  id: number
  auction_id: number
  seller_address: string
  nft_contract_address: string
  auction_type: string
  token_ids: number[]
  starting_price: string
  end_time: number
  title: string
  collection_name: string
  image_url: string
  description: string
  nft_individual: NFTEnhanced[]
  status: string
  nft_claimed: boolean
  nft_reclaimed: boolean
  created_at: string
  total_bid: number
  nft_count: number
  reclaim_nft: number
  seller: {
    address: string
    is_verified: boolean
  }
  timeline: {
    created_at: string
    end_time: number
    is_ended: boolean
    time_left_seconds: number
  }
  contract_info: ContractInfo
}

interface PublicBid {
  bidder: string
  amount: bigint
  timestamp: bigint
  deposit: bigint
}

export default function AuctionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { address, isConnected } = useAccount()

  // State variables
  const [auction, setAuction] = useState<AuctionDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  
  // Related auctions state
  const [relatedAuctions, setRelatedAuctions] = useState<any[]>([])
  const [loadingRelated, setLoadingRelated] = useState(false)

  // Modal states
  const [showBidModal, setShowBidModal] = useState(false)
  const [bidAmount, setBidAmount] = useState('')

  // Loading states
  const [isPlacingBid, setIsPlacingBid] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [isClaimingNFT, setIsClaimingNFT] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [isReclaimingNFT, setIsReclaimingNFT] = useState(false)

  // Bid history states
  const [publicBids, setPublicBids] = useState<PublicBid[]>([])
  const [loadingBids, setLoadingBids] = useState(false)
  const [bidError, setBidError] = useState<string | null>(null)

  // Contract data states
  const [contractAuction, setContractAuction] = useState<any>(null)
  const [loadingContractData, setLoadingContractData] = useState(false)

  // Toast state
  const [transactionToast, setTransactionToast] = useState({
    isVisible: false,
    txHash: ''
  })

  // Time states
  const [realTimeLeft, setRealTimeLeft] = useState('')
  const [realReclaimTimeLeft, setRealReclaimTimeLeft] = useState('')

  // State để theo dõi việc đã fetch hay chưa
  const [contractDataFetched, setContractDataFetched] = useState(false)
  const [bidHistoryFetched, setBidHistoryFetched] = useState(false)

  // Hook functions
  const {
    placeBid,
    cancelAuction,
    claimNFT,
    finalizeAuction,
    reclaimNFT,
    getAuctionAsync,
    getAuctionBidsAsync
  } = useSealedBidAuction()

  // Helper functions
  const showTransactionSuccess = (txHash: string) => {
    setTransactionToast({ isVisible: true, txHash })
  }

  const hideTransactionToast = () => {
    setTransactionToast({ isVisible: false, txHash: '' })
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatTimestamp = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString()
  }

  const isAuctionCreator = isConnected && address && auction && 
    address.toLowerCase() === auction.seller_address.toLowerCase()

  const getCurrentNFT = (): NFTEnhanced | null => {
    if (!auction || !auction.nft_individual || auction.nft_individual.length === 0) {
      return null
    }
    return auction.nft_individual[selectedImageIndex] || auction.nft_individual[0]
  }

  const getReservePrice = (): bigint => {
    if (!contractAuction || !Array.isArray(contractAuction)) return BigInt(0)
    
    try {
      // Reserve price ở index 6 theo data thực tế từ console
      const reservePriceValue = contractAuction[6]
      
      if (typeof reservePriceValue === 'bigint') {
        return reservePriceValue
      } else if (typeof reservePriceValue === 'number' || 
                 (typeof reservePriceValue === 'string' && !isNaN(Number(reservePriceValue)))) {
        return BigInt(reservePriceValue)
      }
      
      return BigInt(0)
    } catch (error) {
      console.error('Error getting reserve price:', error)
      return BigInt(0)
    }
  }

  const getRemainingAmount = (): bigint => {
    if (!contractAuction || !Array.isArray(contractAuction)) return BigInt(0)
    
    try {
      // Theo data thực tế: highestBid ở index 14, startingPrice ở index 5
      const highestBidValue = contractAuction[14]
      const startingPriceValue = contractAuction[5]
      
      // Convert sang BigInt
      let highestBid = BigInt(0)
      let startingPrice = BigInt(0)
      
      if (typeof highestBidValue === 'bigint') {
        highestBid = highestBidValue
      } else if (typeof highestBidValue === 'number' || 
                 (typeof highestBidValue === 'string' && !isNaN(Number(highestBidValue)))) {
        highestBid = BigInt(highestBidValue)
      }
      
      if (typeof startingPriceValue === 'bigint') {
        startingPrice = startingPriceValue
      } else if (typeof startingPriceValue === 'number' || 
                 (typeof startingPriceValue === 'string' && !isNaN(Number(startingPriceValue)))) {
        startingPrice = BigInt(startingPriceValue)
      }
      
      console.log('🔍 getRemainingAmount:', {
        highestBid: highestBid.toString(),
        startingPrice: startingPrice.toString(),
        remaining: (highestBid - startingPrice).toString()
      })
      
      return highestBid > startingPrice ? highestBid - startingPrice : BigInt(0)
    } catch (error) {
      console.error('Error calculating remaining amount:', error)
      return BigInt(0)
    }
  }

  const isHighestBidder = (): boolean => {
    if (!contractAuction || !address) return false
    
    try {
      // Theo data thực tế: highestBidder ở index 13
      const winnerAddress = contractAuction[13]
      
      return winnerAddress && 
             typeof winnerAddress === 'string' && 
             winnerAddress !== '0x0000000000000000000000000000000000000000' &&
             winnerAddress.toLowerCase() === address.toLowerCase()
    } catch (error) {
      console.error('Error checking highest bidder:', error)
      return false
    }
  }

  const isReclaimPeriodExpired = (): boolean => {
    if (!auction || !auction.reclaim_nft) return false
    const now = Math.floor(Date.now() / 1000)
    return auction.reclaim_nft <= now
  }

  // Fetch contract auction data
  const fetchContractAuctionData = async () => {
    if (!auction || loadingContractData || contractDataFetched) return
    
    try {
      setLoadingContractData(true)
      const data = await getAuctionAsync(auction.auction_id)
      
      setContractAuction(data)
      setContractDataFetched(true)
    } catch (error) {
      console.error('❌ Error fetching contract auction data:', error)
    } finally {
      setLoadingContractData(false)
    }
  }

  // Fetch bid history
  const fetchBidHistory = async () => {
    if (!auction || auction.status !== 'finalized' || loadingBids || bidHistoryFetched) return
    
    try {
      setLoadingBids(true)
      setBidError(null)
      const bids = await getAuctionBidsAsync(auction.auction_id)
      setPublicBids(bids as PublicBid[] || [])
      setBidHistoryFetched(true)
    } catch (error) {
      setBidError(error instanceof Error ? error.message : 'Failed to fetch bid history')
      console.error('❌ Fetch bid history error:', error)
    } finally {
      setLoadingBids(false)
    }
  }

  // Fetch auction details
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      
      setLoading(true)
      setError(null)
      
      try {
        await updateExpiredAuctions()
        
        const response = await fetch(`/api/auctions/${id}`)
        const data = await response.json()
        if (data.success) {
          const auctionData = data.data
          if (auctionData.status === 'active' && isAuctionEnded(auctionData.end_time)) {
            auctionData.status = 'ended'
            auctionData.timeline.is_ended = true
          }
          setAuction(auctionData)
        } else {
          setError(data.error || 'Failed to fetch auction details')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch auction details')
        console.error('❌ Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [id])

  // Reset flags khi auction thay đổi
  useEffect(() => {
    setContractDataFetched(false)
    setBidHistoryFetched(false)
  }, [auction?.auction_id])

  // Fetch contract data when auction finalized
  useEffect(() => {
    const shouldFetch = auction && 
                       auction.status === 'finalized' && 
                       (!contractDataFetched || !bidHistoryFetched)
    
    if (shouldFetch) {
      // Delay nhỏ để tránh race condition
      const timer = setTimeout(() => {
        if (!contractDataFetched) fetchContractAuctionData()
        if (!bidHistoryFetched) fetchBidHistory()
      }, 100)
      
      return () => clearTimeout(timer)
    }
  })

  // Real-time countdown
  useEffect(() => {
    if (!auction) return
    
    const updateTime = () => {
      setRealTimeLeft(calculateTimeLeft(auction.timeline.end_time))
    }
    
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [auction])

  // Real-time reclaim countdown
  useEffect(() => {
    if (!auction || !auction.reclaim_nft || auction.reclaim_nft === 0) return
    
    const updateReclaimTime = () => {
      const now = Math.floor(Date.now() / 1000)
      const timeLeft = auction.reclaim_nft - now
      
      if (timeLeft <= 0) {
        setRealReclaimTimeLeft("Reclaim period expired")
        return
      }
      
      const days = Math.floor(timeLeft / 86400)
      const hours = Math.floor((timeLeft % 86400) / 3600)
      const minutes = Math.floor((timeLeft % 3600) / 60)
      
      if (days > 0) {
        setRealReclaimTimeLeft(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setRealReclaimTimeLeft(`${hours}h ${minutes}m`)
      } else {
        setRealReclaimTimeLeft(`${minutes}m`)
      }
    }
    
    updateReclaimTime()
    const timer = setInterval(updateReclaimTime, 1000)
    return () => clearInterval(timer)
  }, [auction])

  // Fetch related auctions by collection
  const fetchRelatedAuctions = useCallback(async () => {
    if (!auction?.collection_name) return
    
    setLoadingRelated(true)
    try {
      const response = await fetch('/api/auctions')
      const data = await response.json()
      if (data.success) {
        // Filter related auctions (same collection, different auction_id, active status)
        const related = data.data.filter((a: any) => 
          a.collection_name === auction.collection_name &&
          a.auction_id !== auction.auction_id &&
          a.status === 'active' &&
          !isAuctionEnded(a.end_time)
        ).slice(0, 3) // Limit to 3 related auctions
        
        setRelatedAuctions(related)
      }
    } catch (error) {
      console.error('Error fetching related auctions:', error)
    } finally {
      setLoadingRelated(false)
    }
  }, [auction])

  // Fetch related auctions when auction is loaded
  useEffect(() => {
    if (auction) {
      fetchRelatedAuctions()
    }
  }, [auction, fetchRelatedAuctions])

  // Event handlers
  const handlePlaceBid = async () => {
    if (!auction || !isConnected || !bidAmount) {
      toast.error('Please enter a valid bid amount')
      return
    }

    if (isAuctionCreator) {
      toast.error('You cannot bid on your own auction')
      return
    }

    const bidValue = parseFloat(bidAmount)
    const startingPrice = parseFloat(auction.starting_price)
    
    if (isNaN(bidValue) || bidValue < startingPrice) {
      toast.error(`Bid must be at least ${startingPrice} ROSE`)
      return
    }

    setIsPlacingBid(true)
    try {
      const bidInWei = parseEther(bidValue.toString())
      const depositInWei = parseEther(startingPrice.toString())
      
      toast.loading('Placing bid...', { id: 'place-bid' })
      
      const result = await placeBid(auction.auction_id, Number(bidInWei), Number(depositInWei))
      
      if (result.receipt?.status === 'success') {
        toast.dismiss('place-bid')
        showTransactionSuccess(result.hash)
        setShowBidModal(false)
        setBidAmount('')
        
        setTimeout(() => {
          window.location.reload()
        }, 7000)
      } else {
        toast.error('Transaction failed', { id: 'place-bid' })
      }
    } catch (error: any) {
      console.error('❌ Place bid error:', error)
      toast.error(error.message || 'Failed to place bid', { id: 'place-bid' })
    } finally {
      setIsPlacingBid(false)
    }
  }

  const handleCancelAuction = async () => {
    if (!auction || !isConnected || !isAuctionCreator) {
      toast.error('You can only cancel your own auctions')
      return
    }

    setIsCanceling(true)
    try {
      toast.loading('Canceling auction...', { id: 'cancel-auction' })
      
      const result = await cancelAuction(auction.auction_id)
      
      if (result.receipt?.status === 'success') {
        toast.dismiss('cancel-auction')
        showTransactionSuccess(result.hash)
        
        setTimeout(() => {
          router.push('/auctions')
        }, 7000)
      } else {
        toast.error('Transaction failed', { id: 'cancel-auction' })
      }
    } catch (error: any) {
      console.error('❌ Cancel auction error:', error)
      toast.error(error.message || 'Failed to cancel auction', { id: 'cancel-auction' })
    } finally {
      setIsCanceling(false)
    }
  }

  const handleFinalizeAuction = async () => {
    if (!auction || !isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    setIsFinalizing(true)
    try {
      toast.loading('Finalizing auction...', { id: 'finalize-auction' })
      
      const result = await finalizeAuction(auction.auction_id)
      
      if (result.receipt?.status === 'success') {
        toast.dismiss('finalize-auction')
        showTransactionSuccess(result.hash)
        
        setTimeout(() => {
          window.location.reload()
        }, 7000)
      } else {
        toast.error('Transaction failed', { id: 'finalize-auction' })
      }
    } catch (error: any) {
      console.error('❌ Finalize auction error:', error)
      toast.error(error.message || 'Failed to finalize auction', { id: 'finalize-auction' })
    } finally {
      setIsFinalizing(false)
    }
  }

  const handleClaimNFT = async () => {
    if (!auction || !isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!contractAuction || !Array.isArray(contractAuction)) {
      toast.error('Loading auction data from contract...')
      await fetchContractAuctionData()
      return
    }

    // Kiểm tra xem user có phải là highest bidder không
    const winnerAddress = contractAuction[13] // highestBidder address ở index 13
    if (!winnerAddress || typeof winnerAddress !== 'string' || 
        winnerAddress.toLowerCase() !== address?.toLowerCase()) {
      toast.error('You are not the winner of this auction')
      return
    }

    setIsClaimingNFT(true)
    try {
      toast.loading('Claiming NFT...', { id: 'claim-nft' })
      
      // Lấy highestBid và startingPrice từ contract an toàn
      let highestBid = BigInt(0)
      let startingPrice = BigInt(0)
      
      try {
        const highestBidValue = contractAuction[14] // highestBid ở index 14
        
        // Tìm startingPrice - thử các index từ 5-7
        let startingPriceValue
        for (let i = 5; i <= 7; i++) {
          const value = contractAuction[i]
          if (typeof value === 'bigint' && value > 0 && value < highestBidValue) {
            startingPriceValue = value
            console.log(`🔍 Using startingPrice at index ${i}:`, value.toString())
            break
          }
        }
        
        if (typeof highestBidValue === 'bigint') {
          highestBid = highestBidValue
        } else if (typeof highestBidValue === 'number' || 
                   (typeof highestBidValue === 'string' && !isNaN(Number(highestBidValue)))) {
          highestBid = BigInt(highestBidValue)
        }
        
        if (typeof startingPriceValue === 'bigint') {
          startingPrice = startingPriceValue
        } else if (typeof startingPriceValue === 'number' || 
                   (typeof startingPriceValue === 'string' && !isNaN(Number(startingPriceValue)))) {
          startingPrice = BigInt(startingPriceValue)
        }
      } catch (parseError) {
        console.error('Error parsing bid amounts:', parseError)
        toast.error('Error reading auction data', { id: 'claim-nft' })
        return
      }
      
      console.log('Claim NFT data:', {
        highestBid: highestBid.toString(),
        startingPrice: startingPrice.toString(),
        remainingAmount: (highestBid - startingPrice).toString()
      })
      
      const result = await claimNFT(auction.auction_id, highestBid, startingPrice)
      
      if (result.receipt?.status === 'success') {
        toast.dismiss('claim-nft')
        showTransactionSuccess(result.hash)
        
        setTimeout(() => {
          window.location.reload()
        }, 7000)
      } else {
        toast.error('Transaction failed', { id: 'claim-nft' })
      }
    } catch (error: any) {
      console.error('❌ Claim NFT error:', error)
      toast.error(error.message || 'Failed to claim NFT', { id: 'claim-nft' })
    } finally {
      setIsClaimingNFT(false)
    }
  }

  const handleReclaimNFT = async () => {
    if (!auction || !isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!isAuctionCreator) {
      toast.error('Only auction creator can reclaim NFT')
      return
    }

    const now = Math.floor(Date.now() / 1000)
    if (auction.reclaim_nft > now) {
      toast.error('Reclaim period has not expired yet')
      return
    }

    setIsReclaimingNFT(true)
    try {
      toast.loading('Reclaiming NFT...', { id: 'reclaim-nft' })
      
      const result = await reclaimNFT(auction.auction_id)
      
      if (result.receipt?.status === 'success') {
        toast.dismiss('reclaim-nft')
        showTransactionSuccess(result.hash)
        
        setTimeout(() => {
          window.location.reload()
        }, 7000)
      } else {
        toast.error('Transaction failed', { id: 'reclaim-nft' })
      }
    } catch (error: any) {
      console.error('❌ Reclaim NFT error:', error)
      toast.error(error.message || 'Failed to reclaim NFT', { id: 'reclaim-nft' })
    } finally {
      setIsReclaimingNFT(false)
    }
  }

  const currentNFT = getCurrentNFT()

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-white/80 rounded-lg w-32 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-white/80 rounded-2xl" />
              <div className="space-y-4">
                <div className="h-8 bg-white/80 rounded-lg w-3/4" />
                <div className="h-6 bg-white/80 rounded-lg w-1/2" />
                <div className="h-20 bg-white/80 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !auction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-8 max-w-md mx-4 border-red-200 bg-red-50/80 backdrop-blur-sm">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-4 text-red-800">Error Loading Auction</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => router.back()} variant="outline" className="border-red-200 hover:bg-red-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-8 bg-white/80 backdrop-blur-sm border border-white/20 hover:bg-white/90 shadow-lg"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Auctions
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-6">
            {/* Main Image */}
            <Card className="overflow-hidden bg-white/90 backdrop-blur-sm border-white/20 shadow-xl">
              <div className="aspect-square relative overflow-hidden">
                <Image
                  src={currentNFT?.image || auction.image_url || '/placeholder.svg'}
                  alt={currentNFT?.name || auction.title}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  priority
                />
                
                <div className="absolute top-4 left-4">
                  {auction.auction_type === 'bundle' && (
                    <Badge className="bg-purple-500/90 backdrop-blur-sm text-white flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Bundle ({auction.nft_count})
                    </Badge>
                  )}
                </div>
                
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {auction.status === 'active' && (
                    <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Live
                    </Badge>
                  )}
                  {auction.status === 'ended' && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                      Ended
                    </Badge>
                  )}
                  {auction.status === 'finalized' && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Finalized
                    </Badge>
                  )}
                  <div className="bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {auction.total_bid}
                  </div>
                </div>

                {isAuctionCreator && (
                  <div className="absolute bottom-4 right-4 bg-green-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm shadow-lg">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Your Auction
                  </div>
                )}
              </div>
            </Card>

            {/* Bundle Gallery */}
            {auction.auction_type === 'bundle' && auction.nft_individual && auction.nft_individual.length > 1 && (
              <Card className="p-6 bg-white/90 backdrop-blur-sm border-white/20 shadow-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-800">
                  Bundle Items ({auction.nft_individual.length})
                </h4>
                <div className="grid grid-cols-4 gap-3">
                  {auction.nft_individual.map((nft, index) => (
                    <Card 
                      key={nft.token_id}
                      className={`overflow-hidden cursor-pointer border-2 transition-all duration-200 hover:scale-105 ${
                        selectedImageIndex === index
                          ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' 
                          : 'border-transparent hover:border-gray-300 bg-white/80'
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <div className="aspect-square relative">
                        <Image
                          src={nft.image}
                          alt={nft.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-1 left-1 bg-black/70 text-white px-1 py-0.5 rounded text-xs font-mono">
                          #{nft.token_id}
                        </div>
                        {nft.contract?.symbol && (
                          <div className="absolute top-1 right-1 bg-purple-500/80 text-white px-1 py-0.5 rounded text-xs">
                            {nft.contract.symbol}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            )}

            {/* NFT Details Card */}
            {currentNFT && (
              <Card className="p-6 bg-white/90 backdrop-blur-sm border-white/20 shadow-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  NFT Details
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1">{currentNFT.name}</h5>
                    {currentNFT.description && (
                      <p className="text-sm text-gray-600 mb-2">{currentNFT.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        Token ID: #{currentNFT.token_id}
                      </Badge>
                      {currentNFT.contract?.symbol && (
                        <Badge variant="outline" className="text-xs">
                          {currentNFT.contract.symbol}
                        </Badge>
                      )}
                      {currentNFT.contract?.is_verified && (
                        <Badge className="text-xs bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Attributes */}
                  {currentNFT.attributes && currentNFT.attributes.length > 0 && (
                    <div>
                      <h6 className="font-medium text-gray-800 mb-2">Attributes</h6>
                      <div className="grid grid-cols-2 gap-2">
                        {currentNFT.attributes.slice(0, 6).map((attr, idx: number) => (
                          <div key={idx} className="bg-gray-50 p-2 rounded text-xs">
                            <div className="font-medium text-gray-600">{attr.trait_type}</div>
                            <div className="text-gray-900">{attr.value}</div>
                          </div>
                        ))}
                      </div>
                      {currentNFT.attributes.length > 6 && (
                        <p className="text-xs text-gray-500 mt-2">
                          +{currentNFT.attributes.length - 6} more attributes
                        </p>
                      )}
                    </div>
                  )}

                  {/* External Links */}
                  {currentNFT.external_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => window.open(currentNFT.external_url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View External Link
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Header */}
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-white/20 shadow-lg">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Badge variant="secondary" className="bg-gray-100 text-gray-800 px-3 py-1">
                  {auction.collection_name}
                </Badge>
                {auction.auction_type === 'bundle' && (
                  <Badge variant="outline" className="flex items-center gap-1 border-purple-200 text-purple-700 bg-purple-50">
                    <Package className="w-3 h-3" />
                    Bundle ({auction.nft_count})
                  </Badge>
                )}
                {isAuctionCreator && (
                  <Badge className="bg-green-500 hover:bg-green-600">
                    <Shield className="w-3 h-3 mr-1" />
                    Your Auction
                  </Badge>
                )}
                {auction.contract_info?.is_verified && (
                  <Badge className="bg-blue-100 text-blue-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified Contract
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {auction.title}
              </h1>
              <p className="text-gray-600 leading-relaxed">{auction.description}</p>
              
              {/* Seller Info */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h6 className="font-medium text-gray-800 mb-1 flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Seller
                </h6>
                <div className="text-sm text-gray-600">
                  <span className="font-mono text-xs bg-white px-2 py-1 rounded">
                    {auction.seller.address.slice(0, 10)}...{auction.seller.address.slice(-8)}
                  </span>
                  {auction.seller.is_verified && (
                    <Badge className="ml-2 text-xs bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </Card>

            {/* Auction Info */}
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-white/20 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Starting Price</p>
                  <p className="text-3xl font-bold text-gray-900">{auction.starting_price} ROSE</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Secret Bids</p>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span className="text-2xl font-bold text-gray-900">{auction.total_bid}</span>
                  </div>
                </div>
              </div>

              {/* Reserve Price - Show only when auction is finalized and contract data is available */}
              {auction.status === 'finalized' && contractAuction && (
                <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        Reserve Price
                      </p>
                      <p className="text-xl font-bold text-amber-800">
                        {formatEther(getReservePrice())} ROSE
                      </p>
                      <p className="text-xs text-amber-600 mt-1">
                        Minimum price seller will accept
                      </p>
                    </div>
                    {contractAuction && Array.isArray(contractAuction) && contractAuction[14] && BigInt(contractAuction[14]) > BigInt(0) ? (
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Winning Bid</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatEther(contractAuction[14])} ROSE
                        </p>
                        {BigInt(contractAuction[14]) >= getReservePrice() ? (
                          <Badge className="mt-1 bg-green-100 text-green-800 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Reserve Met ✓
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="mt-1 text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Below Reserve
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Winning Bid</p>
                        <p className="text-lg font-semibold text-red-600">
                          No winning bid - reserve price not met
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline Status */}
              {isAuctionEnded(auction.timeline.end_time) ? (
                <div className="text-center mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm text-orange-600 font-medium">Auction Ended</p>
                  <p className="text-lg font-bold text-orange-800">
                    {new Date(auction.timeline.end_time * 1000).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="text-center mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Timer className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-blue-600 font-medium">Auction Ends In</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {realTimeLeft}
                  </p>
                </div>
              )}

              {auction.status === 'finalized' && (
                <div className="text-center mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-600 font-medium">Auction Finalized</p>
                  <p className="text-lg font-bold text-green-800">
                    {new Date(auction.timeline.end_time * 1000).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {auction.status === 'active' && !isAuctionCreator && (
                  <Button 
                    onClick={() => setShowBidModal(true)} 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={!isConnected}
                  >
                    <Gavel className="w-4 h-4 mr-2" />
                    {!isConnected ? 'Connect Wallet to Bid' : 'Place Sealed Bid'}
                  </Button>
                )}

                {auction.status === 'active' && isAuctionCreator && (
                  <Button 
                    onClick={handleCancelAuction} 
                    variant="destructive"
                    className="w-full"
                    disabled={isCanceling}
                  >
                    {isCanceling ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <X className="w-4 h-4 mr-2" />
                    )}
                    Cancel Auction
                  </Button>
                )}

                {auction.status === 'ended' && (
                  <div className="space-y-3">
                    {/* Finalization Guide */}
                    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4 text-cyan-600" />
                        <span className="font-medium text-cyan-800">Ready to Finalize</span>
                      </div>
                      <div className="text-sm text-cyan-700 space-y-1">
                        <p>• <strong>Anyone can finalize</strong> this ended auction</p>
                        <p>• <strong>Reveals the winner</strong> and makes bid history public</p>
                        <p>• <strong>Automatic outcomes:</strong> No bids or below reserve = NFT returns to seller</p>
                        <p>• <strong>Winner revealed:</strong> Highest bidder gets 3 days to claim</p>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleFinalizeAuction} 
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                      disabled={isFinalizing || !isConnected}
                    >
                      {isFinalizing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Gavel className="w-4 h-4 mr-2" />
                      )}
                      🔍 Finalize Auction & Reveal Winner
                    </Button>
                  </div>
                )}

                {auction.status === 'finalized' && (
                  <>
                    {/* Both NFT claimed and reclaimed are false */}
                    {!auction.nft_claimed && !auction.nft_reclaimed && (
                      <>
                        {/* Claim Button - CHỈ HIỂN THỊ CHO HIGHEST BIDDER */}
                        {isHighestBidder() ? (
                          <div className="space-y-3">
                            {/* Winner Claim Guide */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Crown className="w-4 h-4 text-green-600" />
                                <span className="font-medium text-green-800">🎉 Congratulations! You Won!</span>
                              </div>
                              <div className="text-sm text-green-700 space-y-1">
                                <p>• <strong>You are the highest bidder</strong> for this auction</p>
                                <p>• <strong>Claim within 3 days</strong> or forfeit your deposit</p>
                                {contractAuction && getRemainingAmount() > BigInt(0) ? (
                                  <p>• <strong>Pay remaining:</strong> {formatEther(getRemainingAmount())} ROSE to complete purchase</p>
                                ) : (
                                  <p>• <strong>No additional payment</strong> required - your deposit covers the full amount!</p>
                                )}
                                <p>• <strong>Instant transfer:</strong> NFT transfers to your wallet immediately</p>
                              </div>
                              
                              {/* Countdown Timer */}
                              {auction.reclaim_nft > 0 && (
                                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-yellow-700 font-medium">⏰ Claim deadline:</span>
                                    <span className="text-yellow-800 font-semibold">{realReclaimTimeLeft}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <Button 
                              onClick={handleClaimNFT} 
                              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                              disabled={isClaimingNFT || !isConnected || loadingContractData}
                            >
                              {isClaimingNFT ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Crown className="w-4 h-4 mr-2" />
                              )}
                              🏆 Claim Your NFT
                              {contractAuction && getRemainingAmount() > BigInt(0) && (
                                <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
                                  +{formatEther(getRemainingAmount())} ROSE
                                </span>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <div className="w-full p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-center text-gray-600 mb-2">
                              <Info className="w-5 h-5 mr-2" />
                              <span className="font-medium">Waiting for Winner to Claim</span>
                            </div>
                            <div className="text-center text-sm text-gray-500 space-y-1">
                              <p>Only the highest bidder can claim this NFT</p>
                              <p>Winner has 3 days from finalization to claim</p>
                              {auction.reclaim_nft > 0 && !isReclaimPeriodExpired() && (
                                <p className="text-yellow-600 font-medium">
                                  ⏰ Time remaining: {realReclaimTimeLeft}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Reclaim Button - CHỈ CHO AUCTION CREATOR */}
                        {isAuctionCreator && (
                          <div className="space-y-3">
                            {/* Reclaim Guide */}
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-orange-600" />
                                <span className="font-medium text-orange-800">Reclaim Your NFT</span>
                              </div>
                              <div className="text-sm text-orange-700 space-y-1">
                                {isReclaimPeriodExpired() ? (
                                  <>
                                    <p>• <strong>Winner didn&apos;t claim:</strong> 3-day deadline has passed</p>
                                    <p>• <strong>Winner forfeits deposit:</strong> You keep their deposit as compensation</p>
                                    <p>• <strong>Your rights:</strong> You can now reclaim your NFT back to your wallet</p>
                                    <p>• <strong>Next steps:</strong> Relist, keep, or sell elsewhere</p>
                                  </>
                                ) : (
                                  <>
                                    <p>• <strong>Winner has time:</strong> They have {realReclaimTimeLeft} to claim</p>
                                    <p>• <strong>Be patient:</strong> Reclaim only available after 3-day grace period</p>
                                    <p>• <strong>Automatic rights:</strong> You can reclaim if they don&apos;t claim</p>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <Button 
                              onClick={handleReclaimNFT} 
                              variant="outline"
                              className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
                              disabled={isReclaimingNFT || !isConnected || !isReclaimPeriodExpired()}
                            >
                              {isReclaimingNFT ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Clock className="w-4 h-4 mr-2" />
                              )}
                              {isReclaimPeriodExpired() ? '🔄 Reclaim Your NFT' : `⏰ Reclaim in ${realReclaimTimeLeft}`}
                            </Button>
                          </div>
                        )}
                      </>
                    )}

                    {/* NFT has been claimed */}
                    {auction.nft_claimed && (
                      <div className="w-full p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-center text-blue-800">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          <span className="font-medium">NFT has been claimed by the winner</span>
                        </div>
                      </div>
                    )}

                    {/* NFT has been reclaimed */}
                    {auction.nft_reclaimed && (
                      <div className="w-full p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center justify-center text-orange-800">
                          <Clock className="w-5 h-5 mr-2" />
                          <span className="font-medium">NFT has been reclaimed by the creator</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>

            {/* Winning Bid Info Card */}
            {auction.status === 'finalized' && contractAuction && (
              <Card className="p-6 bg-white/90 backdrop-blur-sm border-white/20 shadow-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-600" />
                  Winning Bid Details
                </h4>
                
                {loadingContractData ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                    <span className="ml-2 text-gray-500">Loading bid details...</span>
                  </div>
                ) : (
                  <div className="space-y-3 text-sm">
                    {contractAuction[13] && contractAuction[13] !== '0x0000000000000000000000000000000000000000' ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Winner:</span>
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {String(contractAuction[13]).slice(0, 10)}...{String(contractAuction[13]).slice(-8)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Winning Bid:</span>
                          <span className="font-semibold text-green-600">
                            {contractAuction[14] && (typeof contractAuction[14] === 'bigint' || !isNaN(Number(contractAuction[14]))) 
                              ? formatEther(typeof contractAuction[14] === 'bigint' ? contractAuction[14] : BigInt(contractAuction[14])) 
                              : '0'} ROSE
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Starting Price:</span>
                          <span className="text-gray-900">
                            {/* Starting price ở index 5 */}
                            {contractAuction[5] && (typeof contractAuction[5] === 'bigint' || !isNaN(Number(contractAuction[5]))) 
                              ? formatEther(typeof contractAuction[5] === 'bigint' ? contractAuction[5] : BigInt(contractAuction[5])) + ' ROSE'
                              : '0 ROSE'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Additional Payment:</span>
                          <span className="font-semibold text-blue-600">
                            {formatEther(getRemainingAmount())} ROSE
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500">No winning bid - reserve price not met</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )}

            {/* BID HISTORY CARD */}
            {auction.status === 'finalized' && (
              <Card className="p-6 bg-white/90 backdrop-blur-sm border-white/20 shadow-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-600" />
                  Bid History
                </h4>
                
                {loadingBids ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                    <span className="ml-2 text-gray-500">Loading bid history...</span>
                  </div>
                ) : bidError ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-600 text-sm">{bidError}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setBidHistoryFetched(false)
                        setBidError(null)
                        fetchBidHistory()
                      }}
                      className="mt-2"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : publicBids.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No bids found for this auction</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600 mb-4">
                      Total bids: {publicBids.length}
                    </div>
                    
                    {/* Winner Explanation */}
                    {contractAuction && getReservePrice() > BigInt(0) && (
                      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-amber-600" />
                          <span className="font-medium text-amber-800 text-sm">Winner Determination Rules</span>
                        </div>
                        <div className="text-xs text-amber-700 space-y-1">
                          <div>• <strong>Highest bid wins:</strong> Bidder with the highest amount</div>
                          <div>• <strong>Tie-breaker:</strong> Earlier timestamp wins if bids are equal</div>
                          <div>• <strong>Reserve price:</strong> Highest bid must be ≥ {formatEther(getReservePrice())} ROSE</div>
                          <div>• <strong>If below reserve:</strong> No winner, auction gets cancelled, deposits refunded</div>
                        </div>
                        <div className="mt-2 p-2 bg-amber-100 rounded text-xs text-amber-800">
                          <strong>Example:</strong> Starting Price: {auction.starting_price} ROSE, Reserve: {formatEther(getReservePrice())} ROSE
                          <br />• Anyone can bid starting from {auction.starting_price} ROSE
                          <br />• But seller only sells if highest bid ≥ {formatEther(getReservePrice())} ROSE
                        </div>
                      </div>
                    )}
                    
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {publicBids
                        .sort((a, b) => Number(b.amount) - Number(a.amount))
                        .map((bid, index) => (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg border transition-colors ${
                            index === 0 
                              ? 'bg-yellow-50 border-yellow-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {index === 0 && (
                                <Crown className="w-4 h-4 text-yellow-600" />
                              )}
                              <span className="font-mono text-xs bg-white px-2 py-1 rounded border">
                                {formatAddress(bid.bidder)}
                              </span>
                              {bid.bidder.toLowerCase() === address?.toLowerCase() && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  You
                                </Badge>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">
                                {formatEther(bid.amount)} ROSE
                              </div>
                              {index === 0 && (
                                <div className="flex flex-col items-end gap-1">
                                  <div className="text-xs text-yellow-600 font-medium">
                                    Highest Bid
                                  </div>
                                  {/* Winner condition check */}
                                  {contractAuction && getReservePrice() > BigInt(0) && (
                                    <div className="text-xs">
                                      {bid.amount >= getReservePrice() ? (
                                        <Badge className="bg-green-100 text-green-800 px-1 py-0.5 text-xs">
                                          <CheckCircle className="w-2 h-2 mr-1" />
                                          Wins Auction
                                        </Badge>
                                      ) : (
                                        <Badge variant="destructive" className="px-1 py-0.5 text-xs">
                                          <AlertCircle className="w-2 h-2 mr-1" />
                                          Below Reserve
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimestamp(bid.timestamp)}
                            </div>
                            <div>
                              Deposit: {formatEther(bid.deposit)} ROSE
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {publicBids.length > 5 && (
                      <div className="text-center pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const bidContainer = document.querySelector('.max-h-64');
                            if (bidContainer) {
                              bidContainer.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View All {publicBids.length} Bids
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      <Dialog open={showBidModal} onOpenChange={setShowBidModal}>
        <DialogContent className="bg-white/95 backdrop-blur-sm max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Gavel className="w-5 h-5 text-blue-600" />
              Place Sealed Bid
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Bidding Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">How Sealed Bidding Works</span>
              </div>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-start gap-2">
                    <span className="bg-blue-200 text-blue-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                    <div>
                      <strong>Pay Deposit Only:</strong> You only pay <span className="font-semibold text-green-600">{auction?.starting_price} ROSE</span> now (starting price)
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-blue-200 text-blue-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                    <div>
                      <strong>Hidden Bids:</strong> Your bid amount stays secret until auction ends
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-blue-200 text-blue-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                    <div>
                      <strong>If You Win:</strong> Pay remaining amount (your bid - {auction?.starting_price} ROSE) to claim NFT
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-blue-200 text-blue-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                    <div>
                      <strong>If You Lose:</strong> Get your {auction?.starting_price} ROSE deposit back automatically
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bid Input */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Your Secret Bid Amount (ROSE)
              </label>
              <Input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={`Minimum ${auction?.starting_price} ROSE`}
                step="0.01"
                min={auction ? parseFloat(auction.starting_price) : 0}
                className="bg-white border-gray-200 text-lg font-semibold"
              />
              
              {/* Payment Breakdown */}
              {bidAmount && parseFloat(bidAmount) >= parseFloat(auction?.starting_price || '0') && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                  <h4 className="font-medium text-green-800 mb-2">💳 Payment Breakdown</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-green-700">
                      <span>Pay Now (Deposit):</span>
                      <span className="font-semibold">{auction?.starting_price} ROSE</span>
                    </div>
                    <div className="flex justify-between text-green-700">
                      <span>If You Win, Pay Later:</span>
                      <span className="font-semibold">
                        {(parseFloat(bidAmount) - parseFloat(auction?.starting_price || '0')).toFixed(4)} ROSE
                      </span>
                    </div>
                    <div className="border-t border-green-300 pt-1 mt-2">
                      <div className="flex justify-between text-green-800 font-semibold">
                        <span>Total Bid Amount:</span>
                        <span>{parseFloat(bidAmount).toFixed(4)} ROSE</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Warning */}
              <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800 text-sm">Important Reminder</span>
                </div>
                <ul className="text-xs text-yellow-700 space-y-1 list-disc ml-4">
                  <li>This is a binding commitment - you must claim and pay if you win</li>
                  <li>You have 3 days to claim after auction ends, or forfeit your deposit</li>
                  <li>Bid strategically - your amount will be revealed when auction finalizes</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={handlePlaceBid} 
                disabled={isPlacingBid || !bidAmount || parseFloat(bidAmount) < parseFloat(auction?.starting_price || '0')}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isPlacingBid ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Gavel className="w-4 h-4 mr-2" />
                )}
                Place Sealed Bid
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowBidModal(false)}
                disabled={isPlacingBid}
                className="bg-white hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction Success Toast */}
      <TransactionToast
        isVisible={transactionToast.isVisible}
        txHash={transactionToast.txHash}
        onClose={hideTransactionToast}
      />
    </div>
  )
}