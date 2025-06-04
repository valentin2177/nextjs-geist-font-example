"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Image, Palette, Tag, X, Bell, Archive, Trash2 } from "lucide-react"

interface NoteDialogProps {
  isOpen: boolean
  onClose: () => void
  note: {
    id: string
    title: string
    content: string
    color?: string
    tags?: string[]
    images?: string[]
    reminder?: Date | null
    archived?: boolean
    trashed?: boolean
  }
  onSave: (note: any) => void
}

const COLORS = [
  "bg-background",
  "bg-red-900/20",
  "bg-green-900/20",
  "bg-blue-900/20",
  "bg-yellow-900/20",
  "bg-purple-900/20"
]

export function NoteDialog({ isOpen, onClose, note, onSave }: NoteDialogProps) {
  const [editedNote, setEditedNote] = React.useState(note)
  const [newTag, setNewTag] = React.useState("")
  const [imageUrl, setImageUrl] = React.useState("")

  const handleSave = () => {
    onSave(editedNote)
    onClose()
  }

  const addTag = () => {
    if (newTag.trim()) {
      setEditedNote(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setEditedNote(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove)
    }))
  }

  const addImage = () => {
    if (imageUrl.trim()) {
      setEditedNote(prev => ({
        ...prev,
        images: [...(prev.images || []), imageUrl.trim()]
      }))
      setImageUrl("")
    }
  }

  const removeImage = (imageToRemove: string) => {
    setEditedNote(prev => ({
      ...prev,
      images: prev.images?.filter(img => img !== imageToRemove)
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl ${editedNote.color || "bg-background"}`}>
        <DialogHeader>
          <DialogTitle>
            <Input
              value={editedNote.title}
              onChange={(e) => setEditedNote(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Title"
              className="text-lg border-0 focus-visible:ring-0 px-0"
            />
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={editedNote.content}
            onChange={(e) => setEditedNote(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Take a note..."
            className="min-h-[200px] border-0 focus-visible:ring-0 px-0 resize-none"
          />
          
          {/* Color Selection */}
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <div className="flex gap-1">
              {COLORS.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded-full ${color} border border-border hover:opacity-80 transition-opacity
                    ${editedNote.color === color ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setEditedNote(prev => ({ ...prev, color }))}
                />
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {editedNote.tags?.map(tag => (
              <div key={tag} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
                <span className="text-sm">{tag}</span>
                <button onClick={() => removeTag(tag)}>
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Tag className="h-4 w-4" />
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tag"
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && addTag()}
            />
            <Button onClick={addTag} variant="secondary">Add Tag</Button>
          </div>

          {/* Images */}
          <div className="grid grid-cols-2 gap-2">
            {editedNote.images?.map(img => (
              <div key={img} className="relative group">
                <img src={img} alt="" className="w-full h-40 object-cover rounded-md" />
                <button
                  onClick={() => removeImage(img)}
                  className="absolute top-2 right-2 p-1 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Image className="h-4 w-4" />
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Add image URL"
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && addImage()}
            />
            <Button onClick={addImage} variant="secondary">Add Image</Button>
          </div>
        </div>
        {/* Reminder */}
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <input
            type="datetime-local"
            className="bg-transparent text-muted-foreground text-sm border border-muted rounded px-2 py-1"
            value={editedNote.reminder ? new Date(editedNote.reminder).toISOString().slice(0,16) : ""}
            onChange={(e) => setEditedNote(prev => ({ ...prev, reminder: e.target.value ? new Date(e.target.value) : null }))}
          />
        </div>

        <div className="flex justify-between mt-4">
          <div className="flex gap-2">
            {editedNote.archived ? (
              <Button variant="ghost" size="icon" title="Unarchive" onClick={() => setEditedNote(prev => ({ ...prev, archived: false }))}>
                <Archive className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" title="Archive" onClick={() => setEditedNote(prev => ({ ...prev, archived: true }))}>
                <Archive className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" title="Delete" onClick={() => setEditedNote(prev => ({ ...prev, trashed: true }))}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
