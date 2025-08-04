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
import { useNFTData } from "@/hooks/use-NFT-data"
import { useUserData } from "@/hooks/use-user-data"

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

  // Fetch NFT data và User data từ API
  const { nfts, totalCount, isLoading: nftLoading, error: nftError } = useNFTData(address)
  const { user: userData, isLoading: userLoading, error: userError, refreshUser } = useUserData(address)

  // Tạo user object từ database data với fallback values
  const user = userData ? {
    address: userData.address,
    name: userData.name || "Unnamed User",
    username: userData.username ? `@${userData.username}` : `@${userData.address.slice(0, 8)}...`,
    bio: userData.bio || "NFT enthusiast and collector",
    avatar: userData.avatar || "/placeholder-user.jpg",
    banner: userData.banner || "/images/nft-background.jpg",
    verified: false, // Có thể thêm field này vào database sau
    joined: new Date(userData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    website: null, // Có thể thêm field này vào database sau
    stats: {
      owned: totalCount,
      created: userData.created,
      sold: userData.sold,
      totalVolume: `${userData.total_volume.toFixed(1)} ROSE`,
      following: userData.followed,
      followers: userData.follower,
    },
  } : {
    // Fallback cho khi chưa có data
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
      following: 0,
      followers: 0,
    },
  }

  // Mock following data (có thể tạo bảng following sau)
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
    // Có thể thêm toast notification ở đây
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
      
      // Refresh user data
      await refreshUser();
      setIsEditModalOpen(false);
      
      // Có thể thêm toast notification ở đây
      alert("Profile updated successfully!");

    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  }

  // Loading state
  if (userLoading || nftLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (userError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading profile: {userError}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Banner - Updated to use user data */}
      <div className="relative h-[504px] bg-gradient-to-r from-purple-600 to-blue-600 overflow-hidden">
        {user.banner && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('${user.banner}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        )}
        {/* Overlay gradient để text dễ đọc */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm">
            <Flag className="w-4 h-4 mr-2" />
            Report
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Profile Info - Updated to use user data */}
        <div className="relative mb-8 pt-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-32 h-32 border-4 border-white shadow-lg bg-white -mt-16">
              <AvatarImage src={user.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl bg-gray-100">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
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

        {/* Stats - Updated to use database data */}
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
              isLoading={nftLoading}
              error={nftError}
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
      />
    </div>
  )
}