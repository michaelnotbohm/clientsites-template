// app/resources/[slug]/page.tsx
//
// Dual-purpose route under /resources/<slug>:
//   - If <slug> matches a CATEGORY (city or topic) -> category landing page.
//   - Otherwise -> ARTICLE slug -> full article render.
//
// Composition matches the rest of the site: getTenant() -> ThemeWrapper ->
// bordered frame -> SiteNav -> <main> -> SiteFooter.
//
// Body column note: articles store rendered HTML in `content` (the only body
// column on the posts table). It is injected via dangerouslySetInnerHTML and
// styled by a scoped `.article-body` block (no @tailwindcss/typography plugin;
// no globals.css change). All type/spacing/link styling derives from the
// tenant theme CSS variables.

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getTenant } from '@/lib/tenant'
import { ThemeWrapper } from '@/components/theme-wrapper'
import { SiteNav } from '@/components/layout/site-nav'
import { SiteFooter } from '@/components/layout/site-footer'
import type { NavLink } from '@/components/layout/site-nav'
import {
  getCategoryBySlug,
  getCategoryById,
  getCategories,
  getPostsByCategory,
  getPostBySlug,
  splitCategories,
} from '@/lib/resources/queries'
import { ResourcesCategoryBar } from '@/components/resources/resources-category-bar'
import { ResourcesPostGrid } from '@/components/resources/resources-post-grid'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

function formatDate(dateString: string | null): string | null {
  if (!dateString) return null
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const tenant = await getTenant()
  if (!tenant) return {}

  const category = await getCategoryBySlug(tenant.id, slug)
  if (category) {
    const isLocation = category.type === 'location'
    return {
      title: isLocation
        ? `Mortgage Resources for ${category.name}, FL`
        : `${category.name} — Mortgage Guides`,
      description: category.description ?? undefined,
    }
  }

  const post = await getPostBySlug(tenant.id, slug)
  if (post) {
    return {
      title: post.meta_title || `${post.title} | ${tenant.name}`,
      description: post.meta_description || post.excerpt || undefined,
    }
  }

  return {}
}

export default async function ResourceSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const tenant = await getTenant()
  if (!tenant) notFound()

  const category = await getCategoryBySlug(tenant.id, slug)

  // ── CATEGORY BRANCH ───────────────────────────────────────────────────────
  if (category) {
    const [posts, allCategories] = await Promise.all([
      getPostsByCategory(tenant.id, category.id),
      getCategories(tenant.id),
    ])
    const { locationCategories, topicCategories } = splitCategories(allCategories)
    const isLocation = category.type === 'location'
    const base = `https://${tenant.domain}`
    const pageUrl = `${base}/resources/${category.slug}`

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
                  <nav className="mb-6" aria-label="Breadcrumb">
                    <ol className="flex items-center gap-2 text-sm text-white/60">
                      <li><Link href="/" className="hover:text-white">Home</Link></li>
                      <li>/</li>
                      <li><Link href="/resources" className="hover:text-white">Resources</Link></li>
                      <li>/</li>
                      <li className="text-white/40">{category.name}</li>
                    </ol>
                  </nav>
                  <h1 className="font-[var(--font-heading)] text-4xl font-bold tracking-tight text-white md:text-5xl">
                    {isLocation
                      ? `Mortgage Resources for ${category.name}, FL`
                      : `${category.name} — Mortgage Guides`}
                  </h1>
                  {category.description && (
                    <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/80">
                      {category.description}
                    </p>
                  )}
                  <p className="mt-4 text-sm text-white/60">
                    {posts.length} {posts.length === 1 ? 'article' : 'articles'}
                  </p>
                </div>
              </section>

              <ResourcesCategoryBar
                locationCategories={locationCategories}
                topicCategories={topicCategories}
                currentSlug={category.slug}
              />

              <section className="py-12 md:py-16 bg-[var(--color-surface)]">
                <div className="container mx-auto px-4">
                  {posts.length > 0 ? (
                    <ResourcesPostGrid posts={posts} />
                  ) : (
                    <p className="text-[var(--color-muted)]">No articles in this category yet.</p>
                  )}
                </div>
              </section>
            </main>

            <SiteFooter tenant={tenant} />
          </div>
        </div>

        {/* CollectionPage + (cities) LocalBusiness schema — tenant-domain identity */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: isLocation
                ? `Mortgage Resources for ${category.name}, FL`
                : `${category.name} — Mortgage Guides`,
              description: category.description || undefined,
              url: pageUrl,
              publisher: { '@type': 'Organization', name: tenant.name, url: base },
            }),
          }}
        />
        {isLocation && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FinancialService',
                name: tenant.name,
                url: base,
                areaServed: {
                  '@type': 'City',
                  name: category.name,
                  containedInPlace: { '@type': 'State', name: 'Florida' },
                },
              }),
            }}
          />
        )}
      </ThemeWrapper>
    )
  }

  // ── ARTICLE BRANCH ────────────────────────────────────────────────────────
  const post = await getPostBySlug(tenant.id, slug)
  if (!post) notFound()

  const articleCategory = post.category_id
    ? await getCategoryById(tenant.id, post.category_id)
    : null

  const base = `https://${tenant.domain}`
  const pageUrl = `${base}/resources/${post.slug}`
  const publishedLabel = formatDate(post.published_at)

  // Body: `content` holds rendered HTML; inject directly.
  const htmlBody = post.content

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
                <nav className="mb-6" aria-label="Breadcrumb">
                  <ol className="flex items-center gap-2 text-sm text-white/60">
                    <li><Link href="/" className="hover:text-white">Home</Link></li>
                    <li>/</li>
                    <li><Link href="/resources" className="hover:text-white">Resources</Link></li>
                    {articleCategory && (
                      <>
                        <li>/</li>
                        <li>
                          <Link
                            href={`/resources/${articleCategory.slug}`}
                            className="hover:text-white"
                          >
                            {articleCategory.name}
                          </Link>
                        </li>
                      </>
                    )}
                  </ol>
                </nav>
                <h1 className="font-[var(--font-heading)] max-w-3xl text-4xl font-bold tracking-tight text-white md:text-5xl">
                  {post.title}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/60">
                  {publishedLabel && <span>{publishedLabel}</span>}
                  {publishedLabel && post.reading_time_minutes && (
                    <span className="text-white/30">|</span>
                  )}
                  {post.reading_time_minutes && (
                    <span>{post.reading_time_minutes} min read</span>
                  )}
                </div>
              </div>
            </section>

            {/* Featured image */}
            {post.featured_image_url && (
              <section className="bg-[var(--color-surface)]">
                <div className="container mx-auto px-4 pt-10 md:pt-12">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.featured_image_url}
                    alt={post.featured_image_alt || post.title}
                    className="w-full rounded-lg object-cover"
                  />
                </div>
              </section>
            )}

            {/* Body */}
            <section className="py-10 md:py-14 bg-[var(--color-surface)]">
              <div className="container mx-auto px-4">
                {htmlBody ? (
                  <article
                    className="article-body mx-auto max-w-3xl"
                    dangerouslySetInnerHTML={{ __html: htmlBody }}
                  />
                ) : (
                  <p className="mx-auto max-w-3xl text-[var(--color-muted)]">
                    {post.excerpt}
                  </p>
                )}

                <div className="mx-auto mt-12 max-w-3xl">
                  <Link
                    href="/resources"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:underline"
                  >
                    ← Back to Resources
                  </Link>
                </div>
              </div>
            </section>
          </main>

          <SiteFooter tenant={tenant} />
        </div>
      </div>

      {/* Scoped article typography — driven entirely by tenant theme tokens.
          No @tailwindcss/typography plugin; no globals.css dependency. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .article-body {
              color: var(--color-foreground, #1f2937);
              font-size: 1.125rem;
              line-height: 1.8;
            }
            .article-body > *:first-child {
              margin-top: 0;
            }
            .article-body p {
              margin: 0 0 1.5rem;
            }
            .article-body h2 {
              font-family: var(--font-heading);
              color: var(--color-secondary);
              font-size: 1.875rem;
              line-height: 1.25;
              font-weight: 700;
              letter-spacing: -0.01em;
              margin: 3rem 0 1.25rem;
            }
            .article-body h3 {
              font-family: var(--font-heading);
              color: var(--color-secondary);
              font-size: 1.5rem;
              line-height: 1.3;
              font-weight: 700;
              margin: 2.5rem 0 1rem;
            }
            .article-body h4 {
              font-family: var(--font-heading);
              color: var(--color-secondary);
              font-size: 1.25rem;
              line-height: 1.35;
              font-weight: 700;
              margin: 2rem 0 0.75rem;
            }
            .article-body a {
              color: var(--color-primary);
              text-decoration: underline;
              text-underline-offset: 2px;
              font-weight: 500;
            }
            .article-body a:hover {
              text-decoration: none;
            }
            .article-body strong {
              color: var(--color-secondary);
              font-weight: 700;
            }
            .article-body ul,
            .article-body ol {
              margin: 0 0 1.5rem;
              padding-left: 1.5rem;
            }
            .article-body ul {
              list-style: disc;
            }
            .article-body ol {
              list-style: decimal;
            }
            .article-body li {
              margin: 0 0 0.5rem;
              padding-left: 0.25rem;
            }
            .article-body li::marker {
              color: var(--color-primary);
            }
            .article-body blockquote {
              margin: 2rem 0;
              padding: 1rem 1.5rem;
              border-left: 4px solid var(--color-primary);
              background: color-mix(in srgb, var(--color-primary) 6%, transparent);
              font-style: italic;
              color: var(--color-muted, #4b5563);
            }
            .article-body blockquote p:last-child {
              margin-bottom: 0;
            }
            .article-body img {
              border-radius: 0.5rem;
              margin: 2rem 0;
              max-width: 100%;
              height: auto;
            }
            .article-body hr {
              border: 0;
              border-top: 1px solid var(--color-border);
              margin: 3rem 0;
            }
            .article-body h2:first-child,
            .article-body h3:first-child {
              margin-top: 0;
            }
          `,
        }}
      />

      {/* BlogPosting schema — tenant-domain identity */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.meta_description || post.excerpt || undefined,
            image: post.featured_image_url || undefined,
            datePublished: post.published_at || undefined,
            url: pageUrl,
            mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
            author: { '@type': 'Organization', name: tenant.name, url: base },
            publisher: { '@type': 'Organization', name: tenant.name, url: base },
          }),
        }}
      />
    </ThemeWrapper>
  )
}
