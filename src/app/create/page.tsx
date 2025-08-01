"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Upload, Music, FileText, Plus, X, Info } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function CreatePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [properties, setProperties] = useState<Array<{ trait_type: string; value: string }>>([])
  const [isUnlockable, setIsUnlockable] = useState(false)
  const [isSensitive, setIsSensitive] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-3xl font-bold">Create NFT</h1>
              <Button variant="outline" asChild>
                <Link href="/create/collection">Mint NFT Collection</Link>
              </Button>
            </div>
            <p className="text-muted-foreground">Upload your digital asset and create your unique NFT</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="file-upload">Upload File *</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  JPG, PNG, GIF, SVG, MP4, WEBM, MP3, WAV, OGG, GLB, GLTF. Max size: 100 MB
                </p>
                {!selectedFile ? (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept="image/*,video/*,audio/*,.glb,.gltf"
                      onChange={handleFileSelect}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Choose file</p>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                      {selectedFile.type.startsWith("image/") ? (
                        <Image
                          src={previewUrl || "/placeholder.svg"}
                          alt="Preview"
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : selectedFile.type.startsWith("video/") ? (
                        <video src={previewUrl} className="w-full h-full object-cover" />
                      ) : selectedFile.type.startsWith("audio/") ? (
                        <Music className="w-6 h-6 text-muted-foreground" />
                      ) : (
                        <FileText className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null)
                        setPreviewUrl("")
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Card */}
            {selectedFile && (
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>This is how your NFT will appear to others</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4">
                    <div className="aspect-square relative rounded-lg overflow-hidden bg-muted mb-4">
                      {selectedFile.type.startsWith("image/") ? (
                        <Image src={previewUrl || "/placeholder.svg"} alt="NFT Preview" fill className="object-cover" />
                      ) : selectedFile.type.startsWith("video/") ? (
                        <video src={previewUrl} className="w-full h-full object-cover" controls />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            {selectedFile.type.startsWith("audio/") ? (
                              <Music className="w-16 h-16 mx-auto mb-2 text-muted-foreground" />
                            ) : (
                              <FileText className="w-16 h-16 mx-auto mb-2 text-muted-foreground" />
                            )}
                            <p className="font-medium">{selectedFile.name}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold mb-1">Untitled NFT</h3>
                    <p className="text-sm text-muted-foreground mb-2">Your Collection</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-semibold">Not for sale</p>
                      </div>
                      <Button size="sm" disabled>
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" placeholder="Enter NFT name" />
                </div>

                <div>
                  <Label htmlFor="external-link">External Link</Label>
                  <Input id="external-link" placeholder="https://yoursite.io/item/123" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Nexelra will include a link to this URL on this item's detail page
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Provide a detailed description of your item" rows={4} />
                  <p className="text-xs text-muted-foreground mt-1">
                    The description will be included on the item's detail page
                  </p>
                </div>

                <div>
                  <Label htmlFor="collection">Collection</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select collection" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="create-new">+ Create New Collection</SelectItem>
                      <SelectItem value="my-collection">My Collection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Properties */}
            <Card>
              <CardHeader>
                <CardTitle>Properties</CardTitle>
                <CardDescription>Textual traits that show up as rectangles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
              </CardContent>
            </Card>

            {/* Advanced Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

              <Button className="w-full" size="lg" disabled={!selectedFile}>
                Create NFT
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
