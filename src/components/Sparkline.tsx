import { sparklinePath } from '../lib/sparkline'

interface SparklineProps {
  values: number[]
  color: string
  className?: string
}

export function Sparkline({ values, color, className }: SparklineProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 96 28"
      preserveAspectRatio="none"
      className={className ?? 'h-7 w-[104px]'}
    >
      <path
        d={sparklinePath(values)}
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
