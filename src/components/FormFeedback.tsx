export function FormError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p
      role="alert"
      className="rounded-[10px] border border-[#3a1824] bg-[#1a0e16] px-3 py-2.5 text-[13px] text-danger"
    >
      {message}
    </p>
  )
}

export function FormNotice({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p
      role="status"
      className="rounded-xl border border-[#14402f] bg-[#0a1d17] px-4 py-3 text-sm leading-normal text-[#cfeee0]"
    >
      {message}
    </p>
  )
}

export const primaryButtonClassName =
  'h-12 w-full cursor-pointer rounded-[10px] border-0 bg-accent text-[15px] font-bold text-[#04120b] transition hover:bg-accent-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60'

export function SubmitButton({
  submitting,
  children,
  busyLabel = 'Please wait…',
}: {
  submitting: boolean
  children: string
  busyLabel?: string
}) {
  return (
    <button type="submit" disabled={submitting} className={primaryButtonClassName}>
      {submitting ? busyLabel : children}
    </button>
  )
}
