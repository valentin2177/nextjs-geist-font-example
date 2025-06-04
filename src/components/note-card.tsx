"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pin, Archive, Trash2 } from "lucide-react"
import { NoteDialog } from "@/components/note-dialog"

interface Note {
  id: string
  title: string
  content: string
  pinned: boolean
  createdAt: Date
  color?: string
  tags?: string[]
  images?: string[]
  reminder?: Date | null
  archived?: boolean
  trashed?: boolean
}

interface NoteCardProps {
  note: Note
  onPin: (id: string) => void
  onUpdate: (note: Note) => void
  onArchive?: (id: string) => void
  onDelete?: (id: string) => void
}

export function NoteCard({ note, onPin, onUpdate, onArchive, onDelete }: NoteCardProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const handleSave = (updatedNote: Note) => {
    onUpdate({
      ...updatedNote,
      pinned: note.pinned,
    })
    setIsDialogOpen(false)
  }

  const openDialog = () => setIsDialogOpen(true)

  return (
    <>
      <Card 
        className={`p-4 relative group hover:shadow-md transition-shadow cursor-pointer ${note.color || 'bg-background'}`}
        onClick={openDialog}
      >
        {/* Pin button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            onPin(note.id)
          }}
        >
          <Pin className={`h-4 w-4 ${note.pinned ? "fill-current" : ""}`} />
        </Button>

        {/* Archive/Unarchive and Delete buttons */}
        <div className="absolute top-2 right-12 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onArchive && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                onArchive(note.id)
              }}
              title={note.archived ? "Unarchive" : "Archive"}
            >
              <Archive className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(note.id)
              }}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Note content */}
        <div className="pr-8">
          {note.title && (
            <h3 className="font-medium mb-2 break-words">{note.title}</h3>
          )}
          {note.content && (
            <p className="text-sm text-muted-foreground break-words whitespace-pre-wrap">
              {note.content}
            </p>
          )}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {note.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {note.reminder && (
            <div className="mt-2 text-xs text-muted-foreground">
              Reminder: {new Date(note.reminder).toLocaleString()}
            </div>
          )}
          {note.images && note.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {note.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt=""
                  className="w-full h-20 object-cover rounded-md"
                />
              ))}
            </div>
          )}
        </div>
      </Card>

      <NoteDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        note={note}
        onSave={handleSave}
      />
    </>
  )
}
