"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Lock, Eye, Users, Star, Clock, Info, AlertTriangle, CheckCircle, Timer } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function SealedAuctionsPage() {
  const [selectedAuction, setSelectedAuction] = useState<any>(null)
  const [bidAmount, setBidAmount] = useState("")
  const [bidCommitment, setBidCommitment] = useState("")
  const [activeTab, setActiveTab] = useState("active")

  // Mock sealed auction data
  const activeAuctions = [
    {
      id: 1,
      name: "Legendary Dragon #001",
      collection: "Dragon Legends",
      image: "/images/nft-sample.jpg",
      minimumBid: "5.0 ETH",
      timeLeft: "2d 14h 30m",
      totalBids: 47,
      views: 2341,
      verified: true,
      description: "Ultra-rare legendary dragon with unique fire breathing animation",
      seller: {
        address: "0xabcd...ef12",
        name: "DragonMaster",
        verified: true,
      },
      auctionDetails: {
        startTime: "3 days ago",
        endTime: "2d 14h 30m",
        revealPeriod: "24 hours after auction ends",
        commitmentDeadline: "2d 14h 30m",
      },
      status: "bidding",
    },
    {
      id: 2,
      name: "Cosmic Artifact #777",
      collection: "Cosmic Artifacts",
      image: "/images/nft-sample.jpg",
      minimumBid: "10.0 ETH",
      timeLeft: "1d 8h 15m",
      totalBids: 23,
      views: 1567,
      verified: true,
      description: "Ancient cosmic artifact with mysterious powers from the void",
      seller: {
        address: "0x1234...5678",
        name: "CosmicCollector",
        verified: true,
      },
      auctionDetails: {
        startTime: "5 days ago",
        endTime: "1d 8h 15m",
        revealPeriod: "24 hours after auction ends",
        commitmentDeadline: "1d 8h 15m",
      },
      status: "bidding",
    },
  ]

  const revealPhaseAuctions = [
    {
      id: 3,
      name: "Mythic Phoenix #001",
      collection: "Mythic Beasts",
      image: "/images/nft-sample.jpg",
      minimumBid: "8.0 ETH",
      timeLeft: "18h 45m",
      totalBids: 34,
      views: 3456,
      verified: true,
      description: "Reborn from ashes, this mythic phoenix holds eternal flame",
      seller: {
        address: "0x9876...5432",
        name: "MythicCreator",
        verified: true,
      },
      auctionDetails: {
        startTime: "7 days ago",
        endTime: "Ended",
        revealPeriod: "18h 45m remaining",
        commitmentDeadline: "Ended",
      },
      status: "reveal",
      myBid: {
        committed: true,
        revealed: false,
        amount: "12.5 ETH",
        nonce: "abc123def456",
      },
    },
  ]

  const endedAuctions = [
    {
      id: 4,
      name: "Ancient Relic #001",
      collection: "Ancient Relics",
      image: "/images/nft-sample.jpg",
      winningBid: "25.7 ETH",
      totalBids: 89,
      views: 5678,
      verified: true,
      winner: "0xdef1...2345",
      endedAt: "3 days ago",
      status: "ended",
    },
  ]

  const handleSealedBid = (auction: any) => {
    setSelectedAuction(auction)
    setBidAmount("")
    setBidCommitment("")
  }

  const generateCommitment = () => {
    if (!bidAmount) return

    // In a real implementation, this would use cryptographic hashing
    // For demo purposes, we'll simulate the commitment generation
    const nonce = Math.random().toString(36).substring(2, 15)
    const commitment = `commit_${bidAmount}_${nonce}`.replace(/\./g, "_")
    setBidCommitment(commitment)
  }

  const submitSealedBid = () => {
    // Handle sealed bid submission
    console.log("Submitting sealed bid:", {
      auction: selectedAuction,
      bidAmount,
      commitment: bidCommitment,
    })
    setSelectedAuction(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Sealed Bid Auctions</h1>
          <p className="text-muted-foreground">Private bidding where all bids remain hidden until the reveal phase</p>
        </div>

        {/* How It Works */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              How Sealed Bid Auctions Work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900">Commit Phase</h4>
                  <p className="text-sm text-blue-700">
                    Submit your bid as a cryptographic commitment. Your bid amount remains hidden.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900">Reveal Phase</h4>
                  <p className="text-sm text-blue-700">
                    After bidding ends, reveal your actual bid amount to validate your commitment.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900">Winner Selection</h4>
                  <p className="text-sm text-blue-700">
                    Highest valid bid wins, but only pays the second-highest bid amount (Vickrey auction).
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Active Bidding ({activeAuctions.length})
            </TabsTrigger>
            <TabsTrigger value="reveal" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Reveal Phase ({revealPhaseAuctions.length})
            </TabsTrigger>
            <TabsTrigger value="ended" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Ended ({endedAuctions.length})
            </TabsTrigger>
          </TabsList>

          {/* Active Bidding Phase */}
          <TabsContent value="active" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeAuctions.map((auction) => (
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
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {auction.timeLeft}
                      </Badge>
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
                          <div className="text-sm text-muted-foreground">Hidden Bids</div>
                          <div className="font-semibold flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {auction.totalBids}
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm font-medium text-orange-600">Bidding ends in {auction.timeLeft}</div>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full" onClick={() => handleSealedBid(auction)}>
                            <Lock className="w-4 h-4 mr-2" />
                            Submit Sealed Bid
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Submit Sealed Bid</DialogTitle>
                            <DialogDescription>
                              Your bid will be hidden until the reveal phase. Make sure to save your bid details!
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                <div>
                                  <h4 className="font-medium text-yellow-900 mb-1">Important</h4>
                                  <p className="text-sm text-yellow-700">
                                    Save your bid amount and commitment hash. You'll need both to reveal your bid later.
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="bid-amount">Your Bid Amount (ETH)</Label>
                              <Input
                                id="bid-amount"
                                type="number"
                                step="0.001"
                                placeholder="Enter your bid"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Minimum bid: {selectedAuction?.minimumBid}
                              </p>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <Label>Commitment Hash</Label>
                                <Button variant="outline" size="sm" onClick={generateCommitment} disabled={!bidAmount}>
                                  Generate
                                </Button>
                              </div>
                              <Textarea
                                placeholder="Click 'Generate' to create your commitment hash"
                                value={bidCommitment}
                                readOnly
                                className="font-mono text-sm"
                              />
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <h4 className="font-medium text-blue-900 mb-2">Auction Details</h4>
                              <div className="space-y-1 text-sm text-blue-700">
                                <div className="flex justify-between">
                                  <span>Bidding ends:</span>
                                  <span>{selectedAuction?.auctionDetails.endTime}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Reveal period:</span>
                                  <span>{selectedAuction?.auctionDetails.revealPeriod}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={submitSealedBid}
                                className="flex-1"
                                disabled={!bidAmount || !bidCommitment}
                              >
                                Submit Sealed Bid
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setSelectedAuction(null)}
                                className="flex-1 bg-transparent"
                              >
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

          {/* Reveal Phase */}
          <TabsContent value="reveal" className="space-y-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-900 mb-1">Reveal Phase Active</h4>
                  <p className="text-sm text-orange-700">
                    Bidding has ended. You must now reveal your bids to validate them. Unrevealed bids will be
                    disqualified.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {revealPhaseAuctions.map((auction) => (
                <Card key={auction.id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <Image src={auction.image || "/placeholder.svg"} alt={auction.name} fill className="object-cover" />
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <Badge className="bg-orange-100 text-orange-800 flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        Reveal
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {auction.timeLeft}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">{auction.collection}</div>
                    <h3 className="font-semibold mb-3 truncate">{auction.name}</h3>

                    <div className="space-y-3">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="text-sm font-medium text-blue-900 mb-1">Your Bid Status</div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-700">Committed:</span>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-700">Revealed:</span>
                          {auction.myBid?.revealed ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-orange-600" />
                          )}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm font-medium text-orange-600">Reveal deadline: {auction.timeLeft}</div>
                      </div>

                      {!auction.myBid?.revealed ? (
                        <Button className="w-full bg-transparent" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          Reveal My Bid
                        </Button>
                      ) : (
                        <Button className="w-full" disabled>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Bid Revealed
                        </Button>
                      )}
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
                  </div>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">{auction.collection}</div>
                    <h3 className="font-semibold mb-3 truncate">{auction.name}</h3>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground">Winning Bid</div>
                          <div className="font-bold text-lg">{auction.winningBid}</div>
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

        {/* Create Sealed Auction CTA */}
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-8 text-center">
              <Lock className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h3 className="text-2xl font-bold mb-2">Create Your Own Sealed Auction</h3>
              <p className="text-muted-foreground mb-6">
                Launch a private auction where bidders compete without seeing each other's bids
              </p>
              <Button size="lg" asChild>
                <Link href="/create/sealed-auction">Create Sealed Auction</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
