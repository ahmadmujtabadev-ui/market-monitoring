export function LogoMark({ className = 'h-9 w-9' }: { className?: string }) {
  return <img src="/logo.svg" alt="" aria-hidden className={className} />
}

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <LogoMark />
      <div className="text-lg font-bold tracking-[-0.01em]">Market Monitor</div>
    </div>
  )
}
