import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RallyIcon } from '../components/Logo'
import { Icon } from '../components/Icon'
import { MiniMap } from '../components/MiniMap'
import { supabase } from '../lib/supabase'
import { geocodeText, getBrowserLocation, reverseGeocode } from '../lib/geo'
import type { Intent } from '../lib/types'

type Subrole = 'volunteer' | 'professional'

const STEPS = ['role', 'subrole', 'phone', 'location'] as const
type Step = (typeof STEPS)[number]

const DEFAULT_CENTER = { lat: 40.7128, lng: -74.006 } // fallback: NYC, only shown if geolocation is denied

export function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('role')
  const [intent, setIntent] = useState<Intent | null>(null)
  const [subrole, setSubrole] = useState<Subrole | null>(null)
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [saving, setSaving] = useState(false)
  const skipNextGeocode = useRef(false)

  useEffect(() => {
    if (step !== 'location' || coords) return
    setLocating(true)
    getBrowserLocation().then(async (c) => {
      if (c) {
        setCoords(c)
        const place = await reverseGeocode(c.lat, c.lng)
        if (place) {
          skipNextGeocode.current = true
          setLocation(place)
        }
      }
      setLocating(false)
    })
  }, [step, coords])

  // Forward-geocode whatever the user types — this is what lets ANY typed
  // location (not just GPS or a dragged pin) end up with real coordinates.
  useEffect(() => {
    if (skipNextGeocode.current) {
      skipNextGeocode.current = false
      return
    }
    if (step !== 'location' || !location.trim()) return
    const t = setTimeout(async () => {
      setGeocoding(true)
      const hit = await geocodeText(location)
      if (hit) setCoords({ lat: hit.lat, lng: hit.lng })
      setGeocoding(false)
    }, 900)
    return () => clearTimeout(t)
  }, [location, step])

  async function onMarkerDrag(lat: number, lng: number) {
    setCoords({ lat, lng })
    const place = await reverseGeocode(lat, lng)
    if (place) {
      skipNextGeocode.current = true
      setLocation(place)
    }
  }

  function goTo(s: Step) {
    setStep(s)
  }

  function pickIntent(i: Intent) {
    setIntent(i)
    goTo('subrole')
  }

  function pickSubrole(s: Subrole) {
    setSubrole(s)
    goTo('phone')
  }

  async function finish() {
    if (!intent || !phone.trim() || !location.trim()) return
    setSaving(true)
    await supabase.rpc('complete_onboarding', {
      p_intent: intent,
      p_phone: phone.trim(),
      p_location_text: location.trim(),
    })

    if (coords) {
      await supabase.rpc('set_profile_location', { p_lat: coords.lat, p_lng: coords.lng })
    }

    if (subrole === 'professional') {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await supabase.from('professional_listings').insert({
          profile_id: session.user.id,
          category: 'Other',
          description: 'New professional on Rally — edit your listing from your profile.',
        })
      }
    }

    setSaving(false)
    navigate('/home', { replace: true })
  }

  const stepIndex = STEPS.indexOf(step)

  return (
    <div className="min-h-screen bg-rally-cream flex flex-col relative overflow-hidden">
      <div
        className="pointer-events-none absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, #F5A623 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-32 w-[420px] h-[420px] rounded-full opacity-25 blur-3xl"
        style={{ background: 'radial-gradient(circle, #1A7A4A 0%, transparent 70%)' }}
      />

      <div className="px-6 pt-10 pb-6 flex items-center gap-2 relative">
        <RallyIcon size={22} className="text-rally-black" />
        <span className="text-base text-rally-black" style={{ fontFamily: 'Circular' }}>Rally</span>
      </div>

      <div className="flex-1 px-6 flex flex-col justify-center relative pb-10">
        <div className="max-w-md mx-auto w-full">
          <div className="flex items-center gap-1.5 mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className={`h-1 rounded-full flex-1 transition-colors ${i <= stepIndex ? 'bg-rally-black' : 'bg-rally-border'}`} />
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-rally-border shadow-[0_20px_50px_rgba(17,17,16,0.06)] p-7">
            {step === 'role' && (
              <div>
                <h1 className="text-2xl text-rally-black mb-2" style={{ fontFamily: 'Circular' }}>What brings you here?</h1>
                <p className="text-sm text-gray-400 mb-8">You can always do both later — this just sets your starting view.</p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => pickIntent('give')}
                    className="text-left bg-rally-cream rounded-2xl border border-rally-border p-5 hover:border-rally-black hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-3">
                      <Icon name="heart" weight="fill" size={18} className="text-rally-amber" />
                    </div>
                    <p className="text-rally-black" style={{ fontFamily: 'Circular' }}>I give help</p>
                    <p className="text-xs text-gray-400 mt-1">Volunteer for tasks or offer your professional services</p>
                  </button>
                  <button
                    onClick={() => pickIntent('need')}
                    className="text-left bg-rally-cream rounded-2xl border border-rally-border p-5 hover:border-rally-black hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-3">
                      <Icon name="hand-waving" weight="fill" size={18} className="text-rally-green" />
                    </div>
                    <p className="text-rally-black" style={{ fontFamily: 'Circular' }}>I need help</p>
                    <p className="text-xs text-gray-400 mt-1">Post a task for a volunteer, or find a local pro</p>
                  </button>
                </div>
              </div>
            )}

            {step === 'subrole' && intent && (
              <div>
                <button onClick={() => goTo('role')} className="flex items-center gap-1 text-xs text-gray-400 mb-6">
                  <Icon name="arrow-left" size={12} /> Back
                </button>
                <h1 className="text-2xl text-rally-black mb-2" style={{ fontFamily: 'Circular' }}>
                  {intent === 'give' ? 'How do you want to help?' : 'What kind of help do you need?'}
                </h1>
                <p className="text-sm text-gray-400 mb-8">
                  {intent === 'give'
                    ? 'Volunteering earns hours toward a certificate. Professionals list a paid service.'
                    : "Volunteers help informally. Professionals are local tradespeople you'd pay directly."}
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => pickSubrole('volunteer')}
                    className="text-left bg-rally-cream rounded-2xl border border-rally-border p-5 hover:border-rally-black hover:shadow-md transition-all"
                  >
                    <p className="text-rally-black" style={{ fontFamily: 'Circular' }}>
                      {intent === 'give' ? 'As a volunteer' : 'A volunteer'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {intent === 'give' ? 'Apply to tasks nearby, earn certificates' : 'Post a task, get matched with a volunteer'}
                    </p>
                  </button>
                  <button
                    onClick={() => pickSubrole('professional')}
                    className="text-left bg-rally-cream rounded-2xl border border-rally-border p-5 hover:border-rally-black hover:shadow-md transition-all"
                  >
                    <p className="text-rally-black" style={{ fontFamily: 'Circular' }}>
                      {intent === 'give' ? 'As a professional' : 'A professional'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {intent === 'give' ? 'List your trade in the local directory' : 'Browse local pros and get their contact'}
                    </p>
                  </button>
                </div>
              </div>
            )}

            {step === 'phone' && (
              <div>
                <button onClick={() => goTo('subrole')} className="flex items-center gap-1 text-xs text-gray-400 mb-6">
                  <Icon name="arrow-left" size={12} /> Back
                </button>
                <h1 className="text-2xl text-rally-black mb-2" style={{ fontFamily: 'Circular' }}>What's your number?</h1>
                <p className="text-sm text-gray-400 mb-8">Only shared once you're matched with someone — never public.</p>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full bg-rally-cream border border-rally-border rounded-2xl px-4 py-3.5 text-sm text-rally-black outline-none focus:border-rally-black"
                />
                <button
                  disabled={!phone.trim()}
                  onClick={() => goTo('location')}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-rally-black text-white rounded-2xl px-6 py-3.5 text-sm disabled:opacity-30"
                >
                  Continue <Icon name="arrow-right" size={14} />
                </button>
              </div>
            )}

            {step === 'location' && (
              <div>
                <button onClick={() => goTo('phone')} className="flex items-center gap-1 text-xs text-gray-400 mb-6">
                  <Icon name="arrow-left" size={12} /> Back
                </button>
                <h1 className="text-2xl text-rally-black mb-2" style={{ fontFamily: 'Circular' }}>Where are you?</h1>
                <p className="text-sm text-gray-400 mb-4">
                  {locating ? 'Finding you on the map…' : 'Type a place or drag the pin — either way sets what "nearby" means for you.'}
                </p>

                <div className="rounded-2xl overflow-hidden border border-rally-border mb-4 h-48">
                  <MiniMap
                    center={coords ?? DEFAULT_CENTER}
                    zoom={coords ? 14 : 3}
                    interactive
                    draggableMarker
                    onDrag={onMarkerDrag}
                    pins={coords ? [{ lat: coords.lat, lng: coords.lng, amber: true }] : []}
                    className="w-full h-full"
                  />
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Ras Al Khor, Dubai"
                    className="w-full bg-rally-cream border border-rally-border rounded-2xl px-4 py-3.5 text-sm text-rally-black outline-none focus:border-rally-black"
                  />
                  {geocoding && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">Locating…</span>
                  )}
                </div>
                <button
                  disabled={!location.trim() || saving}
                  onClick={finish}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-rally-black text-white rounded-2xl px-6 py-3.5 text-sm disabled:opacity-30"
                >
                  {saving ? 'Setting up…' : 'Finish'} <Icon name="arrow-right" size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
