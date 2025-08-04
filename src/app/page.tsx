/* eslint-disable react/no-unescaped-entities */
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, Eye, Grid3X3, Palette, TrendingUp, Users, CheckCircle, Coins } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  const featuredCollections = [
    {
      id: 1,
      name: "Cosmic Apes",
      image: "/assets/cosmic_apes.jpg",
      floorPrice: "2.5 ETH",
      volume: "1,234 ETH",
      items: "10,000",
      verified: true,
    },
    {
      id: 2,
      name: "Digital Dreams",
      image: "/assets/digital_dream.jpg",
      floorPrice: "1.8 ETH",
      volume: "856 ETH",
      items: "5,000",
      verified: true,
    },
    {
      id: 3,
      name: "Pixel Warriors",
      image: "/assets/pixel_warrior.png",
      floorPrice: "0.9 ETH",
      volume: "432 ETH",
      items: "8,888",
      verified: false,
    },
  ]

  const trendingNFTs = [
    {
      id: 1,
      name: "Cosmic Ape #1234",
      collection: "Cosmic Apes",
      image: "/assets/cosmic_ape.jpeg",
      price: "3.2 ETH",
      lastSale: "2.8 ETH",
      timeLeft: "2h 15m",
      isAuction: true,
      views: 1234,
    },
    {
      id: 2,
      name: "Dream Walker #567",
      collection: "Digital Dreams",
      image: "/assets/dream_walker.jpg",
      price: "2.1 ETH",
      lastSale: "1.9 ETH",
      timeLeft: null,
      isAuction: false,
      views: 892,
    },
    {
      id: 3,
      name: "Pixel Warrior #890",
      collection: "Pixel Warriors",
      image: "/assets/pixel_warrior.png",
      price: "1.5 ETH",
      lastSale: "1.2 ETH",
      timeLeft: "5h 42m",
      isAuction: true,
      views: 567,
    },
    {
      id: 4,
      name: "Cosmic Ape #5678",
      collection: "Cosmic Apes",
      image: "/assets/cosmic_ape.jpeg",
      price: "4.1 ETH",
      lastSale: "3.5 ETH",
      timeLeft: null,
      isAuction: false,
      views: 2341,
    },
  ]

  return (
    <>
      <div className="min-h-screen bg-gray-900">
        {/* Hero Section with Video Background */}
        <section className="relative h-[100vh] md:h-[100vh] text-white overflow-hidden">
          {/* Video Background */}
          <div className="absolute inset-0 w-full h-full">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source 
                src="https://videos.pexels.com/video-files/3129576/3129576-uhd_2560_1440_30fps.mp4" 
                type="video/mp4" 
              />
              {/* Fallback cho browsers không support video */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900"></div>
            </video>
          </div>

          {/* Dark overlay để text dễ đọc */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
          
          <div className="relative container mx-auto px-4 py-12 flex items-center h-full z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-fade-in">
                <span className="block mb-2 text-white">Discover, Create & Trade</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
                  Extraordinary NFTs
                </span>
              </h1>
              <p className="text-base md:text-lg mb-6 text-gray-100 animate-fade-in delay-300">
                The world's most advanced NFT marketplace
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in delay-500">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-base px-6 py-2.5 rounded-2xl shadow-lg hover:shadow-purple-500/25 hover:scale-105 transition-all duration-300"
                >
                  <Link href="/marketplace">Explore Marketplace</Link>
                </Button>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white text-base px-6 py-2.5 rounded-2xl shadow-lg hover:shadow-orange-500/25 hover:scale-105 transition-all duration-300"
                >
                  <Link href="/create">Create NFT</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-white">
          {/* Stats Section */}
          <section className="py-20 bg-white border-t border-b border-gray-200">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center group">
                  <Card className="bg-white shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 rounded-2xl">
                    <CardContent className="p-0">
                      <div className="flex justify-center mb-4">
                        <TrendingUp className="w-10 h-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-500 group-hover:drop-shadow-lg" />
                      </div>
                      <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">2.5M+</div>
                      <div className="text-gray-600">Total Sales</div>
                    </CardContent>
                  </Card>
                </div>
                <div className="text-center group">
                  <Card className="bg-white shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 rounded-2xl">
                    <CardContent className="p-0">
                      <div className="flex justify-center mb-4">
                        <Grid3X3 className="w-10 h-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-500 group-hover:drop-shadow-lg" />
                      </div>
                      <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">180K+</div>
                      <div className="text-gray-600">Collections</div>
                    </CardContent>
                  </Card>
                </div>
                <div className="text-center group">
                  <Card className="bg-white shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 rounded-2xl">
                    <CardContent className="p-0">
                      <div className="flex justify-center mb-4">
                        <Palette className="w-10 h-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-500 group-hover:drop-shadow-lg" />
                      </div>
                      <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">45K+</div>
                      <div className="text-gray-600">Artists</div>
                    </CardContent>
                  </Card>
                </div>
                <div className="text-center group">
                  <Card className="bg-white shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 rounded-2xl">
                    <CardContent className="p-0">
                      <div className="flex justify-center mb-4">
                        <Users className="w-10 h-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-500 group-hover:drop-shadow-lg" />
                      </div>
                      <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">890K+</div>
                      <div className="text-gray-600">Community</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>

      {/* Featured Collections */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Collections</h2>
            <Button variant="outline" asChild>
              <Link href="/collections">View All</Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredCollections.map((collection) => (
              <Card 
                key={collection.id} 
                className="overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 group hover:scale-102 rounded-2xl border border-gray-100"
              >
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    src={collection.image || "/placeholder.svg"}
                    alt={collection.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-6 bg-white">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-bold text-xl text-gray-900">{collection.name}</h3>
                    {collection.verified && (
                      <Badge className="bg-blue-500 text-white border-0 hover:bg-blue-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-gray-500 text-xs mb-1">Floor</div>
                      <div className="font-bold text-gray-900 flex items-center justify-center gap-1">
                        <Coins className="w-3 h-3 text-gray-900" />
                        {collection.floorPrice}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500 text-xs mb-1">Volume</div>
                      <div className="font-bold text-gray-900 flex items-center justify-center gap-1">
                        <Coins className="w-3 h-3 text-gray-900" />
                        {collection.volume}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500 text-xs mb-1">Items</div>
                      <div className="font-bold text-gray-900">{collection.items}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trending NFTs */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold text-gray-900">Trending NFTs</h2>
            <Link 
              href="/marketplace"
              className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-500 hover:underline font-medium transition-all duration-300"
            >
              View All
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {trendingNFTs.map((nft) => (
              <Card 
                key={nft.id} 
                className="overflow-hidden bg-white shadow-sm hover:shadow-lg border border-gray-100 hover:border-purple-200 transition-all duration-300 group hover:scale-102 rounded-2xl"
              >
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    src={nft.image || "/placeholder.svg"}
                    alt={nft.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-gray-900/70 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {nft.views}
                  </div>
                  {nft.isAuction && nft.timeLeft && (
                    <div className="absolute top-3 left-3 bg-gray-900/70 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {nft.timeLeft}
                    </div>
                  )}
                </div>
                <CardContent className="p-5 bg-white">
                  <div className="text-sm text-gray-500 mb-2">{nft.collection}</div>
                  <h3 className="font-semibold mb-3 truncate text-gray-900">{nft.name}</h3>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-xs text-gray-500">Current Price</div>
                      <div className="font-bold text-gray-900">{nft.price}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Last Sale</div>
                      <div className="text-sm text-gray-600">{nft.lastSale}</div>
                    </div>
                  </div>
                  <Button 
                    className={`w-full transition-all duration-300 hover:scale-105 rounded-xl ${
                      nft.isAuction 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white' 
                        : 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white'
                    }`}
                  >
                    {nft.isAuction ? "Place Bid" : "Buy Now"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl p-12 md:p-16 text-center overflow-hidden bg-white shadow-lg border border-gray-200">
            {/* Subtle blockchain icons background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-10 left-10 w-8 h-8 text-gray-200 opacity-20">
                <Coins className="w-full h-full" />
              </div>
              <div className="absolute top-20 right-20 w-6 h-6 text-gray-200 opacity-20">
                <Grid3X3 className="w-full h-full" />
              </div>
              <div className="absolute bottom-20 left-20 w-10 h-10 text-gray-200 opacity-20">
                <Star className="w-full h-full" />
              </div>
              <div className="absolute bottom-10 right-10 w-7 h-7 text-gray-200 opacity-20">
                <TrendingUp className="w-full h-full" />
              </div>
            </div>
            <div className="relative z-10">
              <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
                Ready to Start Your NFT Journey?
              </h2>
              <p className="text-2xl mb-12 text-gray-600 max-w-3xl mx-auto">
                Join thousands of creators and collectors in the world's premier NFT marketplace
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xl px-12 py-4 rounded-2xl shadow-lg hover:shadow-purple-500/25 hover:scale-105 transition-all duration-300"
                >
                  <Link href="/create">Create Your First NFT</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-purple-600 text-purple-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-cyan-500 hover:text-white hover:border-transparent text-xl px-12 py-4 rounded-2xl transition-all duration-300 hover:scale-105"
                >
                  <Link href="/marketplace">Start Collecting</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
        </div>
      </div>
    </>
  )
}
