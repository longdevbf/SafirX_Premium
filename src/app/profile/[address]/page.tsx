"use client"

import { useState, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Share2, ExternalLink, Star, Copy, Wallet, Flag, Edit } from "lucide-react"
import Link from "next/link"
import OwnedNFTs from "@/components/pages/profile/ownedNFTs"
import Following from "@/components/pages/profile/following"
import EditProfile from "@/components/pages/profile/editProfile"
import { useNFTData } from "@/hooks/use-NFTData"

export default function PublicProfilePage({ params }: { params: Promise<{ address: string }> }) {
  // Unwrap the params Promise
  const { address } = use(params)
  
  const [activeTab, setActiveTab] = useState<"nfts" | "following">("nfts")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    tag: "",
    description: "",
    avatar: "",
    background: "",
  })

  // Fetch NFT data từ API
  const { nfts, totalCount, isLoading, error } = useNFTData(address)

  // Mock user data - in real app, fetch based on address
  const user = {
    address: address,
    name: "ArtCollector",
    username: "@artcollector",
    bio: "Passionate about digital art and blockchain technology. Collecting unique pieces since 2021.",
    avatar: "/placeholder-user.jpg",
    banner: "/images/nft-background.jpg",
    verified: false,
    joined: "June 2021",
    website: "https://artcollector.com",
    stats: {
      owned: totalCount, // Sử dụng totalCount từ API
      created: 12,
      sold: 34,
      totalVolume: "156.3 ETH",
      following: 45,
      followers: 123,
    },
  }

  // Mock following data
  const followingUsers = [
    {
      address: "0x1234567890abcdef1234567890abcdef12345678",
      name: "CryptoArtist",
      username: "@cryptoartist",
      avatar: "/placeholder-user.jpg",
      verified: true,
      followers: 2345,
      nftsOwned: 156,
      joinDate: "March 2021"
    },
    {
      address: "0x2345678901bcdef23456789012cdef345678901",
      name: "DigitalCreator",
      username: "@digitalcreator",
      avatar: "/placeholder-user.jpg",
      verified: false,
      followers: 1234,
      nftsOwned: 89,
      joinDate: "July 2021"
    },
    {
      address: "0x3456789012cdef34567890123def4567890123",
      name: "NFTCollector",
      username: "@nftcollector",
      avatar: "/placeholder-user.jpg",
      verified: true,
      followers: 567,
      nftsOwned: 234,
      joinDate: "January 2022"
    },
    {
      address: "0x4567890123def45678901234ef567890123456",
      name: "ArtLover",
      username: "@artlover",
      avatar: "/placeholder-user.jpg",
      verified: false,
      followers: 890,
      nftsOwned: 45,
      joinDate: "September 2021"
    },
  ]

  const copyAddress = () => {
    navigator.clipboard.writeText(user.address)
  }

  const handleEditProfile = () => {
    setEditForm({
      name: user.name,
      tag: user.username,
      description: user.bio,
      avatar: user.avatar,
      background: user.banner,
    })
    setIsEditModalOpen(true)
  }

  const handleSaveProfile = () => {
    console.log("Save profile:", editForm)
    setIsEditModalOpen(false)
  }

  const handleImageUpload = (type: 'avatar' | 'background') => {
    console.log("Upload image for:", type)
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
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <Flag className="w-4 h-4 mr-2" />
            Report
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Profile Info */}
        <div className="relative mb-8 pt-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-32 h-32 border-4 border-white shadow-lg bg-white -mt-16">
              <AvatarImage src={user.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl bg-gray-100">AC</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold text-foreground">{user.name}</h1>
                    {user.verified && <Star className="w-6 h-6 text-blue-500 fill-current" />}
                  </div>
                  <p className="text-muted-foreground mb-2">{user.username}</p>
                  <p className="text-foreground mb-4 max-w-2xl">{user.bio}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleEditProfile}
                  className="ml-4"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
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
              <div className="text-2xl font-bold text-primary">{user.stats.following}</div>
              <div className="text-sm text-muted-foreground">Following</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{user.stats.followers}</div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "nfts" | "following")} className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nfts">Owned NFTs ({user.stats.owned})</TabsTrigger>
            <TabsTrigger value="following">Following ({user.stats.following})</TabsTrigger>
          </TabsList>

          <TabsContent value="nfts">
            <OwnedNFTs 
              nfts={nfts} 
              totalCount={totalCount} 
              isLoading={isLoading}
              error={error}
            />
          </TabsContent>

          <TabsContent value="following">
            <Following followingUsers={followingUsers} totalCount={user.stats.following} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Modal */}
      <EditProfile
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editForm={editForm}
        setEditForm={setEditForm}
        onSave={handleSaveProfile}
        onImageUpload={handleImageUpload}
      />
    </div>
  )
}
