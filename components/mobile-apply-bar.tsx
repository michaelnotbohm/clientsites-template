'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Phone, ArrowRight } from 'lucide-react'

// Paths where the Apply action should route to the refinance form.
const REFI_PATHS = ['/refinance', '/heloc']

// Paths where the bar should not appear at all (the form pages themselves,
// and the thank-you page).
const HIDDEN_PATHS = ['/apply', '/apply-refinance', '/connect', '/thank-you']

interface MobileApplyBarProps {
  phone?: string | null
}

export function MobileApplyBar({ phone }: MobileApplyBarProps) {
  const pathname = usePathname()

  if (HIDDEN_PATHS.includes(pathname)) return null

  const isRefi = REFI_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
  const applyHref = isRefi ? '/apply-refinance' : '/apply'

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 md:hidden">
      <div className="border-t border-[var(--color-border)] bg-[var(--color-background)]/95 px-3 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {phone && (
            <Link
              href={'tel:' + phone}
              aria-label="Call us"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-secondary)] transition-colors hover:bg-[var(--color-surface)]"
            >
              <Phone className="h-5 w-5" />
            </Link>
          )}
          <Link
            href={applyHref}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] text-base font-semibold text-[var(--color-secondary)] shadow-md transition-colors hover:bg-[var(--color-accent)]/90"
          >
            Apply Now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
