/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  Music,
  FileText,
  Plus,
  X,
  Info,
  Images,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Grid3X3
} from "lucide-react"
import Image from "next/image"
import { useAccount } from "wagmi"
import { useNFTMint } from "@/hooks/use-mint"

// ✅ THAY ĐỔI INTERFACE - KHÔNG EXTEND FILE
interface FileWithPreview {
  id: string
  file: File  // ← Lưu File object riêng biệt
  preview: string
  uploading?: boolean
  uploaded?: boolean
  ipfsUrl?: string
  error?: string
}

interface NFTMetadata {
  name: string
  description: string
  image: string
  external_url?: string
  attributes: Array<{ trait_type: string; value: string }>
  properties?: any
}

export default function CreatePage() {
  const { address, isConnected } = useAccount()
  const { mintMyCollection, getMaxBatchSize } = useNFTMint()

  // File management
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form states
  const [collectionName, setCollectionName] = useState("")
  const [collectionDescription, setCollectionDescription] = useState("")
  const [baseExternalUrl, setBaseExternalUrl] = useState("")
  const [properties, setProperties] = useState<Array<{ trait_type: string; value: string }>>([])
  const [isUnlockable, setIsUnlockable] = useState(false)
  const [unlockableContent, setUnlockableContent] = useState("")
  const [isSensitive, setIsSensitive] = useState(false)

  // Processing states
  const [isUploading, setIsUploading] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Get contract limits
  const maxBatchSize = getMaxBatchSize() as number || 50

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    handleFiles(files)
  }

  const handleFiles = (files: File[]) => {
    if (selectedFiles.length + files.length > maxBatchSize) {
      setError(`Maximum ${maxBatchSize} files allowed per collection`)
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    
    const validFiles = files.filter(file => {
      const maxSize = 100 * 1024 * 1024 // 100MB
      
      // Debug file type
      console.log('File:', file.name, 'Type:', file.type, 'Size:', file.size)
      
      if (!allowedTypes.includes(file.type)) {
        setError(`${file.name}: Invalid file type "${file.type}". Only images are allowed: ${allowedTypes.join(', ')}`)
        return false
      }
      
      if (file.size > maxSize) {
        setError(`${file.name}: File too large (max 100MB)`)
        return false
      }
      
      return true
    })

    if (validFiles.length === 0) {
      setError('No valid files selected. Please select image files only.')
      return
    }

    // ✅ THAY ĐỔI CÁCH TẠO newFiles - KHÔNG SPREAD FILE
    const newFiles: FileWithPreview[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file: file,  // ← Lưu File object nguyên vẹn
      preview: URL.createObjectURL(file),
      uploading: false,
      uploaded: false
    }))

    setSelectedFiles(prev => [...prev, ...newFiles])
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
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  // Remove file
  const removeFile = (id: string) => {
    setSelectedFiles(prev => {
      const updated = prev.filter(fileItem => fileItem.id !== id)
      // Revoke object URL to prevent memory leaks
      const fileToRemove = prev.find(fileItem => fileItem.id === id)
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return updated
    })
  }

  // ✅ THAY ĐỔI UPLOAD FUNCTION - SỬ DỤNG fileItem.file
  const uploadFilesToIPFS = async () => {
    setIsUploading(true)
    setUploadProgress(0)
    setError("")

    try {
      const uploadPromises = selectedFiles.map(async (fileItem, index) => {
        // Debug before upload - SỬ DỤNG fileItem.file
        console.log('Uploading file:', fileItem.file.name, 'Type:', fileItem.file.type)
        
        // Update file status
        setSelectedFiles(prev => 
          prev.map(f => f.id === fileItem.id ? { ...f, uploading: true } : f)
        )

        const formData = new FormData()
        formData.append('file', fileItem.file)  // ← SỬ DỤNG fileItem.file

        const response = await fetch('/api/upload-ipfs', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Upload failed for:', fileItem.file.name, errorData)
          throw new Error(errorData.error || 'Upload failed')
        }

        const result = await response.json()
        console.log('Upload success for:', fileItem.file.name, result.ipfsUrl)

        // Update file status
        setSelectedFiles(prev => 
          prev.map(f => f.id === fileItem.id ? { 
            ...f, 
            uploading: false, 
            uploaded: true, 
            ipfsUrl: result.ipfsUrl 
          } : f)
        )

        // Update progress
        setUploadProgress(((index + 1) / selectedFiles.length) * 100)

        return result.ipfsUrl
      })

      const ipfsUrls = await Promise.all(uploadPromises)
      return ipfsUrls

    } catch (error: any) {
      console.error('Upload error:', error)
      setError(error.message || 'Failed to upload files to IPFS')
      
      // Reset uploading status for failed files
      setSelectedFiles(prev => 
        prev.map(f => ({ ...f, uploading: false, error: error.message }))
      )
      
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  // ✅ THAY ĐỔI CREATE METADATA - SỬ DỤNG fileItem.file.name
  const createMetadata = (ipfsUrls: string[]): NFTMetadata[] => {
    return ipfsUrls.map((ipfsUrl, index) => {
      const fileName = selectedFiles[index]?.file.name.replace(/\.[^/.]+$/, "") || `NFT ${index + 1}`
      
      return {
        name: `${collectionName} #${index + 1}`,
        description: collectionDescription || `${fileName} from ${collectionName} collection`,
        image: ipfsUrl,
        external_url: baseExternalUrl ? `${baseExternalUrl}/${index + 1}` : undefined,
        attributes: properties.filter(prop => prop.trait_type && prop.value),
        properties: {
          collection: collectionName,
          edition: index + 1,
          total_supply: selectedFiles.length,
          unlockable_content: isUnlockable ? unlockableContent : undefined,
          sensitive_content: isSensitive
        }
      }
    })
  }

  // Upload metadata to IPFS
  const uploadMetadataToIPFS = async (metadataList: NFTMetadata[]) => {
    const metadataPromises = metadataList.map(async (metadata) => {
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
    })

    return Promise.all(metadataPromises)
  }

  // Main mint function
  const handleMintCollection = async () => {
    if (!isConnected || !address) {
      setError("Please connect your wallet first")
      return
    }

    if (selectedFiles.length === 0) {
      setError("Please select at least one file")
      return
    }

    if (!collectionName.trim()) {
      setError("Please enter a collection name")
      return
    }

    if (selectedFiles.length > maxBatchSize) {
      setError(`Maximum ${maxBatchSize} NFTs allowed per collection`)
      return
    }

    setIsMinting(true)
    setError("")
    setSuccess("")

    try {
      // Step 1: Upload images to IPFS
      console.log("📤 Uploading images to IPFS...")
      const imageUrls = await uploadFilesToIPFS()

      // Step 2: Create metadata
      console.log("📝 Creating metadata...")
      const metadataList = createMetadata(imageUrls)

      // Step 3: Upload metadata to IPFS
      console.log("📤 Uploading metadata to IPFS...")
      const metadataUrls = await uploadMetadataToIPFS(metadataList)

      // Step 4: Mint NFT collection
      console.log("⛏️ Minting NFT collection...")
      const result = await mintMyCollection(metadataUrls)

      console.log("✅ Collection minted successfully!", result)
      setSuccess(`Successfully minted ${selectedFiles.length} NFTs! Transaction: ${result.hash}`)
      
      // ✅ THAY ĐỔI RESET FORM - SỬ DỤNG fileItem.preview
      selectedFiles.forEach(fileItem => URL.revokeObjectURL(fileItem.preview))
      setSelectedFiles([])
      setCollectionName("")
      setCollectionDescription("")
      setBaseExternalUrl("")
      setProperties([])
      setUnlockableContent("")
      setIsUnlockable(false)
      setIsSensitive(false)

    } catch (error: any) {
      console.error("Minting error:", error)
      setError(error.message || "Failed to mint NFT collection")
    } finally {
      setIsMinting(false)
    }
  }

  // Property management
  const addProperty = () => {
    setProperties([...properties, { trait_type: "", value: "" }])
  }

  const removeProperty = (index: number) => {
    setProperties(properties.filter((_, i) => i !== index))
  }

  const updateProperty = (index: number, field: "trait_type" | "value", value: string) => {
    const updated = [...properties]
    updated[index][field] = value
    setProperties(updated)
  }

  const canMint = isConnected && selectedFiles.length > 0 && collectionName.trim() && !isUploading && !isMinting

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-3xl font-bold">Create NFT Collection</h1>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Grid3X3 className="w-3 h-3" />
                Batch Mint
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Upload multiple images and create your NFT collection on the blockchain
            </p>
          </div>

          {/* Upload Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Images className="w-5 h-5" />
                Upload Images ({selectedFiles.length}/{maxBatchSize})
              </CardTitle>
              <CardDescription>
                Select multiple images to create your collection. Max {maxBatchSize} files, each up to 100MB.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? "border-primary bg-primary/5" 
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <Images className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Drop images here or click to browse</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  JPG, PNG, GIF, WebP up to 100MB each
                </p>
                
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  disabled={isUploading || isMinting}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Select Files
                </Button>
              </div>

              {/* Selected Files Grid */}
              {selectedFiles.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Selected Files ({selectedFiles.length})</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        selectedFiles.forEach(fileItem => URL.revokeObjectURL(fileItem.preview))
                        setSelectedFiles([])
                      }}
                      disabled={isUploading || isMinting}
                    >
                      Clear All
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {selectedFiles.map((fileItem) => (
                      <div key={fileItem.id} className="relative group">
                        <div className="aspect-square relative rounded-lg overflow-hidden bg-muted border">
                          <Image
                            src={fileItem.preview}
                            alt={`Preview of ${fileItem.file.name}`}
                            fill
                            className="object-cover"
                          />
                          
                          {/* Status Overlay */}
                          {fileItem.uploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                            </div>
                          )}
                          
                          {fileItem.uploaded && (
                            <div className="absolute top-2 right-2">
                              <CheckCircle className="w-5 h-5 text-green-500 bg-white rounded-full" />
                            </div>
                          )}
                          
                          {fileItem.error && (
                            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                              <AlertTriangle className="w-6 h-6 text-red-500" />
                            </div>
                          )}
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => removeFile(fileItem.id)}
                            disabled={fileItem.uploading}
                            className="absolute top-2 left-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                            aria-label={`Remove ${fileItem.file.name}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <p className="text-xs text-center mt-2 truncate" title={fileItem.file.name}>
                          {fileItem.file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Uploading to IPFS...</span>
                    <span className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Collection Details */}
            <Card>
              <CardHeader>
                <CardTitle>Collection Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="collection-name">Collection Name *</Label>
                  <Input
                    id="collection-name"
                    value={collectionName}
                    onChange={(e) => setCollectionName(e.target.value)}
                    placeholder="Enter collection name"
                    disabled={isUploading || isMinting}
                  />
                </div>

                <div>
                  <Label htmlFor="collection-description">Collection Description</Label>
                  <Textarea
                    id="collection-description"
                    value={collectionDescription}
                    onChange={(e) => setCollectionDescription(e.target.value)}
                    placeholder="Describe your collection..."
                    rows={3}
                    disabled={isUploading || isMinting}
                  />
                </div>

                <div>
                  <Label htmlFor="base-external-url">Base External URL</Label>
                  <Input
                    id="base-external-url"
                    value={baseExternalUrl}
                    onChange={(e) => setBaseExternalUrl(e.target.value)}
                    placeholder="https://yoursite.com/collection"
                    disabled={isUploading || isMinting}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Base URL for external links (token number will be appended)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Properties & Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Properties & Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Properties */}
                <div>
                  <Label>Shared Properties</Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    These properties will be added to all NFTs in the collection
                  </p>
                  
                  <div className="space-y-2">
                    {properties.map((property, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Trait type (e.g. Color)"
                          value={property.trait_type}
                          onChange={(e) => updateProperty(index, "trait_type", e.target.value)}
                        />
                        <Input
                          placeholder="Value (e.g. Blue)"
                          value={property.value}
                          onChange={(e) => updateProperty(index, "value", e.target.value)}
                        />
                        <Button variant="outline" size="icon" onClick={() => removeProperty(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addProperty} className="w-full bg-transparent">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Property
                    </Button>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div>
                  <Label>Advanced Settings</Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Configure additional settings for your collection
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Unlockable Content</Label>
                        <p className="text-sm text-muted-foreground">
                          Include unlockable content that can only be revealed by the owner
                        </p>
                      </div>
                      <Switch checked={isUnlockable} onCheckedChange={setIsUnlockable} />
                    </div>

                    {isUnlockable && (
                      <div>
                        <Label htmlFor="unlockable-content">Unlockable Content</Label>
                        <Textarea
                          id="unlockable-content"
                          value={unlockableContent}
                          onChange={(e) => setUnlockableContent(e.target.value)}
                          placeholder="Enter content that will be unlocked after purchase"
                          rows={3}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Explicit & Sensitive Content</Label>
                        <p className="text-sm text-muted-foreground">Set this item as explicit and sensitive content</p>
                      </div>
                      <Switch checked={isSensitive} onCheckedChange={setIsSensitive} />
                    </div>

                    <div>
                      <Label htmlFor="supply">Supply</Label>
                      <Input id="supply" type="number" defaultValue="1" min="1" />
                      <p className="text-xs text-muted-foreground mt-1">The number of items that can be minted</p>
                    </div>

                    <div>
                      <Label htmlFor="blockchain">Blockchain</Label>
                      <Select defaultValue="ethereum">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ethereum">Ethereum</SelectItem>
                          <SelectItem value="polygon">Polygon</SelectItem>
                          <SelectItem value="arbitrum">Arbitrum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Create Button */}
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Gas Fee Required</h4>
                    <p className="text-sm text-blue-700">
                      Creating an NFT requires a one-time gas fee to mint it on the blockchain. The fee varies based on
                      network congestion.
                    </p>
                  </div>
                </div>
              </div>

              <Button className="w-full" size="lg" disabled={!selectedFiles.length || isUploading || isMinting} onClick={handleMintCollection}>
                {isMinting ? "Minting..." : "Create NFT Collection"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
