'use client'

import { useState, useEffect, useCallback } from 'react'
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import type { BlockProps } from './types'

interface Testimonial {
  quote: string
  author: string
  location?: string
  rating?: number
}

interface TestimonialsContent {
  heading?: string
  testimonials?: Testimonial[]
}

function Stars({ rating }: { rating?: number }) {
  if (!rating || rating <= 0) return null
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < rating
              ? 'h-4 w-4 fill-[var(--color-accent)] text-[var(--color-accent)]'
              : 'h-4 w-4 text-[var(--color-border)]'
          }
        />
      ))}
    </div>
  )
}

export function TestimonialsBlock({ content: rawContent, variant = 'default' }: BlockProps<TestimonialsContent>) {
  const content = rawContent as TestimonialsContent
  const testimonials = content.testimonials || []

  if (testimonials.length === 0) return null

  if (variant === 'carousel') {
    return <TestimonialsCarousel heading={content.heading} testimonials={testimonials} />
  }

  // ---- Default: static grid ----
  return (
    <section className="py-16 lg:py-24 bg-[var(--color-surface)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {content.heading && (
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-center text-[var(--color-secondary)] mb-12 font-[var(--font-heading)]">
            {content.heading}
          </h2>
        )}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, index) => (
            <div
              key={index}
              className="flex flex-col p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <Quote className="h-8 w-8 text-[var(--color-primary)]/30" />
                <Stars rating={t.rating} />
              </div>
              <blockquote className="flex-1">
                <p className="text-[var(--color-foreground)] leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              </blockquote>
              <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                <p className="font-semibold text-[var(--color-foreground)]">{t.author}</p>
                {t.location && <p className="text-sm text-[var(--color-muted)]">{t.location}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialsCarousel({
  heading,
  testimonials,
}: {
  heading?: string
  testimonials: Testimonial[]
}) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = testimonials.length

  const go = useCallback(
    (dir: number) => setIndex((i) => (i + dir + count) % count),
    [count]
  )

  useEffect(() => {
    if (paused || count <= 1) return
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 5000)
    return () => clearInterval(id)
  }, [paused, count])

  const current = testimonials[index]

  return (
    <section className="py-16 lg:py-24 bg-[var(--color-surface)]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {heading && (
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-center text-[var(--color-secondary)] mb-12 font-[var(--font-heading)]">
            {heading}
          </h2>
        )}

        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-8 md:p-12 shadow-sm text-center min-h-[260px] flex flex-col items-center justify-center">
            <Quote className="h-10 w-10 text-[var(--color-primary)]/30 mb-6" />
            <blockquote className="mb-6">
              <p className="text-lg md:text-xl leading-relaxed text-[var(--color-foreground)]">
                &ldquo;{current.quote}&rdquo;
              </p>
            </blockquote>
            <div className="mb-3">
              <Stars rating={current.rating} />
            </div>
            <p className="font-semibold text-[var(--color-foreground)]">{current.author}</p>
            {current.location && (
              <p className="text-sm text-[var(--color-muted)]">{current.location}</p>
            )}
          </div>

          {count > 1 && (
            <>
              <button
                onClick={() => go(-1)}
                aria-label="Previous testimonial"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 md:-translate-x-4 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] shadow-sm hover:bg-[var(--color-surface)] transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => go(1)}
                aria-label="Next testimonial"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 md:translate-x-4 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] shadow-sm hover:bg-[var(--color-surface)] transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {count > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={
                  i === index
                    ? 'h-2 w-6 rounded-full bg-[var(--color-primary)] transition-all'
                    : 'h-2 w-2 rounded-full bg-[var(--color-border)] transition-all hover:bg-[var(--color-muted)]'
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
