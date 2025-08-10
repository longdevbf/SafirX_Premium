/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  X,
  Images,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Grid3X3,
  Trash2
} from "lucide-react"
import Image from "next/image"
import { useAccount } from "wagmi"
import { useNFTMint } from "@/hooks/use-mint"
import TransactionToast from "@/components/ui/transaction-toast"

interface FileWithPreview {
  id: string
  file: File
  preview: string
  uploading?: boolean
  uploaded?: boolean
  ipfsUrl?: string
  error?: string
  customName?: string
  customDescription?: string
  customAttributes?: Array<{ trait_type: string; value: string }>
}

export default function CollectionMint() {
  const { isConnected, address } = useAccount()
  const { mintMyCollection } = useNFTMint()
  
  // File management
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Form state
  const [collectionName, setCollectionName] = useState("")
  const [description, setDescription] = useState("")
  const [allowCustomMetadata, setAllowCustomMetadata] = useState(false)
  
  // Collection attributes
  const [collectionAttributes, setCollectionAttributes] = useState<Array<{ trait_type: string; value: string }>>([])
  
  // Upload state
  const [isMinting, setIsMinting] = useState(false)
  
  // Status
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // Toast state
  const [showToast, setShowToast] = useState(false)
  const [toastTxHash, setToastTxHash] = useState("")
  
  // Constants
  const maxBatchSize = 10
  const maxFileSize = 100 * 1024 * 1024 // 100MB

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
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      handleFiles(selectedFiles)
    }
  }

  const handleFiles = (newFiles: File[]) => {
    // Validate file count
    if (files.length + newFiles.length > maxBatchSize) {
      setError(`Maximum ${maxBatchSize} files allowed`)
      return
    }

    // Process files
    const validFiles: FileWithPreview[] = []
    
    newFiles.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError(`${file.name} is not a valid image file`)
        return
      }

      // Validate file size
      if (file.size > maxFileSize) {
        setError(`${file.name} is too large. Maximum size is 100MB`)
        return
      }

      // Check if file already exists
      const exists = files.some(f => f.file.name === file.name && f.file.size === file.size)
      if (exists) {
        setError(`${file.name} is already selected`)
        return
      }

      const fileWithPreview: FileWithPreview = {
        id: Math.random().toString(36).substring(2),
        file,
        preview: URL.createObjectURL(file),
        customName: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        customDescription: "",
        customAttributes: []
      }

      validFiles.push(fileWithPreview)
    })

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles])
      setError("")
    }
  }

  const removeFile = (id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id)
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter(f => f.id !== id)
    })
  }

  // Collection attribute management
  const addCollectionAttribute = () => {
    setCollectionAttributes(prev => [...prev, { trait_type: "", value: "" }])
  }

  const updateCollectionAttribute = (index: number, field: "trait_type" | "value", value: string) => {
    setCollectionAttributes(prev => 
      prev.map((attr, i) => i === index ? { ...attr, [field]: value } : attr)
    )
  }

  const removeCollectionAttribute = (index: number) => {
    setCollectionAttributes(prev => prev.filter((_, i) => i !== index))
  }

  // Individual NFT customization functions
  const updateFileCustomData = (fileId: string, field: 'customName' | 'customDescription', value: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, [field]: value } : file
    ))
  }

  const addCustomAttribute = (fileId: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { 
            ...file, 
            customAttributes: [...(file.customAttributes || []), { trait_type: "", value: "" }]
          }
        : file
    ))
  }

  const updateCustomAttribute = (fileId: string, attrIndex: number, field: 'trait_type' | 'value', value: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? {
            ...file,
            customAttributes: file.customAttributes?.map((attr, i) => 
              i === attrIndex ? { ...attr, [field]: value } : attr
            ) || []
          }
        : file
    ))
  }

  const removeCustomAttribute = (fileId: string, attrIndex: number) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? {
            ...file,
            customAttributes: file.customAttributes?.filter((_, i) => i !== attrIndex) || []
          }
        : file
    ))
  }

  // Mint collection
  const handleMintCollection = async () => {
    if (!canMint) {
      if (!isConnected) return
      if (files.length === 0) return
      if (!collectionName.trim()) return
      if (isMinting) return
    }

    try {
      setError("")
      setIsMinting(true)
      
      // Upload all files and create metadata URIs (like single NFT mint)
      const metadataURIs: string[] = []
      
      for (let index = 0; index < files.length; index++) {
        const fileData = files[index]
        
        // Step 1: Upload image file
        const imageFormData = new FormData()
        imageFormData.append('file', fileData.file)

        const imageResponse = await fetch('/api/upload-ipfs', {
          method: 'POST',
          body: imageFormData,
        })

        if (!imageResponse.ok) {
          throw new Error(`Failed to upload image ${fileData.file.name}`)
        }

        const imageResult = await imageResponse.json()
        const imageUrl = imageResult.ipfsUrl// Step 2: Create metadata JSON
        const nftName = fileData.customName || `${collectionName} #${index + 1}`
        const nftDescription = fileData.customDescription || description

        // Combine collection and custom attributes
        const allAttributes = [
          ...collectionAttributes,
          ...(fileData.customAttributes || []),
          { trait_type: "Collection", value: collectionName },
          { trait_type: `Edition`, value: `${index + 1} of ${files.length}` },
          { trait_type: "Creator", value: address || "" },
          { trait_type: "Created Date", value: new Date().toISOString() }
        ].filter(attr => attr.trait_type && attr.value) // Remove empty attributes

        const metadata = {
          name: nftName,
          description: nftDescription,
          image: imageUrl,
          attributes: allAttributes,
          properties: {
            edition: index + 1,
            collection: collectionName,
            total_supply: files.length
          }
        }

        // Step 3: Upload metadata JSON (like single NFT mint)
        const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], {
          type: 'application/json'
        })
        const metadataFile = new File([metadataBlob], `${nftName.replace(/[^a-zA-Z0-9]/g, '_')}.json`, {
          type: 'application/json'
        })

        const metadataFormData = new FormData()
        metadataFormData.append('file', metadataFile)

        const metadataResponse = await fetch('/api/upload-ipfs', {
          method: 'POST',
          body: metadataFormData,
        })

        if (!metadataResponse.ok) {
          throw new Error(`Failed to upload metadata for ${nftName}`)
        }

        const metadataResult = await metadataResponse.json()
        const metadataUrl = metadataResult.ipfsUrl
        metadataURIs.push(metadataUrl)
      }
      
      if (metadataURIs.length === 0) {
        throw new Error("Failed to create metadata URIs")
      }

      // Step 4: Mint collection using mintMyCollection
      const result = await mintMyCollection(metadataURIs)
      
      if (result?.hash) {
        setToastTxHash(result.hash)
        setShowToast(true)
        setSuccess(`Successfully minted ${files.length} NFTs!`)
        
        // Reset form
        setTimeout(() => {
          setFiles([])
          setCollectionName("")
          setDescription("")
          setCollectionAttributes([])
        }, 3000)
      }

    } catch (err) {
   //   //('Minting error:', err)
      setError(err instanceof Error ? err.message : "Failed to mint collection")
    } finally {
      setIsMinting(false)
    }
  }

  // Computed values
  const canMint = isConnected && files.length > 0 && collectionName.trim() && !isMinting

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Collection Settings & Actions */}
        <div className="space-y-6">
          {/* Collection Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="w-5 h-5" />
                Collection Settings
              </CardTitle>
              <CardDescription>
                Configure your collection metadata and minting preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Collection Info */}
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="collection-name">Collection Name *</Label>
                  <Input
                    id="collection-name"
                    placeholder="Enter collection name"
                    value={collectionName}
                    onChange={(e) => setCollectionName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="collection-description">Collection Description</Label>
                  <Textarea
                    id="collection-description"
                    placeholder="Describe your collection..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <Separator />

              {/* Collection Attributes */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Collection Properties</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addCollectionAttribute}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Property
                  </Button>
                </div>

                {collectionAttributes.length > 0 && (
                  <div className="space-y-3">
                    {collectionAttributes.map((attribute, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Property name"
                          value={attribute.trait_type}
                          onChange={(e) => updateCollectionAttribute(index, "trait_type", e.target.value)}
                        />
                        <Input
                          placeholder="Value"
                          value={attribute.value}
                          onChange={(e) => updateCollectionAttribute(index, "value", e.target.value)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCollectionAttribute(index)}
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

          {/* Collection Stats */}
          {files.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{files.length}</div>
                    <div className="text-sm text-muted-foreground">Total NFTs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {files.filter(f => f.uploaded).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Ready to Mint</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              {files.length === 0 ? (
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full" 
                  size="lg"
                >
                  <Images className="w-4 h-4 mr-2" />
                  Select Images
                </Button>
              ) : (
                <Button 
                  onClick={handleMintCollection}
                  disabled={!canMint || isMinting}
                  className="w-full" 
                  size="lg"
                >
                  {isMinting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Minting Collection...
                    </>
                  ) : (
                    <>
                      <Grid3X3 className="w-4 h-4 mr-2" />
                      Mint Collection ({files.length} NFTs)
                    </>
                  )}
                </Button>
              )}
              
              {!isConnected && (
                <p className="text-sm text-center text-muted-foreground">
                  Connect your wallet to mint collection
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - File Upload & Preview */}
        <div className="space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Images className="w-5 h-5" />
                Upload Images ({files.length}/{maxBatchSize})
              </CardTitle>
              <CardDescription>
                Select multiple images to create your collection. Max {maxBatchSize} files.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
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
                      <Images className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Drop your images here</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        or click to browse files (max {maxBatchSize} images)
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choose Files
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {files.length} image{files.length !== 1 ? 's' : ''} selected
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add More
                    </Button>
                  </div>

                  {/* File Preview Grid */}
                  <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                    {files.map((fileData) => (
                      <div key={fileData.id} className="relative group">
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                          <Image 
                            src={fileData.preview} 
                            alt={fileData.file.name}
                            fill
                            className="object-cover"
                          />
                          
                          {/* Status Overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            {fileData.uploading ? (
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                            ) : fileData.uploaded ? (
                              <CheckCircle className="w-6 h-6 text-green-400" />
                            ) : fileData.error ? (
                              <AlertTriangle className="w-6 h-6 text-red-400" />
                            ) : (
                              <div className="text-white text-center">
                                <p className="text-xs">Ready to upload</p>
                              </div>
                            )}
                          </div>

                          {/* Remove Button */}
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                            onClick={() => removeFile(fileData.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>

                          {/* Status Badge */}
                          {(fileData.uploading || fileData.uploaded || fileData.error) && (
                            <div className="absolute bottom-1 left-1">
                              {fileData.uploading && (
                                <Badge variant="secondary" className="text-xs">
                                  Uploading...
                                </Badge>
                              )}
                              {fileData.uploaded && (
                                <Badge variant="default" className="text-xs bg-green-500">
                                  ✓ Uploaded
                                </Badge>
                              )}
                              {fileData.error && (
                                <Badge variant="destructive" className="text-xs">
                                  Error
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="mt-1 text-center">
                          <p className="text-xs font-medium truncate">{fileData.customName || fileData.file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(fileData.file.size / 1024 / 1024).toFixed(1)} MB
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Custom Metadata Toggle */}
                  {files.length > 0 && (
                    <div className="mt-6 flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="custom-metadata" className="text-sm font-medium">
                          Custom Metadata per NFT
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Customize name, description, and attributes for each NFT individually
                        </p>
                      </div>
                      <Switch
                        id="custom-metadata"
                        checked={allowCustomMetadata}
                        onCheckedChange={setAllowCustomMetadata}
                      />
                    </div>
                  )}

                  {/* Individual NFT Customization */}
                  {files.length > 0 && allowCustomMetadata && (
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle className="text-lg">Customize Individual NFTs</CardTitle>
                        <CardDescription>
                          Customize each NFT&apos;s metadata individually
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {files.map((fileData, index) => (
                          <div key={fileData.id} className="p-4 border rounded-lg space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                <Image 
                                  src={fileData.preview} 
                                  alt={fileData.file.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor={`name-${fileData.id}`} className="text-sm">NFT Name</Label>
                                    <Input
                                      id={`name-${fileData.id}`}
                                      value={fileData.customName || ""}
                                      onChange={(e) => updateFileCustomData(fileData.id, 'customName', e.target.value)}
                                      placeholder={`${collectionName} #${index + 1}`}
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`desc-${fileData.id}`} className="text-sm">Description</Label>
                                    <Textarea
                                      id={`desc-${fileData.id}`}
                                      value={fileData.customDescription || ""}
                                      onChange={(e) => updateFileCustomData(fileData.id, 'customDescription', e.target.value)}
                                      placeholder="NFT description..."
                                      rows={2}
                                      className="mt-1"
                                    />
                                  </div>
                                </div>

                                {/* Custom Attributes */}
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <Label className="text-sm">Custom Attributes</Label>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => addCustomAttribute(fileData.id)}
                                      className="h-7 px-2"
                                    >
                                      <Plus className="w-3 h-3 mr-1" />
                                      Add
                                    </Button>
                                  </div>
                                  
                                  {fileData.customAttributes && fileData.customAttributes.length > 0 ? (
                                    <div className="space-y-2">
                                      {fileData.customAttributes.map((attr, attrIndex) => (
                                        <div key={attrIndex} className="flex gap-2">
                                          <Input
                                            value={attr.trait_type}
                                            onChange={(e) => updateCustomAttribute(fileData.id, attrIndex, 'trait_type', e.target.value)}
                                            placeholder="Trait type"
                                            className="flex-1"
                                          />
                                          <Input
                                            value={attr.value}
                                            onChange={(e) => updateCustomAttribute(fileData.id, attrIndex, 'value', e.target.value)}
                                            placeholder="Value"
                                            className="flex-1"
                                          />
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeCustomAttribute(fileData.id, attrIndex)}
                                            className="h-9 w-9 p-0"
                                          >
                                            <X className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No custom attributes</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mint Progress */}
          {isMinting && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Minting Collection...</span>
                    <span className="text-sm text-muted-foreground">
                      Please wait...
                    </span>
                  </div>
                  <Progress value={undefined} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
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
        message="Collection Minted Successfully!"
        onClose={() => setShowToast(false)}
      />
    </>
  )
}

