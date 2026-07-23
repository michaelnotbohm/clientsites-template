import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getTenant } from '@/lib/tenant'
import { createClient } from '@/lib/supabase/server'
import { ThemeWrapper } from '@/components/theme-wrapper'
import { SiteNav } from '@/components/layout/site-nav'
import { SiteFooter } from '@/components/layout/site-footer'
import { BlockRenderer } from '@/components/blocks/block-renderer'
import type { Section } from '@/components/blocks/types'
import type { NavLink } from '@/components/layout/site-nav'

interface PageProps {
  params: Promise<{ slug?: string[] }>
}

// Default nav links — stored in code until tenant-level nav is persisted in DB.
// hrefs MUST match real published page slugs in the `pages` table.
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

export const revalidate = 60

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const pageSlug = slug?.join('/') || '/'

  const tenant = await getTenant()
  if (!tenant) return { title: 'Page Not Found' }

  const supabase = await createClient()
  const { data: page } = await supabase
    .from('pages')
    .select('title, meta_title, meta_description, og_image, noindex')
    .eq('tenant_id', tenant.id)
    .eq('slug', pageSlug)
    .eq('status', 'published')
    .single()

  if (!page) return { title: 'Page Not Found' }

  const title = page.meta_title || page.title
  const description = page.meta_description || ''

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: tenant.name,
      images: page.og_image ? [page.og_image] : [],
    },
    robots: page.noindex || tenant.noindex ? { index: false, follow: false } : undefined,
  }
}

export default async function CatchAllPage({ params }: PageProps) {
  const { slug } = await params
  const pageSlug = slug?.join('/') || '/'

  const tenant = await getTenant()
  if (!tenant) notFound()

  const supabase = await createClient()

  const { data: page, error: pageError } = await supabase
    .from('pages')
    .select('*')
    .eq('tenant_id', tenant.id)
    .eq('slug', pageSlug)
    .eq('status', 'published')
    .single()

  if (pageError || !page) notFound()

  const { data: sections } = await supabase
    .from('sections')
    .select('*')
    .eq('page_id', page.id)
    .order('sort_order', { ascending: true })

  const pageSections = (sections || []) as Section[]

  const isHome = pageSlug === '/'
  const organizationSchema = isHome
    ? {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': `https://${tenant.domain || 'example.com'}/#organization`,
        name: tenant.name,
        url: `https://${tenant.domain || 'example.com'}`,
        logo: tenant.logo_url,
        telephone: tenant.phone,
        email: tenant.email,
        address:
          tenant.address_line1 || tenant.city
            ? {
                '@type': 'PostalAddress',
                streetAddress: [tenant.address_line1, tenant.address_line2].filter(Boolean).join(' ') || undefined,
                addressLocality: tenant.city || undefined,
                addressRegion: tenant.state || undefined,
                postalCode: tenant.postal_code || undefined,
                addressCountry: 'US',
              }
            : undefined,
        sameAs: Object.values(tenant.social_links).filter(Boolean),
      }
    : null

  return (
    <ThemeWrapper tenant={tenant}>
      <div className="min-h-screen flex flex-col">
        <div className="border border-[var(--color-border)] m-2 md:m-4 min-h-[calc(100vh-1rem)] md:min-h-[calc(100vh-2rem)] flex flex-col">
          <SiteNav tenant={tenant} navLinks={DEFAULT_NAV_LINKS} />

          <main className="flex-1">
            <BlockRenderer sections={pageSections} tenant={tenant} />
          </main>

          <SiteFooter tenant={tenant} />
        </div>
      </div>

      {organizationSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      )}
    </ThemeWrapper>
  )
}
