/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  ArrowLeft, 
  ExternalLink, 
  Heart, 
  Share2, 
  Package, 
  User, 
  Calendar, 
  DollarSign,
  Image as ImageIcon,
  Info,
  Star,
  Eye,
  Copy,
  CheckCheck,
  Clock,
  Edit,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Activity,
  Shield,
  Zap
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { fetchNFTDetails, DetailedNFT } from "@/services/marketplace"
import { useNFTMarketplace } from "@/hooks/use-market"
import { toast } from "react-hot-toast"
import { parseEther } from "viem"

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

export default function NFTDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { address, isConnected } = useAccount()

  const [nft, setNft] = useState<DetailedNFT | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [liked, setLiked] = useState(false)
  const [copied, setCopied] = useState('')

  // Edit price modal states
  const [showEditPrice, setShowEditPrice] = useState(false)
  const [newPrice, setNewPrice] = useState('')
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [isBuying, setIsBuying] = useState(false)

  // Transaction toast state
  const [transactionToast, setTransactionToast] = useState({
    isVisible: false,
    txHash: '',
    message: ''
  })

  // Blockchain hooks
  const {
    buyNFT,
    buyCollectionBundle,
    buyNFTUnified,
    cancelListing,
    cancelCollection,
    cancelListingUnified,
    updatePrice,
    updateBundlePrice
  } = useNFTMarketplace()

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

  // Check if current user is the seller
  const isOwner = isConnected && address && nft && 
    address.toLowerCase() === nft.seller_address.toLowerCase()

  // Fetch NFT details
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetchNFTDetails(id)
        setNft(response.data)
        // Set initial price for edit modal
        const priceInRose = response.data.price.replace(' ROSE', '')
        setNewPrice(priceInRose)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch NFT details')
        console.error('❌ Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  // Handle buy NFT/Collection
  const handleBuyNFT = async () => {
    if (!nft || !isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (isOwner) {
      toast.error('You cannot buy your own NFT')
      return
    }

    setIsBuying(true)
    try {
      const priceInRose = parseFloat(nft.price.replace(' ROSE', ''))
      const priceInWei = parseEther(priceInRose.toString())
      
      toast.loading('Processing purchase...', { id: 'buy-nft' })
      
      let result
      
      // Determine which function to use based on listing type
      if (nft.listing_type === 'bundle') {
        // For bundle collections, use buyCollectionBundle
        console.log('🔄 Buying collection bundle with ID:', nft.listing_id)
        result = await buyCollectionBundle(nft.listing_id, Number(priceInWei))
      } else if (nft.listing_type === 'single') {
        // For single NFTs, use buyNFT
        console.log('🔄 Buying single NFT with ID:', nft.listing_id)
        result = await buyNFT(nft.listing_id, Number(priceInWei))
      } else {
        // Fallback to unified function
        console.log('🔄 Using unified buy function for ID:', nft.listing_id)
        result = await buyNFTUnified(nft.listing_id, Number(priceInWei))
      }
      
      if (result.receipt?.status === 'success') {
        toast.dismiss('buy-nft')
        const message = nft.listing_type === 'bundle' 
          ? 'Collection bundle purchased successfully!' 
          : 'NFT purchased successfully!'
        
        showTransactionSuccess(result.hash, message)
        
        // Wait total 7 seconds (5s toast + 2s after disappearance) before reloading
        setTimeout(() => {
          window.location.reload()
        }, 7000)
      } else {
        toast.error('Transaction failed', { id: 'buy-nft' })
      }
    } catch (error: any) {
      console.error('❌ Buy error:', error)
      toast.error(error.message || 'Failed to purchase NFT', { id: 'buy-nft' })
    } finally {
      setIsBuying(false)
    }
  }

  // Handle cancel listing
  const handleCancelListing = async () => {
    if (!nft || !isConnected || !isOwner) {
      toast.error('You can only cancel your own listings')
      return
    }

    setIsCanceling(true)
    try {
      toast.loading('Canceling listing...', { id: 'cancel-listing' })
      
      let result
      
      // Determine which function to use based on listing type
      if (nft.listing_type === 'bundle') {
        // For bundle collections, use cancelCollection
        console.log('🔄 Canceling collection with ID:', nft.listing_id)
        result = await cancelCollection(nft.listing_id)
      } else if (nft.listing_type === 'single') {
        // For single NFTs, use cancelListing
        console.log('🔄 Canceling listing with ID:', nft.listing_id)
        result = await cancelListing(nft.listing_id)
      } else {
        // Fallback to unified function
        console.log('🔄 Using unified cancel function for ID:', nft.listing_id)
        result = await cancelListingUnified(nft.listing_id)
      }
      
      if (result.receipt?.status === 'success') {
        toast.dismiss('cancel-listing')
        const message = nft.listing_type === 'bundle' 
          ? 'Collection canceled successfully!' 
          : 'Listing canceled successfully!'
        
        showTransactionSuccess(result.hash, message)
        
        // Wait total 7 seconds before redirecting back to marketplace
        setTimeout(() => {
          router.push('/marketplace')
        }, 7000)
      } else {
        toast.error('Transaction failed', { id: 'cancel-listing' })
      }
    } catch (error: any) {
      console.error('❌ Cancel error:', error)
      toast.error(error.message || 'Failed to cancel listing', { id: 'cancel-listing' })
    } finally {
      setIsCanceling(false)
    }
  }

  // Handle update price
  const handleUpdatePrice = async () => {
    if (!nft || !isConnected || !isOwner || !newPrice) {
      toast.error('Invalid price or insufficient permissions')
      return
    }

    const priceValue = parseFloat(newPrice)
    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error('Please enter a valid price')
      return
    }

    setIsUpdatingPrice(true)
    try {
      toast.loading('Updating price...', { id: 'update-price' })
      
      const priceInWei = parseEther(priceValue.toString())
      
      let result
      
      // Determine which function to use based on listing type
      if (nft.listing_type === 'bundle') {
        // For bundle collections, use updateBundlePrice
        console.log('🔄 Updating bundle price for ID:', nft.listing_id)
        result = await updateBundlePrice(nft.listing_id, Number(priceInWei))
      } else {
        // For single NFTs, use updatePrice
        console.log('🔄 Updating single NFT price for ID:', nft.listing_id)
        result = await updatePrice(nft.listing_id, Number(priceInWei))
      }
      
      if (result.receipt?.status === 'success') {
        toast.dismiss('update-price')
        const message = nft.listing_type === 'bundle' 
          ? 'Bundle price updated successfully!' 
          : 'Price updated successfully!'
        
        showTransactionSuccess(result.hash, message)
        setShowEditPrice(false)
        
        // Wait total 7 seconds before reloading page
        setTimeout(() => {
          window.location.reload()
        }, 7000)
      } else {
        toast.error('Transaction failed', { id: 'update-price' })
      }
    } catch (error: any) {
      console.error('❌ Update price error:', error)
      toast.error(error.message || 'Failed to update price', { id: 'update-price' })
    } finally {
      setIsUpdatingPrice(false)
    }
  }

  // Copy to clipboard function
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      toast.success(`${type} copied to clipboard!`)
      setTimeout(() => setCopied(''), 2000)
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Get all images for bundle/collection view
  const getAllImages = () => {
    if (!nft) return []
    
    const images = []
    
    // For bundle: try to get all individual NFT images first
    if (nft.listing_type === 'bundle' && nft.nft_individual && Array.isArray(nft.nft_individual)) {
      // Add images from nft_individual array
      nft.nft_individual.forEach((item, index) => {
        const imageUrl = item.metadata?.image || item.metadata?.metadata?.image
        if (imageUrl) {
          images.push({
            url: imageUrl,
            name: item.metadata?.name || item.metadata?.metadata?.name || `NFT #${item.token_id}`,
            token_id: item.token_id,
            isMain: index === 0 // First item is main
          })
        }
      })
    }
    
    // If we don't have images from individuals, use main image
    if (images.length === 0 && nft.image) {
      images.push({
        url: nft.image,
        name: nft.name,
        token_id: nft.listing_type === 'single' ? nft.token_ids[0] : nft.token_ids[0] || null,
        isMain: true
      })
    }
    
    return images
  }

  // Get gallery images for display
  const getGalleryImages = () => {
    const allImages = getAllImages()
    
    // For bundle: show all images in gallery
    // For single: don't show gallery if only one image
    if (nft?.listing_type === 'bundle') {
      return allImages // Show all images for bundle
    }
    return allImages.length > 1 ? allImages.slice(1) : [] // Exclude main image for single NFTs
  }

  // Get current display image
  const getCurrentDisplayImage = () => {
    const allImages = getAllImages()
    return allImages[selectedImageIndex] || allImages[0] || {
      url: nft?.image || '/placeholder.svg',
      name: nft?.name || 'NFT',
      token_id: nft?.token_ids?.[0] || null
    }
  }

  const allImages = getAllImages()
  const galleryImages = getGalleryImages()
  const currentImage = getCurrentDisplayImage()

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

  if (error || !nft) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-8 max-w-md mx-4 border-red-200 bg-red-50/80 backdrop-blur-sm">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-4 text-red-800">Error Loading NFT</h2>
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
        {/* Enhanced Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-8 bg-white/80 backdrop-blur-sm border border-white/20 hover:bg-white/90 shadow-lg"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Image Section */}
          <div className="space-y-6">
            {/* Main Image */}
            <Card className="overflow-hidden bg-white/90 backdrop-blur-sm border-white/20 shadow-xl">
              <div className="aspect-square relative overflow-hidden">
                <Image
                  src={currentImage.url}
                  alt={currentImage.name}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  priority
                />
                {/* Enhanced Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                
                {nft.listing_type === 'bundle' && (
                  <div className="absolute top-4 left-4 bg-purple-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-lg">
                    <Package className="w-4 h-4" />
                    Bundle ({nft.bundle_count} NFTs)
                  </div>
                )}
                {currentImage.token_id && (
                  <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-mono shadow-lg">
                    Token ID: {currentImage.token_id}
                  </div>
                )}
                {isOwner && (
                  <div className="absolute top-4 right-4 bg-green-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm shadow-lg">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Your Listing
                  </div>
                )}
              </div>
            </Card>

            {/* Enhanced Image Gallery */}
            {galleryImages.length > 0 && (
              <Card className="p-6 bg-white/90 backdrop-blur-sm border-white/20 shadow-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                  {nft.listing_type === 'bundle' ? 'Bundle Items' : 'Gallery'} ({galleryImages.length})
                </h4>
                <div className="grid grid-cols-4 gap-3">
                  {galleryImages.map((img, index) => {
                    // For bundle, use direct index. For single, add 1 to skip main image
                    const actualIndex = nft.listing_type === 'bundle' ? index : index + 1
                    const isSelected = selectedImageIndex === actualIndex
                    
                    return (
                      <Card 
                        key={index}
                        className={`overflow-hidden cursor-pointer border-2 transition-all duration-200 hover:scale-105 ${
                          isSelected 
                            ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' 
                            : 'border-transparent hover:border-gray-300 bg-white/80'
                        }`}
                        onClick={() => setSelectedImageIndex(actualIndex)}
                      >
                        <div className="aspect-square relative">
                          <Image
                            src={img.url}
                            alt={img.name}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                          {/* Always show token ID for all gallery images */}
                          {img.token_id && (
                            <div className="absolute bottom-1 left-1 bg-black/70 text-white px-1 py-0.5 rounded text-xs font-mono">
                              #{img.token_id}
                            </div>
                          )}
                          {/* Show image number for better identification */}
                          <div className="absolute top-1 right-1 bg-blue-500/90 text-white px-1 py-0.5 rounded text-xs font-medium">
                            {index + 1}
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </Card>
            )}
          </div>

          {/* Enhanced Details Section */}
          <div className="space-y-6">
            {/* Enhanced Header */}
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-white/20 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="bg-gray-100 text-gray-800 px-3 py-1">
                  {nft.collection}
                </Badge>
                {nft.listing_type === 'bundle' && (
                  <Badge variant="outline" className="flex items-center gap-1 border-purple-200 text-purple-700 bg-purple-50">
                    <Package className="w-3 h-3" />
                    Bundle
                  </Badge>
                )}
                {isOwner && (
                  <Badge className="bg-green-500 hover:bg-green-600">
                    <Shield className="w-3 h-3 mr-1" />
                    Your Listing
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {nft.name}
              </h1>
              <p className="text-gray-600 leading-relaxed">{nft.description}</p>
            </Card>

            {/* Enhanced Price Section */}
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-white/20 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Current Price</p>
                  <p className="text-3xl font-bold text-gray-900">{nft.price}</p>
                  {nft.usdPrice && (
                    <p className="text-sm text-gray-500 mt-1">{nft.usdPrice}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setLiked(!liked)} className="bg-white hover:bg-gray-50">
                    <Heart className={`w-4 h-4 ${liked ? 'fill-current text-red-500' : ''}`} />
                  </Button>
                  <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                {isOwner ? (
                  // Enhanced Owner actions
                  <div className="flex gap-3">
                    <Dialog open={showEditPrice} onOpenChange={setShowEditPrice}>
                      <DialogTrigger asChild>
                        <Button 
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                          disabled={isUpdatingPrice || isCanceling}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Price
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white/95 backdrop-blur-sm">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-semibold">Update Price</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">
                              New {nft.listing_type === 'bundle' ? 'Bundle ' : ''}Price (ROSE)
                            </label>
                            <Input
                              type="number"
                              value={newPrice}
                              onChange={(e) => setNewPrice(e.target.value)}
                              placeholder={`Enter new ${nft.listing_type === 'bundle' ? 'bundle ' : ''}price in ROSE`}
                              step="0.01"
                              min="0"
                              className="bg-white border-gray-200"
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button 
                              onClick={handleUpdatePrice} 
                              disabled={isUpdatingPrice || !newPrice}
                              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            >
                              {isUpdatingPrice ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <DollarSign className="w-4 h-4 mr-2" />
                              )}
                              Update {nft.listing_type === 'bundle' ? 'Bundle ' : ''}Price
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setShowEditPrice(false)}
                              disabled={isUpdatingPrice}
                              className="bg-white hover:bg-gray-50"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      variant="destructive" 
                      onClick={handleCancelListing}
                      disabled={isCanceling || isUpdatingPrice}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      {isCanceling ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <X className="w-4 h-4 mr-2" />
                      )}
                      Cancel {nft.listing_type === 'bundle' ? 'Collection' : 'Listing'}
                    </Button>
                  </div>
                ) : (
                  // Enhanced Buyer actions
                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-4 text-lg" 
                      onClick={handleBuyNFT}
                      disabled={isBuying || !isConnected}
                    >
                      {isBuying ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <Zap className="w-5 h-5 mr-2" />
                      )}
                      {!isConnected 
                        ? 'Connect Wallet to Buy' 
                        : nft.listing_type === 'bundle' 
                          ? 'Buy Collection Bundle' 
                          : 'Buy NFT'
                      }
                    </Button>
                    <Button variant="outline" className="w-full bg-white hover:bg-gray-50" size="lg" disabled>
                      <Activity className="w-4 h-4 mr-2" />
                      Make Offer (Coming Soon)
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Enhanced Details Tabs */}
            <Card className="bg-white/90 backdrop-blur-sm border-white/20 shadow-lg">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg m-4 mb-0">
                  <TabsTrigger value="details" className="rounded-md">Details</TabsTrigger>
                  <TabsTrigger value="properties" className="rounded-md">Properties</TabsTrigger>
                  {nft.listing_type === 'bundle' && (
                    <TabsTrigger value="items" className="rounded-md">Items</TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="details" className="p-6 pt-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">Contract Address</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm bg-white px-2 py-1 rounded border">{formatAddress(nft.nft_contract_address)}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copyToClipboard(nft.nft_contract_address, 'Contract Address')}
                          className="h-8 w-8 p-0"
                        >
                          {copied === 'Contract Address' ? <CheckCheck className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">Listing Type</span>
                      <Badge variant={nft.listing_type === 'bundle' ? 'default' : 'secondary'} className="text-sm">
                        {nft.listing_type === 'bundle' ? 'Collection Bundle' : 'Single NFT'}
                      </Badge>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">Token ID{nft.listing_type === 'bundle' ? 's' : ''}</span>
                      <div className="text-right">
                        {nft.listing_type === 'single' ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold bg-white px-3 py-1 rounded border">
                              {nft.token_ids[0]}
                            </span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => copyToClipboard(nft.token_ids[0], 'Token ID')}
                              className="h-8 w-8 p-0"
                            >
                              {copied === 'Token ID' ? <CheckCheck className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {nft.token_ids.slice(0, 3).map((tokenId, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <span className="font-mono text-sm font-bold bg-white px-3 py-1 rounded border">
                                  {tokenId}
                                </span>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => copyToClipboard(tokenId, `Token ID ${index + 1}`)}
                                  className="h-8 w-8 p-0"
                                >
                                  {copied === `Token ID ${index + 1}` ? <CheckCheck className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                                </Button>
                              </div>
                            ))}
                            {nft.token_ids.length > 3 && (
                              <p className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
                                +{nft.token_ids.length - 3} more tokens
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">Seller</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm bg-white px-2 py-1 rounded border">{formatAddress(nft.seller_address)}</span>
                        {isOwner && <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">You</Badge>}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copyToClipboard(nft.seller_address, 'Seller Address')}
                          className="h-8 w-8 p-0"
                        >
                          {copied === 'Seller Address' ? <CheckCheck className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">Listed Date</span>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">{new Date(nft.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="properties" className="p-6 pt-4">
                  {nft.metadata?.metadata?.attributes && nft.metadata.metadata.attributes.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {nft.metadata.metadata.attributes.map((attr: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4 bg-gradient-to-br from-gray-50 to-white hover:shadow-md transition-shadow">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                            {attr.trait_type}
                          </p>
                          <p className="font-semibold text-gray-900">{attr.value}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Info className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No properties available</p>
                      <p className="text-gray-400 text-sm mt-1">This NFT doesn't have any metadata attributes</p>
                    </div>
                  )}
                </TabsContent>

                {nft.listing_type === 'bundle' && (
                  <TabsContent value="items" className="p-6 pt-4">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                        <Package className="w-5 h-5 text-purple-600" />
                        Items in this collection bundle ({nft.bundle_count})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {nft.nft_individual.map((item, index) => (
                          <div key={index} className="border rounded-xl p-4 flex items-center gap-4 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all duration-200">
                            <div className="w-16 h-16 relative rounded-lg overflow-hidden border-2 border-gray-200">
                              <Image
                                src={item.metadata?.image || item.metadata?.metadata?.image || '/placeholder.svg'}
                                alt={item.metadata?.name || `NFT #${item.token_id}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">
                                {item.metadata?.name || item.metadata?.metadata?.name || `NFT #${item.token_id}`}
                              </h4>
                              <p className="text-sm text-gray-500 font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block">
                                Token ID: {item.token_id}
                              </p>
                              {item.metadata?.metadata?.description && (
                                <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                                  {item.metadata.metadata.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </Card>
          </div>
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