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
  Upload,
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
  const { isConnected } = useAccount()
  const { mintMyCollection } = useNFTMint()
  
  // File management
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Form state
  const [collectionName, setCollectionName] = useState("")
  const [description, setDescription] = useState("")
  const [externalUrl, setExternalUrl] = useState("")
  const [isUnlockable, setIsUnlockable] = useState(false)
  const [unlockableContent, setUnlockableContent] = useState("")
  const [isSensitive, setIsSensitive] = useState(false)
  const [allowCustomMetadata, setAllowCustomMetadata] = useState(false)
  
  // Collection attributes
  const [collectionAttributes, setCollectionAttributes] = useState<Array<{ trait_type: string; value: string }>>([])
  
  // Upload state
  const [isUploading, setIsUploading] = useState(false)
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

  // Upload to IPFS
  const handleUploadToIPFS = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    setError("")

    try {
      for (const fileData of files) {
        if (fileData.uploaded) continue

        // Update file status
        setFiles(prev => 
          prev.map(f => f.id === fileData.id ? { ...f, uploading: true } : f)
        )

        // Create form data
        const formData = new FormData()
        formData.append('file', fileData.file)

        // Upload with progress tracking
        const response = await fetch('/api/upload-ipfs', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Failed to upload ${fileData.file.name}`)
        }

        const result = await response.json()

        // Update file with IPFS URL
        setFiles(prev => 
          prev.map(f => f.id === fileData.id ? { 
            ...f, 
            uploading: false, 
            uploaded: true, 
            ipfsUrl: result.ipfsUrl 
          } : f)
        )
      }

      setSuccess("All files uploaded successfully!")
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : "Failed to upload files")
    } finally {
      setIsUploading(false)
    }
  }

  // Mint collection
  const handleMintCollection = async () => {
    if (!canMint) return

    try {
      setError("")
      setIsMinting(true)
      
      // Upload files first if not uploaded
      if (files.some(f => !f.uploaded)) {
        await handleUploadToIPFS()
      }

      // Create metadata URIs array
      const metadataURIs: string[] = files
        .filter(f => f.uploaded && f.ipfsUrl)
        .map(f => f.ipfsUrl!)

      if (metadataURIs.length === 0) {
        throw new Error("No files uploaded successfully")
      }

      // Mint collection using mintMyCollection
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
          setExternalUrl("")
          setCollectionAttributes([])
        }, 3000)
      }

    } catch (err) {
      console.error('Minting error:', err)
      setError(err instanceof Error ? err.message : "Failed to mint collection")
    } finally {
      setIsMinting(false)
    }
  }

  // Computed values
  const canUpload = files.length > 0 && !isUploading
  const canMint = isConnected && files.length > 0 && collectionName.trim() && 
                  files.every(f => f.uploaded) && !isMinting

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

                <div className="space-y-2">
                  <Label htmlFor="external-url">External URL</Label>
                  <Input
                    id="external-url"
                    placeholder="https://yourwebsite.com"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
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

              <Separator />

              {/* Advanced Options */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Minting Options</Label>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="custom-metadata">Custom Metadata per NFT</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow different metadata for each NFT in collection
                      </p>
                    </div>
                    <Switch
                      id="custom-metadata"
                      checked={allowCustomMetadata}
                      onCheckedChange={setAllowCustomMetadata}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="unlockable">Unlockable Content</Label>
                      <p className="text-sm text-muted-foreground">
                        Include content for collection owners
                      </p>
                    </div>
                    <Switch
                      id="unlockable"
                      checked={isUnlockable}
                      onCheckedChange={setIsUnlockable}
                    />
                  </div>

                  {isUnlockable && (
                    <Textarea
                      placeholder="Enter unlockable content..."
                      value={unlockableContent}
                      onChange={(e) => setUnlockableContent(e.target.value)}
                      rows={2}
                    />
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sensitive">Sensitive Content</Label>
                      <p className="text-sm text-muted-foreground">
                        Mark if collection contains sensitive content
                      </p>
                    </div>
                    <Switch
                      id="sensitive"
                      checked={isSensitive}
                      onCheckedChange={setIsSensitive}
                    />
                  </div>
                </div>
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
                <>
                  <Button 
                    onClick={handleUploadToIPFS}
                    disabled={!canUpload || isUploading}
                    className="w-full" 
                    size="lg"
                    variant="outline"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading... ({files.filter(f => f.uploaded).length}/{files.length})
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload to IPFS
                      </>
                    )}
                  </Button>

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
                        Mint Collection ({files.filter(f => f.uploaded).length} NFTs)
                      </>
                    )}
                  </Button>
                </>
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
                          <p className="text-xs font-medium truncate">{fileData.file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(fileData.file.size / 1024 / 1024).toFixed(1)} MB
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

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

          {/* Upload Progress */}
          {isUploading && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Uploading to IPFS...</span>
                    <span className="text-sm text-muted-foreground">
                      {files.filter(f => f.uploaded).length}/{files.length}
                    </span>
                  </div>
                  <Progress 
                    value={(files.filter(f => f.uploaded).length / files.length) * 100} 
                    className="w-full" 
                  />
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
