import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { usePricesStore } from '../stores/pricesStore'
import { ConnectionBadge } from './ConnectionBadge'
import { Logo } from './Logo'

export function AppHeader({ showConnection = true }: { showConnection?: boolean }) {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const connection = usePricesStore((state) => state.connection)

  return (
    <header className="sticky top-0 z-10 border-b border-line-soft bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1304px] items-center justify-between px-4 sm:px-8">
        <Link to="/" aria-label="Dashboard">
          <Logo />
        </Link>
        <div className="flex items-center gap-4">
          {showConnection && <ConnectionBadge status={connection} />}
          <Link
            to="/settings"
            className="flex items-center gap-2.5 text-sm text-label transition hover:text-ink"
          >
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#1a2638] text-[13px] font-bold text-ink">
              {(user?.name ?? 'A').trim()[0]?.toUpperCase()}
            </span>
            <span className="hidden sm:inline">{user?.name}</span>
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="h-9 cursor-pointer rounded-[10px] border border-edge bg-transparent px-4 text-sm font-semibold text-ink transition hover:bg-[#111a2a]"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
