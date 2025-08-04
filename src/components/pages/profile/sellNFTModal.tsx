/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, DollarSign, AlertTriangle, CheckCircle, Copy } from "lucide-react"
import { useAccount } from "wagmi"
import { useNFTMarketplace } from "@/hooks/use-market"
import { useNFTApproval } from "@/hooks/use-approval-market"
import { formatEther, parseEther } from "viem"
//interfaces
interface NFT {
  id: string
  name: string
  collection: string
  image: string
  contractAddress: string
  tokenId: string
}

interface SellNFTModalProps {
  isOpen: boolean
  onClose: () => void
  nft: NFT | null
}

export default function SellNFTModal({ isOpen, onClose, nft }: SellNFTModalProps) {
  const { address } = useAccount()
  const { listSingleNFT, getMarketplaceFee } = useNFTMarketplace()
  const { isApprovedForAll, setApprovalForAll } = useNFTApproval()

  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"form" | "approval" | "listing">("form")
  const [error, setError] = useState("")

  // Get approval status
  const { isApproved, refetch: refetchApproval } = isApprovedForAll(
    nft?.contractAddress || "",
    address || ""
  )

  // Get marketplace fee
  const marketplaceFee = getMarketplaceFee()
  const feePercentage = marketplaceFee ? Number(marketplaceFee) / 100 : 2.5

  // Calculate fees
  const priceNum = parseFloat(price) || 0
  const marketplaceFeeAmount = priceNum * (feePercentage / 100)
  const youReceive = priceNum - marketplaceFeeAmount

  const handleClose = () => {
    setPrice("")
    setDescription("")
    setStep("form")
    setError("")
    onClose()
  }

  const handleSell = async () => {
    if (!nft || !address || !price) return

    setIsLoading(true)
    setError("")

    try {
      // Step 1: Check approval
      setStep("approval")
      
      if (!isApproved) {
        console.log("NFT not approved, requesting approval...")
        await setApprovalForAll(nft.contractAddress, true)
        
        // Wait a bit and refetch approval status
        await new Promise(resolve => setTimeout(resolve, 2000))
        await refetchApproval()
      }

      // Step 2: List NFT
      setStep("listing")
      console.log("Listing NFT...")
      
      const priceInWei = parseEther(price)
      await listSingleNFT(
        nft.contractAddress,
        parseInt(nft.tokenId),
        Number(priceInWei)
      )

      console.log("NFT listed successfully!")
      handleClose()
      
      // Show success message (you can add toast here)
      alert("NFT listed successfully!")

    } catch (error: any) {
      console.error("Error selling NFT:", error)
      setError(error.message || "Failed to list NFT")
      setStep("form")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (!nft) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Sell NFT
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* NFT Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={nft.image || "/placeholder.svg"}
                    alt={nft.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{nft.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{nft.collection}</p>
                  
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Token ID:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono">{nft.tokenId}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => copyToClipboard(nft.tokenId)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Contract:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono">
                          {nft.contractAddress.slice(0, 6)}...{nft.contractAddress.slice(-4)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => copyToClipboard(nft.contractAddress)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approval Status */}
          <Alert className={isApproved ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
            <div className="flex items-center gap-2">
              {isApproved ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              )}
              <AlertDescription>
                {isApproved 
                  ? "✅ NFT approved for marketplace"
                  : "⚠️ NFT needs approval before listing"
                }
              </AlertDescription>
            </div>
          </Alert>

          {/* Price Input */}
          <div className="space-y-2">
            <Label htmlFor="price">Price (ROSE) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter price in ROSE"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={isLoading}
            />
            {price && (
              <p className="text-xs text-muted-foreground">
                ≈ ${(priceNum * 0.05).toFixed(2)} USD (estimated)
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a description for your listing..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* Fee Breakdown */}
          {price && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-medium">Fee Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Listing Price:</span>
                    <span>{priceNum.toFixed(4)} ROSE</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Marketplace Fee ({feePercentage}%):</span>
                    <span>-{marketplaceFeeAmount.toFixed(4)} ROSE</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium text-green-600">
                    <span>You Receive:</span>
                    <span>{youReceive.toFixed(4)} ROSE</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress Steps */}
          {isLoading && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <div className="flex-1">
                    {step === "approval" && "Requesting NFT approval..."}
                    {step === "listing" && "Listing NFT on marketplace..."}
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="text-xs text-muted-foreground">
                    {step === "approval" && "Please approve the transaction in your wallet"}
                    {step === "listing" && "Please confirm the listing transaction"}
                  </div>
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

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSell}
              disabled={isLoading || !price || parseFloat(price) <= 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {step === "approval" ? "Approving..." : "Listing..."}
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  List NFT
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
