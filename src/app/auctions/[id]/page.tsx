/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  ArrowLeft, 
  ExternalLink, 
  Timer, 
  DollarSign,
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
  Star,
  Info,
  Eye,
  Calendar,
  User
} from "lucide-react"
import Image from "next/image"
import { useSealedBidAuction } from "@/hooks/use-auctions"
import { toast } from "react-hot-toast"
import { parseEther } from "viem"
import { updateExpiredAuctions, calculateTimeLeft, isAuctionEnded } from "@/services/updateExpiredAuction"

// Transaction Success Toast Component (same as marketplace)
interface TransactionToastProps {
  isVisible: boolean
  txHash: string
  message: string
  onClose: () => void
}

const TransactionToast = ({ isVisible, txHash, message, onClose }: TransactionToastProps) => {
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
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right-2 duration-300">
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

// ENHANCED TYPE DEFINITIONS dựa vào API response mới
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

export default function AuctionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { address, isConnected } = useAccount()

  const [auction, setAuction] = useState<AuctionDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Bid modal states
  const [showBidModal, setShowBidModal] = useState(false)
  const [bidAmount, setBidAmount] = useState('')
  const [isPlacingBid, setIsPlacingBid] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [isClaimingNFT, setIsClaimingNFT] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)

  // Transaction toast state
  const [transactionToast, setTransactionToast] = useState({
    isVisible: false,
    txHash: '',
    message: ''
  })

  // Blockchain hooks
  const {
    placeBid,
    cancelAuction,
    claimNFT,
    finalizeAuction
  } = useSealedBidAuction()

  // Show transaction success toast
  const showTransactionSuccess = (txHash: string, message: string) => {
    setTransactionToast({
      isVisible: true,
      txHash,
      message
    })
  }

  // Hide transaction toast
  const hideTransactionToast = () => {
    setTransactionToast({
      isVisible: false,
      txHash: '',
      message: ''
    })
  }

  // Check if current user is the auction creator
  const isAuctionCreator = isConnected && address && auction && 
    address.toLowerCase() === auction.seller_address.toLowerCase()

  // Fetch auction details
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      
      setLoading(true)
      setError(null)
      
      try {
        // Update expired auctions first
        await updateExpiredAuctions()
        
        const response = await fetch(`/api/auctions/${id}`)
        const data = await response.json()
        if (data.success) {
          // Client-side validation
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
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [id])

  // Real-time countdown
  const [realTimeLeft, setRealTimeLeft] = useState('')
  
  useEffect(() => {
    if (!auction) return
    
    const updateTime = () => {
      setRealTimeLeft(calculateTimeLeft(auction.timeline.end_time))
    }
    
    updateTime() // Initial update
    const timer = setInterval(updateTime, 1000) // Update every second
    
    return () => clearInterval(timer)
  }, [auction])

  // Handle place bid - SỬA LẠI TIMING (7s total: 5s toast + 2s wait)
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
        showTransactionSuccess(result.hash, 'Bid placed successfully!')
        setShowBidModal(false)
        setBidAmount('')
        
        // Wait total 7 seconds (5s toast + 2s extra) before reload
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

  // Handle cancel auction - SỬA LẠI TIMING
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
        showTransactionSuccess(result.hash, 'Auction canceled successfully!')
        
        // Wait total 7 seconds before redirect
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

  // Handle finalize auction - SỬA LẠI TIMING
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
        showTransactionSuccess(result.hash, 'Auction finalized successfully!')
        
        // Wait total 7 seconds before reload
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

  // Handle claim NFT - SỬA LẠI TIMING
  const handleClaimNFT = async () => {
    if (!auction || !isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    setIsClaimingNFT(true)
    try {
      toast.loading('Claiming NFT...', { id: 'claim-nft' })
      
      const result = await claimNFT(auction.auction_id, 0)
      
      if (result.receipt?.status === 'success') {
        toast.dismiss('claim-nft')
        showTransactionSuccess(result.hash, 'NFT claimed successfully!')
        
        // Wait total 7 seconds before reload
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

  // Calculate time left - SỬ DỤNG timeline từ API
  const calculateTimeLeft = (endTime: number) => {
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

  // Get current selected NFT - SỬ DỤNG enhanced data từ API
  const getCurrentNFT = (): NFTEnhanced | null => {
    if (!auction || !auction.nft_individual || auction.nft_individual.length === 0) {
      return null
    }
    return auction.nft_individual[selectedImageIndex] || auction.nft_individual[0]
  }

  const currentNFT = getCurrentNFT()

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

            {/* Bundle Gallery - ENHANCED với dữ liệu mới */}
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

            {/* NFT Details Card - ENHANCED với dữ liệu chi tiết */}
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

                  {/* Creator & Ownership Info */}
                  {(currentNFT.creator || currentNFT.owner?.eth_address) && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h6 className="font-medium text-gray-800 mb-2 flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Ownership
                      </h6>
                      {currentNFT.creator && (
                        <div className="text-sm mb-1">
                          <span className="text-gray-600">Creator: </span>
                          <span className="font-mono text-xs bg-white px-2 py-1 rounded">
                            {currentNFT.creator.toString().slice(0, 10)}...{currentNFT.creator.toString().slice(-8)}
                          </span>
                        </div>
                      )}
                      {currentNFT.owner?.eth_address && (
                        <div className="text-sm">
                          <span className="text-gray-600">Owner: </span>
                          <span className="font-mono text-xs bg-white px-2 py-1 rounded">
                            {currentNFT.owner.eth_address.slice(0, 10)}...{currentNFT.owner.eth_address.slice(-8)}
                          </span>
                        </div>
                      )}
                      {currentNFT.created_date && (
                        <div className="text-sm mt-1">
                          <span className="text-gray-600">Created: </span>
                          <span className="text-xs">
                            {new Date(currentNFT.created_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

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

                  {/* Collection & Contract Info */}
                  <div className="pt-2 border-t border-gray-100">
                    <h6 className="font-medium text-gray-800 mb-1">Collection Info</h6>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>
                        <span className="font-medium">{currentNFT.collection || auction.collection_name}</span>
                        {currentNFT.contract?.total_supply && (
                          <span className="text-xs ml-2">
                            (Supply: {currentNFT.contract.total_supply})
                          </span>
                        )}
                      </div>
                      {currentNFT.contract?.address && (
                        <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {currentNFT.contract.address}
                        </div>
                      )}
                      {currentNFT.num_transfers && (
                        <div className="text-xs text-gray-500">
                          <Eye className="w-3 h-3 inline mr-1" />
                          {currentNFT.num_transfers} transfers
                        </div>
                      )}
                    </div>
                  </div>

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
                    Finalize Auction
                  </Button>
                )}

                {auction.status === 'finalized' && !auction.nft_claimed && (
                  <Button 
                    onClick={handleClaimNFT} 
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    disabled={isClaimingNFT || !isConnected}
                  >
                    {isClaimingNFT ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Crown className="w-4 h-4 mr-2" />
                    )}
                    Claim NFT
                  </Button>
                )}
              </div>
            </Card>

            {/* Additional Info Card */}
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-white/20 shadow-lg">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Auction Information</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Auction ID:</span>
                  <span className="font-mono">#{auction.auction_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="capitalize">{auction.auction_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span>{new Date(auction.timeline.created_at).toLocaleDateString()}</span>
                </div>
                {auction.contract_info?.address && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-gray-600 block mb-1">Contract:</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded block">
                      {auction.contract_info.address}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      <Dialog open={showBidModal} onOpenChange={setShowBidModal}>
        <DialogContent className="bg-white/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Place Sealed Bid</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Your Bid Amount (ROSE)
              </label>
              <Input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={`Minimum ${auction?.starting_price} ROSE`}
                step="0.01"
                min={auction ? parseFloat(auction.starting_price) : 0}
                className="bg-white border-gray-200"
              />
              <p className="text-xs text-gray-500 mt-1">
                Only {auction?.starting_price} ROSE will be charged now. Remaining amount (if any) will be charged when you claim the NFT if you win.
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handlePlaceBid} 
                disabled={isPlacingBid || !bidAmount}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isPlacingBid ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Gavel className="w-4 h-4 mr-2" />
                )}
                Place Bid
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
        message={transactionToast.message}
        onClose={hideTransactionToast}
      />
    </div>
  )
}