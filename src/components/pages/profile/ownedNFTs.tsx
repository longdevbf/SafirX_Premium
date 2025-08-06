"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Grid3X3, List, Filter, Search, DollarSign, Gavel, ChevronLeft, ChevronRight, Copy, ExternalLink, Heart, Eye, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import SellNFTModal from "@/components/pages/profile/sellNFTModal"

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

interface OwnedNFTsProps {
  nfts: NFT[]
  totalCount: number
  isLoading?: boolean
  error?: string | null
  // Thêm props cho auction
  onOpenSingleAuction?: (nft: NFT) => void
}

// Component để handle NFT image với fallback
function NFTImage({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const isIPFSUrl = src?.includes('ipfs') || src?.includes('gateway.pinata.cloud');

  if (error || !src) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`}>
        <div className="text-gray-400 text-sm text-center">
          <div className="mb-2">🖼️</div>
          <div>No Image</div>
        </div>
      </div>
    );
  }

  if (isIPFSUrl) {
    return (
      <div className="relative w-full h-full">
        {loading && (
          <div className={`${className} flex items-center justify-center bg-gray-100 absolute inset-0`}>
            <div className="text-gray-400 text-sm">Loading...</div>
          </div>
        )}
        <img
          src={src}
          alt={alt}
          className={className}
          onError={() => setError(true)}
          onLoad={() => setLoading(false)}
          style={{
            display: loading ? 'none' : 'block'
          }}
        />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      onError={() => setError(true)}
    />
  );
}

export default function OwnedNFTs({ 
  nfts, 
  totalCount, 
  isLoading, 
  error, 
  onOpenSingleAuction 
}: OwnedNFTsProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null)
  const [showSellModal, setShowSellModal] = useState(false)
  
  const ITEMS_PER_PAGE = 20

  // Lọc NFTs theo search term
  const filteredNFTs = useMemo(() => 
    nfts.filter(nft => 
      nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nft.collection.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nft.tokenId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nft.contractAddress.toLowerCase().includes(searchTerm.toLowerCase())
    ), [nfts, searchTerm]
  )

  // Tính toán pagination
  const totalPages = Math.ceil(filteredNFTs.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentNFTs = filteredNFTs.slice(startIndex, endIndex)

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSell = (nft: NFT) => {
    setSelectedNFT(nft)
    setShowSellModal(true)
  }

  // Cập nhật handleAuction để sử dụng callback từ parent
  const handleAuction = (nft: NFT) => {
    if (onOpenSingleAuction) {
      onOpenSingleAuction(nft)
    } else {
      console.log("Auction NFT:", nft.id)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      console.log("Copied to clipboard:", text)
    } catch (err) {
      console.error("Failed to copy:", err)
      const textArea = document.createElement("textarea")
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        console.log("Copied to clipboard (fallback):", text)
      } catch (fallbackErr) {
        console.error("Fallback copy failed:", fallbackErr)
      }
      document.body.removeChild(textArea)
    }
  }

  const formatAddress = (address: string) => {
    if (!address || address === 'N/A') return 'N/A'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  if (isLoading) {
    return (
      <div className="mt-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading NFTs...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">Error: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Owned NFTs ({totalCount})
          </h2>
          {searchTerm && (
            <p className="text-base text-gray-600">
              {filteredNFTs.length} NFTs found matching your search
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant={viewMode === "grid" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setViewMode("grid")}
            className="hover:shadow-md transition-all duration-300 rounded-xl px-4 py-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
            title="Grid View"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button 
            variant={viewMode === "list" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setViewMode("list")}
            className="hover:shadow-md transition-all duration-300 rounded-xl px-4 py-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
            title="List View"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input 
            placeholder="Search by name, collection, token ID..." 
            className="pl-12 rounded-full border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-12 text-base w-80" 
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-150"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center py-4 mb-6">
        <p className="text-lg font-medium text-gray-900 flex items-center gap-2">
          🔎 Showing {filteredNFTs.length > 0 ? `${startIndex + 1}-${Math.min(endIndex, filteredNFTs.length)} of ` : ''}
          {filteredNFTs.length} results
        </p>
        {totalPages > 1 && (
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
        )}
      </div>

      {filteredNFTs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-6xl mb-4">🖼️</div>
          <div className="text-xl font-medium text-gray-900 mb-2">
            {searchTerm ? "No NFTs found" : "No NFTs owned"}
          </div>
          <div className="text-gray-600">
            {searchTerm ? "Try adjusting your search criteria" : "Start collecting amazing NFTs!"}
          </div>
        </div>
      ) : (
        <>
          <div
            className={`grid gap-6 ${
              viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
            }`}
          >
            {currentNFTs.map((nft) => (
              <Card 
                key={nft.id} 
                className="w-full overflow-hidden bg-white shadow-sm hover:shadow-lg border border-gray-100 hover:border-indigo-200 transition-all duration-300 group hover:scale-[1.02] rounded-xl"
              >
                <Link href={`/nft/${nft.id}`}>
                  <div className="aspect-square relative overflow-hidden">
                    <NFTImage
                      src={nft.image || "/placeholder.svg"}
                      alt={nft.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <div className="bg-white/80 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm">
                        <Eye className="w-3 h-3" />
                        {nft.transfers}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-white/80 backdrop-blur-sm text-gray-900 hover:bg-white/90 hover:text-red-500 hover:scale-110 w-8 h-8 p-0 rounded-full shadow-sm transition-all duration-300"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {nft.isVerified && (
                        <div className="bg-blue-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm">
                          <Star className="w-3 h-3 fill-current" />
                          Verified
                        </div>
                      )}
                    </div>
                    {nft.edition && (
                      <div className="absolute bottom-3 left-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                        {nft.edition}
                      </div>
                    )}
                  </div>
                </Link>
                <CardContent className="p-5 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-sm text-gray-500 font-medium">{nft.collection}</div>
                    {nft.isVerified && <Star className="w-4 h-4 text-blue-500 fill-current" />}
                  </div>
                  <h3 className="font-semibold mb-3 truncate text-gray-900 text-base">{nft.name}</h3>
                  
                  {/* Token ID and Contract Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Token ID:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-gray-700">{nft.tokenId}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-gray-100"
                          onClick={(e) => {
                            e.preventDefault()
                            copyToClipboard(nft.tokenId)
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Contract:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-gray-700">{formatAddress(nft.contractAddress)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-gray-100"
                          onClick={(e) => {
                            e.preventDefault()
                            copyToClipboard(nft.contractAddress)
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        {nft.contractAddress !== 'N/A' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-gray-100"
                            onClick={(e) => {
                              e.preventDefault()
                              window.open(`https://testnet.explorer.sapphire.oasis.io/address/${nft.contractAddress}`, '_blank')
                            }}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Transfers:</span>
                      <span className="text-gray-700 font-medium">{nft.transfers}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Heart className="w-4 h-4" />
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white border-0 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
                        onClick={(e) => {
                          e.preventDefault()
                          handleSell(nft)
                        }}
                      >
                        <DollarSign className="w-3 h-3 mr-1" />
                        Sell
                      </Button>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white border-0 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
                        onClick={(e) => {
                          e.preventDefault()
                          handleAuction(nft)
                        }}
                      >
                        <Gavel className="w-3 h-3 mr-1" />
                        Auction
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-150"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex gap-1">
                {getPageNumbers().map((page, index) => (
                  <div key={index}>
                    {page === '...' ? (
                      <span className="px-3 py-2 text-gray-500">...</span>
                    ) : (
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page as number)}
                        className={`w-10 h-10 ${
                          currentPage === page 
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                            : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                        } transition-all duration-150`}
                      >
                        {page}
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-150"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
      </>
      )}

      {/* Sell NFT Modal */}
      <SellNFTModal
        isOpen={showSellModal}
        onClose={() => {
          setShowSellModal(false)
          setSelectedNFT(null)
        }}
        nft={selectedNFT}
      />
    </div>
  )
}