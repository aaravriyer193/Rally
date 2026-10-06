import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { supabase } from '../lib/supabase'
import { upsertProfileFromSession } from '../lib/auth'
import { RallyIcon } from '../components/Logo'

export function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      const queryParams = new URLSearchParams(window.location.search)
      const oauthError = hashParams.get('error_description') || queryParams.get('error_description')
        || hashParams.get('error') || queryParams.get('error')
      if (oauthError) {
        if (!cancelled) setError(decodeURIComponent(oauthError).replace(/\+/g, ' '))
        return
      }

      await upsertProfileFromSession()

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        if (!cancelled) setError('Sign-in did not complete. Please try again.')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('phone, location_text')
        .eq('id', session.user.id)
        .single()

      if (cancelled) return
      if (profile?.phone && profile?.location_text) {
        navigate('/home', { replace: true })
      } else {
        navigate('/onboarding', { replace: true })
      }
    }

    run()
    return () => { cancelled = true }
  }, [navigate])

  if (error) {
    return (
      <div className="min-h-screen bg-rally-cream flex items-center justify-center px-6">
        <div className="max-w-sm w-full bg-white rounded-3xl border border-rally-border p-8 text-center">
          <RallyIcon size={22} className="text-rally-black mx-auto mb-5" />
          <div className="w-12 h-12 rounded-2xl bg-rally-amber-light flex items-center justify-center mx-auto mb-4">
            <Icon name="warning-circle" weight="fill" size={22} className="text-rally-amber" />
          </div>
          <p className="text-rally-black mb-2" style={{ fontFamily: 'CoFo Robert' }}>Sign-in didn't go through</p>
          <p className="text-sm text-gray-400 mb-6">{error}</p>
          <Link to="/sign-in" className="inline-block bg-rally-black text-white rounded-2xl px-6 py-3 text-sm">
            Try again
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rally-cream flex items-center justify-center">
      <p className="text-gray-400 text-sm">Signing you in…</p>
    </div>
  )
}
