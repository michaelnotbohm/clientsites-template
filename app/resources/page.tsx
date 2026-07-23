// app/resources/page.tsx
//
// Resources landing page (the "All" view). Lists every published post and
// renders the city/topic filter bar.
//
// Composition matches the rest of the site (see ApplyPage): getTenant() ->
// ThemeWrapper -> bordered frame -> SiteNav -> <main> -> SiteFooter. The
// resources-specific content (hero + filter + grid) lives inside <main>.

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTenant } from '@/lib/tenant'
import { ThemeWrapper } from '@/components/theme-wrapper'
import { SiteNav } from '@/components/layout/site-nav'
import { SiteFooter } from '@/components/layout/site-footer'
import type { NavLink } from '@/components/layout/site-nav'
import {
  getAllPosts,
  getCategories,
  splitCategories,
} from '@/lib/resources/queries'
import { ResourcesCategoryBar } from '@/components/resources/resources-category-bar'
import { ResourcesPostGrid } from '@/components/resources/resources-post-grid'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Resources',
  description:
    'Mortgage and home-lending guides, tips, and local market resources for the Tampa Bay area.',
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

export default async function ResourcesPage() {
  const tenant = await getTenant()
  if (!tenant) notFound()

  const [posts, categories] = await Promise.all([
    getAllPosts(tenant.id),
    getCategories(tenant.id),
  ])
  const { locationCategories, topicCategories } = splitCategories(categories)

  return (
    <ThemeWrapper tenant={tenant}>
      <div className="min-h-screen flex flex-col">
        <div className="border border-[var(--color-border)] m-2 md:m-4 min-h-[calc(100vh-1rem)] md:min-h-[calc(100vh-2rem)] flex flex-col">
          <SiteNav tenant={tenant} navLinks={DEFAULT_NAV_LINKS} />

          <main className="flex-1">
            {/* Hero */}
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
              <div className="container relative z-10 mx-auto px-4 py-14 md:py-16">
                <h1 className="font-[var(--font-heading)] text-4xl font-bold tracking-tight text-white md:text-5xl">
                  Mortgage Resources for the Tampa Bay Area
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/80">
                  Expert guides, loan-option breakdowns, and local market insights
                  from Bay to Bay Lending.
                </p>
              </div>
            </section>

            {/* Filter bar */}
            <ResourcesCategoryBar
              locationCategories={locationCategories}
              topicCategories={topicCategories}
            />

            {/* Posts */}
            <section className="py-12 md:py-16 bg-[var(--color-surface)]">
              <div className="container mx-auto px-4">
                {posts.length > 0 ? (
                  <ResourcesPostGrid posts={posts} />
                ) : (
                  <p className="text-[var(--color-muted)]">
                    No articles yet — check back soon.
                  </p>
                )}
              </div>
            </section>
          </main>

          <SiteFooter tenant={tenant} />
        </div>
      </div>
    </ThemeWrapper>
  )
}
