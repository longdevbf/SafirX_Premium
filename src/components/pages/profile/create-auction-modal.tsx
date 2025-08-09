/* eslint-disable @typescript-eslint/no-explicit-any */

"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Tabs,  TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Search, 
  CheckCircle, 
  Circle, 
  Gavel, 
  Package,
 
  AlertTriangle,

  Filter,
  Loader2,
  
  Info
} from "lucide-react"
import Image from "next/image"
import { useAccount } from "wagmi"
import { parseEther } from "viem"
import { useSealedBidAuction } from "@/hooks/use-auctions"
//import { useNFTAuctionApproval } from "@/hooks/use-approval-auction"

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

interface CreateAuctionModalProps {
  isOpen: boolean
  onClose: () => void
  nfts: NFT[]
  mode: "single" | "collection"
  showTransactionSuccess?: (txHash: string, message: string) => void
}

interface AuctionForm {
  title: string
  description: string
  startingPrice: string
  reservePrice: string
  minBidIncrement: string
  duration: string
}

// Component để handle NFT image với fallback
function NFTImage({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  if (error || !src) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-t-lg`}>
        <div className="text-gray-400 text-xs text-center">
          <div className="mb-1">🖼️</div>
          <div>No Image</div>
        </div>
      </div>
    )
  }

  const isExternalUrl = src?.includes('http') || src?.includes('ipfs') || src?.includes('gateway.pinata.cloud')
  
  if (isExternalUrl) {
    return (
      <div className="relative w-full h-full">
        {loading && (
          <div className={`${className} flex items-center justify-center bg-gray-100 absolute inset-0 rounded-t-lg`}>
            <div className="text-gray-400 text-xs">Loading...</div>
          </div>
        )}
        <img
          src={src}
          alt={alt}
          className={`${className} ${loading ? 'hidden' : 'block'} w-full h-full object-cover`}
          onError={() => setError(true)}
          onLoad={() => setLoading(false)}
        />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <Image
        src={src}
        alt={alt}
        fill
        className={`${className} object-cover`}
        onError={() => setError(true)}
        onLoad={() => setLoading(false)}
        unoptimized
      />
    </div>
  )
}

export default function CreateAuctionModal({ isOpen, onClose, nfts, mode, showTransactionSuccess }: CreateAuctionModalProps) {
  const { address } = useAccount()
  const { 
    createSingleNFTAuctionWithApproval, 
    createCollectionAuctionWithApproval
  } = useSealedBidAuction()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedNFTs, setSelectedNFTs] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<"all" | "grouped">("all")
  const [selectedCollection, setSelectedCollection] = useState<string>("all")
  const [form, setForm] = useState<AuctionForm>({
    title: "",
    description: "",
    startingPrice: "",
    reservePrice: "",
    minBidIncrement: "0.001", // Default MIN_BID_INCREMENT
    duration: "24" // Default 24 hours
  })
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<"select" | "configure" | "confirm">("select")
  const [processingStep, setProcessingStep] = useState<"approval" | "creation" | null>(null)
  const [error, setError] = useState("")
  const [selectedCollectionForAuction, setSelectedCollectionForAuction] = useState<string | null>(null)

  // Get selected NFTs list
  const selectedNFTsList = useMemo(() => 
    nfts.filter(nft => selectedNFTs.has(nft.id))
  , [nfts, selectedNFTs])

  // Get contract address from selected NFTs (all should be from same collection for collection auction)
  const contractAddress = selectedNFTsList.length > 0 ? selectedNFTsList[0].contractAddress : ""

  // Duration options in hours
  const durationOptions = [
    { value: "1", label: "1 Hour", seconds: 3600 },
    { value: "3", label: "3 Hours", seconds: 10800 },
    { value: "6", label: "6 Hours", seconds: 21600 },
    { value: "12", label: "12 Hours", seconds: 43200 },
    { value: "24", label: "1 Day", seconds: 86400 },
    { value: "48", label: "2 Days", seconds: 172800 },
    { value: "72", label: "3 Days", seconds: 259200 },
    { value: "168", label: "7 Days", seconds: 604800 },
    { value: "336", label: "14 Days", seconds: 1209600 },
    { value: "720", label: "30 Days", seconds: 2592000 },
  ]

  // Filter NFTs by search term và collection
  const filteredNFTs = useMemo(() => {
    if (!nfts || nfts.length === 0) return []
    
    const filtered = nfts.filter(nft => {
      if (!nft) return false
    
      const matchesSearch = (nft.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (nft.collection || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (nft.tokenId || '').toLowerCase().includes(searchTerm.toLowerCase())
    
      const matchesCollection = selectedCollection === "all" || nft.collection === selectedCollection
    
      // For collection auction, only show NFTs from selected collection
      const matchesSelectedCollectionForAuction = mode === "single" || 
        selectedCollectionForAuction === null || 
        nft.collection === selectedCollectionForAuction
    
      return matchesSearch && matchesCollection && matchesSelectedCollectionForAuction
    })
    
    return filtered
  }, [nfts, searchTerm, selectedCollection, selectedCollectionForAuction, mode])

  // Get unique collections
  const collections = useMemo(() => {
    if (!nfts || nfts.length === 0) return []
    
    const uniqueCollections = [...new Set(nfts
      .filter(nft => nft && nft.collection)
      .map(nft => nft.collection)
    )]
    return uniqueCollections
  }, [nfts])

  // Group NFTs by collection
  const groupedNFTs = useMemo(() => {
    const groups: { [key: string]: NFT[] } = {}
    filteredNFTs.forEach(nft => {
      if (!groups[nft.collection]) {
        groups[nft.collection] = []
      }
      groups[nft.collection].push(nft)
    })
    return groups
  }, [filteredNFTs])

  const handleNFTToggle = (nftId: string) => {
    const nft = nfts.find(n => n.id === nftId)
    if (!nft) return

    const newSelected = new Set(selectedNFTs)
    
    if (mode === "single") {
      // Single auction mode - only allow one NFT
      if (newSelected.has(nftId)) {
        newSelected.clear()
      } else {
        newSelected.clear()
        newSelected.add(nftId)
      }
    } else {
      // Collection auction mode
      if (newSelected.has(nftId)) {
        newSelected.delete(nftId)
        if (newSelected.size === 0) {
          setSelectedCollectionForAuction(null)
        }
      } else {
        if (selectedCollectionForAuction === null) {
          setSelectedCollectionForAuction(nft.collection)
          newSelected.add(nftId)
        } else if (selectedCollectionForAuction === nft.collection) {
          newSelected.add(nftId)
        } else {
          alert(`You can only select NFTs from the same collection. Currently selected: ${selectedCollectionForAuction}`)
          return
        }
      }
    }
    
    setSelectedNFTs(newSelected)
  }

  const handleSelectAll = () => {
    if (filteredNFTs.length === 0) return
    
    const newSelected = new Set(selectedNFTs)
    
    if (mode === "single") {
      // Single mode - select first NFT only
      if (newSelected.size > 0) {
        newSelected.clear()
      } else {
        newSelected.clear()
        newSelected.add(filteredNFTs[0].id)
      }
    } else {
      // Collection mode
      if (selectedCollectionForAuction === null && filteredNFTs.length > 0) {
        const firstCollection = filteredNFTs[0].collection
        setSelectedCollectionForAuction(firstCollection)
        const sameCollectionNFTs = filteredNFTs.filter(nft => nft.collection === firstCollection)
        sameCollectionNFTs.forEach(nft => newSelected.add(nft.id))
      } else {
        const sameCollectionFilteredNFTs = filteredNFTs.filter(nft => nft.collection === selectedCollectionForAuction)
        const allSameCollectionSelected = sameCollectionFilteredNFTs.every(nft => newSelected.has(nft.id))
        
        if (allSameCollectionSelected) {
          sameCollectionFilteredNFTs.forEach(nft => newSelected.delete(nft.id))
          if (newSelected.size === 0) {
            setSelectedCollectionForAuction(null)
          }
        } else {
          sameCollectionFilteredNFTs.forEach(nft => newSelected.add(nft.id))
        }
      }
    }
    
    setSelectedNFTs(newSelected)
  }

  const calculateEstimatedFees = () => {
    if (!form.startingPrice) return { platformFee: "0", netAmount: "0" }
    
    const startingPriceNum = parseFloat(form.startingPrice)
    const feePercent = 2.5 // 2.5%
    const platformFeeAmount = (startingPriceNum * feePercent) / 100
    const netAmount = startingPriceNum - platformFeeAmount
    
    return {
      platformFee: platformFeeAmount.toFixed(4),
      netAmount: netAmount.toFixed(4)
    }
  }

  const getDurationInSeconds = () => {
    const selectedOption = durationOptions.find(opt => opt.value === form.duration)
    return selectedOption ? selectedOption.seconds : 86400 // Default 24 hours
  }

  const handleSubmit = async () => {
    if (selectedNFTs.size === 0) {
      setError("Please select at least one NFT")
      return
    }

    if (mode === "collection" && selectedNFTs.size < 2) {
      setError("Collection auction requires at least 2 NFTs")
      return
    }

    if (!address) {
      setError("Please connect your wallet")
      return
    }

    if (!contractAddress) {
      setError("Unable to determine contract address")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const startingPriceWei = parseEther(form.startingPrice)
      const reservePriceWei = form.reservePrice ? parseEther(form.reservePrice) : startingPriceWei
      const minBidIncrementWei = parseEther(form.minBidIncrement)
      const durationSeconds = getDurationInSeconds()

      if (mode === "single") {
        // Single NFT Auction
        setProcessingStep("approval")
        const tokenId = parseInt(selectedNFTsList[0].tokenId)
        
        const result = await createSingleNFTAuctionWithApproval(
          contractAddress,
          tokenId,
          Number(startingPriceWei), // ✅ Convert BigInt to number
          Number(reservePriceWei),
          Number(minBidIncrementWei),
          durationSeconds,
          form.title,
          form.description,
          address
        )// Show transaction success notification
        if (showTransactionSuccess && result?.hash) {
          showTransactionSuccess(result.hash, "Single NFT Auction created successfully!")
        }
        
        handleClose()

      } else {
        // Collection Auction
        setProcessingStep("approval")
        const tokenIds = selectedNFTsList.map(nft => parseInt(nft.tokenId))
        const result = await createCollectionAuctionWithApproval(
          contractAddress,
          tokenIds,
          Number(startingPriceWei), // ✅ Convert BigInt to number
          Number(reservePriceWei),
          Number(minBidIncrementWei),
          durationSeconds,
          form.title,
          form.description,
          address
        )// Show transaction success notification
        if (showTransactionSuccess && result?.hash) {
          showTransactionSuccess(result.hash, "Collection Auction created successfully!")
        }
        
        handleClose()
      }

    } catch (error: any) {
      console.error("Error creating auction:", error)
      setError(error.message || "Failed to create auction")
    } finally {
      setIsLoading(false)
      setProcessingStep(null)
    }
  }

  const handleClose = () => {
    setCurrentStep("select")
    setSelectedNFTs(new Set())
    setSelectedCollectionForAuction(null)
    setViewMode("all")
    setSelectedCollection("all")
    setForm({
      title: "",
      description: "",
      startingPrice: "",
      reservePrice: "",
      minBidIncrement: "0.001",
      duration: "24"
    })
    setSearchTerm("")
    setError("")
    setProcessingStep(null)
    onClose()
  }

  const canProceed = () => {
    if (currentStep === "select") {
      return mode === "single" ? selectedNFTs.size === 1 : selectedNFTs.size >= 2
    }
    if (currentStep === "configure") {
      const hasValidTitle = form.title.trim().length >= 3
      const hasValidStartingPrice = form.startingPrice && parseFloat(form.startingPrice) > 0
      const hasValidReservePrice = !form.reservePrice || parseFloat(form.reservePrice) >= parseFloat(form.startingPrice)
      const hasValidMinBidIncrement = form.minBidIncrement && parseFloat(form.minBidIncrement) >= 0.001
      return hasValidTitle && hasValidStartingPrice && hasValidReservePrice && hasValidMinBidIncrement
    }
    return true
  }

  // Component NFT Card
  const NFTCard = ({ nft, isSelected, onClick }: { nft: NFT, isSelected: boolean, onClick: () => void }) => {
    const isDisabled = mode === "collection" && selectedCollectionForAuction !== null && selectedCollectionForAuction !== nft.collection
    
    return (
      <Card
        className={`cursor-pointer transition-all ${
          isDisabled 
            ? "opacity-50 cursor-not-allowed" 
            : "hover:shadow-lg hover:scale-105"
        } ${
          isSelected ? "ring-2 ring-primary shadow-lg" : ""
        }`}
        onClick={isDisabled ? undefined : onClick}
      >
        <div className="aspect-square relative">
          <NFTImage
            src={nft.image || "/placeholder.svg"}
            alt={nft.name}
            className="rounded-t-lg"
          />
          {isDisabled && (
            <div className="absolute inset-0 bg-black/30 rounded-t-lg flex items-center justify-center">
              <div className="text-white text-xs bg-black/60 px-2 py-1 rounded">
                Different Collection
              </div>
            </div>
          )}
          <div className="absolute top-2 right-2">
            {isSelected ? (
              <CheckCircle className="w-6 h-6 text-primary bg-white rounded-full drop-shadow-md" />
            ) : (
              <Circle className={`w-6 h-6 ${isDisabled ? "text-gray-400" : "text-muted-foreground"} bg-white/90 rounded-full drop-shadow-md`} />
            )}
          </div>
          {nft.isVerified && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs px-2 py-1">
                ✓ Verified
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <div className="space-y-1">
            <div className="font-medium text-sm truncate" title={nft.name}>{nft.name}</div>
            <div className="text-xs text-muted-foreground truncate" title={nft.collection}>{nft.collection}</div>
            <div className="text-xs text-muted-foreground">#{nft.tokenId}</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!nfts || nfts.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>No NFTs Available</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">You don&apos;t have any NFTs to auction.</p>
          </div>
          <Button onClick={onClose} className="w-full">Close</Button>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-6xl h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gavel className="w-5 h-5" />
            Create {mode === "single" ? "Single NFT" : "Collection"} Auction
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-4 flex-shrink-0">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
            currentStep === "select" ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}>
            <Circle className="w-3 h-3" />
            Select NFTs
          </div>
          <div className="w-8 h-px bg-border" />
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
            currentStep === "configure" ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}>
            <Circle className="w-3 h-3" />
            Configure Auction
          </div>
          <div className="w-8 h-px bg-border" />
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
            currentStep === "confirm" ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}>
            <Circle className="w-3 h-3" />
            Confirm
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0" style={{ height: 'calc(100% - 140px)' }}>
          {currentStep === "select" && (
            <div className="h-full flex flex-col">
              {/* Controls */}
              <div className="flex-shrink-0 mb-4 space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search NFTs by name, collection, or token ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                      <SelectTrigger className="w-56">
                        <SelectValue placeholder="Filter by collection" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Collections ({nfts.length})</SelectItem>
                        {collections.map(collection => {
                          const count = nfts.filter(nft => nft.collection === collection).length
                          return (
                            <SelectItem key={collection} value={collection}>
                              {collection} ({count})
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {mode === "collection" && (
                    <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "all" | "grouped")}>
                      <TabsList>
                        <TabsTrigger value="all">All NFTs</TabsTrigger>
                        <TabsTrigger value="grouped">By Collection</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  )}

                  <div className="flex-1" />

                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {mode === "single" 
                      ? (selectedNFTs.size > 0 ? "Deselect" : "Select First")
                      : (selectedCollectionForAuction === null 
                        ? "Select All" 
                        : (filteredNFTs.filter(nft => nft.collection === selectedCollectionForAuction).every(nft => selectedNFTs.has(nft.id)) 
                          ? "Deselect All" 
                          : "Select All")
                      )
                    }
                  </Button>
                </div>
                
                {/* Stats */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex gap-4 text-sm">
                    <span>Total NFTs: <strong>{nfts.length}</strong></span>
                    <span>Filtered: <strong>{filteredNFTs.length}</strong></span>
                    <span>Selected: <strong>{selectedNFTs.size}</strong></span>
                    {mode === "single" && <span className="text-primary">Mode: <strong>Single NFT Auction</strong></span>}
                    {mode === "collection" && selectedCollectionForAuction && (
                      <span className="text-primary">Collection: <strong>{selectedCollectionForAuction}</strong></span>
                    )}
                  </div>
                  {selectedNFTs.size > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedNFTs(new Set())
                        setSelectedCollectionForAuction(null)
                      }}
                    >
                      Clear Selected
                    </Button>
                  )}
                </div>
              </div>

              {/* Scrollable NFTs area */}
              <div className="flex-1" style={{ height: 'calc(100% - 280px)', overflow: 'auto' }}>
                {filteredNFTs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <Package className="w-12 h-12 mb-4" />
                    <p className="text-lg font-medium">No NFTs found</p>
                    <p className="text-sm">Try adjusting your search or filter criteria</p>
                  </div>
                ) : viewMode === "all" || mode === "single" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
                    {filteredNFTs.map((nft) => {
                      const isSelected = selectedNFTs.has(nft.id)
                      return (
                        <NFTCard
                          key={nft.id}
                          nft={nft}
                          isSelected={isSelected}
                          onClick={() => handleNFTToggle(nft.id)}
                        />
                      )
                    })}
                  </div>
                ) : (
                  <div className="space-y-6 p-2">
                    {Object.entries(groupedNFTs).map(([collectionName, collectionNFTs]) => {
                      const allSelected = collectionNFTs.every(nft => selectedNFTs.has(nft.id))
                      const someSelected = collectionNFTs.some(nft => selectedNFTs.has(nft.id))
                      
                      return (
                        <div key={collectionName} className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                            <div className="flex items-center gap-4">
                              <h3 className="text-lg font-semibold">{collectionName}</h3>
                              <div className="flex gap-2">
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                  {collectionNFTs.length} NFTs
                                </Badge>
                                {someSelected && (
                                  <Badge variant="default" className="bg-primary text-primary-foreground">
                                    {collectionNFTs.filter(nft => selectedNFTs.has(nft.id)).length} Selected
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              variant={allSelected ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                const newSelected = new Set(selectedNFTs)
                                if (allSelected) {
                                  collectionNFTs.forEach(nft => newSelected.delete(nft.id))
                                  if (newSelected.size === 0) {
                                    setSelectedCollectionForAuction(null)
                                  }
                                } else {
                                  if (selectedCollectionForAuction === null) {
                                    setSelectedCollectionForAuction(collectionName)
                                  } else if (selectedCollectionForAuction !== collectionName) {
                                    alert(`You can only select NFTs from the same collection. Currently selected: ${selectedCollectionForAuction}`)
                                    return
                                  }
                                  collectionNFTs.forEach(nft => newSelected.add(nft.id))
                                }
                                setSelectedNFTs(newSelected)
                              }}
                              className="min-w-24"
                            >
                              {allSelected ? "Deselect All" : "Select All"}
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pl-4">
                            {collectionNFTs.map((nft) => {
                              const isSelected = selectedNFTs.has(nft.id)
                              return (
                                <NFTCard
                                  key={nft.id}
                                  nft={nft}
                                  isSelected={isSelected}
                                  onClick={() => handleNFTToggle(nft.id)}
                                />
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Configure */}
          {currentStep === "configure" && (
            <div className="h-full overflow-y-auto space-y-6 p-2">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Auction Title *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Enter auction title (min 3 characters)"
                    maxLength={100}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {form.title.length}/100 characters
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe your auction..."
                    rows={3}
                    maxLength={500}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {form.description.length}/500 characters
                  </div>
                </div>
              </div>

              <Separator />
              
              {/* Auction Settings */}
              <div className="space-y-4">
                <Label>Auction Settings</Label>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startingPrice">Starting Price (ROSE) *</Label>
                    <Input
                      id="startingPrice"
                      type="number"
                      step="0.001"
                      min="0"
                      value={form.startingPrice}
                      onChange={(e) => setForm({ ...form, startingPrice: e.target.value })}
                      placeholder="0.0"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      Minimum bid amount
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="reservePrice">Reserve Price (ROSE)</Label>
                    <Input
                      id="reservePrice"
                      type="number"
                      step="0.001"
                      min={form.startingPrice || "0"}
                      value={form.reservePrice}
                      onChange={(e) => setForm({ ...form, reservePrice: e.target.value })}
                      placeholder={form.startingPrice || "0.0"}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      Minimum price to close auction (optional)
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minBidIncrement">Min Bid Increment (ROSE) *</Label>
                    <Input
                      id="minBidIncrement"
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={form.minBidIncrement}
                      onChange={(e) => setForm({ ...form, minBidIncrement: e.target.value })}
                      placeholder="0.001"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      Minimum increase for each bid (min: 0.001 ROSE)
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Select value={form.duration} onValueChange={(value) => setForm({ ...form, duration: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {durationOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-muted-foreground mt-1">
                      How long the auction will run
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Fee Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Fee Information</span>
                </div>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex justify-between">
                    <span>Platform Fee:</span>
                    <span>2.5%</span>
                  </div>
                  {form.startingPrice && (
                    <>
                      <div className="flex justify-between">
                        <span>Est. Platform Fee:</span>
                        <span>{calculateEstimatedFees().platformFee} ROSE</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Est. Net Amount:</span>
                        <span>{calculateEstimatedFees().netAmount} ROSE</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Complete Auction Process Guide</span>
                </div>
                <div className="space-y-4 text-sm text-yellow-700">
                  {/* Phase 1: Auction Creation */}
                  <div className="bg-white/50 rounded-lg p-3 border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-2">🚀 Phase 1: Auction Creation</h4>
                    <ul className="space-y-1 ml-4 list-disc">
                      <li><strong>Setup:</strong> Configure auction parameters (duration, starting price, reserve price)</li>
                      <li><strong>NFT Lock:</strong> Your NFT(s) will be securely transferred to auction contract</li>
                      <li><strong>Go Live:</strong> Auction becomes active immediately after creation</li>
                    </ul>
                  </div>

                  {/* Phase 2: Bidding Period */}
                  <div className="bg-white/50 rounded-lg p-3 border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-2">🎯 Phase 2: Sealed Bidding Period</h4>
                    <ul className="space-y-1 ml-4 list-disc">
                      <li><strong>Continuous Bidding:</strong> Users can place bids throughout your set duration</li>
                      <li><strong>Sealed Bids:</strong> All bid amounts are hidden until auction ends for fair competition</li>
                      <li><strong>Deposit System:</strong> Bidders only pay <span className="font-semibold text-blue-600">starting price</span> as deposit when bidding</li>
                      <li><strong>Auto-Extension:</strong> Auction extends 10 minutes if bids placed in final moments</li>
                    </ul>
                  </div>

                  {/* Phase 3: Finalization */}
                  <div className="bg-white/50 rounded-lg p-3 border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-2">⚡ Phase 3: Auction Finalization</h4>
                    <ul className="space-y-1 ml-4 list-disc">
                      <li><strong>Anyone Can Finalize:</strong> After auction ends, anyone can trigger finalization</li>
                      <li><strong>No Bids:</strong> NFT automatically returns to your wallet</li>
                      <li><strong>Below Reserve:</strong> All bids refunded, NFT returns to you</li>
                      <li><strong>Successful Auction:</strong> Winner is revealed and claim process begins</li>
                    </ul>
                  </div>

                  {/* Phase 4: Claim Process */}
                  <div className="bg-white/50 rounded-lg p-3 border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-2">🏆 Phase 4: Winner Claim Process</h4>
                    <ul className="space-y-1 ml-4 list-disc">
                      <li><strong>Winner Revealed:</strong> Highest bidder is publicly shown after finalization</li>
                      <li><strong>3-Day Window:</strong> Winner has exactly <span className="font-semibold text-red-600">72 hours</span> to claim NFT</li>
                      <li><strong>Payment Due:</strong> Winner pays remaining amount (full bid - deposit already paid)</li>
                      <li><strong>NFT Transfer:</strong> Upon payment, NFT transfers to winner instantly</li>
                    </ul>
                  </div>

                  {/* Phase 5: Reclaim Rights */}
                  <div className="bg-white/50 rounded-lg p-3 border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-2">🔄 Phase 5: Reclaim Rights (If Winner Defaults)</h4>
                    <ul className="space-y-1 ml-4 list-disc">
                      <li><strong>Winner Forfeit:</strong> If winner doesn&apos;t claim within 3 days, they lose deposit</li>
                      <li><strong>Seller Rights:</strong> You can reclaim your NFT after the 3-day deadline</li>
                      <li><strong>Penalty Applied:</strong> Winner&apos;s deposit is forfeited as penalty</li>
                      <li><strong>Second Chance:</strong> You can relist or keep your NFT</li>
                    </ul>
                  </div>

                  {/* Transparency */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                    <h4 className="font-semibold text-green-800 mb-2">🔍 Complete Transparency</h4>
                    <ul className="space-y-1 ml-4 list-disc text-green-700">
                      <li><strong>Public Records:</strong> All auction history becomes public after finalization</li>
                      <li><strong>Bid History:</strong> Full bidding timeline revealed for transparency</li>
                      <li><strong>Fair Process:</strong> Blockchain ensures all transactions are verifiable</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {currentStep === "confirm" && (
            <div className="h-full overflow-y-auto space-y-6 p-2">
              {/* Summary */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold">Auction Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Auction Title:</div>
                  <div className="font-medium">{form.title}</div>
                  
                  <div>Type:</div>
                  <div className="font-medium">{mode === "single" ? "Single NFT" : "Collection"} Auction</div>
                  
                  <div>Selected NFTs:</div>
                  <div className="font-medium">{selectedNFTs.size} items</div>
                  
                  <div>Contract Address:</div>
                  <div className="font-medium font-mono text-xs">{contractAddress}</div>
                  
                  <div>Starting Price:</div>
                  <div className="font-medium text-green-600">{form.startingPrice} ROSE</div>
                  
                  <div>Reserve Price:</div>
                  <div className="font-medium">{form.reservePrice || form.startingPrice} ROSE</div>
                  
                  <div>Min Bid Increment:</div>
                  <div className="font-medium">{form.minBidIncrement} ROSE</div>
                  
                  <div>Duration:</div>
                  <div className="font-medium">
                    {durationOptions.find(opt => opt.value === form.duration)?.label}
                  </div>
                </div>
              </div>

              {/* Selected NFTs Preview */}
              <div>
                <h3 className="font-semibold mb-3">Selected NFTs ({selectedNFTs.size})</h3>
                <div className="grid grid-cols-6 gap-3 max-h-64 overflow-y-auto">
                  {selectedNFTsList.map((nft) => (
                    <div key={nft.id} className="aspect-square relative group">
                      <NFTImage
                        src={nft.image || "/placeholder.svg"}
                        alt={nft.name}
                        className="rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <div className="text-white text-xs text-center p-2">
                          <div className="font-medium mb-1">{nft.name}</div>
                          <div className="text-xs opacity-80">#{nft.tokenId}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Processing Steps */}
              {isLoading && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <div className="flex-1">
                        {processingStep === "approval" && "Checking approvals and creating auction..."}
                        {processingStep === "creation" && "Creating auction on blockchain..."}
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      {processingStep === "approval" && "Please approve transactions in your wallet"}
                      {processingStep === "creation" && "Please confirm the auction creation transaction"}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Error */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Final Warning & Complete Rules */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium mb-1">Final Warning:</p>
                    <p>
                      Creating this auction will transfer your NFT(s) to the auction contract. 
                      Make sure all details are correct before proceeding.
                    </p>
                  </div>
                </div>

                {/* Complete Auction Rules */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Complete Auction Rules</span>
                  </div>
                  <div className="space-y-2 text-sm text-blue-700">
                    <div><strong>After Auction Ends:</strong></div>
                    <ul className="space-y-1 ml-4 list-disc">
                      <li>Winner must <strong>claim NFT within 3 days</strong> and pay remaining amount</li>
                      <li>If winner fails to claim, they <strong>forfeit their deposit</strong></li>
                      <li>Seller can <strong>reclaim NFT after 3-day period</strong> expires</li>
                      <li><strong>Full bid history</strong> will be revealed when auction finalizes</li>
                      <li>All transactions are <strong>transparent on blockchain</strong></li>
                    </ul>
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-xs">
                      <strong>📋 Note:</strong> These rules ensure fair play and protect both buyers and sellers in the auction process.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={handleClose} className="flex-1" disabled={isLoading}>
            Cancel
          </Button>
          
          {currentStep !== "confirm" ? (
            <Button 
              onClick={() => setCurrentStep(currentStep === "select" ? "configure" : "confirm")}
              disabled={!canProceed()}
              className="flex-1"
            >
              Next
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep("configure")}
                className="flex-1"
                disabled={isLoading}
              >
                Back
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isLoading || !canProceed()}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Gavel className="w-4 h-4 mr-2" />
                    Create Auction
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

