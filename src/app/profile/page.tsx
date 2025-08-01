"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Settings,
  Copy,
  ExternalLink,
  Share2,
  Edit,
  Grid3X3,
  List,
  Filter,
  Search,
  Heart,
  Eye,
  DollarSign,
  Tag,
  Gavel,
  TrendingUp,
  Activity,
  Wallet,
  Star,
  MoreHorizontal,
  Upload,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"

export default function ProfilePage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedTab, setSelectedTab] = useState("owned")
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [selectedNFT, setSelectedNFT] = useState<any>(null)
  const [sellPrice, setSellPrice] = useState("")
  const [sellType, setSellType] = useState("")

  const [selectedNFTs, setSelectedNFTs] = useState<number[]>([])
  const [showCollectionDialog, setShowCollectionDialog] = useState(false)
  const [collectionImage, setCollectionImage] = useState<File | null>(null)
  const [collectionPreview, setCollectionPreview] = useState<string>("")

  // Mock user data
  const user = {
    address: "0x1234...5678",
    name: "CryptoCollector",
    username: "@cryptocollector",
    bio: "Digital art enthusiast and NFT collector. Building the future of digital ownership.",
    avatar: "/placeholder-user.jpg",
    banner: "/images/nft-background.jpg",
    verified: true,
    joined: "March 2022",
    website: "https://cryptocollector.io",
    twitter: "@cryptocollector",
    discord: "CryptoCollector#1234",
    stats: {
      owned: 127,
      created: 23,
      sold: 45,
      totalVolume: "234.5 ETH",
      floorValue: "89.2 ETH",
    },
  }

  // Mock NFT data
  const ownedNFTs = [
    {
      id: 1,
      name: "Cosmic Ape #1234",
      collection: "Cosmic Apes",
      image: "/images/nft-sample.jpg",
      price: null,
      lastSale: "2.8 ETH",
      rarity: "Rare",
      isListed: false,
      views: 1234,
      likes: 89,
      acquired: "2 months ago",
    },
    {
      id: 2,
      name: "Dream Walker #567",
      collection: "Digital Dreams",
      image: "/images/nft-sample.jpg",
      price: "2.1 ETH",
      lastSale: "1.9 ETH",
      rarity: "Common",
      isListed: true,
      views: 892,
      likes: 156,
      acquired: "1 month ago",
    },
    {
      id: 3,
      name: "Pixel Warrior #890",
      collection: "Pixel Warriors",
      image: "/images/nft-sample.jpg",
      price: null,
      lastSale: "1.2 ETH",
      rarity: "Epic",
      isListed: false,
      views: 567,
      likes: 234,
      acquired: "3 weeks ago",
    },
    {
      id: 4,
      name: "Cyber Punk #123",
      collection: "Cyber Punks",
      image: "/images/nft-sample.jpg",
      price: "0.8 ETH",
      lastSale: "0.6 ETH",
      rarity: "Uncommon",
      isListed: true,
      views: 445,
      likes: 67,
      acquired: "1 week ago",
    },
    {
      id: 5,
      name: "Abstract Art #456",
      collection: "Abstract Collection",
      image: "/images/nft-sample.jpg",
      price: null,
      lastSale: "4.8 ETH",
      rarity: "Mythic",
      isListed: false,
      views: 1567,
      likes: 289,
      acquired: "5 days ago",
    },
    {
      id: 6,
      name: "Space Explorer #789",
      collection: "Space Explorers",
      image: "/images/nft-sample.jpg",
      price: null,
      lastSale: "1.5 ETH",
      rarity: "Legendary",
      isListed: false,
      views: 678,
      likes: 123,
      acquired: "3 days ago",
    },
  ]

  const createdNFTs = [
    {
      id: 7,
      name: "My First Creation #001",
      collection: "Personal Collection",
      image: "/images/nft-sample.jpg",
      price: "1.5 ETH",
      sales: 0,
      rarity: "Unique",
      isListed: true,
      views: 234,
      likes: 45,
      created: "1 week ago",
    },
    {
      id: 8,
      name: "Digital Masterpiece #002",
      collection: "Personal Collection",
      image: "/images/nft-sample.jpg",
      price: null,
      sales: 1,
      rarity: "Unique",
      isListed: false,
      views: 567,
      likes: 89,
      created: "2 weeks ago",
    },
  ]

  const activityData = [
    { type: "purchase", nft: "Cosmic Ape #1234", price: "2.8 ETH", time: "2 hours ago" },
    { type: "sale", nft: "Dream Walker #567", price: "2.1 ETH", time: "1 day ago" },
    { type: "listing", nft: "Cyber Punk #123", price: "0.8 ETH", time: "3 days ago" },
    { type: "offer", nft: "Abstract Art #456", price: "5.0 ETH", time: "1 week ago" },
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
      case "Unique":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(user.address)
  }

  const handleSellNFT = (nft: any) => {
    setSelectedNFT(nft)
    setSellPrice("")
    setSellType("fixed")
  }

  const handleListForSale = () => {
    // Handle listing logic here
    console.log("Listing NFT:", selectedNFT, "Price:", sellPrice, "Type:", sellType)
    setSelectedNFT(null)
  }

  const handleCollectionImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCollectionImage(file)
      const url = URL.createObjectURL(file)
      setCollectionPreview(url)
    }
  }

  const toggleNFTSelection = (nftId: number) => {
    setSelectedNFTs((prev) => (prev.includes(nftId) ? prev.filter((id) => id !== nftId) : [...prev, nftId]))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Banner */}
      <div className="relative h-64 bg-gradient-to-r from-purple-600 to-blue-600">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${user.banner}')`,
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-4 right-4">
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <Settings className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Profile Info */}
        <div className="relative -mt-12 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-32 h-32 border-4 border-background">
              <AvatarImage src={user.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl">CC</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{user.name}</h1>
                {user.verified && <Star className="w-6 h-6 text-blue-500 fill-current" />}
              </div>
              <p className="text-muted-foreground mb-2">{user.username}</p>
              <p className="text-muted-foreground mb-4 max-w-2xl">{user.bio}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Wallet className="w-4 h-4" />
                  <span className="font-mono">{user.address}</span>
                  <Button variant="ghost" size="sm" onClick={copyAddress} className="h-6 w-6 p-0">
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <span>Joined {user.joined}</span>
                {user.website && (
                  <Link href={user.website} className="flex items-center gap-1 hover:text-foreground">
                    <ExternalLink className="w-4 h-4" />
                    Website
                  </Link>
                )}
              </div>

              <div className="flex flex-wrap gap-4">
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Profile
                </Button>
                <Dialog open={showCollectionDialog} onOpenChange={setShowCollectionDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Grid3X3 className="w-4 h-4 mr-2" />
                      Manage Collections
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Manage Collections</DialogTitle>
                      <DialogDescription>Choose to create a collection for selling or auction</DialogDescription>
                    </DialogHeader>

                    {/* Collection Type Selection */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <Card
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSellType("sell")}
                      >
                        <CardContent className="p-6 text-center">
                          <Tag className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                          <h3 className="text-lg font-semibold mb-2">Sell Collection</h3>
                          <p className="text-sm text-muted-foreground">Create a collection for direct sales</p>
                        </CardContent>
                      </Card>
                      <Card
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSellType("auction")}
                      >
                        <CardContent className="p-6 text-center">
                          <Gavel className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                          <h3 className="text-lg font-semibold mb-2">Auction Collection</h3>
                          <p className="text-sm text-muted-foreground">Create a collection for auctions</p>
                        </CardContent>
                      </Card>
                    </div>

                    {sellType && (
                      <div className="space-y-6">
                        {/* Collection Image */}
                        <div>
                          <Label htmlFor="collection-image">Collection Image</Label>
                          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                            {!collectionImage ? (
                              <>
                                <input
                                  type="file"
                                  id="collection-image"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={handleCollectionImageSelect}
                                />
                                <label htmlFor="collection-image" className="cursor-pointer">
                                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                  <p className="text-sm font-medium">Choose collection image</p>
                                </label>
                              </>
                            ) : (
                              <div className="space-y-2">
                                <Image
                                  src={collectionPreview || "/placeholder.svg"}
                                  alt="Collection preview"
                                  width={200}
                                  height={200}
                                  className="mx-auto rounded-lg object-cover"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setCollectionImage(null)
                                    setCollectionPreview("")
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Collection Details based on type */}
                        {sellType === "sell" ? (
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="sell-collection-name">Collection Name</Label>
                                <Input id="sell-collection-name" placeholder="Enter collection name" />
                              </div>
                              <div>
                                <Label htmlFor="sell-collection-symbol">Symbol</Label>
                                <Input id="sell-collection-symbol" placeholder="e.g. MYNFT" />
                              </div>
                              <div>
                                <Label htmlFor="sell-collection-price">Fixed Price (ETH)</Label>
                                <Input id="sell-collection-price" type="number" step="0.001" placeholder="0.05" />
                              </div>
                              <div>
                                <Label htmlFor="sell-collection-supply">Total Supply</Label>
                                <Input id="sell-collection-supply" type="number" placeholder="10000" />
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="sell-collection-contract">Contract Address</Label>
                                <Input id="sell-collection-contract" placeholder="0x..." />
                              </div>
                              <div>
                                <Label htmlFor="sell-collection-royalty">Royalty (%)</Label>
                                <Input id="sell-collection-royalty" type="number" placeholder="5" min="0" max="10" />
                              </div>
                              <div>
                                <Label htmlFor="sell-collection-desc">Description</Label>
                                <Textarea id="sell-collection-desc" placeholder="Describe your collection" rows={4} />
                              </div>
                              <div>
                                <Label htmlFor="sell-collection-cat">Category</Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="art">Art</SelectItem>
                                    <SelectItem value="gaming">Gaming</SelectItem>
                                    <SelectItem value="music">Music</SelectItem>
                                    <SelectItem value="sports">Sports</SelectItem>
                                    <SelectItem value="collectibles">Collectibles</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="auction-collection-name">Collection Name</Label>
                                <Input id="auction-collection-name" placeholder="Enter collection name" />
                              </div>
                              <div>
                                <Label htmlFor="auction-collection-symbol">Symbol</Label>
                                <Input id="auction-collection-symbol" placeholder="e.g. MYNFT" />
                              </div>
                              <div>
                                <Label htmlFor="auction-starting-price">Starting Price (ETH)</Label>
                                <Input id="auction-starting-price" type="number" step="0.001" placeholder="0.01" />
                              </div>
                              <div>
                                <Label htmlFor="auction-reserve-price">Reserve Price (ETH)</Label>
                                <Input id="auction-reserve-price" type="number" step="0.001" placeholder="Optional" />
                              </div>
                              <div>
                                <Label htmlFor="auction-duration">Auction Duration</Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select duration" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1">1 Day</SelectItem>
                                    <SelectItem value="3">3 Days</SelectItem>
                                    <SelectItem value="7">7 Days</SelectItem>
                                    <SelectItem value="14">14 Days</SelectItem>
                                    <SelectItem value="30">30 Days</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="auction-collection-contract">Contract Address</Label>
                                <Input id="auction-collection-contract" placeholder="0x..." />
                              </div>
                              <div>
                                <Label htmlFor="auction-collection-supply">Total Supply</Label>
                                <Input id="auction-collection-supply" type="number" placeholder="10000" />
                              </div>
                              <div>
                                <Label htmlFor="auction-collection-royalty">Royalty (%)</Label>
                                <Input id="auction-collection-royalty" type="number" placeholder="5" min="0" max="10" />
                              </div>
                              <div>
                                <Label htmlFor="auction-collection-desc">Description</Label>
                                <Textarea
                                  id="auction-collection-desc"
                                  placeholder="Describe your auction collection"
                                  rows={4}
                                />
                              </div>
                              <div>
                                <Label htmlFor="auction-collection-cat">Category</Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="art">Art</SelectItem>
                                    <SelectItem value="gaming">Gaming</SelectItem>
                                    <SelectItem value="music">Music</SelectItem>
                                    <SelectItem value="sports">Sports</SelectItem>
                                    <SelectItem value="collectibles">Collectibles</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* NFT Selection */}
                        <div>
                          <Label>Select NFTs for Collection ({selectedNFTs.length} selected)</Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 max-h-60 overflow-y-auto border rounded-lg p-4">
                            {ownedNFTs.map((nft) => (
                              <div
                                key={nft.id}
                                className={`relative cursor-pointer border-2 rounded-lg p-2 transition-colors ${
                                  selectedNFTs.includes(nft.id)
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                                onClick={() => toggleNFTSelection(nft.id)}
                              >
                                <div className="aspect-square relative mb-2">
                                  <Image
                                    src={nft.image || "/placeholder.svg"}
                                    alt={nft.name}
                                    fill
                                    className="object-cover rounded"
                                  />
                                  {selectedNFTs.includes(nft.id) && (
                                    <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                      <span className="text-white text-xs">✓</span>
                                    </div>
                                  )}
                                </div>
                                <p className="text-xs font-medium truncate">{nft.name}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button className="flex-1" disabled={selectedNFTs.length === 0}>
                            {sellType === "sell" ? "Create Sell Collection" : "Create Auction Collection"}
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 bg-transparent"
                            onClick={() => {
                              setShowCollectionDialog(false)
                              setSelectedNFTs([])
                              setCollectionImage(null)
                              setCollectionPreview("")
                              setSellType("")
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{user.stats.owned}</div>
              <div className="text-sm text-muted-foreground">Owned</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{user.stats.created}</div>
              <div className="text-sm text-muted-foreground">Created</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{user.stats.sold}</div>
              <div className="text-sm text-muted-foreground">Sold</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{user.stats.totalVolume}</div>
              <div className="text-sm text-muted-foreground">Total Volume</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{user.stats.floorValue}</div>
              <div className="text-sm text-muted-foreground">Floor Value</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <TabsList className="grid w-full sm:w-auto grid-cols-4">
              <TabsTrigger value="owned">Owned ({user.stats.owned})</TabsTrigger>
              <TabsTrigger value="created">Created ({user.stats.created})</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="offers">Offers</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Search items..." className="pl-10 w-64" />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Owned NFTs */}
          <TabsContent value="owned">
            <div
              className={`grid gap-6 ${
                viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
              }`}
            >
              {ownedNFTs.map((nft) => (
                <Card key={nft.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="aspect-square relative">
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
                    <div className="absolute top-3 left-3">
                      <Badge className={getRarityColor(nft.rarity)}>{nft.rarity}</Badge>
                    </div>
                    {nft.isListed && (
                      <div className="absolute bottom-3 left-3">
                        <Badge className="bg-green-100 text-green-800">
                          <Tag className="w-3 h-3 mr-1" />
                          Listed
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">{nft.collection}</div>
                    <h3 className="font-semibold mb-2 truncate">{nft.name}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-sm text-muted-foreground">
                          {nft.isListed ? "Listed Price" : "Last Sale"}
                        </div>
                        <div className="font-bold">{nft.price || nft.lastSale}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Acquired</div>
                        <div className="text-sm">{nft.acquired}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="flex-1" size="sm" onClick={() => handleSellNFT(nft)}>
                            <Tag className="w-3 h-3 mr-1" />
                            Sell
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>List NFT for Sale</DialogTitle>
                            <DialogDescription>Set your price and details for {selectedNFT?.name}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="sell-price">Price (ETH)</Label>
                              <Input
                                id="sell-price"
                                type="number"
                                step="0.001"
                                placeholder="0.00"
                                value={sellPrice}
                                onChange={(e) => setSellPrice(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="sell-description">Description</Label>
                              <Textarea id="sell-description" placeholder="Describe your NFT listing" rows={4} />
                            </div>
                            <div>
                              <Label htmlFor="sell-category">Category</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="art">Art</SelectItem>
                                  <SelectItem value="gaming">Gaming</SelectItem>
                                  <SelectItem value="music">Music</SelectItem>
                                  <SelectItem value="sports">Sports</SelectItem>
                                  <SelectItem value="collectibles">Collectibles</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleListForSale} className="flex-1">
                                List for Sale
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setSelectedNFT(null)}
                                className="flex-1 bg-transparent"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="flex-1 bg-transparent" size="sm">
                            <Gavel className="w-3 h-3 mr-1" />
                            Auction
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Create Auction</DialogTitle>
                            <DialogDescription>Set up an auction for {selectedNFT?.name}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="auction-starting-price">Starting Price (ETH)</Label>
                              <Input id="auction-starting-price" type="number" step="0.001" placeholder="0.00" />
                            </div>
                            <div>
                              <Label htmlFor="auction-reserve">Reserve Price (ETH)</Label>
                              <Input
                                id="auction-reserve"
                                type="number"
                                step="0.001"
                                placeholder="Optional reserve price"
                              />
                            </div>
                            <div>
                              <Label htmlFor="auction-duration">Duration</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1 Day</SelectItem>
                                  <SelectItem value="3">3 Days</SelectItem>
                                  <SelectItem value="7">7 Days</SelectItem>
                                  <SelectItem value="14">14 Days</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="auction-description">Description</Label>
                              <Textarea id="auction-description" placeholder="Describe your auction" rows={4} />
                            </div>
                            <div>
                              <Label htmlFor="auction-category">Category</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="art">Art</SelectItem>
                                  <SelectItem value="gaming">Gaming</SelectItem>
                                  <SelectItem value="music">Music</SelectItem>
                                  <SelectItem value="sports">Sports</SelectItem>
                                  <SelectItem value="collectibles">Collectibles</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex gap-2">
                              <Button className="flex-1">Create Auction</Button>
                              <Button variant="outline" className="flex-1 bg-transparent">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Created NFTs */}
          <TabsContent value="created">
            <div
              className={`grid gap-6 ${
                viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
              }`}
            >
              {createdNFTs.map((nft) => (
                <Card key={nft.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="aspect-square relative">
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
                    </div>
                    <div className="absolute top-3 left-3">
                      <Badge className={getRarityColor(nft.rarity)}>{nft.rarity}</Badge>
                    </div>
                    {nft.isListed && (
                      <div className="absolute bottom-3 left-3">
                        <Badge className="bg-green-100 text-green-800">
                          <Tag className="w-3 h-3 mr-1" />
                          Listed
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">{nft.collection}</div>
                    <h3 className="font-semibold mb-2 truncate">{nft.name}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-sm text-muted-foreground">{nft.isListed ? "Listed Price" : "Sales"}</div>
                        <div className="font-bold">{nft.price || `${nft.sales} sold`}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Created</div>
                        <div className="text-sm">{nft.created}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 bg-transparent" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" className="flex-1 bg-transparent" size="sm" asChild>
                        <Link href={`/nft/${nft.id}`}>View</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Activity */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityData.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          {activity.type === "purchase" && <DollarSign className="w-4 h-4" />}
                          {activity.type === "sale" && <TrendingUp className="w-4 h-4" />}
                          {activity.type === "listing" && <Tag className="w-4 h-4" />}
                          {activity.type === "offer" && <Gavel className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-medium capitalize">{activity.type}</div>
                          <div className="text-sm text-muted-foreground">{activity.nft}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{activity.price}</div>
                        <div className="text-sm text-muted-foreground">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Offers */}
          <TabsContent value="offers">
            <Card>
              <CardContent className="p-8 text-center">
                <Gavel className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Offers Yet</h3>
                <p className="text-muted-foreground">When you receive offers on your NFTs, they'll appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
