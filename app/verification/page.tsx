"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { getFunctions, httpsCallable } from "firebase/functions";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, XCircle, Clock, Shield, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function VerificationPage() {
  const { userData } = useAuth();
  const [pendingMembers, setPendingMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    const fetchPendingMembers = async () => {
      if (!userData || userData.status !== 'verified' || !userData.communityId) {
        setIsLoading(false);
        return;
      }

      try {
        setError("");
        const q = query(
          collection(db, "users"),
          where("communityId", "==", userData.communityId),
          where("status", "==", "pending_approval")
        );

        const querySnapshot = await getDocs(q);
        const members = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPendingMembers(members);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch pending members.");
      } finally {
        setIsLoading(false);
      }
    };

    if(userData) {
        fetchPendingMembers();
    }
  }, [userData]);

  const handleReview = async (targetUserId: string, action: 'approve' | 'reject') => {
    setIsProcessing(targetUserId);
    setError("");
    try {
      const functions = getFunctions(undefined, "asia-south1");
      const reviewUserApplication = httpsCallable(functions, 'reviewUserApplication');
      const result = await reviewUserApplication({ targetUserId, action });
      console.log(result.data);
      
      // Optimistically remove the user from the list
      setPendingMembers(prev => prev.filter(member => member.id !== targetUserId));

    } catch (err: any) {
      console.error("Error calling function:", err);
      setError(`Failed to ${action} user. ${err.message}`);
    } finally {
      setIsProcessing(null);
    }
  };

  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-6">
            <Skeleton className="h-10 w-1/4 mb-4" />
            <Skeleton className="h-48 w-full" />
        </div>
    )
  }

  if (userData?.status !== 'verified') {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Card className="p-8 text-center">
                <CardTitle>Permission Denied</CardTitle>
                <CardDescription>Only verified community members can access this page.</CardDescription>
            </Card>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard"><ArrowLeft className="w-4 h-4 mr-2" />Back to Dashboard</Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">Member Verification</h1>
            <p className="text-sm text-muted-foreground">Review and approve new community members</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="w-4 h-4" />
              Pending ({pendingMembers.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="space-y-4 mt-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>Review new members carefully. Each verification helps keep your community secure.</AlertDescription>
            </Alert>
            
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

            {pendingMembers.length === 0 ? (
                <Card className="text-center p-8">
                    <CardTitle>All Clear!</CardTitle>
                    <CardDescription>There are no pending members awaiting approval right now.</CardDescription>
                </Card>
            ) : (
                <div className="grid gap-4">
                {pendingMembers.map((member) => (
                    <Card key={member.id}>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12"><AvatarFallback>{member.email.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                            <div>
                            <CardTitle className="text-lg">{member.email}</CardTitle>
                            <CardDescription>Requested to join your community</CardDescription>
                            </div>
                        </div>
                        <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="flex gap-2 pt-2">
                        <Button
                            variant="outline"
                            className="flex-1 bg-transparent"
                            onClick={() => handleReview(member.id, 'reject')}
                            disabled={isProcessing === member.id}
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={() => handleReview(member.id, 'approve')}
                            disabled={isProcessing === member.id}
                        >
                            {isProcessing === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                            Approve
                        </Button>
                    </CardContent>
                    </Card>
                ))}
                </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

