'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useDebouncedCallback } from 'use-debounce'
import toast, { Toaster } from 'react-hot-toast'
import { Copy } from 'lucide-react'

export default function TextPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [content, setContent] = useState('')
  const [isEditable, setIsEditable] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Fetch initial data
  useEffect(() => {
    const fetchText = async () => {
      const { data, error } = await supabase
        .from('texts')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error || !data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      // Check if expired
      if (new Date(data.expires_at) < new Date()) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setContent(data.content)
      setIsEditable(data.is_editable)
      setLoading(false)
    }

    fetchText()
  }, [slug])

  // Debounced update to Supabase to prevent spamming database
  const debouncedUpdate = useDebouncedCallback(async (newContent: string) => {
    if (!isEditable) return
    await supabase.from('texts').update({ content: newContent }).eq('slug', slug)
  }, 500)

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    debouncedUpdate(newContent)
  }

  // Supabase Real-time Subscription
  useEffect(() => {
    if (!isEditable) return

    const channel = supabase
      .channel(`text-${slug}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'texts',
          filter: `slug=eq.${slug}`,
        },
        (payload) => {
          // Sync changes from other users
          setContent((prev) => {
            if (prev !== payload.new.content) {
              return payload.new.content
            }
            return prev
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [slug, isEditable])

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Copied to clipboard!', { position: 'bottom-center' })
  }

  const copyText = () => {
    navigator.clipboard.writeText(content)
    toast.success('Text copied!', { position: 'bottom-center' })
  }

  if (loading) return (
    <div className="flex min-h-[75vh] items-center justify-center px-4">
      <div className="surface-card flex w-full max-w-sm flex-col items-center gap-3 p-8">
        <svg className="h-8 w-8 animate-spin text-[var(--accent)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
        <span className="text-sm font-semibold text-[var(--muted)]">Loading note...</span>
      </div>
    </div>
  )
  
  if (notFound) return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 text-center">
      <div className="surface-card w-full max-w-sm p-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-[var(--ink)]">Not found</h1>
        <p className="mb-6 text-sm text-[var(--muted)]">This note does not exist or has expired.</p>
        <Link href={`/?code=${slug}`} className="inline-block rounded-lg bg-[var(--ink)] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#1c2b38]">
          Create Note with '{slug}'
        </Link>
      </div>
    </div>
  )

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Toaster />
      <div className="surface-card flex flex-col items-start justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[var(--surface-soft)] p-2 text-[var(--muted)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
          </div>
          <div>
            <div className="mb-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Note alias</div>
            <div className="font-mono text-lg font-bold text-[var(--ink)]">{slug}</div>
          </div>
        </div>
        <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:gap-3">
          {isEditable && (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 font-semibold text-emerald-700 sm:flex-none">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Live Sync
            </div>
          )}
          <button 
            onClick={copyText}
            className="flex items-center justify-center space-x-2 rounded-lg bg-[var(--ink)] px-5 py-2.5 font-semibold whitespace-nowrap text-white transition hover:bg-[#1c2b38] sm:flex-none"
          >
            <Copy size={16} /> <span>Copy Text</span>
          </button>
          <button 
            onClick={copyLink} 
            className="flex items-center justify-center space-x-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 font-semibold whitespace-nowrap text-white transition hover:bg-[var(--accent-strong)] sm:flex-none"
          >
            <Copy size={16} /> <span>Copy Link</span>
          </button>
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        {isEditable ? (
          <textarea
            className="min-h-[55vh] w-full resize-y bg-[var(--surface-soft)] p-4 font-mono text-sm leading-relaxed text-[var(--ink)] outline-none transition focus:bg-white sm:min-h-[65vh] sm:p-6"
            value={content}
            onChange={handleContentChange}
            placeholder="Start typing to sync live..."
            spellCheck={false}
          />
        ) : (
          <div className="min-h-[55vh] w-full overflow-auto whitespace-pre-wrap bg-[var(--surface-soft)] p-4 font-mono text-sm leading-relaxed text-[var(--ink)] sm:min-h-[65vh] sm:p-6">
            {content}
          </div>
        )}
      </div>
    </div>
  )
}
