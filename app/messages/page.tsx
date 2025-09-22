"use client"

import { useState, useEffect, useRef } from "react"
// --- FIX: Using correct relative paths to ensure modules are found by the build tool ---
import { useAuth } from "../../context/AuthContext"
import { db, app } from "../../lib/firebase"
import dynamic from "next/dynamic";
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });
import type { EmojiClickData } from "emoji-picker-react";
import { Button } from "../../components/ui/button"
import { Textarea } from "../../components/ui/textarea"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import { ScrollArea } from "../../components/ui/scroll-area"
import { Skeleton } from "../../components/ui/skeleton"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";
import { Progress } from "../../components/ui/progress";
import { useToast } from "../../components/ui/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "../../components/ui/dropdown-menu";
import { MessageCircle, Send, ArrowLeft, MoreVertical, Paperclip, Smile, Sparkles, Loader2 } from "lucide-react"
import Link from "next/link"
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, getDocs, limit as qLimit, startAfter } from "firebase/firestore"
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage"


export default function MessagesPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(true);
  const scrollAreaRef = useRef<any>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadFileName, setUploadFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  // --- State for AI features ---
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [summary, setSummary] = useState("");
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);


  // Real-time listener for messages
  useEffect(() => {
    if (!userData?.communityId) { setLoadingMessages(false); return; }
    const messagesColRef = collection(db, "communities", userData.communityId, "messages");
    const q = query(messagesColRef, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setMessages(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingMessages(false);
    });
    return () => unsubscribe();
  }, [userData]);

  // Auto-scrolling logic
  useEffect(() => {
     if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) { setTimeout(() => { viewport.scrollTop = viewport.scrollHeight; }, 100); }
     }
  }, [messages]);
  
  const onEmojiClick = (emojiData: EmojiClickData) => {
      setNewMessage(prevInput => prevInput + emojiData.emoji);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !userData?.communityId) return;
    try {
      const messagesColRef = collection(db, "communities", userData.communityId, "messages");
      await addDoc(messagesColRef, {
        senderId: user.uid, senderEmail: user.email,
        content: newMessage.trim(), type: "text", timestamp: serverTimestamp(),
      });
      setNewMessage("");
      toast({ title: "Message sent" });
    } catch (error) { console.error("Error sending message:", error); }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: any) => {
    if (!user || !userData?.communityId) return;
    const files: File[] = Array.from(e.target.files || []);
    if (!files.length) return;
    setIsUploading(true);
    try {
      const storage = getStorage(app);
      const messagesColRef = collection(db, "communities", userData.communityId, "messages");
      for (const file of files) {
        if (file.size > 25 * 1024 * 1024) { // 25MB limit
          toast({ title: "File too large", description: `${file.name} exceeds 25MB`, variant: "destructive" });
          continue;
        }
        const path = `communities/${userData.communityId}/messages/${Date.now()}_${file.name}`;
        const ref = storageRef(storage, path);
        setUploadFileName(file.name);
        setUploadProgress(0);
        const task = uploadBytesResumable(ref, file);
        await new Promise<void>((resolve, reject) => {
          task.on('state_changed', (snapshot) => {
            const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            setUploadProgress(pct);
          }, reject, async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            const isImage = file.type.startsWith("image/");
            await addDoc(messagesColRef, {
              senderId: user.uid,
              senderEmail: user.email,
              content: isImage ? "" : file.name,
              fileUrl: url,
              fileName: file.name,
              fileType: file.type || "",
              type: isImage ? "image" : "file",
              timestamp: serverTimestamp(),
            });
            resolve();
          });
        });
        toast({ title: "Uploaded", description: file.name });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({ title: "Upload failed", description: "Check Storage config/permissions and retry.", variant: "destructive" });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadFileName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dt = e.dataTransfer;
    const files = Array.from(dt.files || []);
    if (!files.length) return;
    await handleFileSelected({ target: { files } });
  };

  const handleDeleteMessage = async (id: string) => {
    if (!userData?.communityId) return;
    const confirmed = window.confirm("Delete this message? This cannot be undone.");
    if (!confirmed) return;
    try {
      const ref = doc(db, "communities", userData.communityId, "messages", id);
      await deleteDoc(ref);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const startEditing = (id: string, content: string) => {
    setEditingMessageId(id);
    setEditingText(content);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const saveEdit = async () => {
    if (!editingMessageId || !editingText.trim() || !userData?.communityId) return;
    try {
      const ref = doc(db, "communities", userData.communityId, "messages", editingMessageId);
      await updateDoc(ref, { content: editingText.trim() });
      setEditingMessageId(null);
      setEditingText("");
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };

  // --- Function to call our secure backend proxy ---
  const callGeminiProxy = async (prompt: string, systemInstruction: string) => {
      try {
          const { getFunctions, httpsCallable } = await import("firebase/functions");
          const functions = getFunctions(undefined, "asia-south1");
          const callApi = httpsCallable(functions, 'callGeminiApiProxy');
          const result: any = await callApi({ prompt, systemInstruction });

          if (result.data.success) {
              return result.data.response;
          } else {
              return "The AI returned an error.";
          }
      } catch (error) {
          console.error("Error calling Gemini proxy function:", error);
          return "An error occurred while contacting the AI.";
      }
  };
  
  const handleSummarize = async () => {
    setIsSummarizing(true);
    const conversation = messages.slice(-20).map(msg => `${msg.senderEmail}: ${msg.content}`).join("\n");
    const prompt = `Summarize the key points from this conversation. Use bullet points:\n\n${conversation}`;
    const systemInstruction = "You are a helpful assistant that summarizes community chat conversations.";
    const result = await callGeminiProxy(prompt, systemInstruction);
    setSummary(result);
    setShowSummaryDialog(true);
    setIsSummarizing(false);
  };

  const handleDrafting = async () => {
    if (!newMessage.trim()) return;
    setIsDrafting(true);
    const prompt = `Draft a friendly and clear community announcement based on this topic: "${newMessage}"`;
    const systemInstruction = "You are a helpful community manager. Write in a polite, clear, and slightly informal tone for a neighborhood chat. Add relevant emojis.";
    const result = await callGeminiProxy(prompt, systemInstruction);
    setNewMessage(result);
    setIsDrafting(false);
  };

  // --- Actions for 3-dots menu ---
  const exportChat = async () => {
    try {
      if (!userData?.communityId) return;
      // pull latest 500 messages ordered asc
      const messagesColRef = collection(db, "communities", userData.communityId, "messages");
      const q = query(messagesColRef, orderBy("timestamp", "asc"));
      const snap = await getDocs(q);
      const lines = snap.docs.map((d) => {
        const m: any = d.data();
        const ts = m.timestamp?.toDate?.().toLocaleString() || "";
        const sender = m.senderEmail || m.senderId || "unknown";
        const content = m.type === "image" && m.fileUrl ? `[image] ${m.fileUrl}` : m.type === "file" && m.fileUrl ? `[file] ${m.fileName || "file"} -> ${m.fileUrl}` : (m.content || "");
        return `${ts} - ${sender}: ${content}`;
      });
      const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'community-chat.txt'; a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Exported chat", description: `Saved ${lines.length} lines.` });
    } catch (e) {
      console.error(e);
      toast({ title: "Export failed", variant: "destructive" });
    }
  };

  const clearChat = async () => {
    if (!userData?.communityId) return;
    const confirmed = window.confirm("Clear all messages in this community? This cannot be undone.");
    if (!confirmed) return;
    try {
      const messagesColRef = collection(db, "communities", userData.communityId, "messages");
      // Delete in batches to avoid timeouts
      let lastDoc: any = null;
      while (true) {
        const q = lastDoc
          ? query(messagesColRef, orderBy("timestamp", "asc"), startAfter(lastDoc), qLimit(100))
          : query(messagesColRef, orderBy("timestamp", "asc"), qLimit(100));
        const snap = await getDocs(q);
        if (snap.empty) break;
        for (const d of snap.docs) {
          await deleteDoc(doc(db, "communities", userData.communityId, "messages", d.id));
        }
        lastDoc = snap.docs[snap.docs.length - 1];
        if (snap.size < 100) break;
      }
      toast({ title: "Chat cleared" });
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to clear chat", variant: "destructive" });
    }
  };

  if (authLoading) return <div className="h-screen bg-background flex items-center justify-center"><Skeleton className="w-full h-full" /></div>;

  if (!userData?.communityId) {
      return (
         <div className="h-screen bg-background flex items-center justify-center text-center p-4">
            <div><MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" /><h3 className="text-lg font-semibold mb-2">Community Not Found</h3><p className="text-muted-foreground">You must be a verified member to view messages.</p><Button asChild className="mt-4"><Link href="/dashboard">Back to Dashboard</Link></Button></div>
         </div>
      )
  }

  return (
    <>
      <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
        <DialogContent><DialogHeader><DialogTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> Conversation Summary</DialogTitle><DialogDescription>Here are the key points from recent messages:</DialogDescription></DialogHeader><div className="prose prose-sm dark:prose-invert max-h-[60vh] overflow-y-auto">{summary.split('\n').map((line, index) => <p key={index}>{line.replace(/^\* /, '• ')}</p>)}</div></DialogContent>
      </Dialog>
      <div className="h-screen bg-background flex flex-col">
        <div className="p-4 border-b bg-card/50">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><Button variant="ghost" size="sm" asChild><Link href="/dashboard"><ArrowLeft className="w-4 h-4 mr-2" />Back</Link></Button><div><h2 className="font-semibold">General Discussion</h2><p className="text-sm text-muted-foreground">{userData.communityData?.memberCount || 1} members</p></div></div>
              <div className="flex items-center gap-2">
               <Button variant="outline" size="sm" onClick={handleSummarize} disabled={isSummarizing || messages.length < 3}>
                 {isSummarizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                 <span className="ml-2 hidden sm:inline">Summarize</span>
               </Button>
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-48">
                   <DropdownMenuLabel>Conversation</DropdownMenuLabel>
                   <DropdownMenuItem onClick={exportChat}>Export as .txt</DropdownMenuItem>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem variant="destructive" onClick={clearChat}>Clear chat</DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
             </div>
           </div>
        </div>
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {loadingMessages ? (<div className="space-y-4"><Skeleton className="h-16 w-3/4" /><Skeleton className="h-16 w-2/3 self-end ml-auto" /></div>) : (
              messages.map((message) => {
                const isOwn = message.senderId === user?.uid;
                return (
                    <div key={message.id} className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
                      {!isOwn && (<Avatar className="w-8 h-8"><AvatarFallback>{message.senderEmail?.charAt(0).toUpperCase()}</AvatarFallback></Avatar>)}
                      <div className={`max-w-xs lg-max-w-md ${isOwn ? "text-right" : ""}`}>
                        {!isOwn && <p className="text-sm font-medium mb-1">{message.senderEmail}</p>}
                        <div className={`p-3 rounded-lg ${isOwn ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                          {editingMessageId === message.id ? (
                            <div className="space-y-2 text-left">
                              <Textarea rows={3} value={editingText} onChange={(e) => setEditingText(e.target.value)} />
                              <div className="flex gap-2 justify-end">
                                <Button size="sm" variant="outline" onClick={cancelEditing}>Cancel</Button>
                                <Button size="sm" onClick={saveEdit} disabled={!editingText.trim()}>Save</Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {message.type === "image" && message.fileUrl ? (
                                <img src={message.fileUrl} alt={message.fileName || "image"} className="max-w-full rounded-md" />
                              ) : message.type === "file" && message.fileUrl ? (
                                <a href={message.fileUrl} target="_blank" rel="noreferrer" className="underline break-words">{message.fileName || "Download file"}</a>
                              ) : (
                                <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
                              )}
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">{message.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'now'}</p>
                          {isOwn && editingMessageId !== message.id && (
                            <>
                              <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => startEditing(message.id, message.content)}>Edit</Button>
                              <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => handleDeleteMessage(message.id)}>Delete</Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                )
              })
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t bg-card/50">
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" multiple />
            <Button variant="ghost" size="sm" onClick={handleAttachmentClick} disabled={isUploading}><Paperclip className="w-4 h-4" /></Button>
            <div className={`flex-1 relative ${isDragging ? 'ring-2 ring-primary rounded-md' : ''}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
              <Textarea rows={2} placeholder="Type a message or a topic to draft with AI..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} className="pr-20 resize-none"/>
              <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center">
                  <Popover><PopoverTrigger asChild><Button variant="ghost" size="sm"><Smile className="w-4 h-4" /></Button></PopoverTrigger><PopoverContent className="p-0 border-0 w-auto"><EmojiPicker onEmojiClick={onEmojiClick} /></PopoverContent></Popover>
                   <Button variant="ghost" size="sm" onClick={handleDrafting} disabled={isDrafting || !newMessage.trim()}>{isDrafting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}</Button>
              </div>
            </div>
             <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isUploading}><Send className="w-4 h-4" /></Button>
          </div>
          {isUploading && (
            <div className="mt-2 text-xs">
              <div className="mb-1 flex justify-between"><span>Uploading {uploadFileName}</span><span>{uploadProgress}%</span></div>
              <Progress value={uploadProgress} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

