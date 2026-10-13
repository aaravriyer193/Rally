import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/types'

const PODIUM_STYLES = [
  {
    ring: 'ring-4 ring-rally-amber',
    badge: 'bg-rally-amber text-white',
    crown: 'text-rally-amber',
    avatarSize: 'w-20 h-20',
    order: 'order-2',
    lift: '-mt-6',
  },
  {
    ring: 'ring-4 ring-gray-300',
    badge: 'bg-gray-400 text-white',
    crown: 'text-gray-300',
    avatarSize: 'w-16 h-16',
    order: 'order-1',
    lift: 'mt-4',
  },
  {
    ring: 'ring-4 ring-[#C98A4B]',
    badge: 'bg-[#C98A4B] text-white',
    crown: 'text-[#C98A4B]',
    avatarSize: 'w-16 h-16',
    order: 'order-3',
    lift: 'mt-6',
  },
]

function Avatar({ p, size }: { p: Profile; size: string }) {
  return p.avatar_url ? (
    <img src={p.avatar_url} alt="" className={`${size} rounded-full object-cover bg-rally-cream`} />
  ) : (
    <div className={`${size} rounded-full bg-rally-cream flex items-center justify-center text-gray-400`} style={{ fontFamily: 'CoFo Robert', fontWeight: 500 }}>
      {(p.full_name || p.username || '?')[0]?.toUpperCase()}
    </div>
  )
}

export function Leaderboard() {
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [meId, setMeId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [{ data }, { data: { session } }] = await Promise.all([
        supabase.from('profiles').select('*').order('points', { ascending: false }).limit(50),
        supabase.auth.getSession(),
      ])
      setProfiles((data as Profile[]) ?? [])
      setMeId(session?.user?.id ?? null)
      setLoading(false)
    }
    load()
  }, [])

  const podium = profiles.slice(0, 3)
  const rest = profiles.slice(3)

  return (
    <div className="min-h-screen bg-rally-cream pb-24 md:pb-10">
      <div className="relative bg-rally-black bg-grain px-5 md:px-10 pt-12 md:pt-10 pb-10 overflow-hidden">
        <div className="relative flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-1 md:hidden">
            <Icon name="arrow-left" size={20} className="text-white" />
          </button>
          <div className="flex items-center gap-2">
            <Icon name="trophy" weight="fill" size={20} className="text-rally-amber" />
            <h1 className="text-lg text-white" style={{ fontFamily: 'CoFo Robert', fontWeight: 500 }}>Leaderboard</h1>
          </div>
        </div>
        <p className="relative text-xs text-white/50 max-w-md">Ranked by points earned helping neighbours — every completed task, every certificate.</p>

        {/* decorative scattered stars */}
        <Icon name="sparkle" weight="fill" size={16} className="absolute top-6 right-10 text-rally-amber/30" />
        <Icon name="sparkle" weight="fill" size={10} className="absolute top-16 right-24 text-white/20" />
        <Icon name="star-four" weight="fill" size={14} className="absolute bottom-6 right-6 text-rally-amber/20" />

        {!loading && podium.length > 0 && (
          <div className="relative flex items-end justify-center gap-4 md:gap-8 mt-8">
            {podium.map((p, i) => {
              const s = PODIUM_STYLES[i]
              return (
                <div key={p.id} className={`flex flex-col items-center ${s.order} ${s.lift}`}>
                  {i === 0 && <Icon name="crown-simple" weight="fill" size={26} className={`${s.crown} mb-1`} />}
                  <div className={`relative rounded-full ${s.ring}`}>
                    <Avatar p={p} size={s.avatarSize} />
                    <span className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full text-[11px] flex items-center justify-center ${s.badge}`} style={{ fontFamily: 'CoFo Robert', fontWeight: 500 }}>
                      {i + 1}
                    </span>
                  </div>
                  <p className="text-xs text-white mt-3 max-w-[80px] truncate text-center">{p.full_name || p.username}</p>
                  <span className="flex items-center gap-1 text-[11px] text-rally-amber mt-0.5">
                    <Icon name="trophy" weight="fill" size={10} /> {p.points}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="px-5 md:px-10 pt-6 max-w-2xl mx-auto md:mx-0">
        {loading && <p className="text-sm text-gray-400 py-8 text-center">Loading…</p>}
        {!loading && profiles.length === 0 && (
          <p className="text-sm text-gray-400 py-8 text-center">No one on the board yet — be the first to earn points.</p>
        )}
        <div className="flex flex-col gap-2">
          {rest.map((p, i) => {
            const rank = i + 4
            const isMe = p.id === meId
            return (
              <div
                key={p.id}
                className={`rounded-xl border p-3.5 flex items-center gap-3 transition-colors ${
                  isMe ? 'bg-rally-amber-light border-rally-amber' : 'bg-white border-rally-border'
                }`}
              >
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 text-gray-400" style={{ fontFamily: 'CoFo Robert', fontWeight: 500 }}>
                  {rank}
                </span>
                <Avatar p={p} size="w-9 h-9" />
                <span className="text-sm text-rally-black flex-1 truncate">
                  {p.full_name || p.username}
                  {isMe && <span className="text-[10px] text-rally-amber ml-1.5">(you)</span>}
                </span>
                <span className="flex items-center gap-1 text-xs text-rally-amber flex-shrink-0">
                  <Icon name="trophy" weight="fill" size={12} /> {p.points}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
