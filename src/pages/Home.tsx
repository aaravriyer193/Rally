import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { EmptyState } from '../components/illustrations/EmptyState'
import { MiniMap } from '../components/MiniMap'
import { TaskCard } from '../components/TaskCard'
import { ProfessionalCard } from '../components/ProfessionalCard'
import { supabase } from '../lib/supabase'
import { distanceKm } from '../lib/geo'
import { CATEGORIES, type Profile, type ProfessionalListing, type Task } from '../lib/types'

type Tab = 'tasks' | 'pros'
type Budget = 'any' | 'free' | 'paid'
type View = 'list' | 'map'

export function Home() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('tasks')
  const [view, setView] = useState<View>('list')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [budget, setBudget] = useState<Budget>('any')
  const [tasks, setTasks] = useState<Task[]>([])
  const [listings, setListings] = useState<ProfessionalListing[]>([])
  const [me, setMe] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      let myProfile: Profile | null = null
      if (session) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        myProfile = profile
        setMe(profile)
      }

      if (tab === 'tasks') {
        const { data } = await supabase
          .from('tasks')
          .select('*, poster:profiles!tasks_poster_id_fkey(*)')
          .eq('status', 'open')
          .order('created_at', { ascending: false })
        const rows = (data as Task[]) ?? []
        setTasks(myProfile?.lat != null && myProfile?.lng != null ? sortByDistance(rows, myProfile) : rows)
      } else {
        const { data } = await supabase
          .from('professional_listings')
          .select('*, profile:profiles!professional_listings_profile_id_fkey(*)')
          .order('created_at', { ascending: false })
        const rows = (data as ProfessionalListing[]) ?? []
        setListings(myProfile?.lat != null && myProfile?.lng != null ? sortListingsByDistance(rows, myProfile) : rows)
      }
      setLoading(false)
    }
    load()
  }, [tab])

  function sortByDistance(rows: Task[], from: Profile) {
    return [...rows].sort((a, b) => {
      if (a.lat == null || a.lng == null) return 1
      if (b.lat == null || b.lng == null) return -1
      return distanceKm(from.lat!, from.lng!, a.lat, a.lng) - distanceKm(from.lat!, from.lng!, b.lat, b.lng)
    })
  }
  function sortListingsByDistance(rows: ProfessionalListing[], from: Profile) {
    return [...rows].sort((a, b) => {
      const aLat = a.profile?.lat, aLng = a.profile?.lng
      const bLat = b.profile?.lat, bLng = b.profile?.lng
      if (aLat == null || aLng == null) return 1
      if (bLat == null || bLng == null) return -1
      return distanceKm(from.lat!, from.lng!, aLat, aLng) - distanceKm(from.lat!, from.lng!, bLat, bLng)
    })
  }

  function mapFallbackCenter(items: Task[] | ProfessionalListing[]): { lat: number; lng: number } {
    const coords = items
      .map((i) => ('lat' in i ? { lat: i.lat, lng: i.lng } : { lat: i.profile?.lat, lng: i.profile?.lng }))
      .filter((c): c is { lat: number; lng: number } => c.lat != null && c.lng != null)
    if (coords.length === 0) return { lat: 40.7128, lng: -74.006 }
    return {
      lat: coords.reduce((s, c) => s + c.lat, 0) / coords.length,
      lng: coords.reduce((s, c) => s + c.lng, 0) / coords.length,
    }
  }

  function taskDistance(t: Task): number | null {
    if (!me?.lat || !me?.lng || t.lat == null || t.lng == null) return null
    return distanceKm(me.lat, me.lng, t.lat, t.lng)
  }
  function listingDistance(l: ProfessionalListing): number | null {
    if (!me?.lat || !me?.lng || l.profile?.lat == null || l.profile?.lng == null) return null
    return distanceKm(me.lat, me.lng, l.profile.lat, l.profile.lng)
  }

  const filteredTasks = tasks.filter((t) => {
    if (category && t.category !== category) return false
    if (query && !t.title.toLowerCase().includes(query.toLowerCase())) return false
    if (budget === 'free' && t.budget) return false
    if (budget === 'paid' && !t.budget) return false
    return true
  })
  const filteredListings = listings.filter((l) => {
    if (category && l.category !== category) return false
    if (query && !(l.profile?.full_name || l.profile?.username || '').toLowerCase().includes(query.toLowerCase())) return false
    return true
  })

  return (
    <div className="pb-24 md:pb-16 bg-rally-cream min-h-screen">
      {/* Hero banner */}
      <div className="relative overflow-hidden bg-rally-black mx-0 md:mx-10 md:mt-10 md:rounded-[2rem] px-5 md:px-10 pt-12 md:pt-12 pb-8 md:pb-10 bg-grain">
        <div
          className="pointer-events-none absolute -top-24 right-0 w-[420px] h-[420px] rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #F5A623 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 left-10 w-[280px] h-[280px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #1A7A4A 0%, transparent 70%)' }}
        />
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl text-white" style={{ fontFamily: 'CoFo Robert', fontWeight: 500, letterSpacing: '-0.4px' }}>
              {me?.full_name ? `Hi, ${me.full_name.split(' ')[0]}` : 'Hi there'}
            </h1>
            {me?.location_text && (
              <p className="text-sm text-[#999] mt-1.5 flex items-center gap-1.5">
                <Icon name="map-pin" weight="fill" size={13} className="text-rally-amber" /> Near {me.location_text}
                {me.lat != null && <span className="text-[11px] text-rally-green ml-1">· sorted by distance</span>}
              </p>
            )}
          </div>
          <button className="relative p-2 rounded-full bg-white/10 md:hidden">
            <Icon name="bell" size={18} className="text-white" />
          </button>
        </div>
      </div>

      <div className="px-5 md:px-10 pt-6">
        <div className="flex gap-2 mb-5">
          {(['tasks', 'pros'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm border transition-all ${
                tab === t ? 'bg-rally-black text-white border-rally-black' : 'bg-white text-gray-500 border-rally-border'
              }`}
            >
              <Icon name={t === 'tasks' ? 'list-checks' : 'wrench'} weight={tab === t ? 'fill' : 'regular'} size={14} />
              {t === 'tasks' ? 'Tasks near you' : 'Find a pro'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-md">
            <Icon name="magnifying-glass" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full bg-white border border-rally-border rounded-full pl-9 pr-4 py-2.5 text-sm outline-none focus:border-rally-black"
            />
          </div>
          <div className="flex bg-white border border-rally-border rounded-full p-1 flex-shrink-0">
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-full transition-colors ${view === 'list' ? 'bg-rally-black text-white' : 'text-gray-400'}`}
            >
              <Icon name="list-bullets" size={15} />
            </button>
            <button
              onClick={() => setView('map')}
              className={`p-1.5 rounded-full transition-colors ${view === 'map' ? 'bg-rally-black text-white' : 'text-gray-400'}`}
            >
              <Icon name="map-trifold" size={15} />
            </button>
          </div>
        </div>

        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 md:-mx-10 md:px-10">
          <button
            onClick={() => setCategory(null)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs border ${!category ? 'bg-rally-black text-white border-rally-black' : 'bg-white text-gray-500 border-rally-border'}`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs border ${category === c ? 'bg-rally-black text-white border-rally-black' : 'bg-white text-gray-500 border-rally-border'}`}
            >
              {c}
            </button>
          ))}
        </div>

        {tab === 'tasks' && (
          <div className="flex gap-2 mt-2">
            {(['any', 'free', 'paid'] as Budget[]).map((b) => (
              <button
                key={b}
                onClick={() => setBudget(b)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs border capitalize ${budget === b ? 'bg-rally-green text-white border-rally-green' : 'bg-white text-gray-500 border-rally-border'}`}
              >
                {b === 'any' ? 'Any price' : b}
              </button>
            ))}
          </div>
        )}
      </div>

      <section className="px-5 md:px-10 mt-4">
        {loading && <p className="text-sm text-gray-400 py-12 text-center">Loading…</p>}

        {!loading && view === 'map' && (() => {
          const pins = tab === 'tasks'
            ? filteredTasks.filter((t) => t.lat != null && t.lng != null).map((t) => ({
                lat: t.lat!, lng: t.lng!, label: t.title, onClick: () => navigate(`/tasks/${t.id}`),
              }))
            : filteredListings.filter((l) => l.profile?.lat != null && l.profile?.lng != null).map((l) => ({
                lat: l.profile!.lat!, lng: l.profile!.lng!, label: l.profile?.full_name || l.profile?.username, amber: true,
                onClick: () => navigate(`/professionals/${l.id}`),
              }))
          const totalCount = tab === 'tasks' ? filteredTasks.length : filteredListings.length
          return (
            <div className="rounded-3xl overflow-hidden border border-rally-border h-[60vh] min-h-[360px] relative">
              <MiniMap
                center={me?.lat != null && me?.lng != null ? { lat: me.lat, lng: me.lng } : mapFallbackCenter(tab === 'tasks' ? filteredTasks : filteredListings)}
                zoom={me?.lat != null ? 12 : 10}
                interactive
                className="w-full h-full"
                pins={pins}
              />
              {pins.length === 0 && totalCount > 0 && (
                <div className="absolute inset-x-4 top-4 bg-white rounded-2xl border border-rally-border px-4 py-3 flex items-start gap-2 shadow-[0_8px_20px_rgba(17,17,16,0.08)]">
                  <Icon name="info" size={16} className="text-rally-amber flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-500">
                    None of the {totalCount} {tab === 'tasks' ? 'tasks' : 'pros'} here have a precise location yet —
                    that's only captured when someone allows location access. Switch to list view to see them all.
                  </p>
                </div>
              )}
            </div>
          )
        })()}

        {!loading && view === 'list' && tab === 'tasks' && filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 text-center bg-white rounded-3xl border-2 border-dashed border-rally-border">
            <EmptyState variant="tasks" className="w-28 h-28 mb-2" />
            <p className="text-sm text-gray-400">No open tasks nearby yet. Be the first to post one.</p>
          </div>
        )}
        {!loading && view === 'list' && tab === 'tasks' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTasks.map((t) => <TaskCard key={t.id} task={t} distanceKm={taskDistance(t)} />)}
          </div>
        )}

        {!loading && view === 'list' && tab === 'pros' && filteredListings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 text-center bg-white rounded-3xl border-2 border-dashed border-rally-border">
            <EmptyState variant="pros" className="w-28 h-28 mb-2" />
            <p className="text-sm text-gray-400">No professionals listed yet.</p>
          </div>
        )}
        {!loading && view === 'list' && tab === 'pros' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredListings.map((l) => <ProfessionalCard key={l.id} listing={l} distanceKm={listingDistance(l)} />)}
          </div>
        )}
      </section>
    </div>
  )
}
