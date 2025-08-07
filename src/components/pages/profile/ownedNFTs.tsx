"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Grid3X3, List, Filter, Search, DollarSign, Gavel, CheckCircle, ChevronLeft, ChevronRight, Copy, ExternalLink} from "lucide-react"
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
  onOpenSingleAuction?: (nft: NFT) => void
  showTransactionSuccess?: (txHash: string, message: string) => void
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
  onOpenSingleAuction,
  showTransactionSuccess 
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h2 className="text-2xl font-bold">
        Owned NFTs ({totalCount})
        {searchTerm && (
        <span className="text-lg font-normal text-muted-foreground">
          {" "}• {filteredNFTs.length} filtered
        </span>
        )}
      </h2>

      <div className="flex items-center gap-2">
        <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input 
          placeholder="Search by name, collection, token ID, contract..." 
          className="pl-10 w-80" 
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        </div>
        <Button variant="outline" size="sm">
        <Filter className="w-4 h-4" />
        </Button>
        <Button
        variant={viewMode === "grid" ? "default" : "outline"}
        size="sm"
        onClick={() => setViewMode("grid")}
        >
        <Grid3X3 className="w-4 h-4" />
        </Button>
        <Button
        variant={viewMode === "list" ? "default" : "outline"}
        size="sm"
        onClick={() => setViewMode("list")}
        >
        <List className="w-4 h-4" />
        </Button>
      </div>
      </div>

      {/* Pagination Info */}
      {filteredNFTs.length > 0 && (
      <div className="flex justify-between items-center mb-4 text-sm text-muted-foreground">
        <div>
        Showing {startIndex + 1}-{Math.min(endIndex, filteredNFTs.length)} of {filteredNFTs.length} NFTs
        </div>
        <div>
        Page {currentPage} of {totalPages}
        </div>
      </div>
      )}

      {filteredNFTs.length === 0 ? (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">
        {searchTerm ? "No NFTs found matching your search" : "No NFTs owned"}
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
          <Card key={nft.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
          <Link href={`/nft/${nft.id}`}>
            <div className="aspect-square relative">
            <NFTImage
              src={nft.image || "/placeholder.svg"}
              alt={nft.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {nft.isVerified && (
              <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Verified
              </Badge>
              )}
            </div>
            {nft.edition && (
              <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="text-xs">
                {nft.edition}
              </Badge>
              </div>
            )}
            </div>
          </Link>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
            {nft.collection}
            {nft.isVerified && <CheckCircle className="w-3 h-3 text-blue-500" />}
            </div>
            <h3 className="font-semibold mb-2 truncate">{nft.name}</h3>
            
            {/* Token ID and Contract Address */}
            <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Token ID:</span>
              <div className="flex items-center gap-1">
              <span className="font-mono">{nft.tokenId}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={(e) => {
                e.preventDefault()
                copyToClipboard(nft.tokenId)
                }}
              >
                <Copy className="w-3 h-3" />
              </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Contract:</span>
              <div className="flex items-center gap-1">
              <span className="font-mono">{formatAddress(nft.contractAddress)}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
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
                className="h-4 w-4 p-0"
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
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Transfers:</span>
              <span>{nft.transfers}</span>
            </div>
            </div>

            <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={(e) => {
              e.preventDefault()
              handleSell(nft)
              }}
            >
              <DollarSign className="w-3 h-3 mr-1" />
              Sell
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
              e.preventDefault()
              handleAuction(nft)
              }}
            >
              <Gavel className="w-3 h-3 mr-1" />
              Auction
            </Button>
            </div>
          </CardContent>
          </Card>
        ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          >
          <ChevronLeft className="w-4 h-4" />
          Previous
          </Button>

          <div className="flex gap-1">
          {getPageNumbers().map((page, index) => (
            <div key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-muted-foreground">...</span>
            ) : (
              <Button
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page as number)}
              className="w-10 h-10"
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
      showTransactionSuccess={showTransactionSuccess}
      />
    </div>
  )
}