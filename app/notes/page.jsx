'use client'
import { useEffect, useState } from 'react'
import { ObsidianDashboard } from '@/components/obsidian'

export default function NotesPage() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/obsidian/notes')
      .then(res => res.json())
      .then(data => setNotes(data.notes || data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8">Loading knowledge base…</div>

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">📚 Obsidian Knowledge Base</h1>
      <ObsidianDashboard notes={notes} />
    </main>
  )
}
