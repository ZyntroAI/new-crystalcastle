'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

// ─── Types ─────────────────────────────────────────────────
/**
 * @typedef {Object} ObsidianNote
 * @property {string} id - Unique slug/ID from frontmatter or filename
 * @property {string} title - Display title
 * @property {string} type - skill / artifact / adr / research / runbook
 * @property {string} status - draft / review / active / deprecated / archived
 * @property {string} category - Grouping category
 * @property {string[]} tags - Searchable tags
 * @property {string} content - Markdown body
 * @property {string} [version] - Semantic version
 * @property {string} [riskLevel] - low / medium / high
 * @property {boolean} [prismaSync] - Should sync to DB
 * @property {string} [author] - Author name
 * @property {string} [updatedAt] - ISO date
 */

// ─── Status Badge Component ─────────────────────────────────
export function StatusBadge({ status }) {
  const styles = {
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    review: 'bg-amber-50 text-amber-700 border-amber-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    deprecated: 'bg-orange-50 text-orange-700 border-orange-200',
    archived: 'bg-red-50 text-red-700 border-red-200',
  }
  const label = {
    draft: 'Draft',
    review: 'In Review',
    active: 'Active',
    deprecated: 'Deprecated',
    archived: 'Archived',
  }

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${styles[status] || styles.draft}`}>
      {label[status] || status}
    </span>
  )
}

// ─── Risk Badge Component ──────────────────────────────────
export function RiskBadge({ level }) {
  const styles = {
    low: 'bg-emerald-50 text-emerald-700',
    medium: 'bg-amber-50 text-amber-700',
    high: 'bg-red-50 text-red-700',
  }
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[level] || styles.low}`}>
      {level?.toUpperCase() || 'LOW'}
    </span>
  )
}

// ─── Tag List Component ────────────────────────────────────
export function TagList({ tags, limit = 5 }) {
  const displayTags = tags?.slice(0, limit) || []
  const remaining = tags?.length - limit || 0

  return (
    <div className="flex flex-wrap gap-1.5">
      {displayTags.map(tag => (
        <span key={tag} className="px-2 py-0.5 text-xs bg-slate-50 text-slate-600 rounded-md border border-slate-100">
          #{tag}
        </span>
      ))}
      {remaining > 0 && (
        <span className="px-2 py-0.5 text-xs text-slate-400">+{remaining} more</span>
      )}
    </div>
  )
}

// ─── Note Card Component ───────────────────────────────────
export function ObsidianNoteCard({ note, compact = false }) {
  if (!note) return null

  return (
    <div className={`border border-slate-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow ${compact ? 'p-3' : 'p-5'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <Link href={`/notes/${note.id}`} className="font-semibold text-slate-900 hover:text-blue-600 hover:underline">
            {note.title}
          </Link>
          {!compact && note.category && (
            <p className="text-sm text-slate-500 mt-0.5">{note.category}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <StatusBadge status={note.status} />
          {note.riskLevel && <RiskBadge level={note.riskLevel} />}
        </div>
      </div>

      {!compact && note.content && (
        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
          {note.content.replace(/[#*`]/g, '').slice(0, 120)}…
        </p>
      )}

      {note.tags?.length > 0 && <TagList tags={note.tags} limit={compact ? 3 : 5} />}

      {!compact && (
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50 text-xs text-slate-400">
          <span>v{note.version || '0.1.0'}</span>
          {note.updatedAt && <span>Updated {new Date(note.updatedAt).toLocaleDateString()}</span>}
        </div>
      )}
    </div>
  )
}

// ─── Search & Filter Bar ──────────────────────────────────
export function ObsidianSearchBar({ value, onChange, typeFilter, onTypeChange, statusFilter, onStatusChange }) {
  const types = ['all', 'skill', 'artifact', 'adr', 'research', 'runbook']
  const statuses = ['all', 'draft', 'review', 'active', 'deprecated', 'archived']

  return (
    <div className="space-y-3 mb-6">
      <input
        type="text"
        placeholder="🔍 Search notes by title, ID, tags…"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <div className="flex flex-wrap gap-3">
        <select
          value={typeFilter}
          onChange={e => onTypeChange(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white"
        >
          {types.map(t => (
            <option key={t} value={t}>{t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={e => onStatusChange(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white"
        >
          {statuses.map(s => (
            <option key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

// ─── Sync Status Indicator ─────────────────────────────────
export function SyncStatusIndicator() {
  const [status, setStatus] = useState('idle') // idle → syncing → success → error
  const [lastSync, setLastSync] = useState(null)

  const triggerSync = useCallback(async () => {
    setStatus('syncing')
    try {
      const res = await fetch('/api/obsidian/sync', { method: 'POST' })
      if (!res.ok) throw new Error('Sync failed')
      setStatus('success')
      setLastSync(new Date().toLocaleTimeString())
    } catch {
      setStatus('error')
    } finally {
      setTimeout(() => setStatus('idle'), 5000)
    }
  }, [])

  const colors = {
    idle: 'bg-slate-100 text-slate-600',
    syncing: 'bg-blue-50 text-blue-600 animate-pulse',
    success: 'bg-emerald-50 text-emerald-600',
    error: 'bg-red-50 text-red-600',
  }

  return (
    <div className="flex items-center gap-3">
      <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${colors[status]}`}>
        {status === 'idle' && '✓ Ready'}
        {status === 'syncing' && '⏳ Syncing…'}
        {status === 'success' && '✅ Synced'}
        {status === 'error' && '❌ Sync Failed'}
      </span>
      <button
        onClick={triggerSync}
        disabled={status === 'syncing'}
        className="px-3 py-1.5 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-50 transition-colors"
      >
        Sync Now
      </button>
      {lastSync && <span className="text-xs text-slate-400">Last: {lastSync}</span>}
    </div>
  )
}

// ─── Notes List with Filtering ─────────────────────────────
export function ObsidianNotesList({ notes = [] }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = notes.filter(note => {
    const matchesSearch = !search ||
      note.title?.toLowerCase().includes(search.toLowerCase()) ||
      note.id?.toLowerCase().includes(search.toLowerCase()) ||
      note.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))

    const matchesType = typeFilter === 'all' || note.type === typeFilter
    const matchesStatus = statusFilter === 'all' || note.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div>
      <ObsidianSearchBar
        value={search}
        onChange={setSearch}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      <p className="text-sm text-slate-500 mb-4">
        Showing {filtered.length} of {notes.length} note{notes.length !== 1 ? 's' : ''}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="text-lg">No notes found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(note => (
            <ObsidianNoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Knowledge Dashboard ────────────────────────────────────
export function ObsidianDashboard({ notes = [] }) {
  const stats = {
    total: notes.length,
    active: notes.filter(n => n.status === 'active').length,
    skills: notes.filter(n => n.type === 'skill').length,
    artifacts: notes.filter(n => n.type === 'artifact').length,
    recent: notes.filter(n => {
      if (!n.updatedAt) return false
      const updated = new Date(n.updatedAt)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return updated >= weekAgo
    }).length,
  }

  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Notes', value: stats.total, color: 'slate' },
          { label: 'Active', value: stats.active, color: 'emerald' },
          { label: 'Skills', value: stats.skills, color: 'blue' },
          { label: 'Artifacts', value: stats.artifacts, color: 'purple' },
          { label: 'This Week', value: stats.recent, color: 'amber' },
        ].map(stat => (
          <div key={stat.label} className="p-4 bg-white border border-slate-100 rounded-lg">
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Sync Status */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Knowledge Base</h2>
        <SyncStatusIndicator />
      </div>

      {/* Notes List */}
      <ObsidianNotesList notes={notes} />
    </div>
  )
}

export default {
  StatusBadge,
  RiskBadge,
  TagList,
  ObsidianNoteCard,
  ObsidianSearchBar,
  SyncStatusIndicator,
  ObsidianNotesList,
  ObsidianDashboard,
}
