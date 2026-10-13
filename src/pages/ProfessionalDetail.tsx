import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { MiniMap } from '../components/MiniMap'
import { supabase } from '../lib/supabase'
import type { ProfessionalListing } from '../lib/types'

export function ProfessionalDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [listing, setListing] = useState<ProfessionalListing | null>(null)
  const [phone, setPhone] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    async function load() {
      if (!id) return
      setLoading(true)
      const { data } = await supabase
        .from('professional_listings')
        .select('*, profile:profiles!professional_listings_profile_id_fkey(*)')
        .eq('id', id)
        .single()
      setListing(data as ProfessionalListing)
      setLoading(false)
    }
    load()
  }, [id])

  async function reveal() {
    if (!id) return
    setBusy(true)
    const { data } = await supabase.rpc('get_professional_contact', { p_listing_id: id })
    setPhone(data ?? null)
    setBusy(false)
  }

  if (loading) {
    return <div className="min-h-screen bg-rally-cream flex items-center justify-center"><p className="text-sm text-gray-400">Loading…</p></div>
  }
  if (!listing) {
    return <div className="min-h-screen bg-rally-cream flex items-center justify-center"><p className="text-sm text-gray-400">Listing not found.</p></div>
  }

  const name = listing.profile?.full_name || listing.profile?.username || 'Local pro'
  const hasMap = listing.profile?.lat != null && listing.profile?.lng != null

  return (
    <div className="min-h-screen bg-rally-cream pb-24 md:pb-16">
      <div className="bg-white px-5 md:px-10 pt-12 md:pt-10 pb-4 border-b border-rally-border flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <Icon name="arrow-left" size={20} className="text-rally-black" />
        </button>
        <span className="text-xs text-gray-400">{listing.category}</span>
      </div>

      <div className="px-5 md:px-10 pt-6 max-w-6xl mx-auto flex flex-col gap-6">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8">
          {/* Media column */}
          <div>
            {listing.profile?.avatar_url ? (
              <img src={listing.profile.avatar_url} alt="" className="w-full aspect-[4/3] object-cover rounded-3xl border border-rally-border" />
            ) : (
              <div className="w-full aspect-[4/3] rounded-3xl border border-rally-border bg-white flex items-center justify-center">
                <Icon name="wrench" size={48} className="text-rally-border" />
              </div>
            )}
          </div>

          {/* Buy-box column */}
          <div className="lg:sticky lg:top-6 h-fit flex flex-col gap-4">
            <div className="bg-white rounded-3xl border border-rally-border p-6">
              <span className="inline-block text-[11px] px-2.5 py-1 rounded-full mb-3 bg-rally-amber-light text-rally-amber">
                {listing.category}
              </span>
              <h1 className="text-2xl text-rally-black leading-tight mb-3" style={{ fontFamily: 'CoFo Robert', fontWeight: 500, letterSpacing: '-0.3px' }}>
                {name}
              </h1>

              {listing.price_note && (
                <p className="text-3xl text-rally-black mb-1" style={{ fontFamily: 'CoFo Robert', fontWeight: 500 }}>{listing.price_note}</p>
              )}
              <p className="text-xs text-gray-400 mb-5">Contact-only — any payment is arranged directly with {name.split(' ')[0]}.</p>

              <div className="border-t border-rally-border pt-4 mb-4">
                <div className="flex items-center gap-3">
                  {listing.profile?.avatar_url ? (
                    <img src={listing.profile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-rally-cream" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm text-rally-black truncate">{name}</p>
                    <p className="text-xs text-gray-400">{listing.profile?.location_text ?? 'Local professional'}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-rally-border pt-4">
                <button
                  disabled={busy}
                  onClick={reveal}
                  className="w-full flex items-center justify-center gap-2 text-sm bg-rally-black text-white rounded-2xl px-5 py-3.5 disabled:opacity-30 hover:opacity-90 transition-opacity"
                >
                  <Icon name="phone" size={14} /> {phone ?? (busy ? 'Loading…' : 'Get contact')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-rally-border p-6">
          <p className="text-sm text-rally-black mb-2" style={{ fontFamily: 'CoFo Robert', fontWeight: 500 }}>About</p>
          <p className="text-sm text-gray-600 leading-relaxed">{listing.description || 'No description provided.'}</p>
        </div>

        {hasMap && (
          <div className="bg-white rounded-3xl border border-rally-border overflow-hidden">
            <MiniMap
              center={{ lat: listing.profile!.lat!, lng: listing.profile!.lng! }}
              zoom={12}
              interactive
              pins={[{ lat: listing.profile!.lat!, lng: listing.profile!.lng!, amber: true, label: name }]}
              className="w-full h-56"
            />
          </div>
        )}
      </div>
    </div>
  )
}
