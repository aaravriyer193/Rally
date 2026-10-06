import { Link } from 'react-router-dom'
import { Icon } from './Icon'
import type { Task } from '../lib/types'

export function TaskCard({ task, distanceKm }: { task: Task; distanceKm?: number | null }) {
  return (
    <Link
      to={`/tasks/${task.id}`}
      className="block bg-white rounded-2xl border border-rally-border overflow-hidden shadow-[0_1px_2px_rgba(17,17,16,0.04)] hover:shadow-[0_8px_20px_rgba(17,17,16,0.08)] hover:-translate-y-0.5 transition-all duration-200"
    >
      {task.image_url ? (
        <img src={task.image_url} alt="" className="w-full h-36 object-cover" />
      ) : (
        <div className="w-full h-36 bg-rally-cream flex items-center justify-center">
          <Icon name="image" size={26} className="text-rally-border" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-rally-black" style={{ fontFamily: 'CoFo Robert' }}>{task.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{task.poster?.full_name || task.poster?.username || 'Neighbour'}</p>
          </div>
          {task.category && (
            <span className="text-[10px] bg-rally-cream text-gray-500 px-2 py-0.5 rounded-full flex-shrink-0">{task.category}</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          {task.location_text && (
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Icon name="map-pin" size={12} />
              {distanceKm != null ? `${distanceKm < 1 ? '<1' : distanceKm.toFixed(1)} km` : task.location_text}
            </span>
          )}
          {task.budget != null && (
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Icon name="currency-dollar" size={12} /> {task.budget}
            </span>
          )}
          <span className="flex items-center gap-1 text-[11px] text-gray-400">
            <Icon name="clock" size={12} /> {task.status}
          </span>
        </div>
        {task.frequency === 'recurring' && (
          <span className="inline-flex items-center gap-1 text-[11px] bg-rally-green-light text-rally-green px-2 py-0.5 rounded-full mt-2">
            <Icon name="repeat" size={11} />
            {task.recurring_days?.length ? task.recurring_days.map((d) => d[0].toUpperCase() + d.slice(1, 3)).join(', ') : 'Recurring'}
            {task.duration_hours ? ` · ${task.duration_hours}h` : ''}
          </span>
        )}
      </div>
    </Link>
  )
}
