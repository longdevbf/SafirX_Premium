"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Filter, Search, Star, Copy, Users } from "lucide-react"
import Link from "next/link"

interface FollowingUser {
  address: string
  name: string
  username: string
  avatar: string
  verified: boolean
  followers: number
  nftsOwned: number
  joinDate: string
}

interface FollowingProps {
  followingUsers: FollowingUser[]
  totalCount: number
}

export default function Following({ followingUsers, totalCount }: FollowingProps) {
  return (
    <div className="mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Following ({totalCount})</h2>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Search users..." className="pl-10 w-64" />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Following Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {followingUsers.map((followUser) => (
          <Card key={followUser.address} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-16 h-16 mb-4">
                  <AvatarImage src={followUser.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{followUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{followUser.name}</h3>
                  {followUser.verified && <Star className="w-4 h-4 text-blue-500 fill-current" />}
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">{followUser.username}</p>
                
                <div className="text-xs text-muted-foreground mb-4 space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="w-3 h-3" />
                    {followUser.followers} followers
                  </div>
                  <div>{followUser.nftsOwned} NFTs owned</div>
                  <div>Joined {followUser.joinDate}</div>
                </div>

                <div className="w-full space-y-2">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/profile/${followUser.address}`}>View Profile</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => navigator.clipboard.writeText(followUser.address)}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy Address
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}