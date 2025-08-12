'use client'
/* eslint-disable react/no-unescaped-entities */
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Twitter, Github, DiscIcon as Discord, Instagram } from "lucide-react"
import { useAccount } from "wagmi"
import { useWallet } from "@/context/walletContext"
export default function Footer() {
  const { isConnected, address, disconnect } = useWallet()
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-3">
              <Image 
                src="/assets/logo.png" 
                alt="SafirX Logo" 
                width={120}
                height={120}
                className="object-contain"
              />
              
            </Link>
            <p className="text-muted-foreground text-sm">
              The world's premier NFT marketplace for discovering, creating, and trading extraordinary digital assets.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Discord className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Github className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Marketplace */}
          <div className="space-y-4">
            <h3 className="font-semibold">Marketplace</h3>
            <div className="space-y-2 text-sm">
              <Link href="/marketplace" className="block text-muted-foreground hover:text-foreground">
                All NFTs
              </Link>
              <Link href="/marketplace" className="block text-muted-foreground hover:text-foreground">
                Collections
              </Link>
              <Link href="/auctions" className="block text-muted-foreground hover:text-foreground">
                Auctions
              </Link>
              <Link href="/marketplace" className="block text-muted-foreground hover:text-foreground">
                Trending
              </Link>
            </div>
          </div>

          {/* Create */}
          <div className="space-y-4">
            <h3 className="font-semibold">Create</h3>
            <div className="space-y-2 text-sm">
              <Link href="/create" className="block text-muted-foreground hover:text-foreground">
                Create NFT
              </Link>
              <Link href="/create" className="block text-muted-foreground hover:text-foreground">
                Create Collection
              </Link>
              <Link href={`profile/${address}`} className="block text-muted-foreground hover:text-foreground">
                Create Auction
              </Link>
              <Link href="" className="block text-muted-foreground hover:text-foreground">
                Creator Guide
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">Get the latest news and updates from SafirX</p>
            <div className="flex space-x-2">
              <Input placeholder="Enter your email" className="flex-1" />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">© 2024 SafirX. All rights reserved.</p>
          <div className="flex space-x-6 text-sm text-muted-foreground mt-4 md:mt-0">
            <Link href="" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="" className="hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="" className="hover:text-foreground">
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

