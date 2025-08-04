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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  CheckCircle, 
  Circle, 
  DollarSign, 
  Gavel, 
  Package,
  Grid3X3,
  AlertTriangle,
  X,
  Filter
} from "lucide-react"
import Image from "next/image"

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

interface ListCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  nfts: NFT[]
  mode: "list" | "auction"
}

interface CollectionForm {
  name: string
  description: string
  bundlePrice: string
  
  // Auction specific
  startingPrice: string
  reservePrice: string
  duration: string
  minBidIncrement: string
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

  // Kiểm tra nếu là IPFS URL hoặc external URL
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

  // Sử dụng Next.js Image cho local images
  return (
    <div className="relative w-full h-full">
      <Image
        src={src}
        alt={alt}
        fill
        className={`${className} object-cover`}
        onError={() => setError(true)}
        onLoad={() => setLoading(false)}
        unoptimized // Thêm này để tránh lỗi optimization
      />
    </div>
  )
}

export default function ListCollectionModal({ isOpen, onClose, nfts, mode }: ListCollectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedNFTs, setSelectedNFTs] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<"all" | "grouped">("all")
  const [selectedCollection, setSelectedCollection] = useState<string>("all")
  const [form, setForm] = useState<CollectionForm>({
    name: "",
    description: "",
    bundlePrice: "",
    startingPrice: "",
    reservePrice: "",
    duration: "24", // Default 24 hours
    minBidIncrement: "0.1"
  })
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<"select" | "configure" | "confirm">("select")

  // Thêm state để track collection đã chọn:
  const [selectedCollectionForListing, setSelectedCollectionForListing] = useState<string | null>(null)

  // Debug: Log tổng số NFTs
  console.log("Total NFTs in wallet:", nfts.length)

  // Filter NFTs by search term và collection
  const filteredNFTs = useMemo(() => {
    if (!nfts || nfts.length === 0) return []
    
    const filtered = nfts.filter(nft => {
      if (!nft) return false
    
      const matchesSearch = (nft.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (nft.collection || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (nft.tokenId || '').toLowerCase().includes(searchTerm.toLowerCase())
    
      const matchesCollection = selectedCollection === "all" || nft.collection === selectedCollection
    
      // Nếu đã chọn collection cho listing, chỉ hiển thị NFTs từ collection đó
      const matchesSelectedCollectionForListing = selectedCollectionForListing === null || nft.collection === selectedCollectionForListing
    
      return matchesSearch && matchesCollection && matchesSelectedCollectionForListing
    })
    
    console.log("Filtered NFTs:", filtered.length)
    console.log("Selected collection for listing:", selectedCollectionForListing)
    return filtered
  }, [nfts, searchTerm, selectedCollection, selectedCollectionForListing])

  // Get unique collections cho filter dropdown
  const collections = useMemo(() => {
    if (!nfts || nfts.length === 0) return []
    
    const uniqueCollections = [...new Set(nfts
      .filter(nft => nft && nft.collection)
      .map(nft => nft.collection)
    )]
    console.log("Unique collections:", uniqueCollections)
    return uniqueCollections
  }, [nfts])

  // Group NFTs by collection (chỉ dùng khi viewMode = "grouped")
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
    
    if (newSelected.has(nftId)) {
      // Deselect NFT
      newSelected.delete(nftId)
      
      // Nếu không còn NFT nào được chọn, reset collection
      if (newSelected.size === 0) {
        setSelectedCollectionForListing(null)
      }
    } else {
      // Select NFT
      if (selectedCollectionForListing === null) {
        // Lần đầu chọn NFT - set collection
        setSelectedCollectionForListing(nft.collection)
        newSelected.add(nftId)
      } else if (selectedCollectionForListing === nft.collection) {
        // Chọn NFT từ cùng collection
        newSelected.add(nftId)
      } else {
        // Không cho phép chọn NFT từ collection khác
        alert(`You can only select NFTs from the same collection. Currently selected: ${selectedCollectionForListing}`)
        return
      }
    }
    
    setSelectedNFTs(newSelected)
  }

  const handleSelectAll = () => {
    if (filteredNFTs.length === 0) return
    
    const newSelected = new Set(selectedNFTs)
    
    // Nếu chưa có collection nào được chọn, chọn collection của NFT đầu tiên
    if (selectedCollectionForListing === null && filteredNFTs.length > 0) {
      const firstCollection = filteredNFTs[0].collection
      setSelectedCollectionForListing(firstCollection)
      
      // Chỉ chọn NFTs từ collection đầu tiên
      const sameCollectionNFTs = filteredNFTs.filter(nft => nft.collection === firstCollection)
      sameCollectionNFTs.forEach(nft => newSelected.add(nft.id))
    } else {
      // Đã có collection được chọn
      const sameCollectionFilteredNFTs = filteredNFTs.filter(nft => nft.collection === selectedCollectionForListing)
      const allSameCollectionSelected = sameCollectionFilteredNFTs.every(nft => newSelected.has(nft.id))
      
      if (allSameCollectionSelected) {
        // Deselect all from same collection
        sameCollectionFilteredNFTs.forEach(nft => newSelected.delete(nft.id))
        if (newSelected.size === 0) {
          setSelectedCollectionForListing(null)
        }
      } else {
        // Select all from same collection
        sameCollectionFilteredNFTs.forEach(nft => newSelected.add(nft.id))
      }
    }
    
    setSelectedNFTs(newSelected)
  }

  const handleSelectCollection = (collectionNFTs: NFT[]) => {
    if (collectionNFTs.length === 0) return
    
    const collectionName = collectionNFTs[0].collection
    const newSelected = new Set(selectedNFTs)
    
    if (selectedCollectionForListing === null) {
      // Chưa có collection nào được chọn - chọn toàn bộ collection này
      setSelectedCollectionForListing(collectionName)
      collectionNFTs.forEach(nft => newSelected.add(nft.id))
    } else if (selectedCollectionForListing === collectionName) {
      // Cùng collection - toggle select/deselect
      const allSelected = collectionNFTs.every(nft => newSelected.has(nft.id))
      
      if (allSelected) {
        // Deselect all in collection
        collectionNFTs.forEach(nft => newSelected.delete(nft.id))
        if (newSelected.size === 0) {
          setSelectedCollectionForListing(null)
        }
      } else {
        // Select all in collection
        collectionNFTs.forEach(nft => newSelected.add(nft.id))
      }
    } else {
      // Collection khác - không cho phép
      alert(`You can only select NFTs from the same collection. Currently selected: ${selectedCollectionForListing}`)
      return
    }
    
    setSelectedNFTs(newSelected)
  }

  const selectedNFTsList = useMemo(() => 
    nfts.filter(nft => selectedNFTs.has(nft.id))
  , [nfts, selectedNFTs])

  const getTotalValue = () => {
    if (mode === "list") {
      return form.bundlePrice ? `${form.bundlePrice} ROSE` : "0 ROSE"
    } else {
      return form.startingPrice ? `${form.startingPrice} ROSE` : "0 ROSE"
    }
  }

  const handleSubmit = async () => {
    if (selectedNFTs.size === 0) {
      alert("Please select at least one NFT")
      return
    }

    setIsLoading(true)
    try {
      console.log("Selected NFTs:", selectedNFTsList)
      console.log("Form data:", form)
      console.log("Mode:", mode)
      
      // TODO: Implement actual listing/auction logic
      if (mode === "list") {
        // List as bundle collection
        console.log("Listing as bundle collection")
      } else {
        // Create auction
        console.log("Creating collection auction")
      }

      alert(`${mode === "list" ? "Collection listed" : "Auction created"} successfully!`)
      handleClose()

    } catch (error) {
      console.error("Error:", error)
      alert(`Failed to ${mode === "list" ? "list collection" : "create auction"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setCurrentStep("select")
    setSelectedNFTs(new Set())
    setSelectedCollectionForListing(null)
    setViewMode("all")
    setSelectedCollection("all")
    setForm({
      name: "",
      description: "",
      bundlePrice: "",
      startingPrice: "",
      reservePrice: "",
      duration: "24",
      minBidIncrement: "0.1"
    })
    setSearchTerm("")
    onClose()
  }

  const canProceed = () => {
    if (currentStep === "select") return selectedNFTs.size > 0
    if (currentStep === "configure") {
      if (mode === "list") {
        const hasValidName = form.name.trim().length >= 3
        const hasValidPrice = form.bundlePrice && parseFloat(form.bundlePrice) > 0
        return hasValidName && hasValidPrice
      } else {
        const hasValidName = form.name.trim().length >= 3
        const hasValidStartingPrice = form.startingPrice && parseFloat(form.startingPrice) > 0
        const hasValidDuration = form.duration
        return hasValidName && hasValidStartingPrice && hasValidDuration
      }
    }
    return true
  }

  // Component NFT Card riêng để tái sử dụng
  const NFTCard = ({ nft, isSelected, onClick }: { nft: NFT, isSelected: boolean, onClick: () => void }) => {
    const isDisabled = selectedCollectionForListing !== null && selectedCollectionForListing !== nft.collection
    
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

  // Thêm vào đầu component:
  if (!nfts || nfts.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>No NFTs Available</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">You don&apos;t have any NFTs to list or auction.</p>
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
            {mode === "list" ? <Package className="w-5 h-5" /> : <Gavel className="w-5 h-5" />}
            {mode === "list" ? "List Collection" : "Create Collection Auction"}
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
            Configure
          </div>
          <div className="w-8 h-px bg-border" />
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
            currentStep === "confirm" ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}>
            <Circle className="w-3 h-3" />
            Confirm
          </div>
        </div>

        {/* Main Content - FIXED HEIGHT */}
        <div className="flex-1 min-h-0" style={{ height: 'calc(100% - 140px)' }}>
          {currentStep === "select" && (
            <div className="h-full flex flex-col">
              {/* Controls - Fixed height */}
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

                {/* Filters và Controls */}
                <div className="flex flex-wrap gap-3 items-center">
                  {/* Collection Filter */}
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

                  {/* View Mode Toggle */}
                  <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "all" | "grouped")}>
                    <TabsList>
                      <TabsTrigger value="all">All NFTs</TabsTrigger>
                      <TabsTrigger value="grouped">By Collection</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="flex-1" />

                  {/* Select All Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedCollectionForListing === null 
                      ? "Select All" 
                      : (filteredNFTs.filter(nft => nft.collection === selectedCollectionForListing).every(nft => selectedNFTs.has(nft.id)) 
                        ? "Deselect All" 
                        : "Select All")
                    }
                  </Button>
                </div>
                
                {/* Stats */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex gap-4 text-sm">
                    <span>Total NFTs: <strong>{nfts.length}</strong></span>
                    <span>Filtered: <strong>{filteredNFTs.length}</strong></span>
                    <span>Selected: <strong>{selectedNFTs.size}</strong></span>
                    {selectedCollectionForListing && (
                      <span className="text-primary">
                        Collection: <strong>{selectedCollectionForListing}</strong>
                      </span>
                    )}
                  </div>
                  {selectedNFTs.size > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedNFTs(new Set())
                        setSelectedCollectionForListing(null)
                      }}
                    >
                      Clear Selected
                    </Button>
                  )}
                </div>
              </div>

              {/* Scrollable NFTs area - Rest of height */}
              <div className="flex-1" style={{ height: 'calc(100% - 200px)', overflow: 'auto' }}>
                {filteredNFTs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <Package className="w-12 h-12 mb-4" />
                    <p className="text-lg font-medium">No NFTs found</p>
                    <p className="text-sm">Try adjusting your search or filter criteria</p>
                  </div>
                ) : viewMode === "all" ? (
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
                          {/* Collection Header */}
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
                              onClick={() => handleSelectCollection(collectionNFTs)}
                              className="min-w-24"
                            >
                              {allSelected ? "Deselect All" : "Select All"}
                            </Button>
                          </div>

                          {/* NFTs Grid */}
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
                  <Label htmlFor="name">Collection Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter collection name (min 3 characters)"
                    maxLength={100}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {form.name.length}/100 characters
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe your collection..."
                    rows={3}
                    maxLength={500}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {form.description.length}/500 characters
                  </div>
                </div>
              </div>

              {mode === "list" && (
                <>
                  <Separator />
                  
                  {/* Bundle Collection Pricing */}
                  <div className="space-y-4">
                    <Label>Bundle Collection</Label>
                    
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-800">
                        All selected NFTs will be sold together as a single bundle collection. Buyers must purchase the entire collection.
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="bundlePrice">Collection Price (ROSE) *</Label>
                      <Input
                        id="bundlePrice"
                        type="number"
                        step="0.1"
                        min="0"
                        value={form.bundlePrice}
                        onChange={(e) => setForm({ ...form, bundlePrice: e.target.value })}
                        placeholder="0.0"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        Price for all {selectedNFTs.size} NFTs as a bundle
                      </div>
                    </div>
                  </div>
                </>
              )}

              {mode === "auction" && (
                <>
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
                          step="0.1"
                          min="0"
                          value={form.startingPrice}
                          onChange={(e) => setForm({ ...form, startingPrice: e.target.value })}
                          placeholder="0.0"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="reservePrice">Reserve Price (ROSE)</Label>
                        <Input
                          id="reservePrice"
                          type="number"
                          step="0.1"
                          min="0"
                          value={form.reservePrice}
                          onChange={(e) => setForm({ ...form, reservePrice: e.target.value })}
                          placeholder="0.0"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="duration">Duration (Hours)</Label>
                        <Select value={form.duration} onValueChange={(value) => setForm({ ...form, duration: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Hour</SelectItem>
                            <SelectItem value="3">3 Hours</SelectItem>
                            <SelectItem value="6">6 Hours</SelectItem>
                            <SelectItem value="12">12 Hours</SelectItem>
                            <SelectItem value="24">24 Hours (1 Day)</SelectItem>
                            <SelectItem value="48">48 Hours (2 Days)</SelectItem>
                            <SelectItem value="72">72 Hours (3 Days)</SelectItem>
                            <SelectItem value="168">168 Hours (7 Days)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="minBidIncrement">Min Bid Increment (ROSE)</Label>
                        <Input
                          id="minBidIncrement"
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={form.minBidIncrement}
                          onChange={(e) => setForm({ ...form, minBidIncrement: e.target.value })}
                          placeholder="0.1"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Confirm */}
          {currentStep === "confirm" && (
            <div className="h-full overflow-y-auto space-y-6 p-2">
              {/* Summary */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold">Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Collection Name:</div>
                  <div className="font-medium">{form.name}</div>
                  
                  <div>Selected NFTs:</div>
                  <div className="font-medium">{selectedNFTs.size} items</div>
                  
                  <div>Type:</div>
                  <div className="font-medium">
                    {mode === "list" ? "Bundle Collection" : "Collection Auction"}
                  </div>
                  
                  <div>Total Value:</div>
                  <div className="font-medium text-primary">{getTotalValue()}</div>
                </div>
              </div>

              {/* Selected NFTs Preview - Tăng kích thước */}
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

              {/* Warning */}
              <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Important:</p>
                  <p>
                    Make sure you have approved the marketplace contract to transfer these NFTs. 
                    You&apos;ll need to confirm the transaction in your wallet.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="flex gap-3 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={handleClose} className="flex-1">
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
              >
                Back
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Processing..." : (mode === "list" ? "List Collection" : "Create Auction")}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}