'use client'
import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import NoteList from '@/components/NoteList'
import NoteEditor from '@/components/NoteEditor'

type Note = {
  id: string; title: string; content: string; isPinned: boolean
  notebookId: string | null; updatedAt: string
  tags: { id: string; name: string }[]
  notebook: { name: string; color: string } | null
}
type Notebook = { id: string; name: string; color: string; _count: { notes: number } }
type Tag = { id: string; name: string; _count: { notes: number } }

const COLORS = ['#10b981','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16']

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([])
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedNote, setSelectedNote] = useState<string | null>(null)
  const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchNotebooks = useCallback(async () => {
    const res = await fetch('/api/notebooks')
    setNotebooks(await res.json())
  }, [])

  const fetchTags = useCallback(async () => {
    const res = await fetch('/api/tags')
    setTags(await res.json())
  }, [])

  const fetchNotes = useCallback(async () => {
    const params = new URLSearchParams()
    if (selectedNotebook) params.set('notebookId', selectedNotebook)
    if (selectedTag) params.set('tagId', selectedTag)
    if (search) params.set('search', search)
    const res = await fetch(`/api/notes?${params}`)
    const data: Note[] = await res.json()
    setNotes(data)
    setLoading(false)
  }, [selectedNotebook, selectedTag, search])

  useEffect(() => { fetchNotebooks(); fetchTags() }, [fetchNotebooks, fetchTags])
  useEffect(() => { fetchNotes() }, [fetchNotes])

  const createNote = async () => {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notebookId: selectedNotebook }),
    })
    const note: Note = await res.json()
    setNotes((prev) => [note, ...prev])
    setSelectedNote(note.id)
    await fetchNotebooks()
  }

  const updateNote = useCallback(async (id: string, data: Partial<Note & { tagNames: string[] }>) => {
    const res = await fetch(`/api/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const updated: Note = await res.json()
    setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)).sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    }))
    if ('tagNames' in data) fetchTags()
    if ('notebookId' in data) fetchNotebooks()
  }, [fetchTags, fetchNotebooks])

  const deleteNote = async (id: string) => {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' })
    setNotes((prev) => prev.filter((n) => n.id !== id))
    setSelectedNote(null)
    await fetchNotebooks()
  }

  const createNotebook = async (name: string) => {
    const color = COLORS[notebooks.length % COLORS.length]
    const res = await fetch('/api/notebooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color }),
    })
    const nb: Notebook = await res.json()
    setNotebooks((prev) => [...prev, { ...nb, _count: { notes: 0 } }])
  }

  const deleteNotebook = async (id: string) => {
    if (!confirm('노트북을 삭제하면 노트와의 연결이 끊깁니다. 계속할까요?')) return
    await fetch(`/api/notebooks/${id}`, { method: 'DELETE' })
    setNotebooks((prev) => prev.filter((n) => n.id !== id))
    if (selectedNotebook === id) setSelectedNotebook(null)
    fetchNotes()
  }

  const currentNote = notes.find((n) => n.id === selectedNote) ?? null

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        notebooks={notebooks}
        tags={tags}
        selectedNotebook={selectedNotebook}
        selectedTag={selectedTag}
        onSelectNotebook={setSelectedNotebook}
        onSelectTag={setSelectedTag}
        onCreateNotebook={createNotebook}
        onDeleteNotebook={deleteNotebook}
        totalNotes={notes.length}
      />
      <NoteList
        notes={notes}
        selectedId={selectedNote}
        onSelect={setSelectedNote}
        onNew={createNote}
        search={search}
        onSearch={setSearch}
      />
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="animate-spin text-4xl">⏳</div>
        </div>
      ) : (
        <NoteEditor
          note={currentNote}
          notebooks={notebooks}
          onUpdate={updateNote}
          onDelete={deleteNote}
        />
      )}
    </div>
  )
}
