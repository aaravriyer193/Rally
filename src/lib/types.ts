export type Intent = 'give' | 'need'

export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  location_text: string | null
  lat: number | null
  lng: number | null
  intent: Intent | null
  bio: string | null
  points: number
  created_at: string
}

export type TaskStatus = 'open' | 'filled' | 'completed' | 'cancelled'
export type Frequency = 'once' | 'recurring'

export interface Task {
  id: string
  poster_id: string
  title: string
  description: string | null
  category: string | null
  budget: number | null
  location_text: string | null
  lat: number | null
  lng: number | null
  status: TaskStatus
  image_url: string | null
  frequency: Frequency
  recurring_days: string[] | null
  duration_hours: number | null
  created_at: string
  poster?: Profile
}

export const DAYS = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
] as const

export type ApplicationStatus = 'pending' | 'selected' | 'rejected' | 'completed'

export interface TaskApplication {
  id: string
  task_id: string
  applicant_id: string
  status: ApplicationStatus
  applied_at: string
  volunteer_confirmed_at: string | null
  poster_confirmed_at: string | null
  applicant?: Profile
  task?: Task
}

export interface Rating {
  id: string
  task_id: string
  rater_id: string
  ratee_id: string
  stars: number
  comment: string | null
  created_at: string
}

export interface Certificate {
  id: string
  volunteer_id: string
  application_id: string
  task_title: string
  hours: number | null
  issued_at: string
}

export interface Milestone {
  id: string
  profile_id: string
  milestone_key: string
  title: string
  detail: string | null
  achieved_at: string
}

// Cumulative achievement thresholds — checked client-side against total
// completed-task hours/count, awarded once (unique on profile+key).
export const HOUR_MILESTONES = [5, 10, 25, 50, 100] as const
export const TASK_MILESTONES = [1, 5, 10, 25] as const

export function hourMilestone(hours: number) {
  return { key: `hours_${hours}`, title: `${hours} Hours of Service`, detail: `Completed ${hours}+ hours of volunteer service on Rally.` }
}
export function taskMilestone(count: number) {
  return { key: `tasks_${count}`, title: count === 1 ? 'First Task Completed' : `${count} Tasks Completed`, detail: `Completed ${count} volunteer task${count === 1 ? '' : 's'} on Rally.` }
}

export interface ProfessionalListing {
  id: string
  profile_id: string
  category: string
  description: string | null
  price_note: string | null
  created_at: string
  profile?: Profile
}

export interface Notification {
  id: string
  user_id: string
  type: string
  content: string
  related_id: string | null
  read: boolean
  created_at: string
}

export const CATEGORIES = [
  'Yard & outdoor',
  'Household chores',
  'Errands',
  'Childcare',
  'Pet care',
  'Tutoring',
  'Tech help',
  'Moving & lifting',
  'Electrical',
  'Plumbing',
  'Handyman',
  'Other',
] as const
