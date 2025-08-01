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
import { Upload, Info, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function CreateCollectionPage() {
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>("")
  const [bannerPreview, setBannerPreview] = useState<string>("")

  const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const url = URL.createObjectURL(file)
      setLogoPreview(url)
    }
  }

  const handleBannerSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setBannerFile(file)
      const url = URL.createObjectURL(file)
      setBannerPreview(url)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/create" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Link>
              </Button>
              <h1 className="text-3xl font-bold">Create NFT Collection</h1>
            </div>
            <p className="text-muted-foreground">Create a new collection to organize and mint multiple NFTs</p>
          </div>

          <div className="space-y-6">
            {/* Collection Images */}
            <Card>
              <CardHeader>
                <CardTitle>Collection Images</CardTitle>
                <CardDescription>Upload logo and banner images for your collection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo */}
                <div>
                  <Label htmlFor="logo-upload">Logo Image *</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    This image will be used to identify your collection. 350 x 350 recommended.
                  </p>
                  {!logoFile ? (
                    <div className="w-32 h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                      <input
                        type="file"
                        id="logo-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoSelect}
                      />
                      <label htmlFor="logo-upload" className="cursor-pointer text-center">
                        <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-xs font-medium">Upload</p>
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-32 rounded-lg overflow-hidden">
                        <Image
                          src={logoPreview || "/placeholder.svg"}
                          alt="Logo Preview"
                          width={128}
                          height={128}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setLogoFile(null)
                          setLogoPreview("")
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>

                {/* Banner */}
                <div>
                  <Label htmlFor="banner-upload">Banner Image</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    This image will appear at the top of your collection page. 1400 x 400 recommended.
                  </p>
                  {!bannerFile ? (
                    <div className="w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                      <input
                        type="file"
                        id="banner-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleBannerSelect}
                      />
                      <label htmlFor="banner-upload" className="cursor-pointer text-center">
                        <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-xs font-medium">Upload Banner</p>
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-full h-32 rounded-lg overflow-hidden">
                        <Image
                          src={bannerPreview || "/placeholder.svg"}
                          alt="Banner Preview"
                          width={400}
                          height={128}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setBannerFile(null)
                          setBannerPreview("")
                        }}
                      >
                        Remove Banner
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Collection Details */}
            <Card>
              <CardHeader>
                <CardTitle>Collection Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="collection-name">Name *</Label>
                  <Input id="collection-name" placeholder="Enter collection name" />
                </div>

                <div>
                  <Label htmlFor="collection-symbol">Symbol *</Label>
                  <Input id="collection-symbol" placeholder="e.g. MYNFT" />
                  <p className="text-xs text-muted-foreground mt-1">A short symbol to represent your collection</p>
                </div>

                <div>
                  <Label htmlFor="collection-description">Description</Label>
                  <Textarea id="collection-description" placeholder="Describe your collection" rows={4} />
                  <p className="text-xs text-muted-foreground mt-1">
                    The description will be included on the collection's detail page
                  </p>
                </div>

                <div>
                  <Label htmlFor="collection-website">Website</Label>
                  <Input id="collection-website" placeholder="https://yoursite.com" />
                </div>

                <div>
                  <Label htmlFor="collection-discord">Discord</Label>
                  <Input id="collection-discord" placeholder="https://discord.gg/..." />
                </div>

                <div>
                  <Label htmlFor="collection-twitter">Twitter</Label>
                  <Input id="collection-twitter" placeholder="@yourcollection" />
                </div>
              </CardContent>
            </Card>

            {/* Collection Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Collection Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="royalty-percentage">Creator Royalty (%)</Label>
                  <Input id="royalty-percentage" type="number" placeholder="5" min="0" max="10" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Percentage you'll earn from secondary sales (0-10%)
                  </p>
                </div>

                <div>
                  <Label htmlFor="max-supply">Maximum Supply</Label>
                  <Input id="max-supply" type="number" placeholder="10000" min="1" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum number of NFTs that can be minted in this collection
                  </p>
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

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Explicit & Sensitive Content</Label>
                    <p className="text-sm text-muted-foreground">Mark this collection as explicit content</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            {/* Create Button */}
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Collection Creation Fee</h4>
                    <p className="text-sm text-blue-700">
                      Creating a collection requires a one-time gas fee to deploy the smart contract on the blockchain.
                    </p>
                  </div>
                </div>
              </div>

              <Button className="w-full" size="lg" disabled={!logoFile}>
                Create Collection
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
