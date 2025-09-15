"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CommunityStats } from "@/components/community-stats"
import { RecentActivity } from "@/components/recent-activity"
import {
  MapPin,
  Users,
  MessageCircle,
  Bell,
  Settings,
  Shield,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Menu,
  Plus,
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data
  const community = {
    name: "Sunset Apartments",
    type: "Apartment Building",
    memberCount: 24,
    address: "123 Sunset Blvd, Unit 4B",
    status: "verified",
  }

  const stats = {
    totalMembers: 24,
    activeMembers: 18,
    pendingApprovals: 2,
    monthlyPosts: 47,
    upcomingEvents: 3,
    securityScore: 92,
    growthRate: 15,
    issuesResolved: 8,
  }

  const recentActivities = [
    {
      id: "1",
      type: "issue" as const,
      user: { name: "Sarah M.", avatar: "/diverse-woman-portrait.png" },
      title: "Water pressure issue reported",
      description: "Low water pressure affecting floors 3-5",
      timestamp: "2 hours ago",
      metadata: { replies: 8 },
    },
    {
      id: "2",
      type: "event" as const,
      user: { name: "Mike R.", avatar: "/thoughtful-man.png" },
      title: "Building BBQ scheduled",
      description: "Community BBQ this Saturday at 2 PM",
      timestamp: "5 hours ago",
      metadata: { attendees: 15 },
    },
    {
      id: "3",
      type: "member_joined" as const,
      user: { name: "Emma S.", avatar: "/woman-glasses.jpg" },
      title: "New member joined",
      description: "Emma from Unit 5C joined the community",
      timestamp: "1 day ago",
    },
    {
      id: "4",
      type: "issue_resolved" as const,
      user: { name: "Building Manager", avatar: "/abstract-geometric-shapes.png" },
      title: "Elevator maintenance completed",
      description: "Elevator in lobby is now fully operational",
      timestamp: "2 days ago",
    },
  ]

  const posts = [
    {
      id: 1,
      author: "Sarah M.",
      avatar: "/diverse-woman-portrait.png",
      time: "2 hours ago",
      type: "issue",
      title: "Water pressure low in building",
      content: "Anyone else experiencing low water pressure today? Seems to be affecting floors 3-5.",
      replies: 8,
      likes: 12,
    },
    {
      id: 2,
      author: "Mike R.",
      avatar: "/thoughtful-man.png",
      time: "5 hours ago",
      type: "event",
      title: "Building BBQ this Saturday",
      content: "Let's have a community BBQ in the courtyard this Saturday at 2 PM. Bring your own food!",
      replies: 15,
      likes: 23,
    },
    {
      id: 3,
      author: "Lisa K.",
      avatar: "/woman-glasses.jpg",
      time: "1 day ago",
      type: "announcement",
      title: "Parking reminder",
      content: "Reminder: Guest parking is limited to 2 hours. Please inform your visitors.",
      replies: 3,
      likes: 8,
    },
  ]

  const pendingMembers = [
    {
      id: 1,
      name: "John D.",
      unit: "Unit 2A",
      joinedDate: "2 days ago",
      status: "pending",
    },
    {
      id: 2,
      name: "Emma S.",
      unit: "Unit 5C",
      joinedDate: "1 day ago",
      status: "pending",
    },
  ]

  const getPostIcon = (type: string) => {
    switch (type) {
      case "issue":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case "event":
        return <Calendar className="w-4 h-4 text-blue-500" />
      case "announcement":
        return <Bell className="w-4 h-4 text-green-500" />
      default:
        return <MessageCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">{community.name}</h1>
                <p className="text-sm text-muted-foreground">{community.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={community.status === "verified" ? "default" : "secondary"} className="gap-1">
                <Shield className="w-3 h-3" />
                {community.status === "verified" ? "Verified" : "Pending"}
              </Badge>
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/settings">
                  <Settings className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="feed">Community Feed</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Welcome Message */}
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                Welcome to your {community.name} community! You're now connected with {community.memberCount} verified
                neighbors.
              </AlertDescription>
            </Alert>

            {/* Community Stats */}
            <CommunityStats stats={stats} />

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <div className="lg:col-span-2">
                <RecentActivity activities={recentActivities} onViewAll={() => setActiveTab("feed")} />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Community Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Community Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Type</span>
                      <span className="text-sm font-medium">{community.type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Members</span>
                      <span className="text-sm font-medium">{community.memberCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant="outline" size="sm">
                        Active
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                      <Plus className="w-4 h-4 mr-2" />
                      New Post
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                      <Calendar className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Report Issue
                    </Button>
                  </CardContent>
                </Card>

                {/* Pending Approvals */}
                {pendingMembers.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-500" />
                        Pending Approvals
                      </CardTitle>
                      <CardDescription>New members waiting for verification</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {pendingMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.unit}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="h-7 px-2 bg-transparent">
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 px-2 bg-transparent">
                              <AlertTriangle className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button variant="link" size="sm" className="w-full" asChild>
                        <Link href="/verification">View All Pending</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="feed" className="space-y-4">
            {/* Posts */}
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={post.avatar || "/placeholder.svg"} alt={post.author} />
                          <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{post.author}</p>
                            {getPostIcon(post.type)}
                          </div>
                          <p className="text-sm text-muted-foreground">{post.time}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold mb-2">{post.title}</h3>
                    <p className="text-muted-foreground mb-4">{post.content}</p>
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {post.replies}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {post.likes}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Community Members ({community.memberCount})</CardTitle>
                <CardDescription>Verified residents in your building</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Avatar>
                        <AvatarImage src={`/diverse-group-portrait.png?height=40&width=40&query=person-${i + 1}`} />
                        <AvatarFallback>U{i + 1}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Resident {i + 1}</p>
                        <p className="text-sm text-muted-foreground">Unit {Math.floor(Math.random() * 6) + 1}A</p>
                      </div>
                      <Badge variant="outline" size="sm" className="ml-auto">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Community gatherings and activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Building BBQ</h3>
                      <p className="text-sm text-muted-foreground mb-2">Saturday, 2:00 PM - Courtyard</p>
                      <p className="text-sm">Community BBQ in the courtyard. Bring your own food!</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline" size="sm">
                          15 attending
                        </Badge>
                        <Button size="sm">Join Event</Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Monthly Building Meeting</h3>
                      <p className="text-sm text-muted-foreground mb-2">Next Tuesday, 7:00 PM - Community Room</p>
                      <p className="text-sm">Discuss building maintenance and upcoming improvements.</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline" size="sm">
                          8 attending
                        </Badge>
                        <Button size="sm" variant="outline">
                          Maybe
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
