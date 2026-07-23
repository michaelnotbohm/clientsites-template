import { createClient } from "@/lib/supabase/server"
import { createStaticClient } from "@/lib/supabase/static"
import { notFound } from "next/navigation"
import { PageShell } from "@/components/layout/page-shell"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock, ArrowLeft, Tag } from "lucide-react"
import type { Metadata } from "next"

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  featured_image_url: string | null
  featured_image_alt: string | null
  published_at: string
  reading_time_minutes: number | null
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
}

interface PageProps {
  params: Promise<{ categorySlug: string }>
}

async function getCategory(slug: string): Promise<Category | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error || !data) {
    return null
  }

  return data as Category
}

async function getPostsByCategory(categoryId: string): Promise<Post[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("posts")
    .select(`
      id,
      title,
      slug,
      excerpt,
      featured_image_url,
      featured_image_alt,
      published_at,
      reading_time_minutes
    `)
    .eq("status", "published")
    .eq("category_id", categoryId)
    .order("published_at", { ascending: false })

  if (error) {
    console.error("Error fetching posts:", error)
    return []
  }

  return data || []
}

async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("type", "blog")
    .order("name")

  return data || []
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorySlug } = await params
  const category = await getCategory(categorySlug)

  if (!category) {
    return {
      title: "Category Not Found | Bay to Bay Lending",
    }
  }

  return {
    title: `${category.name} Articles | Bay to Bay Lending`,
    description: category.description || `Browse our ${category.name} articles and resources.`,
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { categorySlug } = await params
  const category = await getCategory(categorySlug)

  if (!category) {
    notFound()
  }

  const [posts, allCategories] = await Promise.all([
    getPostsByCategory(category.id),
    getAllCategories(),
  ])

  return (
    <PageShell>
      {/* Hero */}
      <section className="border-b border-border/40 bg-muted/30 py-12 md:py-16">
        <div className="container">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Resources
          </Link>
          <h1 className="font-serif text-4xl font-light tracking-tight md:text-5xl">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {category.description}
            </p>
          )}
        </div>
      </section>

      {/* Category Nav */}
      <section className="border-b border-border/40 py-4">
        <div className="container">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/resources"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              All
            </Link>
            {allCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/resources/category/${cat.slug}`}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  cat.slug === categorySlug
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                <Tag className="h-3 w-3" />
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Post Grid */}
      <section className="py-12 md:py-16">
        <div className="container">
          {posts.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/resources/${post.slug}`}
                  className="group block"
                >
                  <article className="flex h-full flex-col">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-muted">
                      {post.featured_image_url ? (
                        <Image
                          src={post.featured_image_url}
                          alt={post.featured_image_alt || post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-2xl font-serif text-muted-foreground/30">B2B</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex flex-1 flex-col">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(post.published_at)}
                        </span>
                        {post.reading_time_minutes && (
                          <>
                            <span className="text-border">|</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.reading_time_minutes} min read
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="mt-2 font-serif text-xl font-light tracking-tight transition-colors group-hover:text-primary">
                        {post.title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">
                No articles in this category yet. Check back soon!
              </p>
              <Link
                href="/resources"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                View all articles
              </Link>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  )
}

export async function generateStaticParams() {
  try {
    const supabase = createStaticClient()
    const { data } = await supabase
      .from("categories")
      .select("slug")
      .eq("type", "blog")

    return (data || []).map((category) => ({
      categorySlug: category.slug,
    }))
  } catch {
    // Return empty array if Supabase is not configured yet
    return []
  }
}
