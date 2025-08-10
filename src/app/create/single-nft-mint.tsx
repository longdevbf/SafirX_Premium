/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useRef } from "react"
import { useAccount } from "wagmi"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ImageIcon, Upload, X, Plus, Trash2, 
  Loader2, CheckCircle, AlertCircle 
} from "lucide-react"
import { useNFTMint } from "@/hooks/use-mint"
import TransactionToast from "@/components/ui/transaction-toast"

interface NFTMetadata {
  name: string
  description: string
  image: string
  external_url?: string
  attributes: Array<{ trait_type: string; value: string }>
  properties?: any
}

interface CustomAttribute {
  trait_type: string
  value: string
}

export default function SingleNFTMint() {
  const { address, isConnected } = useAccount()
  const { mintNFT } = useNFTMint()

  // File management
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // NFT metadata
  const [nftName, setNftName] = useState("")
  const [description, setDescription] = useState("")
  const [attributes, setAttributes] = useState<CustomAttribute[]>([])

  // Processing states
  const [isUploading, setIsUploading] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Toast states
  const [showToast, setShowToast] = useState(false)
  const [toastTxHash, setToastTxHash] = useState("")

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleFile = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const maxSize = 100 * 1024 * 1024 // 100MB

    if (!allowedTypes.includes(file.type)) {
      setError(`Invalid file type "${file.type}". Only images are allowed: ${allowedTypes.join(', ')}`)
      return
    }

    if (file.size > maxSize) {
      setError(`File too large (max 100MB)`)
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setError("")
  }

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }

  // Remove file
  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Upload to IPFS
  const uploadToIPFS = async (file: File): Promise<string> => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-ipfs', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      setUploadProgress(100)
      return result.ipfsUrl

    } catch (error: any) {
   //   //('Upload error:', error)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  // Create metadata
  const createMetadata = (imageUrl: string): NFTMetadata => {
    return {
      name: nftName || selectedFile?.name.replace(/\.[^/.]+$/, "") || "Untitled NFT",
      description: description || "A unique NFT created on SafirX",
      image: imageUrl,
      attributes: attributes.filter(attr => attr.trait_type && attr.value)
    }
  }

  // Upload metadata to IPFS
  const uploadMetadataToIPFS = async (metadata: NFTMetadata): Promise<string> => {
    const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: 'application/json'
    })
    
    const formData = new FormData()
    formData.append('file', metadataBlob, `${metadata.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`)

    const response = await fetch('/api/upload-ipfs', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Metadata upload failed')
    }

    const result = await response.json()
    return result.ipfsUrl
  }

  // Main mint function
  const handleMintNFT = async () => {
    if (!isConnected || !address) {
      setError("Please connect your wallet first")
      return
    }

    if (!selectedFile) {
      setError("Please select an image file")
      return
    }

    if (!nftName.trim()) {
      setError("Please enter an NFT name")
      return
    }

    setIsMinting(true)
    setError("")
    setSuccess("")

    try {
      // Step 1: Upload image to IPFS
      const imageUrl = await uploadToIPFS(selectedFile)

      // Step 2: Create metadata
      const metadata = createMetadata(imageUrl)

      // Step 3: Upload metadata to IPFS
      const metadataUrl = await uploadMetadataToIPFS(metadata)

      // Step 4: Mint NFT
      const result = await mintNFT(metadataUrl)
      setSuccess(`Successfully minted NFT!`)
      
      // Show toast
      setToastTxHash(result.hash)
      setShowToast(true)
      
      // Reset form
      removeFile()
      setNftName("")
      setDescription("")
      setAttributes([])

    } catch (error: any) {
     // //("Minting error:", error)
      setError(error.message || "Failed to mint NFT")
    } finally {
      setIsMinting(false)
    }
  }

  // Attribute management
  const addAttribute = () => {
    setAttributes([...attributes, { trait_type: "", value: "" }])
  }

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index))
  }

  const updateAttribute = (index: number, field: "trait_type" | "value", value: string) => {
    const updated = [...attributes]
    updated[index][field] = value
    setAttributes(updated)
  }

  const canMint = isConnected && selectedFile && nftName.trim() && !isUploading && !isMinting

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Metadata Form */}
          <Card>
            <CardHeader>
              <CardTitle>NFT Details</CardTitle>
              <CardDescription>
                Customize your NFT metadata and properties
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nft-name">NFT Name *</Label>
                  <Input
                    id="nft-name"
                    placeholder="Enter NFT name"
                    value={nftName}
                    onChange={(e) => setNftName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your NFT..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <Separator />

              {/* Attributes */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Properties</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addAttribute}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Property
                  </Button>
                </div>

                {attributes.length > 0 && (
                  <div className="space-y-3">
                    {attributes.map((attribute, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Property name"
                          value={attribute.trait_type}
                          onChange={(e) => updateAttribute(index, "trait_type", e.target.value)}
                        />
                        <Input
                          placeholder="Value"
                          value={attribute.value}
                          onChange={(e) => updateAttribute(index, "value", e.target.value)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttribute(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mint Button */}
          <Card>
            <CardContent className="pt-6">
              <Button 
                onClick={handleMintNFT}
                disabled={!canMint}
                className="w-full" 
                size="lg"
              >
                {isMinting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Minting NFT...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Mint NFT
                  </>
                )}
              </Button>
              
              {!isConnected && (
                <p className="text-sm text-center text-muted-foreground mt-2">
                  Connect your wallet to mint NFT
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Upload & Preview */}
        <div className="space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Upload Image
              </CardTitle>
              <CardDescription>
                Select an image file to create your NFT. Max 100MB.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedFile ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? "border-primary bg-primary/5" 
                      : "border-muted-foreground/25 hover:border-primary/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-muted rounded-full">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Drop your image here</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        or click to browse files
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choose File
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted">
                      <Image 
                        src={previewUrl} 
                        alt="NFT Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeFile}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload Progress */}
          {isUploading && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Uploading to IPFS...</span>
                    <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <TransactionToast
        isVisible={showToast}
        txHash={toastTxHash}
        message="NFT Minted Successfully!"
        onClose={() => setShowToast(false)}
      />
    </>
  )
}

