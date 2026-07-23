import Link from 'next/link'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react'
import { CTABand } from '@/components/layout/cta-band'
import { cn } from '@/lib/utils'

interface Post {
  id: string
  title: string
  h1: string | null
  slug: string
  excerpt: string | null
  content: string | null
  featured_image_url: string | null
  featured_image_alt: string | null
  meta_title: string | null
  meta_description: string | null
  author: string | null
  published_at: string | null
  reading_time_minutes: number | null
  category?: {
    name: string
    slug: string
  } | null
  tags: string[] | null
}

interface BlogPostLayoutProps {
  post: Post
  relatedPosts?: Post[]
}

export function BlogPostLayout({ post, relatedPosts }: BlogPostLayoutProps) {
  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <>
      {/* Article Header */}
      <article className="pt-24 pb-16 lg:pt-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          {post.category && (
            <Link
              href={`/blog/category/${post.category.slug}`}
              className="inline-block text-sm font-medium text-primary hover:text-primary/80 transition-colors mb-4"
            >
              {post.category.name}
            </Link>
          )}

          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl text-balance">
            {post.h1 || post.title}
          </h1>

          {/* Meta */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {post.author && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {post.author}
              </div>
            )}
            {publishedDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {publishedDate}
              </div>
            )}
            {post.reading_time_minutes && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {post.reading_time_minutes} min read
              </div>
            )}
          </div>
        </div>

        {/* Featured Image */}
        {post.featured_image_url && (
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mt-10">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
              <Image
                src={post.featured_image_url}
                alt={post.featured_image_alt || post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 896px"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-10">
          <div className="prose prose-slate max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
            <ReactMarkdown>{post.content || ''}</ReactMarkdown>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-border">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-3 py-1 text-sm bg-muted rounded-full text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts && relatedPosts.length > 0 && (
        <section className="py-16 lg:py-24 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Related Articles
            </h2>
            <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {relatedPost.featured_image_url && (
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={relatedPost.featured_image_url}
                        alt={relatedPost.featured_image_alt || relatedPost.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    {relatedPost.excerpt && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <CTABand />
    </>
  )
}
