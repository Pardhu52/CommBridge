"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Users, Shield, Clock } from "lucide-react"

interface CommunityCardProps {
  community: {
    id: string
    name: string
    type: "apartment" | "street" | "office"
    memberCount: number
    distance: string
    address: string
    status: "verified" | "pending" | "new"
    recentMembers: Array<{
      name: string
      avatar: string
    }>
  }
  onJoin?: (communityId: string) => void
  onView?: (communityId: string) => void
}

export function CommunityCard({ community, onJoin, onView }: CommunityCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "apartment":
        return "🏢"
      case "street":
        return "🏘️"
      case "office":
        return "🏢"
      default:
        return "🏠"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "default"
      case "pending":
        return "secondary"
      case "new":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl">
              {getTypeIcon(community.type)}
            </div>
            <div>
              <CardTitle className="text-lg">{community.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {community.distance} away
              </CardDescription>
            </div>
          </div>
          <Badge variant={getStatusColor(community.status)} className="gap-1">
            {community.status === "verified" && <Shield className="w-3 h-3" />}
            {community.status === "pending" && <Clock className="w-3 h-3" />}
            {community.status.charAt(0).toUpperCase() + community.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">{community.address}</div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{community.memberCount} members</span>
          </div>
          <div className="flex items-center gap-1">
            {community.recentMembers.slice(0, 3).map((member, index) => (
              <Avatar key={index} className="w-6 h-6 border-2 border-background -ml-1 first:ml-0">
                <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
            {community.memberCount > 3 && (
              <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs -ml-1">
                +{community.memberCount - 3}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {community.status === "new" ? (
            <Button onClick={() => onJoin?.(community.id)} className="flex-1">
              Join Community
            </Button>
          ) : (
            <Button onClick={() => onView?.(community.id)} variant="outline" className="flex-1">
              View Community
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
