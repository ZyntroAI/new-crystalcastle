'use client'
import { useState, useEffect, useRef } from 'react'
import { ragChatStream, getConversations, getMessages, uploadPdf, getUploads } from '@/app/actions'

type Upload = { id: string; filename: string; status: string; total_pages: number | null }
type Message = { id: string; role: string; content: string; sources?: any[] }
type Conversation = { id: string; title: string; updated_at: string }

export default function StreamingRAGPage() {
    const [uploads, setUploads] = useState<Upload[]>([])
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [activeId, setActiveId] = useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [query, setQuery] = useState('')
    const [isStreaming, setIsStreaming] = useState(false)
    const [streamingText, setStreamingText] = useState('')
    const [uploading, setUploading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, streamingText])

    // Load sidebar data
    useEffect(() => {
        getUploads().then(r => r.data && setUploads(r.data))
        getConversations().then(r => r.data && setConversations(r.data))
    }, [])

    useEffect(() => {
        if (!activeId) { setMessages([]); return }
        getMessages(activeId).then(r => r.data && setMessages(r.data))
    }, [activeId])

    // ── PDF Upload Handler ──
    async function handlePdfUpload(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setUploading(true)
        const formData = new FormData(e.currentTarget)
        const res = await uploadPdf(formData)
        if (res.error) alert(res.error)
        else alert(`✅ ${res.data.chunks} chunks from ${res.data.pages} pages ready!`)
        e.currentTarget.reset()
        getUploads().then(r => r.data && setUploads(r.data))
        setUploading(false)
    }

    // ── Streaming Chat Handler ✨ ──
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!query.trim() || isStreaming) return

        setIsStreaming(true)
        setStreamingText('')

        // Add user message instantly
        const tempUserMsg: Message = {
            id: 'temp-user',
            role: 'user',
            content: query
        }
        setMessages(prev => [...prev, tempUserMsg])
        const userQuery = query
        setQuery('')

        // Start stream
        const { stream, conversationId, error } = await ragChatStream(userQuery, activeId ?? undefined)

        if (error || !stream) {
            alert(error || 'Failed to start stream')
            setIsStreaming(false)
            return
        }

        // Switch to new conversation if created
        if (conversationId) setActiveId(conversationId)

        // ✅ Read SSE stream token-by-token
        const reader = stream.getReader()
        const decoder = new TextDecoder('utf-8')
        let answerBuffer = ''

        try {
            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value)
                const lines = chunk.split('\n\n').filter(line => line.startsWith('data: '))

                for (const line of lines) {
                    const data = line.replace('data: ', '')
                    if (data === '[DONE]') {
                        // Stream complete — refresh history from DB
                        setTimeout(async () => {
                            if (conversationId) {
                                const { data: freshMsgs } = await getMessages(conversationId)
                                if (freshMsgs) setMessages(freshMsgs)
                                getConversations().then(r => r.data && setConversations(r.data))
                            }
                        }, 100)
                        break
                    }
                    // Decode token and append
                    const token = decodeURIComponent(data)
                    answerBuffer += token
                    setStreamingText(answerBuffer) // ✅ React updates → word-by-word render
                }
            }
        } catch (err) {
            console.error('Stream error:', err)
        } finally {
            setStreamingText('')
            setIsStreaming(false)
        }
    }

    return (
        <div className="flex min-h-screen bg-white">
            {/* Sidebar — Uploads + Conversations */}
            <aside className="w-80 border-r p-4 space-y-6 overflow-y-auto max-h-screen">
                <div className="space-y-3">
                    <h2 className="font-bold">📄 Upload PDF</h2>
                    <form onSubmit={handlePdfUpload} className="space-y-2">
                        <input
                            type="file"
                            name="file"
                            accept=".pdf,application/pdf"
                            required
                            className="w-full text-sm"
                            disabled={uploading}
                        />
                        <button
                            type="submit"
                            disabled={uploading}
                            className="w-full py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
                        >
                            {uploading ? 'Parsing…' : 'Upload & Index'}
                        </button>
                    </form>

                    {uploads.length > 0 && (
                        <div className="space-y-1 mt-2">
                            <h3 className="text-sm font-medium text-gray-500">Indexed Files</h3>
                            {uploads.map(u => (
                                <div key={u.id} className="text-xs p-2 bg-gray-50 rounded flex justify-between">
                                    <span className="truncate">{u.filename}</span>
                                    <span className={
                                        u.status === 'ready' ? 'text-green-600' :
                                            u.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                                    }>{u.status === 'ready' ? `✓ ${u.total_pages}p` : u.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-2 pt-4 border-t">
                    <h2 className="font-bold">💬 Conversations</h2>
                    <button
                        onClick={() => { setActiveId(null); setMessages([]) }}
                        className="w-full text-left p-2 bg-blue-50 rounded text-sm"
                    >
                        + New Chat
                    </button>
                    {conversations.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setActiveId(c.id)}
                            className={`w-full text-left p-2 rounded text-sm truncate ${activeId === c.id ? 'bg-blue-100' : 'hover:bg-gray-50'
                                }`}
                        >
                            {c.title}
                        </button>
                    ))}
                </div>
            </aside>

            {/* Main Chat Area ✨ */}
            <main className="flex-1 p-6 flex flex-col">
                <h1 className="text-xl font-bold mb-4">🤖 Streaming RAG Assistant</h1>

                {/* Messages + Streaming Output */}
                <div className="flex-1 space-y-4 mb-6 max-w-2xl overflow-y-auto">
                    {/* Saved messages from DB */}
                    {messages.map(m => (
                        <div key={m.id} className={`p-3 rounded-lg ${m.role === 'user' ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'
                            }`}>
                            <p className="whitespace-pre-wrap">{m.content}</p>
                            {m.sources?.length > 0 && (
                                <details className="mt-2 text-xs text-gray-500">
                                    <summary className="cursor-pointer">📚 Sources</summary>
                                    {m.sources.map((s: any, i: number) => (
                                        <p key={i} className="mt-1">
                                            {s.content}
                                            {s.page && <span className="text-blue-500 ml-2">p.{s.page}</span>}
                                            <span className="text-green-600 ml-2">({(s.similarity * 100).toFixed(0)}%)</span>
                                        </p>
                                    ))}
                                </details>
                            )}
                        </div>
                    ))}

                    {/* ✅ Streaming token-by-token output */}
                    {streamingText && (
                        <div className="p-3 rounded-lg bg-green-50 mr-8">
                            <span className="whitespace-pre-wrap">{streamingText}</span>
                            <span className="inline-block w-2 h-4 bg-green-500 ml-0.5 animate-pulse"></span>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="flex gap-2 max-w-2xl">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask about your PDFs…"
                        className="flex-1 p-3 border rounded-lg text-lg"
                        disabled={isStreaming}
                        required
                    />
                    <button
                        type="submit"
                        disabled={isStreaming}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
                    >
                        {isStreaming ? (
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                                Generating…
                            </span>
                        ) : 'Ask'}
                    </button>
                </form>
            </main>
        </div>
    )
}