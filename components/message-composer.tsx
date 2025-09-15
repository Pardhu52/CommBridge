"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageCircle, Send, AlertTriangle, Calendar, Bell, X, Plus } from "lucide-react"

interface MessageComposerProps {
  onSend?: (message: any) => void
  onCancel?: () => void
}

export function MessageComposer({ onSend, onCancel }: MessageComposerProps) {
  const [messageType, setMessageType] = useState("general")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [priority, setPriority] = useState("normal")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  const messageTypes = [
    {
      id: "general",
      label: "General Discussion",
      description: "Regular community conversation",
      icon: MessageCircle,
      color: "blue",
    },
    {
      id: "issue",
      label: "Report Issue",
      description: "Building maintenance or problems",
      icon: AlertTriangle,
      color: "orange",
    },
    {
      id: "event",
      label: "Community Event",
      description: "Organize gatherings and activities",
      icon: Calendar,
      color: "green",
    },
    {
      id: "announcement",
      label: "Announcement",
      description: "Important community updates",
      icon: Bell,
      color: "purple",
    },
  ]

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSend = () => {
    if (title.trim() && content.trim()) {
      const message = {
        type: messageType,
        title: title.trim(),
        content: content.trim(),
        priority,
        tags,
        timestamp: new Date().toISOString(),
      }
      onSend?.(message)
    }
  }

  const selectedType = messageTypes.find((type) => type.id === messageType)

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          New Community Post
        </CardTitle>
        <CardDescription>Share updates, report issues, or organize events with your community</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Message Type Selection */}
        <div>
          <Label className="text-base font-medium mb-3 block">Post Type</Label>
          <RadioGroup value={messageType} onValueChange={setMessageType} className="grid grid-cols-2 gap-4">
            {messageTypes.map((type) => (
              <div key={type.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value={type.id} id={type.id} />
                <div className="flex items-center gap-2 flex-1">
                  <div className={`w-8 h-8 bg-${type.color}-100 rounded-lg flex items-center justify-center`}>
                    <type.icon className={`w-4 h-4 text-${type.color}-600`} />
                  </div>
                  <div>
                    <Label htmlFor={type.id} className="font-medium cursor-pointer">
                      {type.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Title */}
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder={`Enter ${selectedType?.label.toLowerCase()} title...`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Content */}
        <div>
          <Label htmlFor="content">Message</Label>
          <Textarea
            id="content"
            placeholder="Describe the details..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
        </div>

        {/* Priority (for issues) */}
        {messageType === "issue" && (
          <div>
            <Label className="text-base font-medium mb-3 block">Priority Level</Label>
            <RadioGroup value={priority} onValueChange={setPriority} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low">Low</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="normal" />
                <Label htmlFor="normal">Normal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high">High</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="urgent" id="urgent" />
                <Label htmlFor="urgent">Urgent</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Tags */}
        <div>
          <Label className="text-base font-medium mb-3 block">Tags (Optional)</Label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Add a tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTag()}
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={addTag}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Preview */}
        {title && content && (
          <Alert>
            {selectedType && <selectedType.icon className="h-4 w-4" />}
            <AlertDescription>
              <strong>{title}</strong> - {content.substring(0, 100)}
              {content.length > 100 && "..."}
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button onClick={handleSend} disabled={!title.trim() || !content.trim()} className="flex-1">
            <Send className="w-4 h-4 mr-2" />
            Post to Community
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
