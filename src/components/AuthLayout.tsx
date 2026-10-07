import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AuthShowcase } from './AuthShowcase'
import { Logo } from './Logo'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
  backTo?: { to: string; label: string }
}

export const linkClassName = 'font-semibold text-accent transition hover:text-[#6ff0b8]'

export function AuthLayout({ title, subtitle, children, footer, backTo }: AuthLayoutProps) {
  return (
    <div className="grid min-h-full lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <AuthShowcase />
      <div className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          {backTo && (
            <Link
              to={backTo.to}
              className="mb-6 inline-block text-sm font-semibold text-muted transition hover:text-ink"
            >
              &larr; {backTo.label}
            </Link>
          )}
          <h1 className="text-[30px] font-extrabold tracking-[-0.02em]">{title}</h1>
          <p className="mt-2 text-[15px] leading-normal text-muted">{subtitle}</p>
          <div className="mt-8 space-y-[18px]">{children}</div>
          {footer && <p className="mt-6 text-center text-sm text-muted">{footer}</p>}
        </div>
      </div>
    </div>
  )
}
