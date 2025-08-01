"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Gavel, Eye, Users, Star, Timer, Lock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function AuctionsPage() {
  const [activeTab, setActiveTab] = useState("live")

  const liveAuctions = [
    {
      id: 1,
      name: "Cosmic Ape #1234",
      collection: "Cosmic Apes",
      image: "/images/nft-sample.jpg",
      currentBid: "3.2 ETH",
      usdValue: "$6,240",
      timeLeft: "2h 15m 30s",
      totalBids: 23,
      views: 1234,
      verified: true,
      startingBid: "1.0 ETH",
      reserveMet: true,
      bidders: [
        { address: "0x1234...5678", bid: "3.2 ETH" },
        { address: "0x8765...4321", bid: "3.0 ETH" },
        { address: "0x9876...1234", bid: "2.8 ETH" },
      ],
    },
    {
      id: 2,
      name: "Digital Dreams #567",
      collection: "Digital Dreams",
      image: "/images/nft-sample.jpg",
      currentBid: "2.1 ETH",
      usdValue: "$4,095",
      timeLeft: "5h 42m 15s",
      totalBids: 15,
      views: 892,
      verified: true,
      startingBid: "0.5 ETH",
      reserveMet: false,
      bidders: [
        { address: "0x2345...6789", bid: "2.1 ETH" },
        { address: "0x3456...7890", bid: "1.9 ETH" },
      ],
    },
    {
      id: 3,
      name: "Pixel Warrior #890",
      collection: "Pixel Warriors",
      image: "/images/nft-sample.jpg",
      currentBid: "1.5 ETH",
      usdValue: "$2,925",
      timeLeft: "1d 3h 22m",
      totalBids: 8,
      views: 567,
      verified: false,
      startingBid: "0.1 ETH",
      reserveMet: true,
      bidders: [
        { address: "0x4567...8901", bid: "1.5 ETH" },
        { address: "0x5678...9012", bid: "1.2 ETH" },
      ],
    },
  ]

  const sealedAuctions = [
    {
      id: 4,
      name: "Mystery Box #001",
      collection: "Mystery Collection",
      image: "/images/nft-sample.jpg",
      minimumBid: "5.0 ETH",
      timeLeft: "3d 12h 45m",
      totalBids: 45,
      views: 2341,
      verified: true,
      description: "Sealed bid auction - bids are hidden until reveal",
    },
    {
      id: 5,
      name: "Rare Artifact #123",
      collection: "Ancient Artifacts",
      image: "/images/nft-sample.jpg",
      minimumBid: "10.0 ETH",
      timeLeft: "1d 8h 30m",
      totalBids: 12,
      views: 1567,
      verified: true,
      description: "High-value sealed auction with reserve price",
    },
  ]

  const endedAuctions = [
    {
      id: 6,
      name: "Legendary Dragon #001",
      collection: "Dragon Legends",
      image: "/images/nft-sample.jpg",
      finalBid: "15.7 ETH",
      usdValue: "$30,615",
      endedAt: "2 days ago",
      totalBids: 67,
      winner: "0xabcd...ef12",
      verified: true,
    },
    {
      id: 7,
      name: "Abstract Masterpiece #42",
      collection: "Abstract Art",
      image: "/images/nft-sample.jpg",
      finalBid: "8.3 ETH",
      usdValue: "$16,185",
      endedAt: "5 days ago",
      totalBids: 34,
      winner: "0x1357...2468",
      verified: false,
    },
  ]

  const getTimeLeftColor = (timeLeft: string) => {
    if (timeLeft.includes("h") && !timeLeft.includes("d")) {
      const hours = Number.parseInt(timeLeft.split("h")[0])
      if (hours < 1) return "text-red-600"
      if (hours < 6) return "text-orange-600"
    }
    return "text-green-600"
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">NFT Auctions</h1>
          <p className="text-muted-foreground">Discover and bid on exclusive NFT auctions</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <TabsList className="grid w-full sm:w-auto grid-cols-3">
              <TabsTrigger value="live" className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Live Auctions
              </TabsTrigger>
              <TabsTrigger value="sealed" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Sealed Bids
              </TabsTrigger>
              <TabsTrigger value="ended" className="flex items-center gap-2">
                <Gavel className="w-4 h-4" />
                Ended
              </TabsTrigger>
            </TabsList>

            <Select defaultValue="ending-soon">
              <SelectTrigger className="w-48">
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveAuctions.map((auction) => (
                <Card key={auction.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative">
                    <Image src={auction.image || "/placeholder.svg"} alt={auction.name} fill className="object-cover" />
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {auction.timeLeft}
                      </Badge>
                      <div className="bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {auction.views}
                      </div>
                    </div>
                    <div className="absolute top-3 left-3">
                      {auction.verified && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          <Star className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <Badge
                        className={auction.reserveMet ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                      >
                        {auction.reserveMet ? "Reserve Met" : "Reserve Not Met"}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">{auction.collection}</div>
                    <h3 className="font-semibold mb-3 truncate">{auction.name}</h3>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground">Current Bid</div>
                          <div className="font-bold text-lg">{auction.currentBid}</div>
                          <div className="text-xs text-muted-foreground">{auction.usdValue}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Bids</div>
                          <div className="font-semibold flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {auction.totalBids}
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className={`text-sm font-medium ${getTimeLeftColor(auction.timeLeft)}`}>
                          Ends in {auction.timeLeft}
                        </div>
                      </div>

                      <Button className="w-full" asChild>
                        <Link href={`/auction/${auction.id}`}>Place Bid</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Sealed Auctions */}
          <TabsContent value="sealed" className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Sealed Bid Auctions</h4>
                  <p className="text-sm text-blue-700">
                    In sealed bid auctions, all bids are hidden until the auction ends. The highest bidder wins, but
                    only pays the second-highest bid amount.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sealedAuctions.map((auction) => (
                <Card key={auction.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative">
                    <Image src={auction.image || "/placeholder.svg"} alt={auction.name} fill className="object-cover" />
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Sealed
                      </Badge>
                      <div className="bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {auction.views}
                      </div>
                    </div>
                    <div className="absolute top-3 left-3">
                      {auction.verified && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          <Star className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">{auction.collection}</div>
                    <h3 className="font-semibold mb-3 truncate">{auction.name}</h3>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground">Minimum Bid</div>
                          <div className="font-bold text-lg">{auction.minimumBid}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Secret Bids</div>
                          <div className="font-semibold flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {auction.totalBids}
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm font-medium text-orange-600">Ends in {auction.timeLeft}</div>
                      </div>

                      <div className="text-xs text-muted-foreground text-center">{auction.description}</div>

                      <Button className="w-full bg-transparent" variant="outline" asChild>
                        <Link href={`/auction/${auction.id}`}>Submit Sealed Bid</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Ended Auctions */}
          <TabsContent value="ended" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {endedAuctions.map((auction) => (
                <Card key={auction.id} className="overflow-hidden opacity-75">
                  <div className="aspect-square relative">
                    <Image
                      src={auction.image || "/placeholder.svg"}
                      alt={auction.name}
                      fill
                      className="object-cover grayscale"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                        Ended
                      </Badge>
                    </div>
                    <div className="absolute top-3 left-3">
                      {auction.verified && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          <Star className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">{auction.collection}</div>
                    <h3 className="font-semibold mb-3 truncate">{auction.name}</h3>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground">Final Bid</div>
                          <div className="font-bold text-lg">{auction.finalBid}</div>
                          <div className="text-xs text-muted-foreground">{auction.usdValue}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Total Bids</div>
                          <div className="font-semibold">{auction.totalBids}</div>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Ended {auction.endedAt}</div>
                        <div className="text-xs text-muted-foreground">Winner: {auction.winner}</div>
                      </div>

                      <Button className="w-full bg-transparent" variant="outline" disabled>
                        Auction Ended
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Auction CTA */}
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-8 text-center">
              <Gavel className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h3 className="text-2xl font-bold mb-2">Ready to Auction Your NFT?</h3>
              <p className="text-muted-foreground mb-6">
                Create your own auction and let collectors bid on your unique digital assets
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/create/auction">Create Auction</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/auctions/sealed">View Sealed Auctions</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
