import { useState } from 'react'
import { Icon } from '../components/Icon'
import { MarketingNav } from '../components/MarketingNav'
import { MarketingFooter } from '../components/MarketingFooter'
import { supabase } from '../lib/supabase'

export function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (!message.trim()) return
    setSending(true)
    setError(null)
    const { error: insertError } = await supabase.from('contact_messages').insert({
      name: name.trim() || null,
      email: email.trim() || null,
      message: message.trim(),
    })
    setSending(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-rally-cream flex flex-col">
      <MarketingNav />

      <section className="relative max-w-xl mx-auto px-8 pt-20 pb-20 w-full overflow-hidden">
        <div
          className="pointer-events-none absolute -top-16 right-0 w-[420px] h-[300px] rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, #1A7A4A 0%, transparent 70%)' }}
        />
        <div className="relative">
          <p className="text-xs text-rally-amber uppercase tracking-wide mb-4 text-center flex items-center justify-center gap-1.5">
            <Icon name="chats-circle" weight="fill" size={14} /> Contact
          </p>
          <h1 className="text-3xl text-rally-black mb-3 text-center" style={{ fontFamily: 'CoFo Robert', letterSpacing: '-0.5px' }}>
            Get in touch
          </h1>
          <p className="text-sm text-gray-400 text-center mb-10">
            Questions, feedback, or a neighbourhood you'd like to see Rally in — we'd like to hear it.
          </p>

          <div className="bg-white rounded-3xl border border-rally-border p-8 shadow-[0_20px_50px_rgba(17,17,16,0.06)]">
            {sent ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-2xl bg-rally-green-light flex items-center justify-center mx-auto mb-4">
                  <Icon name="check-circle" weight="fill" size={28} className="text-rally-green" />
                </div>
                <p className="text-rally-black mb-1" style={{ fontFamily: 'CoFo Robert' }}>Message sent</p>
                <p className="text-sm text-gray-400">Thanks — we'll get back to you soon.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Name (optional)</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-rally-cream border border-rally-border rounded-2xl px-4 py-3 text-sm outline-none focus:border-rally-black"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Email (optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-rally-cream border border-rally-border rounded-2xl px-4 py-3 text-sm outline-none focus:border-rally-black"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full bg-rally-cream border border-rally-border rounded-2xl px-4 py-3 text-sm outline-none focus:border-rally-black resize-none"
                  />
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <button
                  disabled={!message.trim() || sending}
                  onClick={submit}
                  className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-rally-black text-white rounded-2xl px-6 py-3.5 text-sm disabled:opacity-30 hover:opacity-90 transition-opacity"
                >
                  {sending ? 'Sending…' : 'Send message'} <Icon name="paper-plane-tilt" weight="fill" size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
