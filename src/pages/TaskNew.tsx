import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { supabase } from '../lib/supabase'
import { CATEGORIES, DAYS, type Frequency } from '../lib/types'

const MAX_BUDGET = 200

export function TaskNew() {
  const navigate = useNavigate()
  const fileInput = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [isPaid, setIsPaid] = useState(false)
  const [budget, setBudget] = useState(25)
  const [frequency, setFrequency] = useState<Frequency>('once')
  const [recurringDays, setRecurringDays] = useState<string[]>([])
  const [durationHours, setDurationHours] = useState(2)
  const [location, setLocation] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function pickImage(file: File | undefined) {
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function toggleDay(day: string) {
    setRecurringDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day])
  }

  async function submit() {
    if (!title.trim()) return
    setSaving(true)
    setError(null)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setError('Please sign in first.')
      setSaving(false)
      return
    }

    let image_url: string | null = null
    if (imageFile) {
      const path = `${session.user.id}/${Date.now()}-${imageFile.name}`
      const { error: uploadError } = await supabase.storage.from('task-images').upload(path, imageFile)
      if (uploadError) {
        setError(uploadError.message)
        setSaving(false)
        return
      }
      image_url = supabase.storage.from('task-images').getPublicUrl(path).data.publicUrl
    }

    const { data: myProfile } = await supabase.from('profiles').select('lat, lng').eq('id', session.user.id).single()

    const { data, error: insertError } = await supabase
      .from('tasks')
      .insert({
        poster_id: session.user.id,
        title: title.trim(),
        description: description.trim() || null,
        category,
        budget: isPaid ? budget : null,
        location_text: location.trim() || null,
        lat: myProfile?.lat ?? null,
        lng: myProfile?.lng ?? null,
        image_url,
        frequency,
        recurring_days: frequency === 'recurring' && recurringDays.length > 0 ? recurringDays : null,
        duration_hours: durationHours,
      })
      .select()
      .single()

    setSaving(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    navigate(`/tasks/${data.id}`, { replace: true })
  }

  return (
    <div className="min-h-screen bg-rally-cream pb-24 md:pb-16 relative overflow-hidden">
      <div
        className="pointer-events-none absolute -top-32 right-0 w-[480px] h-[480px] rounded-full opacity-20 blur-3xl hidden md:block"
        style={{ background: 'radial-gradient(circle, #F5A623 0%, transparent 70%)' }}
      />

      <div className="px-5 md:px-10 pt-12 md:pt-14 relative">
        <div className="max-w-2xl mx-auto md:mx-0">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-400 mb-4 md:hidden">
            <Icon name="arrow-left" size={16} /> Back
          </button>
          <h1 className="text-3xl text-rally-black mb-1" style={{ fontFamily: 'Circular', letterSpacing: '-0.4px' }}>Post a task</h1>
          <p className="text-sm text-gray-400 mb-8">Tell your neighbours what you need — the more detail, the better the match.</p>

          <div className="bg-white rounded-3xl border border-rally-border shadow-[0_1px_2px_rgba(17,17,16,0.04)] p-6 md:p-8 flex flex-col gap-5">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="relative aspect-video rounded-2xl border-2 border-dashed border-rally-border hover:border-rally-black transition-colors overflow-hidden flex items-center justify-center bg-rally-cream group"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-rally-black transition-colors">
                  <Icon name="image" size={26} />
                  <span className="text-xs">Add a photo (optional)</span>
                </div>
              )}
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => pickImage(e.target.files?.[0])}
              />
            </button>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-400 mb-1.5 block">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mow the lawn this weekend"
                  className="w-full bg-rally-cream border border-rally-border rounded-2xl px-4 py-3 text-sm outline-none focus:border-rally-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-gray-400 mb-1.5 block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Any details a volunteer should know"
                  rows={3}
                  className="w-full bg-rally-cream border border-rally-border rounded-2xl px-4 py-3 text-sm outline-none focus:border-rally-black resize-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-gray-400 mb-1.5 block">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-rally-cream border border-rally-border rounded-2xl px-4 py-3 text-sm outline-none focus:border-rally-black"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-gray-400 mb-1.5 block">Location</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Riverside, 94110"
                  className="w-full bg-rally-cream border border-rally-border rounded-2xl px-4 py-3 text-sm outline-none focus:border-rally-black"
                />
              </div>
            </div>

            {/* Timing */}
            <div className="border-t border-rally-border pt-5">
              <label className="text-xs text-gray-400 mb-2 block">Timing</label>
              <div className="flex gap-2 mb-4">
                {(['once', 'recurring'] as Frequency[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFrequency(f)}
                    className={`flex-1 px-4 py-2.5 rounded-2xl text-sm border transition-all ${
                      frequency === f ? 'bg-rally-black text-white border-rally-black' : 'bg-rally-cream text-gray-500 border-rally-border'
                    }`}
                  >
                    {f === 'once' ? 'One-off' : 'Recurring'}
                  </button>
                ))}
              </div>

              {frequency === 'recurring' && (
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Which days?</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {DAYS.map((d) => (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => toggleDay(d.key)}
                        className={`w-11 h-9 rounded-xl text-xs border transition-all ${
                          recurringDays.includes(d.key) ? 'bg-rally-green text-white border-rally-green' : 'bg-rally-cream text-gray-500 border-rally-border'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-gray-400">{frequency === 'recurring' ? 'Hours per session' : 'Estimated hours'}</label>
                  <span className="text-sm text-rally-black" style={{ fontFamily: 'Circular' }}>{durationHours}h</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={8}
                  step={0.5}
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full accent-rally-black"
                />
              </div>
            </div>

            {/* Budget */}
            <div className="border-t border-rally-border pt-5">
              <label className="text-xs text-gray-400 mb-2 block">Budget</label>
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setIsPaid(false)}
                  className={`flex-1 px-4 py-2.5 rounded-2xl text-sm border transition-all ${
                    !isPaid ? 'bg-rally-black text-white border-rally-black' : 'bg-rally-cream text-gray-500 border-rally-border'
                  }`}
                >
                  Unpaid — volunteer
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaid(true)}
                  className={`flex-1 px-4 py-2.5 rounded-2xl text-sm border transition-all ${
                    isPaid ? 'bg-rally-black text-white border-rally-black' : 'bg-rally-cream text-gray-500 border-rally-border'
                  }`}
                >
                  Paid
                </button>
              </div>

              {isPaid && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-400">Suggested budget</span>
                    <span className="text-2xl text-rally-black" style={{ fontFamily: 'Circular' }}>${budget}</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={MAX_BUDGET}
                    step={5}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full accent-rally-amber"
                  />
                  <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                    <span>$5</span>
                    <span>${MAX_BUDGET}+</span>
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              disabled={!title.trim() || saving}
              onClick={submit}
              className="w-full bg-rally-black text-white rounded-2xl px-6 py-3.5 text-sm disabled:opacity-30 hover:opacity-90 transition-opacity"
              style={{ fontFamily: 'Circular' }}
            >
              {saving ? 'Posting…' : 'Post task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
