"use client"

import { useAccount } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Grid3X3, ImageIcon } from "lucide-react"
import SingleNFTMint from "./single-nft-mint"
import CollectionMint from "./collection-mint"

export default function CreatePage() {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Create Your NFT</h1>
            <p className="text-xl text-muted-foreground mb-6">
              Choose how you want to create your digital masterpiece
            </p>
            
            {!isConnected && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800">
                  Please connect your wallet to start creating NFTs
                </p>
              </div>
            )}
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="single" className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="single" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Single NFT
              </TabsTrigger>
              <TabsTrigger value="collection" className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4" />
                Collection
              </TabsTrigger>
            </TabsList>

            {/* Single NFT Tab */}
            <TabsContent value="single" className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold mb-2">Create Single NFT</h2>
                <p className="text-muted-foreground">
                  Upload one image and create a unique NFT with custom metadata
                </p>
              </div>

              <SingleNFTMint />
            </TabsContent>

            {/* Collection Tab */}
            <TabsContent value="collection" className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold mb-2">Create NFT Collection</h2>
                <p className="text-muted-foreground">
                  Upload multiple images and create a collection with batch minting
                </p>
              </div>

              <CollectionMint />
            </TabsContent>
          </Tabs>

          {/* Information Cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Single NFT
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Perfect for unique, one-of-a-kind artworks</li>
                  <li>✓ Full control over metadata</li>
                  <li>✓ Quick and simple creation process</li>
                  <li>✓ Lower gas fees for single mint</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Grid3X3 className="w-5 h-5" />
                  NFT Collection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Ideal for series, sets, or themed artwork</li>
                  <li>✓ Batch minting saves on gas costs</li>
                  <li>✓ Advanced metadata customization</li>
                  <li>✓ Collection-wide branding and settings</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
