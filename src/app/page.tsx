"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Menu, Search, Plus, LightbulbIcon, Archive, Trash2, Bell, Tag, X } from "lucide-react"
import { NoteCard } from "@/components/note-card"

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

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [tags, setTags] = useState<string[]>([])
  const COLORS = [
    "bg-background",
    "bg-red-900/20",
    "bg-green-900/20",
    "bg-blue-900/20",
    "bg-yellow-900/20",
    "bg-purple-900/20"
  ]

  const [newNote, setNewNote] = useState({ title: "", content: "", reminder: null as Date | null, color: undefined as string | undefined, tags: [] as string[], images: [] as string[], tagInput: "" })
  const [searchQuery, setSearchQuery] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [filter, setFilter] = useState<"notes" | "reminders" | "archive" | "trash">("notes")
  const [isEditTagsOpen, setIsEditTagsOpen] = useState(false)
  const [newTagInput, setNewTagInput] = useState("")

  // Load notes and tags from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('notes')
    const savedTags = localStorage.getItem('tags')
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }
      if (savedTags) {
        setTags(JSON.parse(savedTags) as string[])
      } else {
        // Initialize tags from existing notes
        const noteTags = Array.from(new Set(JSON.parse(savedNotes || '[]').flatMap((note: Note) => note.tags || [])))
        setTags(noteTags)
      }
  }, [])

  // Save notes and tags to localStorage
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes))
    localStorage.setItem('tags', JSON.stringify(tags))
  }, [notes, tags])

  const addTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags(prev => [...prev, tag.trim()])
      setNewTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
    // Also remove the tag from all notes
    setNotes(prev => prev.map(note => ({
      ...note,
      tags: note.tags?.filter(tag => tag !== tagToRemove) || []
    })))
  }

  const addNote = () => {
    if (newNote.title.trim() || newNote.content.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        title: newNote.title,
        content: newNote.content,
        pinned: false,
        createdAt: new Date(),
        color: newNote.color || undefined,
        tags: newNote.tags || [],
        images: newNote.images || [],
        reminder: newNote.reminder || null,
        archived: false,
        trashed: false,
      }
      setNotes(prev => [note, ...prev])
      setNewNote({ title: "", content: "", reminder: null, color: undefined, tags: [], images: [], tagInput: "" })
      setIsExpanded(false)
    }
  }

  const handleArchive = (noteId: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, archived: !note.archived } : note
    ))
  }

  const handleDelete = (noteId: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, trashed: true } : note
    ))
  }

  const togglePin = (id: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, pinned: !note.pinned } : note
    ))
  }

  const updateNote = (updatedNote: Note) => {
    setNotes(prev => prev.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    ))
  }

  const filteredNotes = notes.filter(note => {
    if (filter === "reminders") {
      return note.reminder !== null && !note.trashed
    }
    if (filter === "archive") {
      return note.archived && !note.trashed
    }
    if (filter === "trash") {
      return note.trashed
    }
    // filter === "notes"
    return !note.archived && !note.trashed
  }).filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const pinnedNotes = filteredNotes.filter(note => note.pinned)
  const unpinnedNotes = filteredNotes.filter(note => !note.pinned)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="flex h-14 items-center px-4 gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[280px]">
            <nav className="flex flex-col gap-2 mt-4">
              <Button 
                variant={filter === "notes" ? "default" : "ghost"} 
                className="justify-start gap-2"
                onClick={() => setFilter("notes")}
              >
                <LightbulbIcon className="h-4 w-4" />
                Notes
              </Button>
              <Button 
                variant={filter === "reminders" ? "default" : "ghost"} 
                className="justify-start gap-2 text-muted-foreground"
                onClick={() => setFilter("reminders")}
              >
                Reminders
              </Button>
              <Button 
                variant={filter === "archive" ? "default" : "ghost"} 
                className="justify-start gap-2 text-muted-foreground"
                onClick={() => setFilter("archive")}
              >
                Archive
              </Button>
              <Button 
                variant={filter === "trash" ? "default" : "ghost"} 
                className="justify-start gap-2 text-muted-foreground"
                onClick={() => setFilter("trash")}
              >
                Trash
              </Button>
          {/* Tags Section */}
          <div className="mt-6 border-t pt-4">
            <h3 className="text-sm font-semibold mb-2">Tags</h3>
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
              {Array.from(new Set(notes.flatMap(note => note.tags || []))).map(tag => (
                <div key={tag} className="flex items-center gap-1">
                  <button
                    className="flex-1 text-left text-sm px-2 py-1 rounded hover:bg-muted"
                    onClick={() => setSearchQuery(tag)}
                    title="Click to filter by tag"
                  >
                    {tag}
                  </button>
                  <button
                    className="text-sm px-2 py-1 rounded hover:bg-muted text-destructive"
                    onClick={() => {
                      setNotes(prev => prev.map(note => ({
                        ...note,
                        tags: note.tags?.filter(t => t !== tag) || []
                      })))
                    }}
                    title="Remove tag from all notes"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Add new tag"
                className="flex-1 rounded border border-muted px-2 py-1 text-sm"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTagInput.trim()) {
                    e.preventDefault()
                    if (!Array.from(new Set(notes.flatMap(note => note.tags || []))).includes(newTagInput.trim())) {
                      // Add new tag to all notes as empty tag array if none
                      setNotes(prev => prev.map(note => ({
                        ...note,
                        tags: note.tags ? note.tags : []
                      })))
                      setNewTagInput("")
                    }
                  }
                }}
              />
              <button
                className="rounded border border-muted px-4 py-1 text-sm"
                onClick={() => {
                  if (newTagInput.trim() && !Array.from(new Set(notes.flatMap(note => note.tags || []))).includes(newTagInput.trim())) {
                    setNotes(prev => prev.map(note => ({
                      ...note,
                      tags: note.tags ? note.tags : []
                    })))
                    setNewTagInput("")
                  }
                }}
              >
                Add Tag
              </button>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 w-full"
              onClick={() => setIsEditTagsOpen(true)}
            >
              Edit Tags
            </Button>

                <Dialog open={isEditTagsOpen} onOpenChange={setIsEditTagsOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Tags</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {Array.from(new Set(notes.flatMap(note => note.tags || []))).map(tag => (
                          <div key={tag} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
                            <span className="text-sm">{tag}</span>
                            <button
                              onClick={() => {
                                setNotes(prev => prev.map(note => ({
                                  ...note,
                                  tags: note.tags?.filter(t => t !== tag) || []
                                })))
                              }}
                              className="hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Click × to remove a tag from all notes
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </nav>
          </SheetContent>
          </Sheet>
          <div className="flex-1">
            <form className="flex items-center gap-4" onSubmit={(e) => e.preventDefault()}>
              <div className="flex-1 relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex min-h-screen pt-14">
        {/* Sidebar - Hidden on mobile */}
        <aside className="hidden md:flex w-[240px] flex-col gap-2 border-r p-4">
          <Button 
            variant={filter === "notes" ? "default" : "ghost"} 
            className="justify-start gap-2"
            onClick={() => setFilter("notes")}
          >
            <LightbulbIcon className="h-4 w-4" />
            Notes
          </Button>
          <Button 
            variant={filter === "reminders" ? "default" : "ghost"} 
            className="justify-start gap-2 text-muted-foreground"
            onClick={() => setFilter("reminders")}
          >
            Reminders
          </Button>
          <Button 
            variant={filter === "archive" ? "default" : "ghost"} 
            className="justify-start gap-2 text-muted-foreground"
            onClick={() => setFilter("archive")}
          >
            Archive
          </Button>
          <Button 
            variant={filter === "trash" ? "default" : "ghost"} 
            className="justify-start gap-2 text-muted-foreground"
            onClick={() => setFilter("trash")}
          >
            Trash
          </Button>
        </aside>

        {/* Notes Content */}
        <div className="flex-1 p-4">
          {/* Create Note */}
          {filter === "notes" && (
            <Card className="mb-6 p-4 transition-all duration-200">
          {isExpanded ? (
            <>
              <Input
                placeholder="Title"
                className="mb-2 border-0 text-lg font-medium focus-visible:ring-0"
                value={newNote.title}
                onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                placeholder="Take a note..."
                className="min-h-[100px] border-0 focus-visible:ring-0 resize-none"
                value={newNote.content}
                onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
              />
              <div className="flex items-center gap-2 mt-2">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <input
                  type="datetime-local"
                  className="bg-transparent text-muted-foreground text-sm border border-muted rounded px-2 py-1"
                  value={newNote.reminder ? newNote.reminder.toISOString().slice(0,16) : ""}
                  onChange={(e) => setNewNote(prev => ({ ...prev, reminder: e.target.value ? new Date(e.target.value) : null }))}
                />
              </div>
              {/* Additional options like color, tags, image upload, archive, delete */}
              <div className="flex items-center gap-4 mt-4">
                {/* Color picker */}
                {COLORS.map(color => (
                  <button
                    key={color}
                    className={`p-1 rounded-full w-6 h-6 ${color} ${newNote.color === color ? "ring-2 ring-offset-1 ring-offset-background ring-primary" : ""}`}
                    title={color.replace("bg-", "")}
                    onClick={() => setNewNote(prev => ({ ...prev, color }))}
                  />
                ))}
                {/* Tags */}
                <div className="flex flex-col gap-2">
                  {newNote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newNote.tags.map(tag => (
                        <div key={tag} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
                          <Tag className="h-3 w-3" />
                          <span className="text-sm">{tag}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              setNewNote(prev => ({
                                ...prev,
                                tags: prev.tags.filter(t => t !== tag)
                              }))
                            }}
                            className="hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Tag className="h-4 w-4" />
                    <Input
                      placeholder="Add tag"
                      className="flex-1"
                      value={newNote.tagInput || ""}
                      onChange={(e) => setNewNote(prev => ({ ...prev, tagInput: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newNote.tagInput?.trim()) {
                          e.preventDefault()
                          if (!newNote.tags.includes(newNote.tagInput.trim())) {
                            setNewNote(prev => ({
                              ...prev,
                              tags: [...prev.tags, newNote.tagInput!.trim()],
                              tagInput: ""
                            }))
                          }
                        }
                      }}
                    />
                    <Button 
                      variant="secondary" 
                      onClick={(e) => {
                        e.stopPropagation()
                        if (newNote.tagInput?.trim() && !newNote.tags.includes(newNote.tagInput.trim())) {
                          setNewNote(prev => ({
                            ...prev,
                            tags: [...prev.tags, newNote.tagInput!.trim()],
                            tagInput: ""
                          }))
                        }
                      }}
                    >
                      Add Tag
                    </Button>
                  </div>
                </div>
                {/* Image upload */}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = () => {
                        const result = reader.result as string
                        setNewNote(prev => ({
                          ...prev,
                          images: [...prev.images, result]
                        }))
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                />
                <label htmlFor="image-upload" className="cursor-pointer rounded bg-muted px-2 py-1 text-sm">
                  Add Image
                </label>
                {/* Archive and Delete buttons */}
                <Button variant="ghost" size="icon" title="Archive" onClick={() => setNewNote(prev => ({ ...prev, archived: true }))}>
                  <Archive className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" title="Delete" onClick={() => setNewNote(prev => ({ ...prev, trashed: true }))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-between mt-4">
                <Button variant="ghost" onClick={() => setIsExpanded(false)}>
                  Close
                </Button>
                <Button onClick={addNote}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>
            </>
          ) : (
            <div
              className="flex items-center gap-2 text-muted-foreground cursor-text"
              onClick={() => setIsExpanded(true)}
            >
              Take a note...
            </div>
          )}
            </Card>
          )}

          {/* Notes Grid */}
          <ScrollArea className="h-[calc(100vh-16rem)]">
            {pinnedNotes.length > 0 && (
              <>
                <h2 className="text-sm font-medium mb-4">Pinned</h2>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
                  {pinnedNotes.map(note => (
                    <NoteCard 
                      key={note.id} 
                      note={note} 
                      onPin={togglePin}
                      onUpdate={updateNote}
                      onArchive={handleArchive}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
                <h2 className="text-sm font-medium mb-4">Others</h2>
              </>
            )}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {unpinnedNotes.map(note => (
                <NoteCard 
                  key={note.id} 
                  note={note} 
                  onPin={togglePin}
                  onUpdate={updateNote}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                />
              ))}
            </div>
            {notes.length === 0 && (
              <div className="text-center text-muted-foreground mt-8">
                Notes you add appear here
              </div>
            )}
          </ScrollArea>
        </div>
      </main>
    </div>
  )
}
