import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { EmptyState } from '../components/illustrations/EmptyState'
import { MiniMap } from '../components/MiniMap'
import { CertificateView } from '../components/CertificateView'
import { supabase } from '../lib/supabase'
import { signOut } from '../lib/auth'
import { geocodeText, reverseGeocode } from '../lib/geo'
import { RatingStars } from '../components/RatingStars'
import {
  CATEGORIES, HOUR_MILESTONES, TASK_MILESTONES, hourMilestone, taskMilestone,
  type Certificate, type Milestone, type Profile as ProfileType, type ProfessionalListing, type Rating,
} from '../lib/types'

const DEFAULT_CENTER = { lat: 40.7128, lng: -74.006 }

type CertModalData = {
  eyebrow: string
  title: string
  detail: string
  dateStr: string
  certId: string
}

export function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [bio, setBio] = useState('')
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])
  const [certModal, setCertModal] = useState<CertModalData | null>(null)
  const [listing, setListing] = useState<ProfessionalListing | null>(null)
  const [listingCategory, setListingCategory] = useState<string>(CATEGORIES[0])
  const [listingDescription, setListingDescription] = useState('')
  const [listingPriceNote, setListingPriceNote] = useState('')
  const [listingSaving, setListingSaving] = useState(false)
  const [listingSaved, setListingSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [locationText, setLocationText] = useState('')
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [geocoding, setGeocoding] = useState(false)
  const [locationSaving, setLocationSaving] = useState(false)
  const [locationSaved, setLocationSaved] = useState(false)
  const skipNextGeocode = useRef(false)
  const locationLoaded = useRef(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      const { data: p } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      setProfile(p)
      setBio(p?.bio ?? '')
      setLocationText(p?.location_text ?? '')
      if (p?.lat != null && p?.lng != null) setLocationCoords({ lat: p.lat, lng: p.lng })
      locationLoaded.current = true

      const { data: certs } = await supabase.from('certificates').select('*').eq('volunteer_id', session.user.id).order('issued_at', { ascending: false })
      const certList = (certs as Certificate[]) ?? []
      setCertificates(certList)

      const { data: existingMilestones } = await supabase.from('milestones').select('*').eq('profile_id', session.user.id)
      const have = new Set((existingMilestones ?? []).map((m) => m.milestone_key))

      const totalHours = certList.reduce((s, c) => s + (c.hours ?? 0), 0)
      const taskCount = certList.length
      const toAward = [
        ...HOUR_MILESTONES.filter((h) => totalHours >= h).map(hourMilestone),
        ...TASK_MILESTONES.filter((t) => taskCount >= t).map(taskMilestone),
      ].filter((m) => !have.has(m.key))

      let awarded: Milestone[] = []
      if (toAward.length > 0) {
        const { data: inserted } = await supabase
          .from('milestones')
          .insert(toAward.map((m) => ({ profile_id: session.user.id, milestone_key: m.key, title: m.title, detail: m.detail })))
          .select()
        awarded = (inserted as Milestone[]) ?? []
      }
      setMilestones([...(existingMilestones as Milestone[] ?? []), ...awarded])

      const { data: r } = await supabase.from('ratings').select('*').eq('ratee_id', session.user.id).order('created_at', { ascending: false })
      setRatings((r as Rating[]) ?? [])

      const { data: l } = await supabase.from('professional_listings').select('*').eq('profile_id', session.user.id).maybeSingle()
      if (l) {
        setListing(l)
        setListingCategory(l.category)
        setListingDescription(l.description ?? '')
        setListingPriceNote(l.price_note ?? '')
      }

      setLoading(false)
    }
    load()
  }, [])

  async function saveBio() {
    if (!profile) return
    setSaving(true)
    await supabase.from('profiles').update({ bio }).eq('id', profile.id)
    setSaving(false)
  }

  // Forward-geocode whatever the user types so any typed location — not just
  // one reached via GPS or dragging the pin — ends up with real coordinates.
  useEffect(() => {
    if (!locationLoaded.current) return
    if (skipNextGeocode.current) {
      skipNextGeocode.current = false
      return
    }
    if (!locationText.trim()) return
    const t = setTimeout(async () => {
      setGeocoding(true)
      const hit = await geocodeText(locationText)
      if (hit) setLocationCoords({ lat: hit.lat, lng: hit.lng })
      setGeocoding(false)
    }, 900)
    return () => clearTimeout(t)
  }, [locationText])

  async function onLocationDrag(lat: number, lng: number) {
    setLocationCoords({ lat, lng })
    const place = await reverseGeocode(lat, lng)
    if (place) {
      skipNextGeocode.current = true
      setLocationText(place)
    }
  }

  async function saveLocation() {
    if (!profile) return
    setLocationSaving(true)
    setLocationSaved(false)
    await supabase.from('profiles').update({ location_text: locationText.trim() || null }).eq('id', profile.id)
    if (locationCoords) {
      await supabase.rpc('set_profile_location', { p_lat: locationCoords.lat, p_lng: locationCoords.lng })
    }
    setLocationSaving(false)
    setLocationSaved(true)
  }

  async function saveListing() {
    if (!profile) return
    setListingSaving(true)
    setListingSaved(false)
    if (listing) {
      await supabase
        .from('professional_listings')
        .update({ category: listingCategory, description: listingDescription.trim() || null, price_note: listingPriceNote.trim() || null })
        .eq('id', listing.id)
    } else {
      const { data } = await supabase
        .from('professional_listings')
        .insert({ profile_id: profile.id, category: listingCategory, description: listingDescription.trim() || null, price_note: listingPriceNote.trim() || null })
        .select()
        .single()
      if (data) setListing(data)
    }
    setListingSaving(false)
    setListingSaved(true)
  }

  const avgRating = ratings.length ? ratings.reduce((s, r) => s + r.stars, 0) / ratings.length : 0
  const distribution = [5, 4, 3, 2, 1].map((star) => ratings.filter((r) => r.stars === star).length)

  if (loading) {
    return <div className="min-h-screen bg-rally-cream flex items-center justify-center"><p className="text-sm text-gray-400">Loading…</p></div>
  }
  if (!profile) {
    return <div className="min-h-screen bg-rally-cream flex items-center justify-center"><p className="text-sm text-gray-400">Sign in to view your profile.</p></div>
  }

  return (
    <div className="min-h-screen bg-rally-cream pb-24 md:pb-16">
      {/* Header banner */}
      <div className="relative overflow-hidden bg-rally-black mx-0 md:mx-10 md:mt-10 md:rounded-[2rem] px-5 md:px-10 pt-12 md:pt-12 pb-8 bg-grain">
        <div
          className="pointer-events-none absolute -top-24 right-10 w-[380px] h-[380px] rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, #F5A623 0%, transparent 70%)' }}
        />
        <div className="relative flex items-center gap-4">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white/10" />
          )}
          <div>
            <p className="text-xl text-white" style={{ fontFamily: 'CoFo Robert', fontWeight: 500 }}>{profile.full_name || profile.username}</p>
            <p className="text-xs text-[#999] mt-0.5">{profile.location_text ?? 'No location set'}</p>
          </div>
        </div>

        <div className="relative flex items-center gap-3 mt-6 flex-wrap">
          <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-2.5">
            <Icon name="trophy" weight="fill" size={16} className="text-rally-amber" />
            <span className="text-sm text-white">{profile.points} pts</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-2.5">
            <Icon name="star" weight="fill" size={16} className="text-rally-amber" />
            <span className="text-sm text-white">{ratings.length ? avgRating.toFixed(1) : '—'}</span>
            <span className="text-xs text-[#999]">({ratings.length})</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-2.5">
            <Icon name="medal" weight="fill" size={16} className="text-rally-amber" />
            <span className="text-sm text-white">{certificates.length} certificate{certificates.length === 1 ? '' : 's'}</span>
          </div>
        </div>
      </div>

      <div className="px-5 md:px-10 pt-8 grid lg:grid-cols-[1fr_1.3fr] gap-6 max-w-6xl">
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-rally-border shadow-[0_1px_2px_rgba(17,17,16,0.04)] p-6">
            <label className="text-xs text-gray-400 mb-1.5 block">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              onBlur={saveBio}
              rows={4}
              placeholder="Tell your neighbours a bit about you"
              className="w-full bg-rally-cream border border-rally-border rounded-2xl px-4 py-3 text-sm outline-none focus:border-rally-black resize-none"
            />
            {saving && <p className="text-[11px] text-gray-400 mt-1">Saving…</p>}
          </div>

          <div className="bg-white rounded-3xl border border-rally-border shadow-[0_1px_2px_rgba(17,17,16,0.04)] p-6">
            <p className="text-sm text-rally-black mb-4 flex items-center gap-1.5" style={{ fontFamily: 'CoFo Robert', fontWeight: 500 }}>
              <Icon name="map-pin" weight="fill" size={16} className="text-rally-amber" /> Location
            </p>
            <div className="rounded-2xl overflow-hidden border border-rally-border mb-3 h-40">
              <MiniMap
                center={locationCoords ?? DEFAULT_CENTER}
                zoom={locationCoords ? 13 : 3}
                interactive
                draggableMarker
                onDrag={onLocationDrag}
                pins={locationCoords ? [{ lat: locationCoords.lat, lng: locationCoords.lng, amber: true }] : []}
                className="w-full h-full"
              />
            </div>
            <div className="relative mb-3">
              <input
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="e.g. Ras Al Khor, Dubai"
                className="w-full bg-rally-cream border border-rally-border rounded-2xl px-4 py-3 text-sm outline-none focus:border-rally-black"
              />
              {geocoding && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">Locating…</span>}
            </div>
            <button
              onClick={saveLocation}
              disabled={locationSaving}
              className="bg-rally-black text-white rounded-2xl px-5 py-3 text-sm disabled:opacity-30 hover:opacity-90 transition-opacity w-fit"
            >
              {locationSaving ? 'Saving…' : 'Save location'}
            </button>
            {locationSaved && <p className="text-[11px] text-rally-green mt-2">Saved — used for nearby sorting and the map.</p>}
          </div>

          <div className="bg-white rounded-3xl border border-rally-border shadow-[0_1px_2px_rgba(17,17,16,0.04)] p-6">
            <p className="text-sm text-rally-black mb-4 flex items-center gap-1.5" style={{ fontFamily: 'CoFo Robert', fontWeight: 500 }}>
              <Icon name="wrench" weight="fill" size={16} className="text-rally-amber" /> Professional listing
            </p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Category</label>
                <select
                  value={listingCategory}
                  onChange={(e) => setListingCategory(e.target.value)}
                  className="w-full bg-rally-cream border border-rally-border rounded-2xl px-4 py-3 text-sm outline-none focus:border-rally-black"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Description</label>
                <textarea
                  value={listingDescription}
                  onChange={(e) => setListingDescription(e.target.value)}
                  rows={3}
                  placeholder="What you do, experience, service area…"
                  className="w-full bg-rally-cream border border-rally-border rounded-2xl px-4 py-3 text-sm outline-none focus:border-rally-black resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Rate (optional)</label>
                <input
                  value={listingPriceNote}
                  onChange={(e) => setListingPriceNote(e.target.value)}
                  placeholder="e.g. $45/hr"
                  className="w-full bg-rally-cream border border-rally-border rounded-2xl px-4 py-3 text-sm outline-none focus:border-rally-black"
                />
              </div>
              <button
                onClick={saveListing}
                disabled={listingSaving}
                className="bg-rally-black text-white rounded-2xl px-5 py-3 text-sm disabled:opacity-30 hover:opacity-90 transition-opacity w-fit"
              >
                {listingSaving ? 'Saving…' : listing ? 'Update listing' : 'Create listing'}
              </button>
              {listingSaved && <p className="text-[11px] text-rally-green">Saved — visible in Find a pro.</p>}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-rally-border shadow-[0_1px_2px_rgba(17,17,16,0.04)] p-6">
            <p className="text-sm text-rally-black mb-4 flex items-center gap-1.5" style={{ fontFamily: 'CoFo Robert', fontWeight: 500 }}>
              <Icon name="medal" weight="fill" size={16} className="text-rally-amber" /> Certificates
            </p>
            {certificates.length === 0 && (
              <div className="flex flex-col items-center text-center py-4">
                <EmptyState variant="certificates" className="w-20 h-20 mb-1" />
                <p className="text-xs text-gray-400">Complete a task to earn your first certificate.</p>
              </div>
            )}
            <div className="flex flex-col gap-2.5">
              {certificates.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCertModal({
                    eyebrow: 'Certificate of Service',
                    title: c.task_title,
                    detail: `Awarded for completing "${c.task_title}" as a volunteer on Rally${c.hours ? `, totalling ${c.hours} hour${c.hours === 1 ? '' : 's'} of service` : ''}.`,
                    dateStr: new Date(c.issued_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
                    certId: c.id.slice(0, 8).toUpperCase(),
                  })}
                  className="text-left bg-rally-amber-light rounded-2xl p-4 flex items-center gap-3 hover:opacity-90 transition-opacity"
                >
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                    <Icon name="medal" weight="fill" size={18} className="text-rally-amber" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-rally-black truncate">{c.task_title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.hours ? `${c.hours}h · ` : ''}issued {new Date(c.issued_at).toLocaleDateString()}</p>
                  </div>
                  <Icon name="caret-right" size={14} className="text-rally-amber flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {milestones.length > 0 && (
            <div className="bg-white rounded-3xl border border-rally-border shadow-[0_1px_2px_rgba(17,17,16,0.04)] p-6">
              <p className="text-sm text-rally-black mb-4 flex items-center gap-1.5" style={{ fontFamily: 'CoFo Robert', fontWeight: 500 }}>
                <Icon name="trophy" weight="fill" size={16} className="text-rally-green" /> Milestones
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {milestones.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setCertModal({
                      eyebrow: 'Certificate of Achievement',
                      title: m.title,
                      detail: m.detail ?? '',
                      dateStr: new Date(m.achieved_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
                      certId: m.id.slice(0, 8).toUpperCase(),
                    })}
                    className="text-left bg-rally-green-light rounded-2xl p-3.5 hover:opacity-90 transition-opacity"
                  >
                    <Icon name="trophy" weight="fill" size={18} className="text-rally-green mb-2" />
                    <p className="text-xs text-rally-black leading-snug">{m.title}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-rally-border shadow-[0_1px_2px_rgba(17,17,16,0.04)] p-6 h-fit">
          <p className="text-sm text-rally-black mb-4 flex items-center gap-1.5" style={{ fontFamily: 'CoFo Robert', fontWeight: 500 }}>
            <Icon name="star" weight="fill" size={16} className="text-rally-amber" /> Reviews
          </p>

          {ratings.length === 0 ? (
            <div className="flex flex-col items-center text-center py-4">
              <EmptyState variant="reviews" className="w-20 h-20 mb-1" />
              <p className="text-xs text-gray-400">No reviews yet — they'll show up here once you complete a task.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-6 mb-6 pb-6 border-b border-rally-border">
                <div className="text-center">
                  <p className="text-4xl text-rally-black" style={{ fontFamily: 'CoFo Robert', fontWeight: 500 }}>{avgRating.toFixed(1)}</p>
                  <RatingStars value={Math.round(avgRating)} size={14} />
                  <p className="text-[11px] text-gray-400 mt-1">{ratings.length} review{ratings.length === 1 ? '' : 's'}</p>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  {distribution.map((count, i) => {
                    const star = 5 - i
                    const pct = ratings.length ? (count / ratings.length) * 100 : 0
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 w-2">{star}</span>
                        <div className="flex-1 h-1.5 bg-rally-cream rounded-full overflow-hidden">
                          <div className="h-full bg-rally-amber rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {ratings.map((r) => (
                  <div key={r.id} className="pb-4 border-b border-rally-border last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <RatingStars value={r.stars} size={13} />
                      <span className="text-[11px] text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    {r.comment && <p className="text-sm text-gray-600 mt-2">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="px-5 md:px-10">
        <button
          onClick={async () => { await signOut(); navigate('/', { replace: true }) }}
          className="md:hidden mt-8 flex items-center gap-2 text-sm text-gray-400"
        >
          <Icon name="sign-out" size={14} /> Sign out
        </button>
      </div>

      {certModal && (
        <div className="fixed inset-0 z-[2000] bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl">
            <div className="flex items-center justify-end gap-2 mb-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 text-sm bg-white text-rally-black rounded-full px-4 py-2 hover:opacity-90 transition-opacity"
              >
                <Icon name="printer" size={14} /> Print / Save as PDF
              </button>
              <button
                onClick={() => setCertModal(null)}
                className="flex items-center gap-1.5 text-sm bg-white text-rally-black rounded-full px-4 py-2 hover:opacity-90 transition-opacity"
              >
                <Icon name="x" size={14} /> Close
              </button>
            </div>
            <CertificateView
              recipientName={profile.full_name || profile.username}
              eyebrow={certModal.eyebrow}
              title={certModal.title}
              detail={certModal.detail}
              dateStr={certModal.dateStr}
              certId={certModal.certId}
            />
          </div>
        </div>
      )}
    </div>
  )
}
