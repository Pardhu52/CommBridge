"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MessageCircle,
  Send,
  ArrowLeft,
  Search,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  Users,
} from "lucide-react"
import Link from "next/link"

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>("general")
  const [newMessage, setNewMessage] = useState("")

  // Mock data for chats
  const chats = [
    {
      id: "general",
      name: "General Discussion",
      type: "group",
      lastMessage: "Thanks for organizing the BBQ!",
      lastMessageTime: "2m ago",
      unreadCount: 3,
      participants: 24,
      avatar: "/diverse-group-portrait.png",
    },
    {
      id: "maintenance",
      name: "Building Maintenance",
      type: "group",
      lastMessage: "Water pressure issue has been resolved",
      lastMessageTime: "1h ago",
      unreadCount: 0,
      participants: 18,
      avatar: "/abstract-geometric-shapes.png",
    },
    {
      id: "events",
      name: "Community Events",
      type: "group",
      lastMessage: "BBQ this Saturday at 2 PM!",
      lastMessageTime: "3h ago",
      unreadCount: 1,
      participants: 20,
      avatar: "/thoughtful-man.png",
    },
    {
      id: "sarah",
      name: "Sarah Martinez",
      type: "direct",
      lastMessage: "Sure, I can help with that",
      lastMessageTime: "1d ago",
      unreadCount: 0,
      participants: 2,
      avatar: "/diverse-woman-portrait.png",
    },
  ]

  // Mock messages for selected chat
  const messages = [
    {
      id: "1",
      sender: "Mike Rodriguez",
      avatar: "/thoughtful-man.png",
      content: "Hey everyone! Just wanted to remind you about the BBQ this Saturday at 2 PM in the courtyard.",
      timestamp: "10:30 AM",
      type: "text",
      isOwn: false,
    },
    {
      id: "2",
      sender: "Sarah Martinez",
      avatar: "/diverse-woman-portrait.png",
      content: "Sounds great! Should we bring our own food or is it provided?",
      timestamp: "10:32 AM",
      type: "text",
      isOwn: false,
    },
    {
      id: "3",
      sender: "You",
      avatar: "/woman-glasses.jpg",
      content: "I can bring some drinks for everyone!",
      timestamp: "10:35 AM",
      type: "text",
      isOwn: true,
    },
    {
      id: "4",
      sender: "Mike Rodriguez",
      avatar: "/thoughtful-man.png",
      content: "Perfect! Everyone brings their own food, but drinks would be awesome. Thanks!",
      timestamp: "10:37 AM",
      type: "text",
      isOwn: false,
    },
    {
      id: "5",
      sender: "Lisa Kim",
      avatar: "/abstract-geometric-shapes.png",
      content: "I'll bring some games for the kids",
      timestamp: "11:15 AM",
      type: "text",
      isOwn: false,
    },
    {
      id: "6",
      sender: "You",
      avatar: "/woman-glasses.jpg",
      content: "Thanks for organizing this Mike! It's going to be great to meet everyone.",
      timestamp: "Just now",
      type: "text",
      isOwn: true,
    },
  ]

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Handle sending message
      console.log("Sending message:", newMessage)
      setNewMessage("")
    }
  }

  const selectedChatData = chats.find((chat) => chat.id === selectedChat)

  const getChatIcon = (type: string) => {
    switch (type) {
      case "group":
        return <Users className="w-4 h-4" />
      case "direct":
        return <MessageCircle className="w-4 h-4" />
      default:
        return <MessageCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="h-screen bg-background flex">
      {/* Sidebar - Chat List */}
      <div className="w-80 border-r bg-card/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
            <h1 className="text-lg font-semibold">Messages</h1>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search conversations..." className="pl-10" />
          </div>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 ${
                  selectedChat === chat.id ? "bg-muted" : ""
                }`}
                onClick={() => setSelectedChat(chat.id)}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={chat.avatar || "/placeholder.svg"} alt={chat.name} />
                    <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {chat.type === "group" && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      {getChatIcon(chat.type)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium truncate">{chat.name}</p>
                    <span className="text-xs text-muted-foreground">{chat.lastMessageTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                    {chat.unreadCount > 0 && (
                      <Badge variant="default" size="sm" className="ml-2">
                        {chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                  {chat.type === "group" && (
                    <p className="text-xs text-muted-foreground mt-1">{chat.participants} members</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChatData ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-card/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedChatData.avatar || "/placeholder.svg"} alt={selectedChatData.name} />
                    <AvatarFallback>{selectedChatData.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold">{selectedChatData.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedChatData.type === "group" ? `${selectedChatData.participants} members` : "Online"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedChatData.type === "direct" && (
                    <>
                      <Button variant="ghost" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.isOwn ? "flex-row-reverse" : ""}`}>
                    {!message.isOwn && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={message.avatar || "/placeholder.svg"} alt={message.sender} />
                        <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}

                    <div className={`max-w-xs lg:max-w-md ${message.isOwn ? "text-right" : ""}`}>
                      {!message.isOwn && <p className="text-sm font-medium mb-1">{message.sender}</p>}
                      <div
                        className={`p-3 rounded-lg ${
                          message.isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{message.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-card/50">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>

                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="pr-10"
                  />
                  <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 transform -translate-y-1/2">
                    <Smile className="w-4 h-4" />
                  </Button>
                </div>

                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">Choose a chat from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
