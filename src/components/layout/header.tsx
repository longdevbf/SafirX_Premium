"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  Menu,
  X,
  Wallet,
  User,
  Settings,
  LogOut,
  Plus,
  TrendingUp,
  Grid3X3,
  Gavel,
  Heart,
  Lock,
} from "lucide-react"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const connectWallet = () => {
    setIsConnected(true)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-xl font-bold">Nexelra</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1">
                  <Grid3X3 className="w-4 h-4" />
                  Explore
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/marketplace" className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Marketplace
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/collections" className="flex items-center gap-2">
                    <Grid3X3 className="w-4 h-4" />
                    Collections
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/auctions" className="flex items-center gap-2">
                    <Gavel className="w-4 h-4" />
                    Auctions
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/auctions/sealed" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Sealed Auctions
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/marketplace" className="text-sm font-medium hover:text-primary transition-colors">
              Marketplace
            </Link>
            <Link href="/auctions" className="text-sm font-medium hover:text-primary transition-colors">
              Auctions
            </Link>
            <Link href="/create" className="text-sm font-medium hover:text-primary transition-colors">
              Create
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search collections, NFTs, and accounts" className="pl-10 pr-4" />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Create Button */}
            <Button variant="outline" size="sm" className="hidden md:flex bg-transparent" asChild>
              <Link href="/create">
                <Plus className="w-4 h-4 mr-1" />
                Create
              </Link>
            </Button>

            {/* Wallet Connection */}
            {!isConnected ? (
              <Button onClick={connectWallet} className="hidden md:flex">
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-user.jpg" alt="User" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">0x1234...5678</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">Balance: 2.45 ETH</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites" className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Favorites
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="w-4 h-4 mr-2" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Search collections, NFTs..." className="pl-10 pr-4" />
              </div>
              <nav className="flex flex-col space-y-2">
                <Link
                  href="/marketplace"
                  className="flex items-center gap-2 px-2 py-2 text-sm font-medium hover:bg-muted rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <TrendingUp className="w-4 h-4" />
                  Marketplace
                </Link>
                <Link
                  href="/collections"
                  className="flex items-center gap-2 px-2 py-2 text-sm font-medium hover:bg-muted rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Grid3X3 className="w-4 h-4" />
                  Collections
                </Link>
                <Link
                  href="/auctions"
                  className="flex items-center gap-2 px-2 py-2 text-sm font-medium hover:bg-muted rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Gavel className="w-4 h-4" />
                  Auctions
                </Link>
                <Link
                  href="/create"
                  className="flex items-center gap-2 px-2 py-2 text-sm font-medium hover:bg-muted rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Plus className="w-4 h-4" />
                  Create
                </Link>
                {isConnected && (
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-2 py-2 text-sm font-medium hover:bg-muted rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                )}
              </nav>
              {!isConnected && (
                <Button onClick={connectWallet} className="w-full">
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
