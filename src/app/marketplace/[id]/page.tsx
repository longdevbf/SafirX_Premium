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
  Loader2
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { fetchNFTDetails, DetailedNFT } from "@/services/marketplace"
import { useNFTMarketplace } from "@/hooks/use-market"
import { toast } from "react-hot-toast"
import { parseEther } from "viem"

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
        toast.success(
          nft.listing_type === 'bundle' 
            ? 'Collection bundle purchased successfully!' 
            : 'NFT purchased successfully!', 
          { id: 'buy-nft' }
        )
        // Refresh page after successful purchase
        setTimeout(() => {
          window.location.reload()
        }, 2000)
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
        toast.success(
          nft.listing_type === 'bundle' 
            ? 'Collection canceled successfully!' 
            : 'Listing canceled successfully!', 
          { id: 'cancel-listing' }
        )
        // Redirect back to marketplace after successful cancellation
        setTimeout(() => {
          router.push('/marketplace')
        }, 2000)
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
        toast.success(
          nft.listing_type === 'bundle' 
            ? 'Bundle price updated successfully!' 
            : 'Price updated successfully!', 
          { id: 'update-price' }
        )
        setShowEditPrice(false)
        // Refresh page to show new price
        setTimeout(() => {
          window.location.reload()
        }, 2000)
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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-lg" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
                <div className="h-20 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !nft) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md mx-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Error Loading NFT</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <Card className="overflow-hidden">
              <div className="aspect-square relative">
                <Image
                  src={currentImage.url}
                  alt={currentImage.name}
                  fill
                  className="object-cover"
                  priority
                />
                {nft.listing_type === 'bundle' && (
                  <div className="absolute top-4 left-4 bg-purple-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Bundle ({nft.bundle_count} NFTs)
                  </div>
                )}
                {currentImage.token_id && (
                  <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-mono">
                    Token ID: {currentImage.token_id}
                  </div>
                )}
                {isOwner && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                    Your Listing
                  </div>
                )}
              </div>
            </Card>

            {/* Image Gallery - Only show if there are multiple images */}
            {galleryImages.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                  {nft.listing_type === 'bundle' ? 'Bundle Items' : 'Gallery'} ({galleryImages.length})
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {galleryImages.map((img, index) => {
                    // For bundle, use direct index. For single, add 1 to skip main image
                    const actualIndex = nft.listing_type === 'bundle' ? index : index + 1
                    const isSelected = selectedImageIndex === actualIndex
                    
                    return (
                      <Card 
                        key={index}
                        className={`overflow-hidden cursor-pointer border-2 transition-colors ${
                          isSelected ? 'border-primary' : 'border-transparent hover:border-gray-300'
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
                          <div className="absolute top-1 right-1 bg-black/70 text-white px-1 py-0.5 rounded text-xs">
                            {index + 1}
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{nft.collection}</Badge>
                {nft.listing_type === 'bundle' && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    Bundle
                  </Badge>
                )}
                {isOwner && (
                  <Badge variant="default" className="bg-green-500">
                    Your Listing
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">{nft.name}</h1>
              <p className="text-muted-foreground">{nft.description}</p>
            </div>

            {/* Price Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Price</p>
                  <p className="text-2xl font-bold">{nft.price}</p>
                  {nft.usdPrice && (
                    <p className="text-sm text-muted-foreground">{nft.usdPrice}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setLiked(!liked)}>
                    <Heart className={`w-4 h-4 ${liked ? 'fill-current text-red-500' : ''}`} />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                {isOwner ? (
                  // Owner actions
                  <div className="flex gap-2">
                    <Dialog open={showEditPrice} onOpenChange={setShowEditPrice}>
                      <DialogTrigger asChild>
                        <Button className="flex-1" variant="outline" disabled={isUpdatingPrice || isCanceling}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Price
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Price</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">
                              New {nft.listing_type === 'bundle' ? 'Bundle ' : ''}Price (ROSE)
                            </label>
                            <Input
                              type="number"
                              value={newPrice}
                              onChange={(e) => setNewPrice(e.target.value)}
                              placeholder={`Enter new ${nft.listing_type === 'bundle' ? 'bundle ' : ''}price in ROSE`}
                              step="0.01"
                              min="0"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={handleUpdatePrice} 
                              disabled={isUpdatingPrice || !newPrice}
                              className="flex-1"
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
                      className="flex-1"
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
                  // Buyer actions
                  <div className="space-y-3">
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleBuyNFT}
                      disabled={isBuying || !isConnected}
                    >
                      {isBuying ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <DollarSign className="w-4 h-4 mr-2" />
                      )}
                      {!isConnected 
                        ? 'Connect Wallet to Buy' 
                        : nft.listing_type === 'bundle' 
                          ? 'Buy Collection Bundle' 
                          : 'Buy NFT'
                      }
                    </Button>
                    <Button variant="outline" className="w-full" size="lg" disabled>
                      Make Offer (Coming Soon)
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Details Tabs */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="properties">Properties</TabsTrigger>
                {nft.listing_type === 'bundle' && (
                  <TabsTrigger value="items">Items</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contract Address</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{formatAddress(nft.nft_contract_address)}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copyToClipboard(nft.nft_contract_address, 'Contract Address')}
                        >
                          {copied === 'Contract Address' ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Listing Type</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={nft.listing_type === 'bundle' ? 'default' : 'secondary'}>
                          {nft.listing_type === 'bundle' ? 'Collection Bundle' : 'Single NFT'}
                        </Badge>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Token ID{nft.listing_type === 'bundle' ? 's' : ''}</span>
                      <div className="text-right">
                        {nft.listing_type === 'single' ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold bg-gray-100 px-2 py-1 rounded">
                              {nft.token_ids[0]}
                            </span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => copyToClipboard(nft.token_ids[0], 'Token ID')}
                            >
                              {copied === 'Token ID' ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {nft.token_ids.slice(0, 3).map((tokenId, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <span className="font-mono text-sm font-bold bg-gray-100 px-2 py-1 rounded">
                                  {tokenId}
                                </span>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => copyToClipboard(tokenId, `Token ID ${index + 1}`)}
                                >
                                  {copied === `Token ID ${index + 1}` ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                </Button>
                              </div>
                            ))}
                            {nft.token_ids.length > 3 && (
                              <p className="text-xs text-muted-foreground">
                                +{nft.token_ids.length - 3} more tokens
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Seller</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{formatAddress(nft.seller_address)}</span>
                        {isOwner && <span className="text-xs text-green-600">(You)</span>}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copyToClipboard(nft.seller_address, 'Seller Address')}
                        >
                          {copied === 'Seller Address' ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Listed Date</span>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(nft.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="properties" className="space-y-4">
                <Card className="p-6">
                  {nft.metadata?.metadata?.attributes && nft.metadata.metadata.attributes.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {nft.metadata.metadata.attributes.map((attr: any, index: number) => (
                        <div key={index} className="border rounded-lg p-3">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">
                            {attr.trait_type}
                          </p>
                          <p className="font-semibold">{attr.value}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Info className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No properties available</p>
                    </div>
                  )}
                </Card>
              </TabsContent>

              {nft.listing_type === 'bundle' && (
                <TabsContent value="items" className="space-y-4">
                  <Card className="p-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Items in this collection bundle ({nft.bundle_count})</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {nft.nft_individual.map((item, index) => (
                          <div key={index} className="border rounded-lg p-4 flex items-center gap-4">
                            <div className="w-16 h-16 relative rounded-lg overflow-hidden">
                              <Image
                                src={item.metadata?.image || item.metadata?.metadata?.image || '/placeholder.svg'}
                                alt={item.metadata?.name || `NFT #${item.token_id}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">
                                {item.metadata?.name || item.metadata?.metadata?.name || `NFT #${item.token_id}`}
                              </h4>
                              <p className="text-sm text-muted-foreground font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                                <strong>Token ID: {item.token_id}</strong>
                              </p>
                              {item.metadata?.metadata?.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {item.metadata.metadata.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}