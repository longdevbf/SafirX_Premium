"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ConnectWallet } from "@/components/ConnectWallet"
import { useWallet } from "@/context/walletContext"
import { useUser } from "@/context/userContext" // Sử dụng context thay vì hook

import {
  Search,
  Menu,
  X,
  TrendingUp,
  Grid3X3,
  Gavel,
  Lock,
  Plus,
  LogOut,
  Copy,
  User,
} from "lucide-react"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isConnected, address, disconnect } = useWallet()
  
  // Sử dụng context thay vì hook riêng biệt
  const { user: userData, isLoading: userLoading } = useUser()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }
  
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
    }
  }

  // Tạo user object với fallback values
  const user = userData ? {
    name: userData.name || "Unnamed User",
    avatar: userData.avatar || null,
    username: userData.username || null
  } : {
    name: "Loading...",
    avatar: null,
    username: null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <img 
              src="/assets/logo.png" 
              alt="SafirX Logo" 
              className="w-29 h-29 object-contain"
            />
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
                  <Link href="/create/collection" className="flex items-center gap-2">
                    <Grid3X3 className="w-4 h-4" />
                    Collections
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/auctions" className="flex items-center gap-2">
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
              <div className="hidden md:flex">
                <ConnectWallet />
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-muted">
                    {/* Avatar từ database */}
                    <Avatar className="h-9 w-9">
                      {user.avatar ? (
                        <AvatarImage src={user.avatar} alt={user.name} />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold">
                        {userLoading ? '...' : user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  {/* User info trong dropdown */}
                  <div className="flex items-center gap-3 p-3 border-b">
                    <Avatar className="h-8 w-8">
                      {user.avatar ? (
                        <AvatarImage src={user.avatar} alt={user.name} />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm">
                        {userLoading ? '...' : user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{user.name}</p>
                      {user.username && (
                        <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                      )}
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        {formatAddress(address || '')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyAddress}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${address}`} className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => disconnect()}
                    className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Disconnect Wallet
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
              
              {/* Mobile User Info */}
              {isConnected && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Avatar className="h-10 w-10">
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.name} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                      {userLoading ? '...' : user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user.name}</p>
                    {user.username && (
                      <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                    )}
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {formatAddress(address || '')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              )}
              
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
              </nav>
              
              {!isConnected ? (
                <div className="w-full">
                  <ConnectWallet />
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href={`/profile/${address}`}
                    className="flex items-center gap-2 px-2 py-2 text-sm font-medium hover:bg-muted rounded-md w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    View Profile
                  </Link>
                  <Button 
                    onClick={() => {
                      disconnect()
                      setIsMenuOpen(false)
                    }} 
                    variant="outline" 
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Disconnect Wallet
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}