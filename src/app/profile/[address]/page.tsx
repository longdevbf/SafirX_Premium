"use client"

import { useState, use, useEffect } from "react"
import { useUser } from "@/context/userContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Share2, ExternalLink, Star, Copy, Wallet, Flag, Edit, Package, Gavel, CheckCircle, X } from "lucide-react"
import Link from "next/link"
import OwnedNFTs from "@/components/pages/profile/ownedNFTs"
import Following from "@/components/pages/profile/following"
import EditProfileModal from "@/components/pages/profile/editProfileModal"
import ListCollectionModal from "@/components/pages/profile/listCollectionModal"
import CreateAuctionModal from "@/components/pages/profile/create-auction-modal"
import { useNFTData } from "@/hooks/use-NFT-data"
import { useWalletBalance } from "@/hooks/use-balance"

// Transaction Success Toast Component
interface TransactionToastProps {
  isVisible: boolean
  txHash: string
  message: string
  onClose: () => void
}

const TransactionToast = ({ isVisible, txHash, message, onClose }: TransactionToastProps) => {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (isVisible) {
      setProgress(100)
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(timer)
            onClose()
            return 0
          }
          return prev - 2 // Decrease by 2% every 100ms (5 seconds total)
        })
      }, 100)

      return () => clearInterval(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  const explorerUrl = `https://explorer.oasis.io/testnet/sapphire/tx/${txHash}`

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right-2 duration-300">
      <div className="bg-white border border-green-200 rounded-lg shadow-lg p-3 w-80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-semibold text-green-800">Transaction Successful</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded flex-1 mr-2 truncate">
            {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs"
            onClick={() => window.open(explorerUrl, '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            View
          </Button>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-green-500 h-1 rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

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

  // Transaction toast state
  const [transactionToast, setTransactionToast] = useState({
    isVisible: false,
    txHash: '',
    message: ''
  })

  // Sử dụng context và NFT data
  const { nfts, totalCount, isLoading: nftLoading, error: nftError } = useNFTData(address)
  const { user: userData, isLoading: userLoading, error: userError, refreshUser } = useUser()
  
  // Get wallet balance for this address
  const { balance, formatted: walletBalance, isLoading: balanceLoading } = useWalletBalance(address)

  // Show transaction success toast (with optional auto-reload)
  const showTransactionSuccess = (txHash: string, message: string, autoReload = true) => {
    setTransactionToast({
      isVisible: true,
      txHash,
      message
    })
    
    // Auto reload page after 7 seconds (5s toast display + 2s delay) - only for blockchain transactions
    if (autoReload) {
      setTimeout(() => {
        window.location.reload()
      }, 7000)
    }
  }

  // Hide transaction toast
  const hideTransactionToast = () => {
    setTransactionToast({
      isVisible: false,
      txHash: '',
      message: ''
    })
  }

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
      
      // Show success notification for profile update (no auto-reload)
      showTransactionSuccess("profile-update", "Profile updated successfully!", false);

    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile")
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
      {/* Profile Banner */}
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
        {/* Profile Info */}
        <div className="relative mb-8 pt-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-40 h-40 border-4 border-white shadow-lg bg-white -mt-25">
              <AvatarImage src={user.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-3xl bg-gray-100">
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
                <div className="flex gap-2 ml-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleEditProfile}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
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
              <div className="text-2xl font-bold text-primary">{user.stats.walletBalance}</div>
              <div className="text-sm text-muted-foreground">Wallet Balance</div>
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <TabsList className="grid w-full sm:w-auto grid-cols-2">
              <TabsTrigger value="nfts">Owned NFTs ({user.stats.owned})</TabsTrigger>
              <TabsTrigger value="following">Following ({user.stats.following})</TabsTrigger>
            </TabsList>

            {/* Collection Actions */}
            {activeTab === "nfts" && totalCount > 0 && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsListCollectionOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  List Collection
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedNFTForAuction(null) // Reset selected NFT for general auction
                    setIsSingleAuctionOpen(true)
                  }}
                  className="flex items-center gap-2"
                >
                  <Gavel className="w-4 h-4" />
                  Single Auction
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsCollectionAuctionOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Gavel className="w-4 h-4" />
                  Collection Auction
                </Button>
              </div>
            )}
          </div>

          <TabsContent value="nfts">
            <OwnedNFTs 
              nfts={nfts} 
              totalCount={totalCount} 
              isLoading={nftLoading}
              error={nftError}
              onOpenSingleAuction={handleOpenSingleAuction} // ✅ Truyền callback
              showTransactionSuccess={showTransactionSuccess} // ✅ Pass transaction success callback
            />
          </TabsContent>

          <TabsContent value="following">
            <Following followingUsers={followingUsers} totalCount={user.stats.following} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editForm={editForm}
        setEditForm={setEditForm}
        onSave={handleSaveProfile}
      />

      {/* List Collection Modal */}
      <ListCollectionModal
        isOpen={isListCollectionOpen}
        onClose={() => setIsListCollectionOpen(false)}
        nfts={nfts}
        mode="list"
        showTransactionSuccess={showTransactionSuccess}
      />

      {/* Auction Collection Modal */}
      <ListCollectionModal
        isOpen={isAuctionCollectionOpen}
        onClose={() => setIsAuctionCollectionOpen(false)}
        nfts={nfts}
        mode="auction"
        showTransactionSuccess={showTransactionSuccess}
      />

      {/* Single NFT Auction Modal */}
      <CreateAuctionModal
        isOpen={isSingleAuctionOpen}
        onClose={() => {
          setIsSingleAuctionOpen(false)
          setSelectedNFTForAuction(null) // Reset selected NFT khi đóng modal
        }}
        nfts={selectedNFTForAuction ? [selectedNFTForAuction] : nfts} // ✅ Nếu có NFT được chọn, chỉ hiển thị NFT đó
        mode="single"
        showTransactionSuccess={showTransactionSuccess}
      />

      {/* Collection Auction Modal */}
      <CreateAuctionModal
        isOpen={isCollectionAuctionOpen}
        onClose={() => setIsCollectionAuctionOpen(false)}
        nfts={nfts}
        mode="collection"
        showTransactionSuccess={showTransactionSuccess}
      />
      
      {/* Transaction Success Toast */}
      <TransactionToast
        isVisible={transactionToast.isVisible}
        txHash={transactionToast.txHash}
        message={transactionToast.message}
        onClose={hideTransactionToast}
      />
    </div>
  )
}