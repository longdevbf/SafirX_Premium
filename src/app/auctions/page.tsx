/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Clock, 
  Gavel, 
  Eye, 
  Users, 
  Star, 
  Timer, 
  Lock, 
  HelpCircle,
  CheckCircle,
  AlertCircle,
  History,
  Crown,
  X,
  ExternalLink,
  Loader2
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSealedBidAuction} from "@/hooks/use-auctions"
import { toast } from "react-hot-toast"
import { updateExpiredAuctions, calculateTimeLeft, isAuctionEnded } from "@/services/updateExpiredAuction"

interface Auction {
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
  nft_individual: any[]
  status: string
  nft_claimed: boolean
  nft_reclaimed: boolean
  created_at: string
  total_bid: number
  timeLeft?: string
  isEnded?: boolean
}

// Transaction Success Toast Component
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
          return prev - 2 // Decrease by 2% every 100ms (5 seconds total)
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
        
        {/* Progress Bar */}
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

// Real-time countdown component
interface CountdownProps {
  endTime: number
  className?: string
}

const Countdown = ({ endTime, className = "" }: CountdownProps) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endTime))
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endTime))
    }, 1000) // Update every second
    
    return () => clearInterval(timer)
  }, [endTime])
  
  return (
    <div className={className}>
      Ends in {timeLeft}
    </div>
  )
}

export default function AuctionsPage() {
  const [activeTab, setActiveTab] = useState("live")
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [loading, setLoading] = useState(true)
  const [showGuideModal, setShowGuideModal] = useState(false)
  const [cancelingAuctions, setCancelingAuctions] = useState<Set<number>>(new Set())
  const [finalizingAuctions, setFinalizingAuctions] = useState<Set<number>>(new Set())

  // Transaction toast state
  const [transactionToast, setTransactionToast] = useState({
    isVisible: false,
    txHash: '',
    message: ''
  })

  const { address, isConnected } = useAccount()
  const { cancelAuction, finalizeAuction } = useSealedBidAuction()
  const router = useRouter()

  // Show transaction success toast
  const showTransactionSuccess = useCallback((txHash: string, message: string) => {
    setTransactionToast({
      isVisible: true,
      txHash,
      message
    })
  }, [])

  // Hide transaction toast
  const hideTransactionToast = useCallback(() => {
    setTransactionToast({
      isVisible: false,
      txHash: '',
      message: ''
    })
  }, [])

  // Fetch auctions from database
  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        // First, update expired auctions
        await updateExpiredAuctions()
        
        // Then fetch updated data
        const response = await fetch('/api/auctions')
        const data = await response.json()
        if (data.success) {
          // Client-side validation and update
          const updatedAuctions = data.data.map((auction: Auction) => ({
            ...auction,
            isEnded: isAuctionEnded(auction.end_time),
            timeLeft: calculateTimeLeft(auction.end_time)
          }))
          setAuctions(updatedAuctions)
        }
      } catch (error) {
        console.error('Error fetching auctions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAuctions()
    
    // Auto-refresh every 30 seconds with status check
    const interval = setInterval(async () => {
      await fetchAuctions()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Enhanced filter with real-time status using useMemo
  const liveAuctions = useMemo(() => 
    auctions.filter(auction => 
      auction.status === 'active' && !isAuctionEnded(auction.end_time)
    ), [auctions]
  )
  
  const endedAuctions = useMemo(() => 
    auctions.filter(auction => 
      auction.status === 'ended' || (auction.status === 'active' && isAuctionEnded(auction.end_time))
    ), [auctions]
  )
  
  const finalizedAuctions = useMemo(() => 
    auctions.filter(auction => auction.status === 'finalized'), [auctions]
  )

  // Check if current user is the auction creator
  const isAuctionCreator = useCallback((auction: Auction) => {
    return isConnected && address && 
      address.toLowerCase() === auction.seller_address.toLowerCase()
  }, [isConnected, address])

  // Handle cancel auction
  const handleCancelAuction = useCallback(async (auctionId: number) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    setCancelingAuctions(prev => new Set(prev).add(auctionId))
    try {
      toast.loading('Canceling auction...', { id: 'cancel-auction' })
      
      const result = await cancelAuction(auctionId)
      
      if (result.receipt?.status === 'success') {
        toast.dismiss('cancel-auction')
        showTransactionSuccess(result.hash, 'Auction canceled successfully!')
        
        // Refresh auctions after successful cancellation
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        toast.error('Transaction failed', { id: 'cancel-auction' })
      }
    } catch (error: any) {
      console.error('❌ Cancel auction error:', error)
      toast.error(error.message || 'Failed to cancel auction', { id: 'cancel-auction' })
    } finally {
      setCancelingAuctions(prev => {
        const newSet = new Set(prev)
        newSet.delete(auctionId)
        return newSet
      })
    }
  }, [isConnected, cancelAuction, showTransactionSuccess])

  // Handle finalize auction
  const handleFinalizeAuction = useCallback(async (auctionId: number) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    setFinalizingAuctions(prev => new Set(prev).add(auctionId))
    try {
      toast.loading('Finalizing auction...', { id: 'finalize-auction' })
      
      const result = await finalizeAuction(auctionId)
      
      if (result.receipt?.status === 'success') {
        toast.dismiss('finalize-auction')
        showTransactionSuccess(result.hash, 'Auction finalized successfully!')
        
        // Refresh auctions after successful finalization
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        toast.error('Transaction failed', { id: 'finalize-auction' })
      }
    } catch (error: any) {
      console.error('❌ Finalize auction error:', error)
      toast.error(error.message || 'Failed to finalize auction', { id: 'finalize-auction' })
    } finally {
      setFinalizingAuctions(prev => {
        const newSet = new Set(prev)
        newSet.delete(auctionId)
        return newSet
      })
    }
  }, [isConnected, finalizeAuction, showTransactionSuccess])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-white/80 rounded-lg w-64 mb-8" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square bg-white/80 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              NFT Auctions
            </h1>
            <p className="text-gray-600">Discover and bid on exclusive sealed bid NFT auctions</p>
          </div>
          
          {/* Help Button */}
          <Dialog open={showGuideModal} onOpenChange={setShowGuideModal}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-sm">
                <HelpCircle className="w-4 h-4 mr-2" />
                Auction Guide
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-purple-600" />
                  Sealed Bid Auction Guide
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">How Sealed Bid Auctions Work</h4>
                  <p className="text-blue-800">
                    When an auction is successfully created, anyone can place bids during the sealed bidding period. 
                    All bids are kept secret until the auction ends.
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">Bidding Process</h4>
                  <p className="text-green-800">
                    For security reasons, when you bid (e.g., 5 ROSE) on an auction with a starting price of 2 ROSE, 
                    only 2 ROSE will be deducted from your wallet initially. The remaining 3 ROSE will be charged 
                    later if you win and claim the NFT.
                  </p>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-2">Auction Finalization</h4>
                  <p className="text-yellow-800">
                    When an auction ends, anyone can click the "Finalize NFT" button in the Ended tab. 
                    This determines the winner and automatically refunds losing bidders. If there are no bidders 
                    or no winner, the NFT is returned to the auction creator.
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">After Finalization</h4>
                  <p className="text-purple-800">
                    Finalized auctions move to the Finalized tab. Winners can claim their NFT using the "Claim NFT" button. 
                    If a winner doesn't claim within 3 days, the auction creator can reclaim the NFT. 
                    You can view the complete bid history by clicking "Bid History" below the claim button.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <TabsList className="grid w-full sm:w-auto grid-cols-3 bg-white/80 backdrop-blur-sm">
              <TabsTrigger value="live" className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Live ({liveAuctions.length})
              </TabsTrigger>
              <TabsTrigger value="ended" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Ended ({endedAuctions.length})
              </TabsTrigger>
              <TabsTrigger value="finalized" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Finalized ({finalizedAuctions.length})
              </TabsTrigger>
            </TabsList>

            <Select defaultValue="ending-soon">
              <SelectTrigger className="w-48 bg-white/80 backdrop-blur-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ending-soon">Ending Soon</SelectItem>
                <SelectItem value="most-bids">Most Bids</SelectItem>
                <SelectItem value="highest-bid">Highest Bid</SelectItem>
                <SelectItem value="recently-started">Recently Started</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Live Auctions */}
          <TabsContent value="live" className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Active Sealed Bid Auctions</h4>
                  <p className="text-sm text-blue-700">
                    All bids are hidden until the auction ends. Place your bid now while the auction is live!
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveAuctions.map((auction) => (
                <Card key={auction.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 bg-white/90 backdrop-blur-sm border-white/20">
                  <div className="aspect-square relative cursor-pointer" onClick={() => router.push(`/auctions/${auction.auction_id}`)}>
                    <Image 
                      src={auction.image_url || "/placeholder.svg"} 
                      alt={auction.title} 
                      fill 
                      className="object-cover" 
                    />
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Live
                      </Badge>
                      <div className="bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <Gavel className="w-3 h-3" />
                        {auction.total_bid}
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="outline" className="bg-white/90 text-gray-800">
                        {auction.auction_type === 'bundle' ? 'Bundle' : 'Single'}
                      </Badge>
                    </div>
                    {isAuctionCreator(auction) && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-green-100 text-green-800">
                          <Crown className="w-3 h-3 mr-1" />
                          Your Auction
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-500 mb-1">{auction.collection_name}</div>
                    <h3 className="font-semibold mb-3 truncate">{auction.title}</h3>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-500">Starting Price</div>
                          <div className="font-bold text-lg">{auction.starting_price} ROSE</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Secret Bids</div>
                          <div className="font-semibold flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {auction.total_bid}
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <Countdown 
                          endTime={auction.end_time}
                          className="text-sm font-medium text-green-600"
                        />
                      </div>

                      {isAuctionCreator(auction) ? (
                        <Button 
                          variant="destructive" 
                          className="w-full"
                          onClick={() => handleCancelAuction(auction.auction_id)}
                          disabled={cancelingAuctions.has(auction.auction_id)}
                        >
                          {cancelingAuctions.has(auction.auction_id) ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <X className="w-4 h-4 mr-2" />
                          )}
                          Cancel Auction
                        </Button>
                      ) : (
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
                          <Link href={`/auctions/${auction.auction_id}`}>Place Sealed Bid</Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {liveAuctions.length === 0 && (
              <div className="text-center py-12">
                <Timer className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No live auctions at the moment</p>
                <p className="text-gray-400 text-sm mt-1">Check back later for new auctions</p>
              </div>
            )}
          </TabsContent>

          {/* Ended Auctions */}
          <TabsContent value="ended" className="space-y-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-900 mb-1">Ended Auctions</h4>
                  <p className="text-sm text-orange-700">
                    These auctions have ended and need to be finalized. Anyone can finalize an auction to determine the winner.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {endedAuctions.map((auction) => (
                <Card key={auction.id} className="overflow-hidden bg-white/90 backdrop-blur-sm border-white/20">
                  <div className="aspect-square relative cursor-pointer" onClick={() => router.push(`/auctions/${auction.auction_id}`)}>
                    <Image 
                      src={auction.image_url || "/placeholder.svg"} 
                      alt={auction.title} 
                      fill 
                      className="object-cover opacity-75" 
                    />
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                        Ended
                      </Badge>
                    </div>
                    {isAuctionCreator(auction) && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-green-100 text-green-800">
                          <Crown className="w-3 h-3 mr-1" />
                          Your Auction
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-500 mb-1">{auction.collection_name}</div>
                    <h3 className="font-semibold mb-3 truncate">{auction.title}</h3>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-500">Starting Price</div>
                          <div className="font-bold text-lg">{auction.starting_price} ROSE</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Total Bids</div>
                          <div className="font-semibold">{auction.total_bid}</div>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm text-gray-500">
                          Ended {new Date(auction.end_time * 1000).toLocaleDateString()}
                        </div>
                      </div>

                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                        onClick={() => handleFinalizeAuction(auction.auction_id)}
                        disabled={finalizingAuctions.has(auction.auction_id) || !isConnected}
                      >
                        {finalizingAuctions.has(auction.auction_id) ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Gavel className="w-4 h-4 mr-2" />
                        )}
                        Finalize Auction
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {endedAuctions.length === 0 && (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No ended auctions waiting for finalization</p>
              </div>
            )}
          </TabsContent>

          {/* Finalized Auctions */}
          <TabsContent value="finalized" className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 mb-1">Finalized Auctions</h4>
                  <p className="text-sm text-green-700">
                    These auctions have been completed. Winners can claim their NFTs, and bid history is available.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {finalizedAuctions.map((auction) => (
                <Card key={auction.id} className="overflow-hidden bg-white/90 backdrop-blur-sm border-white/20">
                  <div className="aspect-square relative cursor-pointer" onClick={() => router.push(`/auctions/${auction.auction_id}`)}>
                    <Image 
                      src={auction.image_url || "/placeholder.svg"} 
                      alt={auction.title} 
                      fill 
                      className="object-cover" 
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Finalized
                      </Badge>
                    </div>
                    {!auction.nft_claimed && (
                      <div className="absolute bottom-3 right-3">
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Crown className="w-3 h-3 mr-1" />
                          Awaiting Claim
                        </Badge>
                      </div>
                    )}
                    {isAuctionCreator(auction) && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-green-100 text-green-800">
                          <Crown className="w-3 h-3 mr-1" />
                          Your Auction
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-500 mb-1">{auction.collection_name}</div>
                    <h3 className="font-semibold mb-3 truncate">{auction.title}</h3>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-500">Starting Price</div>
                          <div className="font-bold text-lg">{auction.starting_price} ROSE</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Total Bids</div>
                          <div className="font-semibold">{auction.total_bid}</div>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm text-gray-500">
                          Finalized {new Date(auction.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {!auction.nft_claimed ? (
                          <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" asChild>
                            <Link href={`/auctions/${auction.auction_id}`}>
                              <Crown className="w-4 h-4 mr-2" />
                              View Details
                            </Link>
                          </Button>
                        ) : (
                          <Button variant="outline" className="w-full bg-white/80" asChild>
                            <Link href={`/auctions/${auction.auction_id}`}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              View Details
                            </Link>
                          </Button>
                        )}
                        
                        <Button variant="outline" className="w-full bg-white/80" asChild>
                          <Link href={`/auctions/${auction.auction_id}/history`}>
                            <History className="w-4 h-4 mr-2" />
                            Bid History
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {finalizedAuctions.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No finalized auctions yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Create Auction CTA */}
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <Gavel className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h3 className="text-2xl font-bold mb-2">Ready to Auction Your NFT?</h3>
              <p className="text-gray-600 mb-6">
                Create your own sealed bid auction and let collectors bid on your unique digital assets
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" asChild>
                  <Link href="/create/auction">Create Auction</Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-white/80" asChild>
                  <Link href="/auctions/guide">Learn More</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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