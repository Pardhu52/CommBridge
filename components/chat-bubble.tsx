"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { MessageCircle, Heart, Reply, MoreHorizontal } from "lucide-react"

interface ChatBubbleProps {
  message: {
    id: string
    sender: string
    avatar: string
    content: string
    timestamp: string
    type?: "text" | "image" | "file"
    isOwn: boolean
    reactions?: Array<{
      emoji: string
      count: number
      users: string[]
    }>
    replies?: number
  }
  showAvatar?: boolean
  onReply?: (messageId: string) => void
  onReact?: (messageId: string, emoji: string) => void
}

export function ChatBubble({ message, showAvatar = true, onReply, onReact }: ChatBubbleProps) {
  return (
    <div className={cn("flex gap-3 group", message.isOwn ? "flex-row-reverse" : "")}>
      {/* Avatar */}
      {showAvatar && !message.isOwn && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarImage src={message.avatar || "/placeholder.svg"} alt={message.sender} />
          <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
        </Avatar>
      )}

      {/* Message Content */}
      <div className={cn("max-w-xs lg:max-w-md space-y-1", message.isOwn ? "text-right" : "")}>
        {/* Sender Name */}
        {!message.isOwn && showAvatar && <p className="text-sm font-medium text-muted-foreground">{message.sender}</p>}

        {/* Message Bubble */}
        <div className="relative">
          <Card
            className={cn("shadow-sm", message.isOwn ? "bg-primary text-primary-foreground border-primary" : "bg-card")}
          >
            <CardContent className="p-3">
              <p className="text-sm leading-relaxed">{message.content}</p>
            </CardContent>
          </Card>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex gap-1 mt-1">
              {message.reactions.map((reaction, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs cursor-pointer hover:bg-muted"
                  onClick={() => onReact?.(message.id, reaction.emoji)}
                >
                  {reaction.emoji} {reaction.count}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp and Actions */}
        <div
          className={cn(
            "flex items-center gap-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity",
            message.isOwn ? "justify-end" : "justify-start",
          )}
        >
          <span>{message.timestamp}</span>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onReact?.(message.id, "❤️")}>
              <Heart className="w-3 h-3" />
            </Button>

            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onReply?.(message.id)}>
              <Reply className="w-3 h-3" />
            </Button>

            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </div>

          {/* Reply Count */}
          {message.replies && message.replies > 0 && (
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs" onClick={() => onReply?.(message.id)}>
              <MessageCircle className="w-3 h-3 mr-1" />
              {message.replies} replies
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
