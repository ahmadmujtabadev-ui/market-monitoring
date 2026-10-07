import { scorePassword, STRENGTH_COLORS, STRENGTH_LABELS } from '../lib/password'

export function PasswordStrength({ password }: { password: string }) {
  const score = scorePassword(password)
  return (
    <div className="flex items-center gap-2.5" data-testid="password-strength">
      <div className="grid flex-1 grid-cols-4 gap-1">
        {[1, 2, 3, 4].map((bar) => (
          <span
            key={bar}
            className="h-1 rounded-sm"
            style={{ background: password && bar <= score ? STRENGTH_COLORS[score] : '#1d2738' }}
          />
        ))}
      </div>
      <span className="min-w-12 text-right text-xs font-medium text-muted">
        {password ? STRENGTH_LABELS[score] : ''}
      </span>
    </div>
  )
}
