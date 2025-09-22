"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageCircle, Calendar, AlertTriangle, CheckCircle, Users, ArrowRight } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Activity {
  id: string
  type: "post" | "event" | "issue" | "member_joined" | "issue_resolved"
  user: {
    name: string
    avatar: string
  }
  title: string
  description: string
  timestamp: string
  metadata?: {
    replies?: number
    attendees?: number
    status?: string
  }
}

interface RecentActivityProps {
  activities: Activity[]
  onViewAll?: () => void
  onResolveIssue?: (id: string) => void
}

export function RecentActivity({ activities, onViewAll, onResolveIssue }: RecentActivityProps) {
  const [filter, setFilter] = useState<"all" | "post" | "event" | "issue">("all")
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "post":
        return <MessageCircle className="w-4 h-4 text-blue-500" />
      case "event":
        return <Calendar className="w-4 h-4 text-green-500" />
      case "issue":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case "issue_resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "member_joined":
        return <Users className="w-4 h-4 text-purple-500" />
      default:
        return <MessageCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getActivityBadge = (type: string) => {
    switch (type) {
      case "post":
        return <Badge variant="outline">Post</Badge>
      case "event":
        return <Badge variant="outline">Event</Badge>
      case "issue":
        return <Badge variant="secondary">Issue</Badge>
      case "issue_resolved":
        return <Badge variant="default">Resolved</Badge>
      case "member_joined":
        return <Badge variant="outline">New Member</Badge>
      default:
        return <Badge variant="outline">Activity</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your community</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="post">Posts</TabsTrigger>
                <TabsTrigger value="event">Events</TabsTrigger>
                <TabsTrigger value="issue">Issues</TabsTrigger>
              </TabsList>
            </Tabs>
            {onViewAll && (
              <Button variant="ghost" size="sm" onClick={onViewAll}>
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(filter === 'all' ? activities : activities.filter(a => a.type === filter)).map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm truncate">{activity.title}</p>
                  {getActivityBadge(activity.type)}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
                      <AvatarFallback className="text-xs">{activity.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{activity.user.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {activity.metadata?.replies && (
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {activity.metadata.replies}
                      </span>
                    )}
                    {activity.metadata?.attendees && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {activity.metadata.attendees}
                      </span>
                    )}
                    <span>{activity.timestamp}</span>
                    {activity.type === 'issue' && onResolveIssue && (
                      <Button variant="link" className="p-0 h-auto text-xs" onClick={() => onResolveIssue(activity.id)}>
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
