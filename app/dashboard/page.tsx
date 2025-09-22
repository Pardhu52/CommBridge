"use client"

import { useState, useEffect } from "react"
// --- FIX: Using relative paths to ensure the build tool can find the files ---
import { useAuth } from "../../context/AuthContext"
import { db } from "../../lib/firebase"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { CommunityStats } from "../../components/community-stats"
import { RecentActivity } from "../../components/recent-activity"
import { Skeleton } from "../../components/ui/skeleton"
import { MapPin, Users, Bell, Settings, Shield, Clock, Menu, Plus, Calendar, AlertTriangle, Edit2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import Link from "next/link"
import { doc, getDoc, collection, query, where, onSnapshot, orderBy, limit, updateDoc, addDoc, deleteDoc } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "../../components/ui/dropdown-menu"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"

const DashboardLoadingSkeleton = () => (
    <div className="container mx-auto px-4 py-6 space-y-6 animate-pulse">
        <div className="flex items-center justify-between"><Skeleton className="h-12 w-1/3" /><Skeleton className="h-8 w-1/4" /></div>
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" />
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2"><Skeleton className="h-96 w-full" /></div>
            <div className="space-y-6"><Skeleton className="h-48 w-full" /><Skeleton className="h-48 w-full" /></div>
        </div>
    </div>
);

export default function DashboardPage() {
    const { user, userData, loading: authLoading } = useAuth();
    const router = useRouter();
    const [communityData, setCommunityData] = useState<any>(null);
    const [pendingMembers, setPendingMembers] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [recentActivities, setRecentActivities] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [editOpen, setEditOpen] = useState(false);
    const [newCommunityName, setNewCommunityName] = useState("");
    const [createEventOpen, setCreateEventOpen] = useState(false);
    const [newPostOpen, setNewPostOpen] = useState(false);
    const [newPostText, setNewPostText] = useState("");
    const [reportOpen, setReportOpen] = useState(false);
    const [reportTitle, setReportTitle] = useState("");
    const [reportDesc, setReportDesc] = useState("");
    const [newEventTitle, setNewEventTitle] = useState("");
    const [newEventDate, setNewEventDate] = useState("");
    const [issuesResolvedCount, setIssuesResolvedCount] = useState(0);
    const [monthlyPostsCount, setMonthlyPostsCount] = useState(0);
    const [unresolvedIssuesCount, setUnresolvedIssuesCount] = useState(0);
    const [notifOpen, setNotifOpen] = useState(false);
    // Popover open state is managed by the Radix component internally

    useEffect(() => {
        if (!userData) return;

        let communityUnsubscribe: () => void;
        let pendingUnsubscribe: () => void;
        let activityMsgUnsubscribe: () => void;
        let activityEventUnsubscribe: () => void;
        let activityIssueUnsubscribe: () => void;
        let msgsActivities: any[] = [];
        let evActivities: any[] = [];
        let issueActivities: any[] = [];

        const updateCombined = () => {
            const combined = [...msgsActivities, ...evActivities, ...issueActivities]
              .sort((a, b) => (b._ts || 0) - (a._ts || 0))
              .slice(0, 4);
            setRecentActivities(combined);
        };

        const fetchData = () => {
            setLoadingData(true);

            if (userData.communityId) {
                // Real-time listener for community data
                const communityDocRef = doc(db, "communities", userData.communityId);
                communityUnsubscribe = onSnapshot(communityDocRef, (docSnap) => {
                    if (docSnap.exists()) setCommunityData(docSnap.data());
                });

                // Real-time listener for recent messages (for the activity feed)
                const messagesRef = collection(db, "communities", userData.communityId, "messages");
                const activityMsgQuery = query(messagesRef, orderBy("timestamp", "desc"), limit(10));
                activityMsgUnsubscribe = onSnapshot(activityMsgQuery, (snapshot) => {
                    msgsActivities = snapshot.docs.map(docSnap => {
                        const data: any = docSnap.data();
                        const tsMs = data.timestamp?.toDate?.()?.getTime?.() || 0;
                        const content = data.content || "";
                        return {
                            id: docSnap.id,
                            type: "post",
                            user: { name: data.senderEmail, avatar: "" },
                            title: content.substring(0, 30) + (content.length > 30 ? "..." : ""),
                            description: `New message from ${data.senderEmail}`,
                            timestamp: data.timestamp?.toDate?.()?.toLocaleDateString?.() || "Just now",
                            _ts: tsMs,
                        };
                    });
                    updateCombined();
                });

                // Monthly posts counter
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                const monthlyQuery = query(
                  messagesRef,
                  where("timestamp", ">=", startOfMonth),
                  where("timestamp", "<", startOfNextMonth)
                );
                onSnapshot(monthlyQuery, (snapshot) => setMonthlyPostsCount(snapshot.size));
                // Members list (verified)
                const membersQuery = query(collection(db, "users"), where("communityId", "==", userData.communityId), where("status", "==", "verified"));
                onSnapshot(membersQuery, (snapshot) => setMembers(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));

                // Events subcollection
                const eventsQuery = query(collection(db, "communities", userData.communityId, "events"), orderBy("date", "asc"));
                onSnapshot(eventsQuery, (snapshot) => setEvents(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));

                // Recent activity for events (use createdAt as timestamp)
                const eventsRecentQuery = query(collection(db, "communities", userData.communityId, "events"), orderBy("createdAt", "desc"), limit(10));
                activityEventUnsubscribe = onSnapshot(eventsRecentQuery, (snapshot) => {
                    evActivities = snapshot.docs.map(docSnap => {
                        const data: any = docSnap.data();
                        const tsMs = data.createdAt ? new Date(data.createdAt).getTime() : 0;
                        return {
                            id: docSnap.id,
                            type: "event",
                            user: { name: "", avatar: "" },
                            title: data.title || "Community Event",
                            description: data.date ? `Event on ${data.date}` : "New event created",
                            timestamp: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "",
                            _ts: tsMs,
                        };
                    });
                    updateCombined();
                });

                // Recent activity for issues
                const issuesRecentQuery = query(collection(db, "communities", userData.communityId, "issues"), orderBy("createdAt", "desc"), limit(10));
                activityIssueUnsubscribe = onSnapshot(issuesRecentQuery, (snapshot) => {
                    issueActivities = snapshot.docs.map(docSnap => {
                        const data: any = docSnap.data();
                        const tsMs = data.createdAt ? new Date(data.createdAt).getTime() : 0;
                        return {
                            id: docSnap.id,
                            type: "issue",
                            user: { name: data.reporterEmail || "", avatar: "" },
                            title: data.title || "Issue reported",
                            description: data.description || "",
                            timestamp: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "",
                            metadata: { status: data.status || 'pending' },
                            _ts: tsMs,
                        };
                    });
                    updateCombined();
                });

                // Dynamic issues resolved count for this month
                const nowIssues = new Date();
                const startOfMonthISO = new Date(nowIssues.getFullYear(), nowIssues.getMonth(), 1).toISOString();
                const startOfNextMonthISO = new Date(nowIssues.getFullYear(), nowIssues.getMonth() + 1, 1).toISOString();
                const resolvedThisMonthQuery = query(
                    collection(db, "communities", userData.communityId, "issues"),
                    where("status", "==", "resolved"),
                    where("resolvedAt", ">=", startOfMonthISO),
                    where("resolvedAt", "<", startOfNextMonthISO)
                );
                onSnapshot(resolvedThisMonthQuery, (snapshot) => setIssuesResolvedCount(snapshot.size));

                // Unresolved (pending) issues count for bell + security score
                const pendingIssuesQuery = query(
                    collection(db, "communities", userData.communityId, "issues"),
                    where("status", "==", "pending")
                );
                onSnapshot(pendingIssuesQuery, (snapshot) => setUnresolvedIssuesCount(snapshot.size));
            }

            if (userData.status === 'verified' && userData.communityId) {
                 // Real-time listener for pending members
                const pendingQuery = query(collection(db, "users"), where("communityId", "==", userData.communityId), where("status", "==", "pending_approval"));
                pendingUnsubscribe = onSnapshot(pendingQuery, (snapshot) => {
                    setPendingMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                });
            }
            setLoadingData(false);
        };

        fetchData();

        // Cleanup listeners on component unmount
        return () => {
            if (communityUnsubscribe) communityUnsubscribe();
            if (pendingUnsubscribe) pendingUnsubscribe();
            if (activityMsgUnsubscribe) activityMsgUnsubscribe();
            if (activityEventUnsubscribe) activityEventUnsubscribe();
            if (activityIssueUnsubscribe) activityIssueUnsubscribe();
        };
    }, [userData]);

    const handleTabChange = (value: string) => {
        if (value === "feed") router.push('/messages');
        else setActiveTab(value);
    };

    const saveCommunityName = async () => {
        if (!userData?.communityId || !newCommunityName.trim()) return;
        await updateDoc(doc(db, "communities", userData.communityId), { name: newCommunityName.trim() });
        setEditOpen(false);
    };

    const resolveIssue = async (issueId: string) => {
        if (!userData?.communityId) return;
        await updateDoc(doc(db, 'communities', userData.communityId, 'issues', issueId), {
            status: 'resolved',
            resolvedAt: new Date().toISOString(),
        });
    };

    const createEvent = async () => {
        if (!userData?.communityId || !newEventTitle.trim() || !newEventDate.trim()) return;
        await addDoc(collection(db, "communities", userData.communityId, "events"), {
            title: newEventTitle.trim(),
            date: newEventDate,
            createdAt: new Date().toISOString(),
        });
        setCreateEventOpen(false);
        setNewEventTitle("");
        setNewEventDate("");
    };

    if (authLoading || (!userData && !authLoading)) return <DashboardLoadingSkeleton />;
    
    if (!userData?.communityId) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="p-8 text-center"><CardTitle>Please Complete Your Setup</CardTitle><CardDescription>We couldn't find your community.</CardDescription><Button asChild className="mt-4"><Link href="/community-setup">Go to Setup</Link></Button></Card>
            </div>
        )
    }

    if (userData?.status === 'pending_approval') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="w-full max-w-lg text-center"><CardHeader><Clock className="w-12 h-12 mx-auto text-yellow-500 mb-4" /><CardTitle className="text-2xl">Verification Pending</CardTitle><CardDescription>Your request to join the <strong>{communityData?.name || 'community'}</strong> is awaiting approval.</CardDescription></CardHeader><CardContent><p className="text-muted-foreground">You will get full access once approved.</p></CardContent></Card>
            </div>
        );
    }
    
    if (userData?.status === 'verified' && communityData) {
        // Derive a dynamic security score (0-100):
        //  - 70% from verified member ratio
        //  - 30% from unresolved issues penalty (each pending issue reduces by 5 up to -100)
        const verifiedRatio = communityData.memberCount ? (members.length / communityData.memberCount) : 1;
        const issuesPenalty = Math.min(100, unresolvedIssuesCount * 5);
        const securityScore = Math.max(0, Math.round(verifiedRatio * 100 * 0.7 + (100 - issuesPenalty) * 0.3));

        const stats = {
            totalMembers: communityData.memberCount || 0,
            activeMembers: communityData.memberCount || 0,
            pendingApprovals: pendingMembers.length,
            monthlyPosts: monthlyPostsCount,
            upcomingEvents: events.length,
            securityScore: securityScore,
            growthRate: 0,
            issuesResolved: issuesResolvedCount,
        };
        
        return (
            <div className="min-h-screen bg-background">
              <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="md:hidden"><Menu className="w-4 h-4" /></Button>
                      <div className="flex items-center gap-2"><div><h1 className="text-xl font-bold">{communityData.name}</h1><p className="text-sm text-muted-foreground">{userData.address.full}</p></div><Button variant="ghost" size="icon" onClick={() => { setNewCommunityName(communityData.name || ""); setEditOpen(true); }}><Edit2 className="w-4 h-4" /></Button></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="default" className="gap-1"><Shield className="w-3 h-3" />Verified</Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="relative" aria-haspopup="menu">
                            <Bell className="w-4 h-4" />
                            {(pendingMembers.length + unresolvedIssuesCount + events.length) > 0 && (
                              <span className="absolute -top-1 -right-1 text-[10px] bg-primary text-primary-foreground rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                                {pendingMembers.length + unresolvedIssuesCount + events.length}
                              </span>
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-72">
                          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                          {(pendingMembers.length === 0 && unresolvedIssuesCount === 0 && events.length === 0) && (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">No notifications</div>
                          )}
                          {pendingMembers.length > 0 && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="!pointer-events-none !opacity-100">Pending approvals</DropdownMenuItem>
                              {pendingMembers.slice(0,3).map((m) => (
                                <DropdownMenuItem key={m.id} className="!pointer-events-none !opacity-100 pl-8 text-sm">{m.email}</DropdownMenuItem>
                              ))}
                              <DropdownMenuItem asChild>
                                <Link href="/verification" className="pl-8">View all</Link>
                              </DropdownMenuItem>
                            </>
                          )}
                          {unresolvedIssuesCount > 0 && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="!pointer-events-none !opacity-100">Unresolved issues: {unresolvedIssuesCount}</DropdownMenuItem>
                            </>
                          )}
                          {events.length > 0 && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="!pointer-events-none !opacity-100">Upcoming events: {events.length}</DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button variant="ghost" size="sm" asChild><Link href="/settings"><Settings className="w-4 h-4" /></Link></Button>
                    </div>
                  </div>
                </div>
              </header>
              <div className="container mx-auto px-4 py-6">
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="feed">Community Feed</TabsTrigger>
                    <TabsTrigger value="members">Members</TabsTrigger>
                    <TabsTrigger value="events">Events</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="space-y-6">
                    <Alert><Users className="h-4 w-4" /><AlertDescription>Welcome to your {communityData.name} community!</AlertDescription></Alert>
                    <CommunityStats stats={stats} />
                    <div className="grid lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2"><RecentActivity activities={recentActivities} onViewAll={() => handleTabChange("feed")} onResolveIssue={resolveIssue} /></div>
                      <div className="space-y-6">
                        <Card><CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" />Community Info</CardTitle></CardHeader><CardContent className="space-y-3"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Type</span><span className="text-sm font-medium">{communityData.type}</span></div><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Members</span><span className="text-sm font-medium">{communityData.memberCount}</span></div></CardContent></Card>
                        <Card><CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader><CardContent className="space-y-2"><Button variant="outline" size="sm" className="w-full justify-start bg-transparent" onClick={() => setNewPostOpen(true)}><Plus className="w-4 h-4 mr-2" />New Post</Button><Button variant="outline" size="sm" className="w-full justify-start bg-transparent" onClick={() => setCreateEventOpen(true)}><Calendar className="w-4 h-4 mr-2" />Create Event</Button><Button variant="outline" size="sm" className="w-full justify-start bg-transparent" onClick={() => setReportOpen(true)}><AlertTriangle className="w-4 h-4 mr-2" />Report Issue</Button></CardContent></Card>
                        {pendingMembers.length > 0 && (
                          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-orange-500" />Pending Approvals</CardTitle><CardDescription>New members waiting for verification</CardDescription></CardHeader><CardContent className="space-y-3">{pendingMembers.map((member) => (<div key={member.id} className="flex items-center justify-between p-3 border rounded-lg"><div><p className="font-medium text-sm">{member.email}</p></div></div>))}<Button variant="link" size="sm" className="w-full" asChild><Link href="/verification">View All Pending</Link></Button></CardContent></Card>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="members" className="space-y-4">
                    {members.length === 0 ? <p className="text-sm text-muted-foreground">No members yet.</p> : (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {members.map((m) => (
                          <Card key={m.id}><CardContent className="p-3"><p className="font-medium text-sm">{m.name || m.email}</p><p className="text-xs text-muted-foreground">{m.email}</p></CardContent></Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="events" className="space-y-4">
                    <div className="flex justify-between items-center"><h3 className="font-medium">Upcoming Events</h3><Button size="sm" variant="outline" onClick={() => setCreateEventOpen(true)}><Plus className="w-4 h-4 mr-1" />Add Event</Button></div>
                    {events.length === 0 ? <p className="text-sm text-muted-foreground">No events scheduled.</p> : (
                      <div className="space-y-2">
                        {events.map(ev => (
                          <Card key={ev.id}>
                            <CardContent className="p-3 flex items-center justify-between">
                              <div><p className="font-medium text-sm">{ev.title}</p><p className="text-xs text-muted-foreground">{ev.date}</p></div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={async () => { if (!userData?.communityId) return; if (!confirm('Delete this event?')) return; await deleteDoc(doc(db, 'communities', userData.communityId, 'events', ev.id)); }}>Delete</Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
              <Dialog open={createEventOpen} onOpenChange={setCreateEventOpen}><DialogContent><DialogHeader><DialogTitle>New Event</DialogTitle><DialogDescription>Share an upcoming community event</DialogDescription></DialogHeader><div className="space-y-3"><Input placeholder="Title" value={newEventTitle} onChange={(e) => setNewEventTitle(e.target.value)} /><Input type="date" value={newEventDate} onChange={(e) => setNewEventDate(e.target.value)} /><Textarea placeholder="Description (optional)" /></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setCreateEventOpen(false)}>Cancel</Button><Button onClick={createEvent} disabled={!newEventTitle.trim() || !newEventDate.trim()}>Create</Button></div></DialogContent></Dialog>

              {/* New Post Dialog */}
              <Dialog open={newPostOpen} onOpenChange={setNewPostOpen}><DialogContent><DialogHeader><DialogTitle>New Post</DialogTitle><DialogDescription>Share an update with your community</DialogDescription></DialogHeader><div className="space-y-3"><Textarea placeholder="Write your post..." value={newPostText} onChange={(e) => setNewPostText(e.target.value)} rows={4} /></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setNewPostOpen(false)}>Cancel</Button><Button onClick={async () => { if (!userData?.communityId || !newPostText.trim()) return; await addDoc(collection(db, 'communities', userData.communityId, 'messages'), { senderId: user?.uid, senderEmail: user?.email, content: newPostText.trim(), type: 'text', timestamp: new Date() }); setNewPostText(''); setNewPostOpen(false); }}>Post</Button></div></DialogContent></Dialog>

              {/* Report Issue Dialog */}
              <Dialog open={reportOpen} onOpenChange={setReportOpen}><DialogContent><DialogHeader><DialogTitle>Report an Issue</DialogTitle><DialogDescription>Alert your community about a problem</DialogDescription></DialogHeader><div className="space-y-3"><Input placeholder="Title" value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} /><Textarea placeholder="Describe the issue..." value={reportDesc} onChange={(e) => setReportDesc(e.target.value)} rows={4} /></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setReportOpen(false)}>Cancel</Button><Button onClick={async () => { if (!userData?.communityId || !reportTitle.trim()) return; await addDoc(collection(db, 'communities', userData.communityId, 'issues'), { title: reportTitle.trim(), description: reportDesc.trim(), status: 'pending', createdAt: new Date().toISOString(), reporterId: user?.uid, reporterEmail: user?.email }); setReportTitle(''); setReportDesc(''); setReportOpen(false); }}>Submit</Button></div></DialogContent></Dialog>
              <Dialog open={editOpen} onOpenChange={setEditOpen}><DialogContent><DialogHeader><DialogTitle>Edit community name</DialogTitle><DialogDescription>Update the name shown at the top</DialogDescription></DialogHeader><div className="space-y-3"><Input value={newCommunityName} onChange={(e) => setNewCommunityName(e.target.value)} placeholder="Community name" /><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button><Button onClick={saveCommunityName} disabled={!newCommunityName.trim()}>Save</Button></div></div></DialogContent></Dialog>
            </div>
        );
      }
      return null; // Return null or a generic error/redirect page if no condition is met
}

