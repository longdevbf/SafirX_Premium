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
import { Search, Filter, Grid3X3, List, Heart, Clock, Eye, Star, Package, RefreshCw, Edit, X, DollarSign } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { MarketplaceNFT } from "@/types/marketplace"
import { fetchMarketplaceListings, getCollections, MarketplaceFilters } from "@/services/marketplace"

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

  // Check if user is owner of NFT
  const isOwner = (nft: MarketplaceNFT) => {
    return isConnected && address && address.toLowerCase() === nft.seller_address?.toLowerCase()
  }

  // Fetch marketplace data
  const fetchData = async (newFilters: MarketplaceFilters = filters) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetchMarketplaceListings(newFilters)
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
    const newFilters = { ...filters, sortBy: value as any, page: 1 }
    setFilters(newFilters)
    fetchData(newFilters)
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page }
    setFilters(newFilters)
    fetchData(newFilters)
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "bg-gray-100 text-gray-800"
      case "Uncommon":
        return "bg-green-100 text-green-800"
      case "Rare":
        return "bg-blue-100 text-blue-800"
      case "Epic":
        return "bg-purple-100 text-purple-800"
      case "Legendary":
        return "bg-orange-100 text-orange-800"
      case "Mythic":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md mx-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Error Loading Marketplace</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => fetchData()} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
            <p className="text-muted-foreground">Discover and collect extraordinary NFTs</p>
            {rosePrice && (
              <p className="text-sm text-muted-foreground mt-1">
                Current ROSE price: ${rosePrice.toFixed(4)} USD
              </p>
            )}
            {isConnected && address && (
              <p className="text-sm text-blue-600 mt-1">
                Connected: {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              <List className="w-4 h-4" />
            </Button>
            <Button onClick={() => fetchData(filters)} size="sm" variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </h3>

              <div className="space-y-4">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      placeholder="Search NFTs..." 
                      className="pl-10" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                    />
                  </div>
                </div>

                {/* Listing Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Listing Type</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
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
                      <label htmlFor="single" className="text-sm">Single NFT</label>
                    </div>
                    <div className="flex items-center space-x-2">
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
                      <label htmlFor="bundle" className="text-sm">
                        <div className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          Bundle
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Price Range (ROSE)</label>
                  <Slider 
                    value={priceRange} 
                    onValueChange={setPriceRange} 
                    max={1000} 
                    step={1} 
                    className="mb-2" 
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{priceRange[0]} ROSE</span>
                    <span>{priceRange[1]} ROSE</span>
                  </div>
                </div>

                {/* Collections */}
                {collections.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Collections</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {collections.map((collection) => (
                        <div key={collection} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`collection-${collection}`}
                            checked={selectedCollections.includes(collection)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCollections([collection]) // Only allow one collection for now
                              } else {
                                setSelectedCollections([])
                              }
                            }}
                          />
                          <label htmlFor={`collection-${collection}`} className="text-sm truncate">
                            {collection}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={applyFilters} className="w-full">
                  Apply Filters
                </Button>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort and Results */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <p className="text-muted-foreground">
                Showing {pagination.total_items} results
                {loading && <span className="ml-2">Loading...</span>}
              </p>
              <Select value={filters.sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Recently Listed</SelectItem>
                  <SelectItem value="price">Price: Low to High</SelectItem>
                  <SelectItem value="name">Name: A to Z</SelectItem>
                  <SelectItem value="listing_id">Listing ID</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-200" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2" />
                      <div className="h-6 bg-gray-200 rounded mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* NFT Grid */}
            {!loading && (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                }`}
              >
                {nfts.map((nft) => {
                  const isOwnerOfNft = isOwner(nft)
                  
                  return (
                    <Card key={nft.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                      <Link href={`/marketplace/${nft.id}`}>
                        <div
                          className={`${viewMode === "grid" ? "aspect-square" : "aspect-video md:aspect-square"} relative`}
                        >
                          <Image
                            src={nft.image || "/placeholder.svg"}
                            alt={nft.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute top-3 right-3 flex flex-col gap-2">
                            {nft.bundle_count && nft.bundle_count > 1 && (
                              <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                {nft.bundle_count}
                              </div>
                            )}
                            <div className="bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {nft.views || 0}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="bg-black/70 text-white hover:bg-black/80 w-8 h-8 p-0 rounded-full"
                            >
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>
                          {nft.listing_type === 'bundle' && (
                            <div className="absolute top-3 left-3 bg-purple-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              Bundle
                            </div>
                          )}
                          {isOwnerOfNft && (
                            <div className="absolute bottom-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                              Your Listing
                            </div>
                          )}
                          <Badge className={`absolute bottom-3 left-3 ${getRarityColor(nft.rarity || 'Common')}`}>
                            {nft.rarity || 'Common'}
                          </Badge>
                        </div>
                      </Link>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-sm text-muted-foreground truncate">{nft.collection}</div>
                          {nft.verified && <Star className="w-3 h-3 text-blue-500 fill-current" />}
                          {isOwnerOfNft && <Badge variant="outline" className="text-xs bg-green-50">Yours</Badge>}
                        </div>
                        <h3 className="font-semibold mb-2 truncate">{nft.name}</h3>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-sm text-muted-foreground">Current Price</div>
                            <div className="font-bold">{nft.price}</div>
                            {nft.usdPrice && (
                              <div className="text-xs text-muted-foreground">{nft.usdPrice}</div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Type</div>
                            <div className="text-sm capitalize">{nft.listing_type}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Heart className="w-3 h-3" />
                            {nft.likes || 0}
                          </div>
                          <div className="flex gap-2 flex-1 ml-4">
                            {isOwnerOfNft ? (
                              <>
                                <Button size="sm" variant="outline" className="flex-1" asChild>
                                  <Link href={`/marketplace/${nft.id}`}>
                                    <Edit className="w-3 h-3 mr-1" />
                                    Manage
                                  </Link>
                                </Button>
                              </>
                            ) : (
                              <Button 
                                className="flex-1" 
                                variant="outline" 
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
                          <p className="text-xs text-muted-foreground mt-2 text-center">
                            Connect wallet to purchase
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Empty State */}
            {!loading && nfts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground">No NFTs found matching your criteria</div>
                <Button onClick={() => {
                  setSearchTerm('')
                  setSelectedCollections([])
                  setSelectedListingTypes([])
                  setPriceRange([0, 1000])
                  const resetFilters = { page: 1, limit: 20, sortBy: 'created_at' as const, sortOrder: 'DESC' as const }
                  setFilters(resetFilters)
                  fetchData(resetFilters)
                }} variant="outline" className="mt-4">
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {!loading && pagination.total_pages > 1 && (
              <div className="flex justify-center mt-12 gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page <= 1}
                >
                  Previous
                </Button>
                
                {[...Array(Math.min(5, pagination.total_pages))].map((_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      variant={pagination.current_page === page ? "default" : "outline"}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  )
                })}
                
                <Button 
                  variant="outline" 
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page >= pagination.total_pages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}