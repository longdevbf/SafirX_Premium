"use client"

import { useState, use } from "react"
import { useUser } from "@/context/userContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Share2, ExternalLink, Star, Copy, Wallet, Flag, Edit, Package, Gavel } from "lucide-react"
import Link from "next/link"
import OwnedNFTs from "@/components/pages/profile/ownedNFTs"
import Following from "@/components/pages/profile/following"
import EditProfileModal from "@/components/pages/profile/editProfileModal"
import ListCollectionModal from "@/components/pages/profile/listCollectionModal"
import CreateAuctionModal from "@/components/pages/profile/create-auction-modal"
import { useNFTData } from "@/hooks/use-NFT-data"
import { useWalletBalance } from "@/hooks/use-balance"

// Interface cho NFT
interface NFT {
  id: string
  name: string
  collection: string
  image: string
  isVerified: boolean
  contractName: string
  contractAddress: string
  tokenId: string
  transfers: number
  edition?: string
}

export default function PublicProfilePage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params)
  const [activeTab, setActiveTab] = useState<"nfts" | "following">("nfts")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isListCollectionOpen, setIsListCollectionOpen] = useState(false)
  const [isAuctionCollectionOpen, setIsAuctionCollectionOpen] = useState(false)
  const [isSingleAuctionOpen, setIsSingleAuctionOpen] = useState(false)
  const [isCollectionAuctionOpen, setIsCollectionAuctionOpen] = useState(false)
  
  // Thêm state để lưu NFT được chọn từ card
  const [selectedNFTForAuction, setSelectedNFTForAuction] = useState<NFT | null>(null)
  
  const [editForm, setEditForm] = useState({
    name: "",
    tag: "",
    description: "",
    avatar: "",
    background: "",
  })

  // Sử dụng context và NFT data
  const { nfts, totalCount, isLoading: nftLoading, error: nftError } = useNFTData(address)
  const { user: userData, isLoading: userLoading, error: userError, refreshUser } = useUser()
  
  // Get wallet balance for this address
  const { formatted: walletBalance } = useWalletBalance(address)

  // Handler để mở single auction từ NFT card
  const handleOpenSingleAuction = (nft: NFT) => {
    console.log("Opening single auction for NFT:", nft) // Debug log
    setSelectedNFTForAuction(nft)
    setIsSingleAuctionOpen(true)
  }

  // Tạo user object từ database data với fallback values
  const user = userData ? {
    address: userData.address,
    name: userData.name || "Unnamed User",
    username: userData.username ? `@${userData.username}` : `@${userData.address.slice(0, 8)}...`,
    bio: userData.bio || "NFT enthusiast and collector",
    avatar: userData.avatar || "/placeholder-user.jpg",
    banner: userData.banner || "/images/nft-background.jpg",
    verified: false,
    joined: new Date(userData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    website: null,
    stats: {
      owned: totalCount,
      created: userData.created,
      sold: userData.sold,
      totalVolume: `${userData.total_volume.toFixed(1)} ROSE`,
      walletBalance: walletBalance,
      following: userData.followed,
      followers: userData.follower,
    },
  } : {
    address: address,
    name: "Loading...",
    username: `@${address.slice(0, 8)}...`,
    bio: "NFT enthusiast and collector",
    avatar: "/placeholder-user.jpg",
    banner: "/images/nft-background.jpg",
    verified: false,
    joined: "Recently",
    website: null,
    stats: {
      owned: totalCount,
      created: 0,
      sold: 0,
      totalVolume: "0.0 ROSE",
      walletBalance: "0.00 ROSE",
      following: 0,
      followers: 0,
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
    console.log("Address copied to clipboard")
  }

  const handleEditProfile = () => {
    setEditForm({
      name: user.name || "",
      tag: user.username ? user.username.replace('@', '') : "",
      description: user.bio || "",
      avatar: user.avatar || "",
      background: user.banner || "",
    })
    setIsEditModalOpen(true)
  }

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: user.address,
          name: editForm.name.trim(),
          username: editForm.tag.trim(),
          bio: editForm.description.trim(),
          avatar: editForm.avatar.trim() || null,
          banner: editForm.background.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }

      console.log("Profile updated successfully!");
      await refreshUser();
      setIsEditModalOpen(false);
      alert("Profile updated successfully!");

    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile")
    }
  }

  // Loading state
  if (userLoading || nftLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-6 w-6 animate-spin border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (userError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading profile: {userError}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner Section */}
      <div className="relative h-[400px] overflow-hidden">
        {user.banner ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('${user.banner}')`,
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-blue-500" />
        )}
        
        {/* Action Buttons */}
        <div className="absolute bottom-6 right-6 flex gap-3">
          <Button 
            variant="outline" 
            size="sm"
            className="bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-150"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-150"
          >
            <Flag className="w-4 h-4 mr-2" />
            Report
          </Button>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Profile Section */}
        <div className="relative -mt-16 pb-8">
          <div className="flex flex-col items-start gap-6">
            {/* Avatar */}
            <Avatar className="w-32 h-32 border-[5px] border-white shadow-md bg-white relative z-10">
              <AvatarImage src={user.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl bg-gray-100 text-gray-600">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* User Info - Below Avatar */}
            <div className="w-full">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 w-full">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                    {user.verified && (
                      <div className="flex items-center" title="Verified">
                        <Star className="w-6 h-6 text-sky-500 fill-current" />
                      </div>
                    )}
                  </div>
                  <p className="text-gray-500 font-mono mb-3">{user.username}</p>
                  <p className="text-gray-700 leading-relaxed max-w-3xl">{user.bio}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleEditProfile}
                  className="border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-150 self-start"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>

          {/* User Details Strip */}
          <div className="mt-6 flex flex-wrap gap-6 items-center text-sm text-gray-600 w-full">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              <span className="font-mono">{user.address.slice(0, 8)}...{user.address.slice(-6)}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={copyAddress}
                className="h-6 w-6 p-0 hover:bg-gray-100"
                aria-label="Copy address"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            {user.website && (
              <Link 
                href={user.website} 
                className="flex items-center gap-2 hover:text-gray-900 transition-colors duration-150"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4" />
                Website
              </Link>
            )}
            <div className="flex items-center gap-2">
              <span>📅</span>
              <span>Joined {user.joined}</span>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8 w-full">
          <Card className="hover:shadow-md hover:scale-[1.02] transition-all duration-150 border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">{user.stats.owned}</div>
              <div className="text-sm text-gray-500">Owned</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md hover:scale-[1.02] transition-all duration-150 border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">{user.stats.created}</div>
              <div className="text-sm text-gray-500">Created</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md hover:scale-[1.02] transition-all duration-150 border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">{user.stats.sold}</div>
              <div className="text-sm text-gray-500">Sold</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md hover:scale-[1.02] transition-all duration-150 border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">{user.stats.totalVolume}</div>
              <div className="text-sm text-gray-500">Total Volume</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md hover:scale-[1.02] transition-all duration-150 border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">{user.stats.walletBalance}</div>
              <div className="text-sm text-gray-500">Wallet</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md hover:scale-[1.02] transition-all duration-150 border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">{user.stats.followers}</div>
              <div className="text-sm text-gray-500">Followers</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "nfts" | "following")} className="mb-8 w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 w-full">
            <TabsList className="bg-gray-100 p-1 rounded-lg">
              <TabsTrigger 
                value="nfts" 
                className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:shadow-sm"
              >
                Owned NFTs ({user.stats.owned})
              </TabsTrigger>
              <TabsTrigger 
                value="following"
                className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:shadow-sm"
              >
                Following ({user.stats.following})
              </TabsTrigger>
            </TabsList>

            {/* Collection Actions */}
            {activeTab === "nfts" && totalCount > 0 && (
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsListCollectionOpen(true)}
                  className="border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-150"
                >
                  <Package className="w-4 h-4 mr-2" />
                  List Collection
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedNFTForAuction(null)
                    setIsSingleAuctionOpen(true)
                  }}
                  className="border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-150"
                >
                  <Gavel className="w-4 h-4 mr-2" />
                  Single Auction
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsCollectionAuctionOpen(true)}
                  className="border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-150"
                >
                  <Gavel className="w-4 h-4 mr-2" />
                  Collection Auction
                </Button>
              </div>
            )}
          </div>

          <TabsContent value="nfts" className="w-full">
            <OwnedNFTs 
              nfts={nfts} 
              totalCount={totalCount} 
              isLoading={nftLoading}
              error={nftError}
              onOpenSingleAuction={handleOpenSingleAuction}
            />
          </TabsContent>

          <TabsContent value="following" className="w-full">
            <Following followingUsers={followingUsers} totalCount={user.stats.following} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editForm={editForm}
        setEditForm={setEditForm}
        onSave={handleSaveProfile}
      />

      <ListCollectionModal
        isOpen={isListCollectionOpen}
        onClose={() => setIsListCollectionOpen(false)}
        nfts={nfts}
        mode="list"
      />

      <ListCollectionModal
        isOpen={isAuctionCollectionOpen}
        onClose={() => setIsAuctionCollectionOpen(false)}
        nfts={nfts}
        mode="auction"
      />

      <CreateAuctionModal
        isOpen={isSingleAuctionOpen}
        onClose={() => {
          setIsSingleAuctionOpen(false)
          setSelectedNFTForAuction(null)
        }}
        nfts={selectedNFTForAuction ? [selectedNFTForAuction] : nfts}
        mode="single"
      />

      <CreateAuctionModal
        isOpen={isCollectionAuctionOpen}
        onClose={() => setIsCollectionAuctionOpen(false)}
        nfts={nfts}
        mode="collection"
      />
    </div>
  )
}