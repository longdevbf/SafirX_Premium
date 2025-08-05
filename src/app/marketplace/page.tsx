"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
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
import Image from "next/image"
import Link from "next/link"

export default function MarketplacePage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [priceRange, setPriceRange] = useState([0, 100])

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

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-6 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 w-full">
          <div>
            <h1 className="text-5xl font-bold mb-3 text-black">Explore Marketplace</h1>
            <p className="text-xl text-gray-600">Discover and collect extraordinary NFTs 🔍</p>
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
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
          {/* Filters Sidebar */}
          <aside className="bg-white shadow-md rounded-xl p-4">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-black">
              <Filter className="w-5 h-5 text-purple-600" />
              Filters
            </h3>

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
                </div>
              </div>

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
                    </CardContent>
                  </Card>
                ))}
              </div>
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
          </div>
        </div>
      </div>
    </div>
  )
}
