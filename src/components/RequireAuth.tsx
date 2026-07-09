import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { AppShell } from './AppShell'

export function RequireAuth({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'checking' | 'ready'>('checking')

  useEffect(() => {
    let cancelled = false

    async function check() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        if (!cancelled) navigate('/', { replace: true })
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone, location_text')
        .eq('id', session.user.id)
        .single()

      if (cancelled) return
      if (!profile?.phone || !profile?.location_text) {
        navigate('/onboarding', { replace: true })
        return
      }
      setStatus('ready')
    }

    check()
    return () => { cancelled = true }
  }, [navigate])

  if (status === 'checking') {
    return <div className="min-h-screen bg-rally-cream flex items-center justify-center"><p className="text-sm text-gray-400">Loading…</p></div>
  }

  return <AppShell>{children}</AppShell>
}
