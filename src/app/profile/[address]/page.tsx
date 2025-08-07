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

const TransactionToast = ({ isVisible, txHash, onClose }: Omit<TransactionToastProps, 'message'>) => {
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
  const [activeTab, setActiveTab] = useState<"nfts">("nfts")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isListCollectionOpen, setIsListCollectionOpen] = useState(false)
  const [isSingleAuctionOpen, setIsSingleAuctionOpen] = useState(false)
  
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
  const { formatted: walletBalance } = useWalletBalance(address)

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
      walletBalance: walletBalance,
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
      walletBalance: walletBalance,
    },
  }

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Loading Banner Skeleton */}
        <div className="relative h-[300px] bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        </div>

        <div className="container mx-auto px-4">
          {/* Profile Info Skeleton */}
          <div className="relative mb-8 pt-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar Skeleton */}
              <div className="w-32 h-32 rounded-full bg-white shadow-lg -mt-16 relative">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
              </div>

              <div className="flex-1 space-y-4">
                {/* Name & Username Skeleton */}
                <div className="space-y-2">
                  <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
                  <div className="h-5 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
                </div>
                
                {/* Bio Skeleton */}
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full max-w-2xl animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>

                {/* Stats Skeleton */}
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Edit Button Skeleton */}
              <div className="h-9 bg-gray-200 rounded-lg w-28 animate-pulse"></div>
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="mb-6">
            <div className="flex space-x-4 border-b">
              <div className="h-10 bg-gray-200 rounded-t-lg w-24 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded-t-lg w-20 animate-pulse"></div>
            </div>
          </div>

          {/* NFT Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Profile Banner - Reduced Height */}
      <div className="relative h-[300px] bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        
        {/* Banner Action Buttons */}
        <div className="absolute bottom-6 right-6 flex gap-3">
          <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-md transition-all duration-300 shadow-lg">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-md transition-all duration-300 shadow-lg">
            <Flag className="w-4 h-4 mr-2" />
            Report
          </Button>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute top-10 left-10 w-4 h-4 bg-white/20 rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-20 w-6 h-6 bg-white/10 rounded-full animate-pulse delay-75"></div>
        <div className="absolute bottom-20 left-20 w-3 h-3 bg-white/30 rounded-full animate-pulse delay-150"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8">
        {/* Profile Info - Enhanced Design */}
        <div className="relative mb-12 pt-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
              {/* Enhanced Avatar */}
              <div className="relative -mt-20 lg:-mt-24">
                <Avatar className="w-36 h-36 lg:w-44 lg:h-44 border-4 border-white shadow-2xl bg-gradient-to-br from-blue-100 to-indigo-100 ring-4 ring-blue-100">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} className="object-cover" />
                  <AvatarFallback className="text-4xl lg:text-5xl bg-gradient-to-br from-blue-200 to-indigo-200 text-blue-700 font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {user.verified && (
                  <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2 shadow-lg">
                    <Star className="w-6 h-6 text-white fill-current" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-3">
                    {/* Enhanced Name & Username */}
                    <div className="space-y-2">
                      <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                        {user.name}
                      </h1>
                      <p className="text-xl text-blue-600 font-medium">{user.username}</p>
                    </div>
                    
                    {/* Enhanced Bio */}
                    <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">
                      {user.bio}
                    </p>
                  </div>

                  {/* Enhanced Edit Button */}
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={handleEditProfile}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Edit className="w-5 h-5 mr-2" />
                    Edit Profile
                  </Button>
                </div>

                {/* Enhanced Wallet Info */}
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-2 rounded-full border border-gray-200">
                    <Wallet className="w-4 h-4 text-blue-600" />
                    <span className="font-mono text-gray-700">{user.address.slice(0, 12)}...{user.address.slice(-8)}</span>
                    <Button variant="ghost" size="sm" onClick={copyAddress} className="h-6 w-6 p-0 hover:bg-blue-100">
                      <Copy className="w-3 h-3 text-blue-600" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>Joined {user.joined}</span>
                  </div>
                  {user.website && (
                    <Link href={user.website} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                      Website
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats - Simplified */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{user.stats.owned}</div>
              <div className="text-sm font-medium text-blue-500 uppercase tracking-wide">NFTs Owned</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">{user.stats.walletBalance}</div>
              <div className="text-sm font-medium text-emerald-500 uppercase tracking-wide">Wallet Balance</div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabs Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "nfts")} className="">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <TabsList className="grid w-full sm:w-auto grid-cols-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                <TabsTrigger 
                  value="nfts" 
                  className="text-lg font-semibold px-8 py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white transition-all duration-300"
                >
                  🎨 Owned NFTs ({user.stats.owned})
                </TabsTrigger>
              </TabsList>

              {/* Enhanced Collection Actions */}
              {activeTab === "nfts" && totalCount > 0 && (
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsListCollectionOpen(true)}
                    className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 text-emerald-700 hover:bg-gradient-to-r hover:from-emerald-100 hover:to-green-100 hover:border-emerald-300 transition-all duration-300 shadow-md hover:shadow-lg"
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
                    className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:border-purple-300 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Gavel className="w-4 h-4 mr-2" />
                    Collection Auction
                  </Button>
                </div>
              )}
            </div>

            <TabsContent value="nfts" className="mt-8">
              <OwnedNFTs 
                nfts={nfts} 
                totalCount={totalCount} 
                isLoading={nftLoading}
                error={nftError}
                onOpenSingleAuction={handleOpenSingleAuction}
                showTransactionSuccess={showTransactionSuccess}
              />
            </TabsContent>
          </Tabs>
        </div>
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

      {/* Single NFT Auction Modal */}
      <CreateAuctionModal
        isOpen={isSingleAuctionOpen}
        onClose={() => {
          setIsSingleAuctionOpen(false)
          setSelectedNFTForAuction(null)
        }}
        nfts={selectedNFTForAuction ? [selectedNFTForAuction] : nfts}
        mode="single"
        showTransactionSuccess={showTransactionSuccess}
      />
      
      {/* Transaction Success Toast */}
      <TransactionToast
        isVisible={transactionToast.isVisible}
        txHash={transactionToast.txHash}
        onClose={hideTransactionToast}
      />
    </div>
  )
}