import { useEffect, useState } from 'react'
import { Icon } from '../components/Icon'
import { EmptyState } from '../components/illustrations/EmptyState'
import { useNavigate } from 'react-router-dom'
import { TaskCard } from '../components/TaskCard'
import { supabase } from '../lib/supabase'
import type { Task, TaskApplication } from '../lib/types'

export function Activity() {
  const navigate = useNavigate()
  const [posted, setPosted] = useState<Task[]>([])
  const [applications, setApplications] = useState<TaskApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      const { data: postedTasks } = await supabase
        .from('tasks')
        .select('*, poster:profiles!tasks_poster_id_fkey(*)')
        .eq('poster_id', session.user.id)
        .order('created_at', { ascending: false })
      setPosted((postedTasks as Task[]) ?? [])

      const { data: apps } = await supabase
        .from('task_applications')
        .select('*, task:tasks(*, poster:profiles!tasks_poster_id_fkey(*))')
        .eq('applicant_id', session.user.id)
        .order('applied_at', { ascending: false })
      setApplications((apps as TaskApplication[]) ?? [])

      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-rally-cream pb-24 md:pb-10">
      <div className="bg-white px-5 md:px-10 pt-12 md:pt-10 pb-4 border-b border-rally-border flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 md:hidden">
          <Icon name="arrow-left" size={20} className="text-rally-black" />
        </button>
        <h1 className="text-lg text-rally-black" style={{ fontFamily: 'CoFo Robert' }}>Activity</h1>
      </div>

      <div className="px-5 md:px-10 pt-6 max-w-3xl mx-auto md:mx-0">
        {loading && <p className="text-sm text-gray-400 py-8 text-center">Loading…</p>}

        {!loading && (
          <>
            <p className="text-sm text-rally-black mb-3" style={{ fontFamily: 'CoFo Robert' }}>Tasks you posted</p>
            {posted.length === 0 && (
              <div className="flex flex-col items-center text-center py-8 mb-8 bg-white rounded-3xl border-2 border-dashed border-rally-border">
                <EmptyState variant="tasks" className="w-24 h-24 mb-1" />
                <p className="text-xs text-gray-400">Nothing posted yet.</p>
              </div>
            )}
            {posted.length > 0 && (
              <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 mb-8">
                {posted.map((t) => <TaskCard key={t.id} task={t} />)}
              </div>
            )}

            <p className="text-sm text-rally-black mb-3" style={{ fontFamily: 'CoFo Robert' }}>Your applications</p>
            {applications.length === 0 && (
              <div className="flex flex-col items-center text-center py-8 bg-white rounded-3xl border-2 border-dashed border-rally-border">
                <EmptyState variant="search" className="w-24 h-24 mb-1" />
                <p className="text-xs text-gray-400">No applications yet.</p>
              </div>
            )}
            <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2">
              {applications.map((a) => a.task && (
                <div key={a.id} className="relative">
                  <TaskCard task={a.task} />
                  <span className="absolute top-3 right-3 text-[10px] bg-rally-amber-light text-rally-amber px-2 py-0.5 rounded-full">
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
