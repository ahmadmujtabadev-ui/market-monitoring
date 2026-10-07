import type { ReactNode } from 'react'

export const panelClassName = 'rounded-[18px] border border-line bg-panel'

export function Panel({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`${panelClassName} p-6 ${className}`}>
      <h2 className="text-lg font-bold">{title}</h2>
      {children}
    </section>
  )
}
