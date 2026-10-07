import type { ConnectionStatus } from '../types'

const STATUS_STYLES: Record<ConnectionStatus, { label: string; dot: string; box: string }> = {
  connecting: {
    label: 'Connecting',
    dot: 'bg-amber animate-pulse-dot',
    box: 'border-[#3a3118] bg-[#1a1608] text-amber',
  },
  open: {
    label: 'Live',
    dot: 'bg-accent animate-pulse-dot',
    box: 'border-[#14342b] bg-[#0b1a17] text-accent',
  },
  reconnecting: {
    label: 'Reconnecting',
    dot: 'bg-amber animate-pulse-dot',
    box: 'border-[#3a3118] bg-[#1a1608] text-amber',
  },
  closed: {
    label: 'Offline',
    dot: 'bg-down',
    box: 'border-[#3a1824] bg-[#1a0e16] text-down',
  },
}

export function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  const style = STATUS_STYLES[status]
  return (
    <span
      role="status"
      className={`flex h-[30px] items-center gap-2 rounded-full border px-3 text-[13px] font-semibold ${style.box}`}
    >
      <span className={`h-[7px] w-[7px] rounded-full ${style.dot}`} />
      {style.label}
    </span>
  )
}
