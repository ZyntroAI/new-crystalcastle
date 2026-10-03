import { StatusBadge, RiskBadge, TagList } from '@/components/obsidian'
import { notFound } from 'next/navigation'

export default async function NotePage({ params }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obsidian/notes/${params.id}`)
  if (!res.ok) notFound()
  const note = await res.json()

  return (
    <article className="max-w-3xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-3">{note.title}</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          <StatusBadge status={note.status} />
          {note.riskLevel && <RiskBadge level={note.riskLevel} />}
          <span className="text-sm text-slate-500">v{note.version}</span>
        </div>
        {note.tags?.length > 0 && <TagList tags={note.tags} />}
      </header>
      <div className="prose prose-slate max-w-none">
        {note.content}
      </div>
    </article>
  )
}
