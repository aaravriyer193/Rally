type Weight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'

export function Icon({
  name,
  size = 20,
  weight = 'regular',
  className = '',
}: {
  name: string
  size?: number
  weight?: Weight
  className?: string
}) {
  const prefix = weight === 'regular' ? 'ph' : `ph-${weight}`
  return <i className={`${prefix} ph-${name} ${className}`} style={{ fontSize: size, lineHeight: 1 }} />
}
