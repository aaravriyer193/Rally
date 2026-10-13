import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { GoogleMapEmbed } from '../components/GoogleMapEmbed'
import { supabase } from '../lib/supabase'
import { distanceKm } from '../lib/geo'
import { RatingStars } from '../components/RatingStars'
import type { Profile, Task, TaskApplication } from '../lib/types'

function displayName(p?: Profile) {
  return (p?.full_name || p?.username) ?? 'Neighbour'
}

function ContactCard({
  profile,
  phone,
  onReveal,
  busy,
  label,
}: {
  profile?: Profile
  phone: string | null
  onReveal: () => void
  busy: boolean
  label: string
}) {
  return (
    <div className="bg-rally-cream rounded-2xl p-4 flex items-center gap-3">
      {profile?.avatar_url ? (
        <img src={profile.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
          <Icon name="user" size={20} className="text-rally-border" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-rally-black truncate" style={{ fontFamily: 'CoFo Robert', fontWeight: 500 }}>
          {displayName(profile)}
        </p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
      {phone ? (
        <a
          href={`tel:${phone}`}
          className="flex items-center gap-1.5 text-sm text-rally-green bg-rally-green-light px-3 py-2 rounded-xl flex-shrink-0"
        >
          <Icon name="phone" weight="fill" size={14} /> {phone}
        </a>
      ) : (
        <button
          disabled={busy}
          onClick={onReveal}
          className="flex items-center gap-1.5 text-sm text-white bg-rally-black px-3 py-2.5 rounded-xl flex-shrink-0 disabled:opacity-30"
        >
          <Icon name="phone" size={14} /> {busy ? '…' : 'Contact'}
        </button>
      )}
    </div>
  )
}

const STATUS_LABEL: Record<string, { text: string; tint: string }> = {
  open: { text: 'Open — accepting applicants', tint: 'bg-rally-green-light text-rally-green' },
  filled: { text: 'Filled — matched with a volunteer', tint: 'bg-rally-amber-light text-rally-amber' },
  completed: { text: 'Completed', tint: 'bg-rally-cream text-gray-500' },
  cancelled: { text: 'Cancelled', tint: 'bg-rally-cream text-gray-400' },
}

export function TaskDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [task, setTask] = useState<Task | null>(null)
  const [applications, setApplications] = useState<TaskApplication[]>([])
  const [myApplication, setMyApplication] = useState<TaskApplication | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [myCoords, setMyCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [contactPhone, setContactPhone] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [rating, setRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false)
  const [certRequested, setCertRequested] = useState(false)
  const [certError, setCertError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    const uid = session?.user.id ?? null
    setUserId(uid)

    if (uid) {
      const { data: myProfile } = await supabase.from('profiles').select('lat, lng').eq('id', uid).single()
      setMyCoords(myProfile?.lat != null && myProfile?.lng != null ? { lat: myProfile.lat, lng: myProfile.lng } : null)
    }

    const { data: taskData } = await supabase
      .from('tasks')
      .select('*, poster:profiles!tasks_poster_id_fkey(*)')
      .eq('id', id)
      .single()
    setTask(taskData as Task)

    const isPoster = uid && taskData?.poster_id === uid

    if (isPoster) {
      const { data: apps } = await supabase
        .from('task_applications')
        .select('*, applicant:profiles!task_applications_applicant_id_fkey(*)')
        .eq('task_id', id)
      setApplications((apps as TaskApplication[]) ?? [])
    } else if (uid) {
      const { data: app } = await supabase
        .from('task_applications')
        .select('*')
        .eq('task_id', id)
        .eq('applicant_id', uid)
        .maybeSingle()
      setMyApplication(app as TaskApplication | null)
    }

    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  async function apply() {
    if (!id || !userId) return
    setBusy(true)
    await supabase.from('task_applications').insert({ task_id: id, applicant_id: userId })
    setBusy(false)
    load()
  }

  async function selectRandomly() {
    if (!id) return
    setBusy(true)
    await supabase.rpc('select_random_applicant', { p_task_id: id })
    setBusy(false)
    load()
  }

  async function confirmCompletion(applicationId: string) {
    setBusy(true)
    await supabase.rpc('confirm_task_completion', { p_application_id: applicationId })
    setBusy(false)
    load()
  }

  async function revealContact(applicationId: string) {
    setBusy(true)
    const { data } = await supabase.rpc('get_contact_for_application', { p_application_id: applicationId })
    setContactPhone(data ?? null)
    setBusy(false)
  }

  async function submitRating(applicationId: string, ratee_id: string, stars: number) {
    if (!id || !userId) return
    setRating(stars)
    const { error } = await supabase.from('ratings').insert({ task_id: id, rater_id: userId, ratee_id, stars })
    if (!error) setRatingSubmitted(true)
    void applicationId
  }

  async function requestCertificate(applicationId: string, hours: number) {
    setBusy(true)
    setCertError(null)
    const { error } = await supabase.rpc('request_certificate', { p_application_id: applicationId, p_hours: hours })
    setBusy(false)
    if (error) {
      setCertError(error.message)
      return
    }
    setCertRequested(true)
  }

  if (loading) {
    return <div className="min-h-screen bg-rally-cream flex items-center justify-center"><p className="text-sm text-gray-400">Loading…</p></div>
  }
  if (!task) {
    return <div className="min-h-screen bg-rally-cream flex items-center justify-center"><p className="text-sm text-gray-400">Task not found.</p></div>
  }

  const isPoster = userId === task.poster_id
  const selectedApp = applications.find((a) => a.status === 'selected' || a.status === 'completed')
  const status = STATUS_LABEL[task.status]
  const mapQuery = task.location_text || (task.lat != null && task.lng != null ? `${task.lat},${task.lng}` : null)

  return (
    <div className="min-h-screen bg-rally-cream pb-24 md:pb-16">
      <div className="bg-white px-5 md:px-10 pt-12 md:pt-10 pb-4 border-b border-rally-border flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <Icon name="arrow-left" size={20} className="text-rally-black" />
        </button>
        <span className="text-xs text-gray-400">{task.category ?? 'Task'}</span>
      </div>

      <div className="px-5 md:px-10 pt-6 max-w-6xl mx-auto flex flex-col gap-6">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8">
          {/* Media column */}
          <div>
            {task.image_url ? (
              <img src={task.image_url} alt="" className="w-full aspect-[4/3] object-cover rounded-3xl border border-rally-border" />
            ) : (
              <div className="w-full aspect-[4/3] rounded-3xl border border-rally-border bg-white flex items-center justify-center">
                <Icon name="image" size={40} className="text-rally-border" />
              </div>
            )}
          </div>

          {/* Buy-box column */}
          <div className="lg:sticky lg:top-6 h-fit flex flex-col gap-4">
            <div className="bg-white rounded-3xl border border-rally-border p-6">
              {status && (
                <span className={`inline-block text-[11px] px-2.5 py-1 rounded-full mb-3 ${status.tint}`}>{status.text}</span>
              )}
              <h1 className="text-2xl text-rally-black leading-tight mb-3" style={{ fontFamily: 'CoFo Robert', fontWeight: 500, letterSpacing: '-0.3px' }}>
                {task.title}
              </h1>

              <p className="text-3xl text-rally-black mb-1" style={{ fontFamily: 'CoFo Robert', fontWeight: 500 }}>
                {task.budget != null ? `$${task.budget}` : 'Unpaid'}
              </p>
              <p className="text-xs text-gray-400 mb-5">{task.budget != null ? 'Suggested — agree details with the poster' : 'Volunteer task — earns certificate hours'}</p>

              {task.location_text && (
                <p className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
                  <Icon name="map-pin" size={14} /> {task.location_text}
                </p>
              )}

              <p className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
                <Icon name={task.frequency === 'recurring' ? 'repeat' : 'clock'} size={14} />
                {task.frequency === 'recurring'
                  ? `Recurring${task.recurring_days?.length ? ' · ' + task.recurring_days.map((d) => d[0].toUpperCase() + d.slice(1, 3)).join(', ') : ''}${task.duration_hours ? ` · ${task.duration_hours}h/session` : ''}`
                  : task.duration_hours ? `One-off · ~${task.duration_hours}h` : 'One-off'}
              </p>

              <div className="border-t border-rally-border pt-4 mb-4">
                <div className="flex items-center gap-3">
                  {task.poster?.avatar_url ? (
                    <img src={task.poster.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-rally-cream" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm text-rally-black truncate">{displayName(task.poster)}</p>
                    <p className="text-xs text-gray-400">Posted this task</p>
                  </div>
                </div>
              </div>

              {/* Action area */}
              <div className="border-t border-rally-border pt-4 flex flex-col gap-3">
              {!isPoster && userId && task.status === 'open' && !myApplication && (
                <button disabled={busy} onClick={apply} className="w-full bg-rally-black text-white rounded-2xl px-6 py-3.5 text-sm disabled:opacity-30 hover:opacity-90 transition-opacity">
                  {busy ? 'Applying…' : 'Apply for this task'}
                </button>
              )}

              {!isPoster && myApplication && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-rally-black">Your application:</span>
                    <span className="text-xs text-gray-500 bg-rally-cream px-2 py-0.5 rounded-full">{myApplication.status}</span>
                  </div>

                  {(myApplication.status === 'selected' || myApplication.status === 'completed') && (
                    <>
                      <ContactCard
                        profile={task.poster}
                        phone={contactPhone}
                        busy={busy}
                        label="Task poster — you're matched!"
                        onReveal={() => revealContact(myApplication.id)}
                      />

                      {myApplication.status === 'selected' && (
                        myApplication.volunteer_confirmed_at ? (
                          <p className="text-xs text-gray-400">Waiting for {displayName(task.poster)} to confirm the task is done…</p>
                        ) : (
                          <button disabled={busy} onClick={() => confirmCompletion(myApplication.id)} className="w-full bg-rally-black text-white rounded-2xl px-6 py-3 text-sm disabled:opacity-30 hover:opacity-90 transition-opacity">
                            {busy ? 'Saving…' : "I've completed this task"}
                          </button>
                        )
                      )}

                      {myApplication.status === 'completed' && !certRequested && (
                        task.budget != null ? (
                          <p className="text-xs text-gray-400">Paid tasks aren't eligible for a volunteer certificate.</p>
                        ) : (
                          <button disabled={busy} onClick={() => requestCertificate(myApplication.id, task.duration_hours ?? 1)} className="text-sm text-rally-black underline w-fit">
                            Request certificate
                          </button>
                        )
                      )}
                      {certRequested && <p className="text-xs text-rally-green">Certificate requested — check your profile.</p>}
                      {certError && <p className="text-xs text-red-500">{certError}</p>}
                    </>
                  )}
                </>
              )}

              {isPoster && task.status === 'open' && (
                <div>
                  <p className="text-sm text-rally-black mb-2" style={{ fontFamily: 'CoFo Robert', fontWeight: 500 }}>Applicants ({applications.length})</p>
                  {applications.length === 0 && <p className="text-xs text-gray-400">No applicants yet.</p>}
                  <div className="flex flex-col gap-2">
                    {applications.map((a) => (
                      <div key={a.id} className="bg-rally-cream rounded-xl p-3 flex items-center gap-3">
                        {a.applicant?.avatar_url ? (
                          <img src={a.applicant.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white" />
                        )}
                        <span className="text-sm text-rally-black flex-1 truncate">{displayName(a.applicant)}</span>
                        <span className="text-xs text-gray-400">{a.status}</span>
                      </div>
                    ))}
                  </div>
                  {applications.length > 0 && (
                    <button disabled={busy} onClick={selectRandomly} className="mt-3 w-full bg-rally-black text-white rounded-2xl px-6 py-3 text-sm disabled:opacity-30 hover:opacity-90 transition-opacity">
                      {busy ? 'Selecting…' : 'Select randomly'}
                    </button>
                  )}
                </div>
              )}

              {isPoster && task.status === 'filled' && selectedApp && (
                <>
                  <ContactCard
                    profile={selectedApp.applicant}
                    phone={contactPhone}
                    busy={busy}
                    label="Selected volunteer — you're matched!"
                    onReveal={() => revealContact(selectedApp.id)}
                  />
                  {selectedApp.poster_confirmed_at ? (
                    <p className="text-xs text-gray-400">Waiting for {displayName(selectedApp.applicant)} to confirm the task is done…</p>
                  ) : (
                    <button disabled={busy} onClick={() => confirmCompletion(selectedApp.id)} className="w-full bg-rally-black text-white rounded-2xl px-6 py-3 text-sm disabled:opacity-30 hover:opacity-90 transition-opacity">
                      {busy ? 'Saving…' : 'Confirm task is done'}
                    </button>
                  )}
                </>
              )}

              {isPoster && task.status === 'completed' && selectedApp && (
                <div>
                  <p className="text-sm text-rally-black mb-2">Rate {displayName(selectedApp.applicant)}</p>
                  {!ratingSubmitted ? (
                    <RatingStars value={rating} onChange={(v) => submitRating(selectedApp.id, selectedApp.applicant_id, v)} size={22} />
                  ) : (
                    <p className="text-xs text-rally-green">Thanks for rating!</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        </div>

        <div className="bg-white rounded-3xl border border-rally-border p-6">
          <p className="text-sm text-rally-black mb-2" style={{ fontFamily: 'CoFo Robert', fontWeight: 500 }}>Description</p>
          <p className="text-sm text-gray-600 leading-relaxed">{task.description || 'No description provided.'}</p>
        </div>

        {mapQuery && (
          <div className="bg-white rounded-3xl border border-rally-border overflow-hidden">
            <GoogleMapEmbed query={mapQuery} className="w-full h-56" />
            {myCoords && task.lat != null && task.lng != null && (
              <p className="text-[11px] text-gray-400 px-5 py-2.5 border-t border-rally-border">
                {distanceKm(myCoords.lat, myCoords.lng, task.lat, task.lng).toFixed(1)} km from you
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
