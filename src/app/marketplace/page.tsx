/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Search, Filter, Grid3X3, List, Heart, Eye, Star, Package, RefreshCw, Edit, X, DollarSign, ChevronLeft, ChevronRight, ExternalLink, CheckCircle, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { MarketplaceNFT } from "@/types/marketplace"
import { fetchMarketplaceListings, getCollections, MarketplaceFilters } from "@/services/marketplace"

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

export default function MarketplacePage() {
  const { address, isConnected } = useAccount()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [nfts, setNfts] = useState<MarketplaceNFT[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [collections, setCollections] = useState<string[]>([])
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 20
  })
  const [rosePrice, setRosePrice] = useState<number | null>(null)
  
  // Transaction toast state
  const [transactionToast, setTransactionToast] = useState({
    isVisible: false,
    txHash: '',
    message: ''
  })
  
  // Filter states
  const [filters, setFilters] = useState<MarketplaceFilters>({
    page: 1,
    limit: 20,
    sortBy: 'created_at',
    sortOrder: 'DESC'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [selectedListingTypes, setSelectedListingTypes] = useState<string[]>([])

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

  // Check if user is owner of NFT
  const isOwner = (nft: MarketplaceNFT) => {
    return isConnected && address && address.toLowerCase() === nft.seller_address?.toLowerCase()
  }

  // Fetch marketplace data
  const fetchData = async (newFilters: MarketplaceFilters = filters) => {
    setLoading(true)
    setError(null)
    
    try {
      // Ensure we always have limit = 20 for consistent pagination
      const filtersWithLimit = {
        ...newFilters,
        limit: 20
      }
      
      const response = await fetchMarketplaceListings(filtersWithLimit)
      setNfts(response.data)
      setPagination(response.pagination)
      setRosePrice(response.rose_price_usd)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch marketplace data')
      console.error('❌ Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch collections for filter
  const fetchCollections = async () => {
    try {
      const cols = await getCollections()
      setCollections(cols)
    } catch (err) {
      console.error('❌ Error fetching collections:', err)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchData()
    fetchCollections()
  }, [])

  // Apply filters
  const applyFilters = () => {
    const newFilters: MarketplaceFilters = {
      ...filters,
      page: 1, // Reset to first page when filtering
      limit: 20, // Ensure 20 items per page
      search: searchTerm || undefined,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 1000 ? priceRange[1] : undefined,
      collection: selectedCollections.length > 0 ? selectedCollections[0] : undefined,
      listingType: selectedListingTypes.length === 1 ? selectedListingTypes[0] as 'single' | 'bundle' : undefined
    }
    
    setFilters(newFilters)
    fetchData(newFilters)
  }

  // Handle sort change
  const handleSortChange = (value: string) => {
    const newFilters = { 
      ...filters, 
      sortBy: value as any, 
      page: 1, // Reset to first page when sorting
      limit: 20 
    }
    setFilters(newFilters)
    fetchData(newFilters)
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    // Validate page number
    if (page < 1 || page > pagination.total_pages) {
      console.warn('❌ Invalid page number:', page)
      return
    }
    
    const newFilters = { 
      ...filters, 
      page,
      limit: 20 
    }
    
    setFilters(newFilters)
    fetchData(newFilters)
    
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const totalPages = pagination.total_pages
    const currentPage = pagination.current_page
    
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)
      
      if (currentPage > 4) {
        pages.push('...')
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i)
        }
      }
      
      if (currentPage < totalPages - 3) {
        pages.push('...')
      }
      
      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "Uncommon":
        return "bg-green-100 text-green-800 border-green-200"
      case "Rare":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Epic":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "Legendary":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Mythic":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <Card className="p-8 max-w-md mx-4 border-red-200 bg-red-50">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-4 text-red-800">Error Loading Marketplace</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <Button onClick={() => fetchData()} className="gap-2 bg-red-600 hover:bg-red-700">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NFT Marketplace
              </h1>
              <p className="text-gray-600 text-lg">Discover and collect extraordinary digital assets</p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {rosePrice && (
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                    💎 ROSE: ${rosePrice.toFixed(4)} USD
                  </div>
                )}
                {isConnected && address && (
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-mono text-xs">
                    🔗 {address.slice(0, 6)}...{address.slice(-4)}
                  </div>
                )}
                <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                  📊 {pagination.total_items} Items Available
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-lg border border-gray-200 p-1 flex">
                <Button 
                  variant={viewMode === "grid" ? "default" : "ghost"} 
                  size="sm" 
                  onClick={() => setViewMode("grid")}
                  className="rounded-md"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button 
                  variant={viewMode === "list" ? "default" : "ghost"} 
                  size="sm" 
                  onClick={() => setViewMode("list")}
                  className="rounded-md"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <Button 
                onClick={() => fetchData(filters)} 
                size="sm" 
                variant="outline" 
                className="gap-2 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Filters Sidebar */}
          <div className="lg:w-80 space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-white/20 shadow-lg">
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-6 flex items-center gap-2 text-gray-800">
                  <Filter className="w-5 h-5 text-blue-600" />
                  Filters & Search
                </h3>

                <div className="space-y-6">
                  {/* Enhanced Search */}
                  <div>
                    <label className="text-sm font-medium mb-3 block text-gray-700">Search NFTs</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input 
                        placeholder="Search by name, collection..." 
                        className="pl-10 bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-400" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                      />
                    </div>
                  </div>

                  {/* Enhanced Listing Type */}
                  <div>
                    <label className="text-sm font-medium mb-3 block text-gray-700">Listing Type</label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <Checkbox 
                          id="single" 
                          checked={selectedListingTypes.includes('single')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedListingTypes([...selectedListingTypes, 'single'])
                            } else {
                              setSelectedListingTypes(selectedListingTypes.filter(t => t !== 'single'))
                            }
                          }}
                        />
                        <label htmlFor="single" className="text-sm font-medium cursor-pointer">Single NFT</label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <Checkbox 
                          id="bundle" 
                          checked={selectedListingTypes.includes('bundle')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedListingTypes([...selectedListingTypes, 'bundle'])
                            } else {
                              setSelectedListingTypes(selectedListingTypes.filter(t => t !== 'bundle'))
                            }
                          }}
                        />
                        <label htmlFor="bundle" className="text-sm font-medium cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-purple-600" />
                            Collection Bundle
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Price Range */}
                  <div>
                    <label className="text-sm font-medium mb-3 block text-gray-700">Price Range (ROSE)</label>
                    <div className="px-2">
                      <Slider 
                        value={priceRange} 
                        onValueChange={setPriceRange} 
                        max={1000} 
                        step={1} 
                        className="mb-4" 
                      />
                      <div className="flex justify-between text-sm text-gray-600 bg-gray-100 rounded-lg p-2">
                        <span className="font-medium">{priceRange[0]} ROSE</span>
                        <span className="font-medium">{priceRange[1]} ROSE</span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Collections */}
                  {collections.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-3 block text-gray-700">Collections</label>
                      <div className="space-y-2 max-h-40 overflow-y-auto bg-gray-50 rounded-lg p-3">
                        {collections.map((collection) => (
                          <div key={collection} className="flex items-center space-x-3 p-2 rounded-md hover:bg-white transition-colors">
                            <Checkbox 
                              id={`collection-${collection}`}
                              checked={selectedCollections.includes(collection)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedCollections([collection])
                                } else {
                                  setSelectedCollections([])
                                }
                              }}
                            />
                            <label htmlFor={`collection-${collection}`} className="text-sm truncate cursor-pointer font-medium">
                              {collection}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={applyFilters} 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Enhanced Sort and Results */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <p className="text-gray-800 font-medium">
                    Showing {((pagination.current_page - 1) * pagination.items_per_page) + 1} - {Math.min(pagination.current_page * pagination.items_per_page, pagination.total_items)} of {pagination.total_items} results
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Page {pagination.current_page} of {pagination.total_pages}</span>
                    {loading && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading...</span>
                      </div>
                    )}
                  </div>
                </div>
                <Select value={filters.sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-56 bg-white border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">📅 Recently Listed</SelectItem>
                    <SelectItem value="price">💰 Price: Low to High</SelectItem>
                    <SelectItem value="name">🔤 Name: A to Z</SelectItem>
                    <SelectItem value="listing_id">🆔 Listing ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(20)].map((_, i) => (
                  <Card key={i} className="overflow-hidden animate-pulse bg-white/80 border-white/20">
                    <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2" />
                      <div className="h-6 bg-gray-200 rounded mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Enhanced NFT Grid */}
            {!loading && (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                }`}
              >
                {nfts.map((nft) => {
                  const isOwnerOfNft = isOwner(nft)
                  
                  return (
                    <Card key={nft.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 group bg-white/90 backdrop-blur-sm border-white/20 hover:scale-[1.02]">
                      <Link href={`/marketplace/${nft.id}`}>
                        <div
                          className={`${viewMode === "grid" ? "aspect-square" : "aspect-video md:aspect-square"} relative overflow-hidden`}
                        >
                          <Image
                            src={nft.image || "/placeholder.svg"}
                            alt={nft.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          {/* Enhanced Overlays */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                          
                          {/* Top Right Badges */}
                          <div className="absolute top-3 right-3 flex flex-col gap-2">
                            {nft.bundle_count && nft.bundle_count > 1 && (
                              <div className="bg-blue-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs flex items-center gap-1 shadow-lg">
                                <Package className="w-3 h-3" />
                                {nft.bundle_count}
                              </div>
                            )}
                            <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs flex items-center gap-1 shadow-lg">
                              <Eye className="w-3 h-3" />
                              {nft.views_count || nft.views || 0}
                            </div>
                            <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs flex items-center gap-1 shadow-lg">
                              <Heart className="w-3 h-3" />
                              {nft.love_count || nft.likes || 0}
                            </div>
                          </div>

                          {/* Top Left Badge for Bundle */}
                          {nft.listing_type === 'bundle' && (
                            <div className="absolute top-3 left-3 bg-purple-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs flex items-center gap-1 shadow-lg">
                              <Package className="w-3 h-3" />
                              Bundle
                            </div>
                          )}

                          {/* Owner Badge */}
                          {isOwnerOfNft && (
                            <div className="absolute bottom-3 right-3 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs shadow-lg">
                              Your Listing
                            </div>
                          )}

                          {/* Rarity Badge */}
                          <Badge className={`absolute bottom-3 left-3 ${getRarityColor(nft.rarity || 'Common')} shadow-lg border`}>
                            {nft.rarity || 'Common'}
                          </Badge>
                        </div>
                      </Link>
                      
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-sm text-gray-600 truncate font-medium">{nft.collection}</div>
                          {nft.verified && <Star className="w-4 h-4 text-blue-500 fill-current" />}
                          {isOwnerOfNft && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              Yours
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="font-bold text-lg mb-3 truncate text-gray-800">{nft.name}</h3>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Current Price</div>
                            <div className="font-bold text-lg text-gray-900">{nft.price}</div>
                            {nft.usdPrice && (
                              <div className="text-xs text-gray-500">{nft.usdPrice}</div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Type</div>
                            <div className="text-sm font-medium capitalize text-gray-700">{nft.listing_type}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Heart className="w-4 h-4" />
                            <span className="font-medium">{nft.likes || 0}</span>
                          </div>
                          <div className="flex gap-2 flex-1 ml-4">
                            {isOwnerOfNft ? (
                              <Button size="sm" variant="outline" className="flex-1 hover:bg-gray-50" asChild>
                                <Link href={`/marketplace/${nft.id}`}>
                                  <Edit className="w-3 h-3 mr-1" />
                                  Manage
                                </Link>
                              </Button>
                            ) : (
                              <Button 
                                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" 
                                size="sm"
                                asChild
                                disabled={!isConnected}
                              >
                                <Link href={`/marketplace/${nft.id}`}>
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  {nft.listing_type === 'bundle' ? 'View Bundle' : 'Buy Now'}
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {!isConnected && !isOwnerOfNft && (
                          <p className="text-xs text-gray-500 mt-3 text-center bg-gray-50 rounded-lg py-2">
                            Connect wallet to purchase
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Enhanced Empty State */}
            {!loading && nfts.length === 0 && (
              <div className="text-center py-16">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-12 max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No NFTs Found</h3>
                  <p className="text-gray-600 mb-6">No NFTs match your current search criteria</p>
                  <Button 
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedCollections([])
                      setSelectedListingTypes([])
                      setPriceRange([0, 1000])
                      const resetFilters = { page: 1, limit: 20, sortBy: 'created_at' as const, sortOrder: 'DESC' as const }
                      setFilters(resetFilters)
                      fetchData(resetFilters)
                    }} 
                    variant="outline" 
                    className="bg-white hover:bg-gray-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}

            {/* Enhanced Pagination */}
            {!loading && pagination.total_pages > 1 && (
              <div className="mt-12 space-y-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6">
                  {/* Pagination Info */}
                  <div className="text-center text-sm text-gray-600 mb-6">
                    <span className="font-medium">
                      Showing {((pagination.current_page - 1) * 20) + 1} - {Math.min(pagination.current_page * 20, pagination.total_items)} of {pagination.total_items} NFTs
                    </span>
                  </div>
                  
                  {/* Pagination Controls */}
                  <div className="flex justify-center items-center gap-3 flex-wrap">
                    {/* Previous Button */}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                      disabled={pagination.current_page <= 1}
                      className="gap-2 bg-white hover:bg-gray-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    
                    {/* Page Numbers */}
                    <div className="flex gap-2">
                      {getPageNumbers().map((pageNum, index) => (
                        <div key={index}>
                          {pageNum === '...' ? (
                            <span className="px-4 py-2 text-gray-400">...</span>
                          ) : (
                            <Button
                              variant={pagination.current_page === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum as number)}
                              className={`min-w-[44px] ${
                                pagination.current_page === pageNum 
                                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                                  : 'bg-white hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Next Button */}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                      disabled={pagination.current_page >= pagination.total_pages}
                      className="gap-2 bg-white hover:bg-gray-50"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Jump to Page */}
                  {pagination.total_pages > 10 && (
                    <div className="flex justify-center items-center gap-3 text-sm mt-6 pt-6 border-t border-gray-200">
                      <span className="text-gray-600 font-medium">Jump to page:</span>
                      <Input
                        type="number"
                        min={1}
                        max={pagination.total_pages}
                        placeholder="Page"
                        className="w-24 h-9 text-center bg-white border-gray-200"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const page = parseInt((e.target as HTMLInputElement).value)
                            if (page >= 1 && page <= pagination.total_pages) {
                              handlePageChange(page)
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
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

