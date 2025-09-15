"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  FileText,
  MapPin,
  AlertTriangle,
  Eye,
  MessageCircle,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

export default function VerificationPage() {
  const [activeTab, setActiveTab] = useState("pending")
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [reviewNote, setReviewNote] = useState("")

  // Mock data for pending verifications
  const pendingMembers = [
    {
      id: 1,
      name: "John Davidson",
      phone: "+1 (555) 123-4567",
      unit: "Unit 2A",
      joinedDate: "2 days ago",
      status: "pending",
      verificationScore: 85,
      documents: [
        { type: "Electricity Bill", status: "verified", confidence: 92 },
        { type: "Lease Agreement", status: "pending", confidence: 78 },
      ],
      locationData: {
        accuracy: "High",
        consistent: true,
        timeSpent: "18 hours/day",
        pattern: "Resident-like",
      },
      peerReviews: [
        { reviewer: "Sarah M.", comment: "I've seen him around the building", status: "approved" },
        { reviewer: "Mike R.", comment: "Lives in 2A, seems legit", status: "approved" },
      ],
    },
    {
      id: 2,
      name: "Emma Stone",
      phone: "+1 (555) 987-6543",
      unit: "Unit 5C",
      joinedDate: "1 day ago",
      status: "pending",
      verificationScore: 72,
      documents: [{ type: "Gas Bill", status: "flagged", confidence: 45 }],
      locationData: {
        accuracy: "Medium",
        consistent: false,
        timeSpent: "8 hours/day",
        pattern: "Irregular",
      },
      peerReviews: [],
    },
  ]

  const approvedMembers = [
    {
      id: 3,
      name: "Sarah Martinez",
      unit: "Unit 1B",
      approvedDate: "1 week ago",
      approvedBy: "Community Vote",
      verificationScore: 95,
    },
    {
      id: 4,
      name: "Mike Rodriguez",
      unit: "Unit 3A",
      approvedDate: "2 weeks ago",
      approvedBy: "Document AI + Peers",
      verificationScore: 88,
    },
  ]

  const rejectedMembers = [
    {
      id: 5,
      name: "Fake User",
      reason: "Failed location verification",
      rejectedDate: "3 days ago",
      rejectedBy: "Automated System",
    },
  ]

  const handleApprove = (memberId: number) => {
    console.log("Approving member:", memberId)
    // Handle approval logic
  }

  const handleReject = (memberId: number) => {
    console.log("Rejecting member:", memberId, "Reason:", reviewNote)
    // Handle rejection logic
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "flagged":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">Member Verification</h1>
              <p className="text-sm text-muted-foreground">Review and approve new community members</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="w-4 h-4" />
              Pending ({pendingMembers.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Approved ({approvedMembers.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <XCircle className="w-4 h-4" />
              Rejected ({rejectedMembers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Review new members carefully. Each verification helps keep your community secure.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4">
              {pendingMembers.map((member) => (
                <Card key={member.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={`/abstract-geometric-shapes.png?height=48&width=48&query=${member.name}`} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{member.name}</CardTitle>
                          <CardDescription>
                            {member.unit} • Joined {member.joinedDate}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-muted-foreground">Verification Score:</span>
                          <span className={`font-bold ${getScoreColor(member.verificationScore)}`}>
                            {member.verificationScore}%
                          </span>
                        </div>
                        <Progress value={member.verificationScore} className="w-24" />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Documents */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Documents
                      </h4>
                      <div className="space-y-2">
                        {member.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(doc.status)}
                              <span className="text-sm">{doc.type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{doc.confidence}% confidence</span>
                              <Button size="sm" variant="ghost">
                                <Eye className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Location Data */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location Analysis
                      </h4>
                      <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded">
                        <div>
                          <span className="text-xs text-muted-foreground">Accuracy</span>
                          <p className="font-medium">{member.locationData.accuracy}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Pattern</span>
                          <p className="font-medium">{member.locationData.pattern}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Time Spent</span>
                          <p className="font-medium">{member.locationData.timeSpent}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Consistent</span>
                          <p className="font-medium">
                            {member.locationData.consistent ? (
                              <CheckCircle className="w-4 h-4 text-green-500 inline" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500 inline" />
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Peer Reviews */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Peer Reviews ({member.peerReviews.length})
                      </h4>
                      {member.peerReviews.length > 0 ? (
                        <div className="space-y-2">
                          {member.peerReviews.map((review, index) => (
                            <div key={index} className="p-2 border rounded">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">{review.reviewer}</span>
                                <Badge variant={review.status === "approved" ? "default" : "secondary"} size="sm">
                                  {review.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{review.comment}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No peer reviews yet</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex-1 bg-transparent"
                            onClick={() => setSelectedMember(member)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reject Member Application</DialogTitle>
                            <DialogDescription>
                              Please provide a reason for rejecting {member.name}'s application.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="reason">Reason for rejection</Label>
                              <Textarea
                                id="reason"
                                placeholder="Explain why this application should be rejected..."
                                value={reviewNote}
                                onChange={(e) => setReviewNote(e.target.value)}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button variant="destructive" onClick={() => handleReject(member.id)} className="flex-1">
                                Confirm Rejection
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button onClick={() => handleApprove(member.id)} className="flex-1">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            <div className="grid gap-4">
              {approvedMembers.map((member) => (
                <Card key={member.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={`/abstract-geometric-shapes.png?height=40&width=40&query=${member.name}`} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.unit}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="default" className="mb-1">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approved
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {member.approvedDate} • {member.approvedBy}
                        </p>
                        <p className="text-xs text-muted-foreground">Score: {member.verificationScore}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            <div className="grid gap-4">
              {rejectedMembers.map((member) => (
                <Card key={member.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.reason}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive" className="mb-1">
                          <XCircle className="w-3 h-3 mr-1" />
                          Rejected
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {member.rejectedDate} • {member.rejectedBy}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
