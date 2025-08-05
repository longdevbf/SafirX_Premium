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
<<<<<<< HEAD
import { Search, Filter, Grid3X3, List, Heart, Clock, Eye, Star, Package, RefreshCw, Edit, X, DollarSign } from "lucide-react"
=======
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Heart, 
  Clock, 
  Eye, 
  Star, 
  ChevronDown,
  ArrowDown,
  Sparkles,
  Crown,
  Gem,
  Shield,
  Award,
  Zap
} from "lucide-react"
>>>>>>> dfaf10def481ce1a5bfc7ec596f852b391690989
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

<<<<<<< HEAD
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
=======
  const nfts = [
    {
      id: 1,
      name: "Cosmic Ape #1234",
      collection: "Cosmic Apes",
      image: "/assets/cosmic_ape.jpeg",
      price: "3.2 ETH",
      usdPrice: "$6,240",
      lastSale: "2.8 ETH",
      timeLeft: "2h 15m",
      isAuction: true,
      views: 1234,
      likes: 89,
      verified: true,
      rarity: "Rare",
    },
    {
      id: 2,
      name: "Dream Walker #567",
      collection: "Digital Dreams",
      image: "/assets/digital_dream.jpg",
      price: "2.1 ETH",
      usdPrice: "$4,095",
      lastSale: "1.9 ETH",
      timeLeft: null,
      isAuction: false,
      views: 892,
      likes: 156,
      verified: true,
      rarity: "Common",
    },
    {
      id: 3,
      name: "Pixel Warrior #890",
      collection: "Pixel Warriors",
      image: "/assets/pixel_warrior.png",
      price: "1.5 ETH",
      usdPrice: "$2,925",
      lastSale: "1.2 ETH",
      timeLeft: "5h 42m",
      isAuction: true,
      views: 567,
      likes: 234,
      verified: false,
      rarity: "Epic",
    },
    {
      id: 4,
      name: "Cosmic Ape #5678",
      collection: "Cosmic Apes",
      image: "/assets/cosmic_apesss.webp",
      price: "4.1 ETH",
      usdPrice: "$7,995",
      lastSale: "3.5 ETH",
      timeLeft: null,
      isAuction: false,
      views: 2341,
      likes: 445,
      verified: true,
      rarity: "Legendary",
    },
    {
      id: 5,
      name: "Cyber Dog #123",
      collection: "Cyber Dogs",
      image: "/assets/dog_pixel.jpeg",
      price: "0.8 ETH",
      usdPrice: "$1,560",
      lastSale: "0.6 ETH",
      timeLeft: "1d 3h",
      isAuction: true,
      views: 445,
      likes: 67,
      verified: true,
      rarity: "Uncommon",
    },
    {
      id: 6,
      name: "Pixel King #456",
      collection: "Pixel Collection",
      image: "/assets/pixel_king.png",
      price: "5.2 ETH",
      usdPrice: "$10,140",
      lastSale: "4.8 ETH",
      timeLeft: null,
      isAuction: false,
      views: 1567,
      likes: 289,
      verified: false,
      rarity: "Mythic",
    },
    {
      id: 7,
      name: "Dream Walker #999",
      collection: "Digital Dreams",
      image: "/assets/dream_walker.jpg",
      price: "12.5 ETH",
      usdPrice: "$24,375",
      lastSale: "11.8 ETH",
      timeLeft: "3h 15m",
      isAuction: true,
      views: 3456,
      likes: 567,
      verified: true,
      rarity: "Legendary",
    },
    {
      id: 8,
      name: "Space Monkey #777",
      collection: "Space Monkeys",
      image: "/assets/monkey1.jpeg",
      price: "2.8 ETH",
      usdPrice: "$5,460",
      lastSale: "2.5 ETH",
      timeLeft: null,
      isAuction: false,
      views: 1890,
      likes: 234,
      verified: true,
      rarity: "Rare",
    },
  ]
>>>>>>> dfaf10def481ce1a5bfc7ec596f852b391690989

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800"
      case "Uncommon":
        return "bg-gradient-to-r from-green-100 to-green-200 text-green-800"
      case "Rare":
        return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800"
      case "Epic":
        return "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800"
      case "Legendary":
        return "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800"
      case "Mythic":
        return "bg-gradient-to-r from-red-100 to-red-200 text-red-800"
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800"
    }
  }

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return <Shield className="w-3 h-3" />
      case "Uncommon":
        return <Sparkles className="w-3 h-3" />
      case "Rare":
        return <Gem className="w-3 h-3" />
      case "Epic":
        return <Crown className="w-3 h-3" />
      case "Legendary":
        return <Award className="w-3 h-3" />
      case "Mythic":
        return <Zap className="w-3 h-3" />
      default:
        return <Shield className="w-3 h-3" />
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
    <div className="min-h-screen bg-white">
      <div className="w-full px-6 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 w-full">
          <div>
<<<<<<< HEAD
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
=======
            <h1 className="text-5xl font-bold mb-3 text-black">Explore Marketplace</h1>
            <p className="text-xl text-gray-600">Discover and collect extraordinary NFTs 🔍</p>
>>>>>>> dfaf10def481ce1a5bfc7ec596f852b391690989
          </div>
          <div className="flex items-center gap-3 justify-end">
            <Button 
              variant={viewMode === "grid" ? "default" : "outline"} 
              size="lg" 
              onClick={() => setViewMode("grid")}
              className="hover:shadow-md transition-all duration-300 rounded-xl px-4 py-2"
              title="Grid View"
            >
              <Grid3X3 className="w-5 h-5" />
            </Button>
            <Button 
              variant={viewMode === "list" ? "default" : "outline"} 
              size="lg" 
              onClick={() => setViewMode("list")}
              className="hover:shadow-md transition-all duration-300 rounded-xl px-4 py-2"
              title="List View"
            >
              <List className="w-5 h-5" />
            </Button>
            <Button onClick={() => fetchData(filters)} size="sm" variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
          {/* Filters Sidebar */}
          <aside className="bg-white shadow-md rounded-xl p-4">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-black">
              <Filter className="w-5 h-5 text-purple-600" />
              Filters
            </h3>

<<<<<<< HEAD
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
=======
            {/* Search */}
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold mb-3 block text-gray-900">Search</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input 
                    placeholder="Search NFTs..." 
                    className="pl-12 rounded-full border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent h-12 text-base" 
                  />
>>>>>>> dfaf10def481ce1a5bfc7ec596f852b391690989
                </div>
              </div>

<<<<<<< HEAD
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
=======
              {/* Status */}
              <div>
                <label className="text-sm font-semibold mb-3 block text-gray-900">Status</label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox id="buy-now" className="w-5 h-5" />
                    <label htmlFor="buy-now" className="text-base text-gray-700">
                      Buy Now
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox id="auction" className="w-5 h-5" />
                    <label htmlFor="auction" className="text-base text-gray-700">
                      On Auction
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox id="new" className="w-5 h-5" />
                    <label htmlFor="new" className="text-base text-gray-700">
                      New
                    </label>
                  </div>
                </div>
>>>>>>> dfaf10def481ce1a5bfc7ec596f852b391690989
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-semibold mb-3 block text-gray-900">Price Range (ETH)</label>
                <Slider 
                  value={priceRange} 
                  onValueChange={setPriceRange} 
                  max={100} 
                  step={1} 
                  className="mb-4" 
                />
                <div className="flex justify-between text-sm text-gray-600 font-medium">
                  <span>{priceRange[0]} ETH</span>
                  <span>{priceRange[1]} ETH</span>
                </div>
              </div>

              {/* Collections */}
              <div>
                <label className="text-sm font-semibold mb-3 block text-gray-900">Collections</label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox id="cosmic-apes" className="w-5 h-5" />
                    <label htmlFor="cosmic-apes" className="text-base text-gray-700">
                      Cosmic Apes
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox id="digital-dreams" className="w-5 h-5" />
                    <label htmlFor="digital-dreams" className="text-base text-gray-700">
                      Digital Dreams
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox id="pixel-warriors" className="w-5 h-5" />
                    <label htmlFor="pixel-warriors" className="text-base text-gray-700">
                      Pixel Warriors
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox id="bored-apes" className="w-5 h-5" />
                    <label htmlFor="bored-apes" className="text-base text-gray-700">
                      Bored Ape Yacht Club
                    </label>
                  </div>
                </div>
              </div>

              {/* Rarity */}
              <div>
                <label className="text-sm font-semibold mb-3 block text-gray-900">Rarity</label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox id="common" className="w-5 h-5" />
                    <label htmlFor="common" className="text-base text-gray-700">
                      Common
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox id="rare" className="w-5 h-5" />
                    <label htmlFor="rare" className="text-base text-gray-700">
                      Rare
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox id="epic" className="w-5 h-5" />
                    <label htmlFor="epic" className="text-base text-gray-700">
                      Epic
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox id="legendary" className="w-5 h-5" />
                    <label htmlFor="legendary" className="text-base text-gray-700">
                      Legendary
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="w-full">
            {/* Sort and Results */}
<<<<<<< HEAD
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
=======
            <div className="flex justify-between items-center py-4 mb-6">
              <p className="text-lg font-medium text-gray-900 flex items-center gap-2">
                🔎 Showing {nfts.length} results
              </p>
              <div className="flex items-center gap-4">
                <Select defaultValue="recent">
                  <SelectTrigger className="w-56 h-12 rounded-xl border-gray-200 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="recent">Recently Listed</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="most-liked">Most Liked</SelectItem>
                    <SelectItem value="ending-soon">Ending Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* NFT Grid */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {nfts.map((nft) => (
                  <Card 
                    key={nft.id} 
                    className="w-full overflow-hidden bg-white shadow-sm hover:shadow-lg border border-gray-100 hover:border-purple-200 transition-all duration-300 group hover:scale-102 rounded-xl"
                  >
                    <Link href={`/nft/${nft.id}`}>
                      <div className="aspect-square relative overflow-hidden">
                        <Image
                          src={nft.image || "/placeholder.svg"}
                          alt={nft.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          <div className="bg-white/80 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm">
                            <Eye className="w-3 h-3" />
                            {nft.views}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="bg-white/80 backdrop-blur-sm text-gray-900 hover:bg-white/90 hover:text-red-500 hover:scale-110 w-8 h-8 p-0 rounded-full shadow-sm transition-all duration-300"
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                        {nft.isAuction && nft.timeLeft && (
                          <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm">
                            <Clock className="w-3 h-3" />
                            {nft.timeLeft}
                          </div>
                        )}
                        <Badge className={`absolute bottom-3 left-3 ${getRarityColor(nft.rarity)} flex items-center gap-1 px-2 py-1 text-xs font-medium shadow-sm`}>
                          {getRarityIcon(nft.rarity)}
                          {nft.rarity}
                        </Badge>
                      </div>
                    </Link>
                    <CardContent className="p-5 bg-white">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-sm text-gray-500 font-medium">{nft.collection}</div>
                        {nft.verified && <Star className="w-4 h-4 text-blue-500 fill-current" />}
                      </div>
                      <h3 className="font-semibold mb-3 truncate text-gray-900 text-base">{nft.name}</h3>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Current Price</div>
                          <div className="font-bold text-gray-900 text-base">{nft.price}</div>
                          <div className="text-xs text-gray-400">{nft.usdPrice}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 mb-1">Last Sale</div>
                          <div className="text-sm text-gray-600">{nft.lastSale}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Heart className="w-4 h-4" />
                          <span className="font-medium">{nft.likes}</span>
                        </div>
                        <Button 
                          className={`flex-1 ml-4 transition-all duration-300 hover:scale-105 rounded-xl ${
                            nft.isAuction 
                              ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white' 
                              : 'bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white'
                          }`}
                          asChild
                        >
                          <Link href={`/nft/${nft.id}`}>{nft.isAuction ? "Place Bid" : "Buy Now"}</Link>
                        </Button>
                      </div>
>>>>>>> dfaf10def481ce1a5bfc7ec596f852b391690989
                    </CardContent>
                  </Card>
                ))}
              </div>
<<<<<<< HEAD
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
=======
            ) : (
              <div className="flex flex-col gap-6">
                {nfts.map((nft) => (
                  <Card 
                    key={nft.id} 
                    className="w-full overflow-hidden bg-white shadow-sm hover:shadow-lg border border-gray-100 hover:border-purple-200 transition-all duration-300 group rounded-xl"
                  >
                    <div className="flex flex-col md:flex-row">
                      <Link href={`/nft/${nft.id}`} className="md:w-64 flex-shrink-0">
                        <div className="aspect-square md:aspect-square relative overflow-hidden">
                          <Image
                            src={nft.image || "/placeholder.svg"}
                            alt={nft.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 right-3 flex flex-col gap-2">
                            <div className="bg-white/80 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm">
                              <Eye className="w-3 h-3" />
                              {nft.views}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="bg-white/80 backdrop-blur-sm text-gray-900 hover:bg-white/90 hover:text-red-500 hover:scale-110 w-8 h-8 p-0 rounded-full shadow-sm transition-all duration-300"
                            >
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>
                          {nft.isAuction && nft.timeLeft && (
                            <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm">
                              <Clock className="w-3 h-3" />
                              {nft.timeLeft}
                            </div>
                          )}
                          <Badge className={`absolute bottom-3 left-3 ${getRarityColor(nft.rarity)} flex items-center gap-1 px-2 py-1 text-xs font-medium shadow-sm`}>
                            {getRarityIcon(nft.rarity)}
                            {nft.rarity}
                          </Badge>
                        </div>
                      </Link>
                      <CardContent className="flex-1 p-6 bg-white">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-sm text-gray-500 font-medium">{nft.collection}</div>
                          {nft.verified && <Star className="w-4 h-4 text-blue-500 fill-current" />}
                        </div>
                        <h3 className="font-semibold mb-4 text-gray-900 text-xl">{nft.name}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Current Price</div>
                            <div className="font-bold text-gray-900 text-lg">{nft.price}</div>
                            <div className="text-sm text-gray-400">{nft.usdPrice}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Last Sale</div>
                            <div className="text-base text-gray-600">{nft.lastSale}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Likes</div>
                            <div className="flex items-center gap-2 text-base text-gray-600">
                              <Heart className="w-4 h-4" />
                              <span className="font-medium">{nft.likes}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            className={`px-8 py-3 transition-all duration-300 hover:scale-105 rounded-xl ${
                              nft.isAuction 
                                ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white' 
                                : 'bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white'
                            }`}
                            asChild
                          >
                            <Link href={`/nft/${nft.id}`}>{nft.isAuction ? "Place Bid" : "Buy Now"}</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Load More */}
            <div className="flex justify-center mt-10">
              <Button className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2">
                <ArrowDown className="w-4 h-4" />
                Load More NFTs
              </Button>
            </div>
>>>>>>> dfaf10def481ce1a5bfc7ec596f852b391690989
          </div>
        </div>
      </div>
    </div>
  )
}