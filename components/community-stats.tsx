"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, MessageCircle, Calendar, Shield, TrendingUp, AlertTriangle } from "lucide-react"

interface CommunityStatsProps {
  stats: {
    totalMembers: number
    activeMembers: number
    pendingApprovals: number
    monthlyPosts: number
    upcomingEvents: number
    securityScore: number
    growthRate: number
    issuesResolved: number
  }
}

export function CommunityStats({ stats }: CommunityStatsProps) {
  const activityRate = Math.round((stats.activeMembers / stats.totalMembers) * 100)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalMembers}</div>
          <div className="flex items-center gap-2 mt-1">
            <Progress value={activityRate} className="flex-1 h-2" />
            <span className="text-xs text-muted-foreground">{activityRate}% active</span>
          </div>
        </CardContent>
      </Card>

      {/* Community Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Posts</CardTitle>
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.monthlyPosts}</div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span className="text-xs text-green-600">+{stats.growthRate}% from last month</span>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </CardContent>
      </Card>

      {/* Security Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Security Score</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.securityScore}%</div>
          <div className="flex items-center gap-2 mt-1">
            <Progress value={stats.securityScore} className="flex-1 h-2" />
            <Badge variant={stats.securityScore >= 80 ? "default" : "secondary"} size="sm">
              {stats.securityScore >= 80 ? "High" : "Medium"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      {stats.pendingApprovals > 0 && (
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground mt-1">Members waiting for verification</p>
          </CardContent>
        </Card>
      )}

      {/* Issues Resolved */}
      <Card className={stats.pendingApprovals > 0 ? "md:col-span-2" : "md:col-span-4"}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Issues Resolved</CardTitle>
          <AlertTriangle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.issuesResolved}</div>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </CardContent>
      </Card>
    </div>
  )
}
