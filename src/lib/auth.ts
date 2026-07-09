import { supabase } from './supabase'

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
  if (error) {
    console.error('Google sign-in failed:', error.message)
    alert(`Sign-in failed: ${error.message}`)
    return
  }
  if (data?.url) {
    window.location.assign(data.url)
  }
}

export async function signOut() {
  await supabase.auth.signOut()
}

// Call this once after every Google sign-in (e.g. in the auth callback page).
// Upserts the profile row so name + avatar stay in sync with Google.
export async function upsertProfileFromSession() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return

  const { id, email, user_metadata } = session.user
  await supabase.rpc('upsert_profile_from_google', {
    p_id:         id,
    p_email:      email ?? '',
    p_full_name:  user_metadata?.full_name ?? '',
    p_avatar_url: user_metadata?.avatar_url ?? '',
  })
}
