import { useEffect } from 'react'
import { useToastStore, type Toast, type ToastKind } from '../stores/toastStore'

const AUTO_DISMISS_MS = 6000

const KIND_STYLES: Record<ToastKind, { box: string; label: string }> = {
  alert: { box: 'border-[#3a3118]', label: 'text-amber' },
  success: { box: 'border-[#14402f]', label: 'text-accent' },
  error: { box: 'border-[#3a1824]', label: 'text-danger' },
}

const KIND_LABELS: Record<Exclude<ToastKind, 'alert'>, string> = {
  success: 'Success',
  error: 'Error',
}

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((state) => state.dismiss)

  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [toast.id, dismiss])

  const style = KIND_STYLES[toast.kind]
  const label = toast.kind === 'alert' ? toast.title : KIND_LABELS[toast.kind]
  const text = toast.kind === 'alert' ? toast.message : toast.title

  return (
    <div
      role="status"
      className={`pointer-events-auto w-80 animate-slide-in rounded-[14px] border bg-[#121a2a] px-4 py-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${style.box}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-xs font-bold uppercase tracking-[0.06em] ${style.label}`}>{label}</p>
          {text && <p className="mt-1.5 text-[15px] font-semibold text-ink">{text}</p>}
        </div>
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={() => dismiss(toast.id)}
          className="cursor-pointer text-lg leading-none text-dim hover:text-ink"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts)
  return (
    <div className="pointer-events-none fixed right-4 top-[84px] z-50 flex flex-col gap-3 sm:right-8">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
