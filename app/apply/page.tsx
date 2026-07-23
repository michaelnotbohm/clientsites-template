import type { Metadata } from 'next'
import { getTenant } from '@/lib/tenant'
import { ThemeWrapper } from '@/components/theme-wrapper'
import { SiteNav } from '@/components/layout/site-nav'
import { SiteFooter } from '@/components/layout/site-footer'
import { ClarkyForm } from '@/components/clarky-form'
import { notFound } from 'next/navigation'
import type { NavLink } from '@/components/layout/site-nav'

export const metadata: Metadata = {
  title: 'Apply for a Home Loan',
  description: 'Start your home loan application with Bay to Bay Lending. A few quick questions and a local loan officer will be in touch.',
}

const DEFAULT_NAV_LINKS: NavLink[] = [
  {
    label: 'Loan Programs',
    href: '/buy',
    children: [
      { label: 'Conventional Mortgages', href: '/loan-options/conventional' },
      { label: 'FHA Loans', href: '/loan-options/fha' },
      { label: 'VA Mortgages', href: '/loan-options/va' },
      { label: 'USDA Loans', href: '/loan-options/usda' },
      { label: 'Jumbo Mortgages', href: '/loan-options/jumbo' },
      { label: 'Refinance', href: '/refinance' },
      { label: 'HELOC', href: '/heloc' },
      { label: 'All Loan Options', href: '/buy' },
    ],
  },
  { label: 'Calculators', href: '/calculators' },
  { label: 'Resources', href: '/resources' },
  { label: 'Loan Originators', href: '/loan-originators' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/connect' },
]

export default async function ApplyPage() {
  const tenant = await getTenant()
  if (!tenant) notFound()

  return (
    <ThemeWrapper tenant={tenant}>
      <div className="min-h-screen flex flex-col">
        <div className="border border-[var(--color-border)] m-2 md:m-4 min-h-[calc(100vh-1rem)] md:min-h-[calc(100vh-2rem)] flex flex-col">
          <SiteNav tenant={tenant} navLinks={DEFAULT_NAV_LINKS} />

          <main className="flex-1">
            <section className="relative overflow-hidden bg-[var(--color-secondary)]">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(135deg, var(--color-secondary) 0%, color-mix(in srgb, var(--color-secondary) 80%, black) 100%)',
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(120% 120% at 85% 15%, color-mix(in srgb, var(--color-primary) 45%, transparent) 0%, transparent 55%)',
                }}
              />
              <div className="absolute left-0 top-0 h-1 w-full bg-[#C8102E]" />
              <div className="container relative z-10 mx-auto px-4 py-14 md:py-16 text-center">
                <h1 className="font-[var(--font-heading)] text-4xl font-bold tracking-tight text-white md:text-5xl">
                  Apply for Your Home Loan
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/80">
                  Answer a few quick questions and a local Bay to Bay loan officer will reach out to guide you from here. No obligation, no pressure.
                </p>
              </div>
            </section>

            <section className="py-12 md:py-16 bg-[var(--color-surface)]">
              <div className="container mx-auto px-4">
                <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--color-border)] bg-[var(--color-background)] p-6 md:p-10 shadow-lg">
                  <ClarkyForm formId="ee86bb42-7154-4b94-ac87-a1d01e06d1dd" />
                </div>
              </div>
            </section>
          </main>

          <SiteFooter tenant={tenant} />
        </div>
      </div>
    </ThemeWrapper>
  )
}
