'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { customAlphabet } from 'nanoid'
import { Turnstile } from '@marsidev/react-turnstile'

const generateCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 6)

export default function Home() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [useCustomCode, setUseCustomCode] = useState(false)
  const [customCode, setCustomCode] = useState('')
  const [expiryHours, setExpiryHours] = useState(3)
  const [isEditable, setIsEditable] = useState(false)
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  
  // For opening an existing code
  const [openCode, setOpenCode] = useState('')

  const handleOpenCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (!openCode.trim()) return
    router.push(`/${openCode.trim()}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (useCustomCode && !/^[a-zA-Z0-9]+$/.test(customCode.trim())) {
      alert('Custom code can only use letters and numbers.')
      return
    }
    
    if (!turnstileToken) {
      alert('Please complete the captcha verification first.')
      return
    }

    setLoading(true)

    try {
      const finalCode = useCustomCode ? customCode.trim() : generateCode()

      const expiryDate = new Date()
      expiryDate.setHours(expiryDate.getHours() + expiryHours)

      const { error } = await supabase
        .from('texts')
        .insert({
          slug: finalCode,
          content,
          expires_at: expiryDate.toISOString(),
          is_editable: isEditable,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          alert('Code already exists. Try another one.')
        } else {
          alert('Failed to save text.')
        }
        return
      }

      router.push(`/${finalCode}`)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-3 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-12">
      <section className="reveal mb-6 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)]/90 p-4 sm:mb-8 sm:p-8 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-5">
            <span className="inline-flex items-center rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
              Anonymous and secure
            </span>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[var(--ink)] sm:text-5xl lg:text-6xl">
              Share text with confidence, not clutter.
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
              MyText helps teams move quickly with expiring links, optional real-time editing, and zero onboarding friction.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-xl border border-[var(--line)] bg-white p-3 sm:gap-3 sm:p-4">
            {[
              { value: '0', label: 'Sign-up Steps' },
              { value: '24h', label: 'Max Expiry' },
              { value: 'Live', label: 'Collab Mode' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg bg-[var(--surface-soft)] p-2 text-center sm:p-3">
                <div className="text-xl font-extrabold text-[var(--ink)]">{stat.value}</div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="surface-card reveal-delayed lg:col-span-8 p-4 sm:p-7">
          <div className="mb-5 flex items-start justify-between gap-4 border-b border-[var(--line)] pb-4 sm:mb-6 sm:pb-5">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-[var(--ink)] sm:text-2xl">Create a new note</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Compose once, share instantly, and control access duration.</p>
            </div>
            <span className="hidden rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)] sm:inline-flex">
              Encrypted transit
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <textarea
              className="w-full min-h-[240px] resize-y rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-4 font-mono text-sm leading-relaxed text-[var(--ink)] outline-none transition focus:border-[var(--accent)] focus:bg-white focus:ring-4 focus:ring-teal-100 sm:min-h-[320px] sm:p-5"
              placeholder="Paste your snippet, release notes, or sprint summary..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />

            <div className="grid gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-4 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-white px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={useCustomCode}
                  onChange={(e) => setUseCustomCode(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--line)] text-[var(--accent)] focus:ring-teal-300"
                />
                <span>
                  <span className="block text-sm font-bold text-[var(--ink)]">Custom code</span>
                  <span className="block text-xs text-[var(--muted)]">Turn on to choose your own code.</span>
                </span>
              </label>

              {useCustomCode ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Type your code</label>
                  <input
                    type="text"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    className="w-full rounded-lg border border-[var(--line)] bg-white p-2.5 font-mono text-sm text-[var(--ink)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-teal-100"
                    placeholder="e.g. Team042"
                    pattern="[A-Za-z0-9]+"
                    title="Use only letters and numbers"
                    required
                  />
                </div>
              ) : (
                <div className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5">
                  <p className="text-sm font-bold text-[var(--ink)]">Random code</p>
                  <p className="text-xs text-[var(--muted)]">A random 6-character code will be generated for you.</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Auto Expiry</label>
                <select
                  value={expiryHours}
                  onChange={(e) => setExpiryHours(Number(e.target.value))}
                  className="w-full rounded-lg border border-[var(--line)] bg-white p-2.5 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-teal-100"
                >
                  {[1, 3, 6, 12, 18, 24].map((h) => (
                    <option key={h} value={h}>{h} {h === 1 ? 'Hour' : 'Hours'}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-white px-3 py-2.5">
                <input
                  type="checkbox"
                  id="isEditable"
                  checked={isEditable}
                  onChange={(e) => setIsEditable(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--line)] text-[var(--accent)] focus:ring-teal-300"
                />
                <span>
                  <span className="block text-sm font-bold text-[var(--ink)]">Live collaboration</span>
                  <span className="block text-xs text-[var(--muted)]">Allow link viewers to edit in real time.</span>
                </span>
              </label>
            </div>

            <div className="turnstile-wrap flex justify-center overflow-hidden rounded-lg border border-[var(--line)] bg-white py-3">
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                onSuccess={(token) => setTurnstileToken(token)}
                onError={() => alert('Verification failed. Please try again.')}
                options={{
                  theme: 'light',
                }}
              />
            </div>

            <div className="sticky bottom-3 z-20 sm:static">
              <button
                type="submit"
                disabled={loading || !content}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--ink)] px-5 py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-[#1c2b38] disabled:cursor-not-allowed disabled:opacity-50 sm:shadow-none"
              >
                {loading ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                    Publishing note...
                  </>
                ) : (
                  <>
                    Create Secure Link
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        <aside className="reveal-delayed space-y-6 lg:col-span-4">
          <section className="surface-card p-5 sm:p-6">
            <h3 className="mb-2 text-lg font-extrabold tracking-tight text-[var(--ink)]">Open an existing note</h3>
            <p className="mb-4 text-sm leading-relaxed text-[var(--muted)]">Paste your alias to retrieve a shared note immediately.</p>
            <form onSubmit={handleOpenCode} className="space-y-3">
              <input
                type="text"
                placeholder="Example: A7b3K9"
                value={openCode}
                onChange={(e) => setOpenCode(e.target.value)}
                className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] p-3 font-mono text-sm text-[var(--ink)] outline-none transition focus:border-[var(--accent)] focus:bg-white focus:ring-4 focus:ring-teal-100"
                required
              />
              <p className="text-xs text-[var(--muted)]">Example codes: A7b3K9 or m2N8qR</p>
              <button
                type="submit"
                className="w-full rounded-lg bg-[var(--accent)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--accent-strong)]"
              >
                Open Note
              </button>
            </form>
          </section>

          <section className="surface-card p-5 sm:p-6">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">What makes it professional</h3>
            <ul className="space-y-3">
              {[
                { title: 'Fast handoff', desc: 'Share work notes with links in seconds.' },
                { title: 'Controlled lifetime', desc: 'Each note has automatic expiry.' },
                { title: 'Collaborative mode', desc: 'Switch on live editing when needed.' },
              ].map((feature) => (
                <li key={feature.title} className="rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] p-3">
                  <p className="text-sm font-bold text-[var(--ink)]">{feature.title}</p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">{feature.desc}</p>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  )
}
