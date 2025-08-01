"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Search, Filter, Grid3X3, List, Heart, Clock, Eye, Star } from "lucide-react"
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
      image: "/images/bored-ape-1.jpg",
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
      image: "/images/purple-nft.jpg",
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
      image: "/images/bored-ape-2.png",
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
      image: "/images/nft-monkey.jpg",
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
      name: "Cyber Punk #123",
      collection: "Cyber Punks",
      image: "/images/colorful-ape.jpg",
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
      name: "Abstract Art #456",
      collection: "Abstract Collection",
      image: "/images/robot-nft.jpg",
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
      name: "Bored Ape #999",
      collection: "Bored Ape Yacht Club",
      image: "/images/bored-ape-1.jpg",
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
      image: "/images/purple-nft.jpg",
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
            <p className="text-muted-foreground">Discover and collect extraordinary NFTs</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              <List className="w-4 h-4" />
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

              {/* Search */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input placeholder="Search NFTs..." className="pl-10" />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="buy-now" />
                      <label htmlFor="buy-now" className="text-sm">
                        Buy Now
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="auction" />
                      <label htmlFor="auction" className="text-sm">
                        On Auction
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="new" />
                      <label htmlFor="new" className="text-sm">
                        New
                      </label>
                    </div>
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Price Range (ETH)</label>
                  <Slider value={priceRange} onValueChange={setPriceRange} max={100} step={1} className="mb-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{priceRange[0]} ETH</span>
                    <span>{priceRange[1]} ETH</span>
                  </div>
                </div>

                {/* Collections */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Collections</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="cosmic-apes" />
                      <label htmlFor="cosmic-apes" className="text-sm">
                        Cosmic Apes
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="digital-dreams" />
                      <label htmlFor="digital-dreams" className="text-sm">
                        Digital Dreams
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="pixel-warriors" />
                      <label htmlFor="pixel-warriors" className="text-sm">
                        Pixel Warriors
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="bored-apes" />
                      <label htmlFor="bored-apes" className="text-sm">
                        Bored Ape Yacht Club
                      </label>
                    </div>
                  </div>
                </div>

                {/* Rarity */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Rarity</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="common" />
                      <label htmlFor="common" className="text-sm">
                        Common
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="rare" />
                      <label htmlFor="rare" className="text-sm">
                        Rare
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="epic" />
                      <label htmlFor="epic" className="text-sm">
                        Epic
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="legendary" />
                      <label htmlFor="legendary" className="text-sm">
                        Legendary
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort and Results */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <p className="text-muted-foreground">Showing {nfts.length} results</p>
              <Select defaultValue="recent">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recently Listed</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="most-liked">Most Liked</SelectItem>
                  <SelectItem value="ending-soon">Ending Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* NFT Grid */}
            <div
              className={`grid gap-6 ${
                viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
              }`}
            >
              {nfts.map((nft) => (
                <Card key={nft.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <Link href={`/nft/${nft.id}`}>
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
                        <div className="bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {nft.views}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="bg-black/70 text-white hover:bg-black/80 w-8 h-8 p-0 rounded-full"
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                      {nft.isAuction && nft.timeLeft && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {nft.timeLeft}
                        </div>
                      )}
                      <Badge className={`absolute bottom-3 left-3 ${getRarityColor(nft.rarity)}`}>{nft.rarity}</Badge>
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-sm text-muted-foreground">{nft.collection}</div>
                      {nft.verified && <Star className="w-3 h-3 text-blue-500 fill-current" />}
                    </div>
                    <h3 className="font-semibold mb-2 truncate">{nft.name}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Current Price</div>
                        <div className="font-bold">{nft.price}</div>
                        <div className="text-xs text-muted-foreground">{nft.usdPrice}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Last Sale</div>
                        <div className="text-sm">{nft.lastSale}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Heart className="w-3 h-3" />
                        {nft.likes}
                      </div>
                      <Button className="flex-1 ml-4" variant={nft.isAuction ? "default" : "outline"} asChild>
                        <Link href={`/nft/${nft.id}`}>{nft.isAuction ? "Place Bid" : "Buy Now"}</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More NFTs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
