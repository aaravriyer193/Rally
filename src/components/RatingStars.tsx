import { Icon } from './Icon'

export function RatingStars({ value, onChange, size = 16 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const stars = [1, 2, 3, 4, 5]
  return (
    <div className="flex items-center gap-0.5">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(s)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
        >
          <Icon
            name="star"
            weight="fill"
            size={size}
            className={s <= value ? 'text-rally-amber' : 'text-gray-300'}
          />
        </button>
      ))}
    </div>
  )
}
