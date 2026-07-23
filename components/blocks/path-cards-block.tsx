import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import type { BlockProps, PathCardsContent } from './types'

export function PathCardsBlock({ content, variant = 'default' }: BlockProps<PathCardsContent>) {
  const { cards, heading } = content as PathCardsContent & { heading?: string }

  if (!cards || cards.length === 0) return null

  const isGrid = variant === 'grid'
  const isOverlap = variant === 'overlap'
  const isSimple = variant === 'simple'

  // ---- Simple variant: text-only cards, no image (for category links) ----
  if (isSimple) {
    return (
      <section className="py-16 md:py-24 bg-[var(--color-background)]">
        <div className="container mx-auto px-4">
          {heading && (
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-center text-[var(--color-secondary)] mb-12 font-[var(--font-heading)]">
              {heading}
            </h2>
          )}
          <div className="grid gap-6 md:grid-cols-3">
            {cards.map((card, index) => (
              <Link
                key={index}
                href={card.href}
                className="group flex flex-col items-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-8 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="mb-3 text-2xl md:text-3xl font-bold text-[var(--color-secondary)] font-[var(--font-heading)]">
                  {card.label}
                </h3>
                {card.description && (
                  <p className="mb-6 flex-1 leading-relaxed text-[var(--color-foreground)]/75">
                    {card.description}
                  </p>
                )}
                <span className="inline-flex items-center text-sm font-semibold text-[var(--color-accent)] group-hover:underline">
                  Learn More
                  <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // ---- Overlap variant: white cards that lift up into the hero above ----
  if (isOverlap) {
    return (
      <section className="relative z-20 -mt-20 md:-mt-32 lg:-mt-40 pb-16 md:pb-24">
        <div className="container mx-auto px-4">
          {heading && (
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-center text-[var(--color-secondary)] mb-12 font-[var(--font-heading)]">
              {heading}
            </h2>
          )}
          <div className="grid gap-6 md:grid-cols-3">
            {cards.map((card, index) => (
              <Link
                key={index}
                href={card.href}
                className="group flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-7 shadow-lg transition-shadow hover:shadow-xl"
              >
                <h3 className="mb-2 text-xl font-bold text-[var(--color-secondary)] font-[var(--font-heading)]">
                  {card.label}
                </h3>
                {card.description && (
                  <p className="mb-5 flex-1 text-sm leading-relaxed text-[var(--color-foreground)]/75">
                    {card.description}
                  </p>
                )}
                <span className="inline-flex items-center text-sm font-semibold text-[var(--color-accent)] group-hover:underline">
                  Learn More
                  <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // ---- Grid variant: image-top, text-below white cards (matches screenshot) ----
  if (isGrid) {
    return (
      <section className="py-16 md:py-24 bg-[var(--color-background)]">
        <div className="container mx-auto px-4">
          {heading && (
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-center text-[var(--color-secondary)] mb-12 font-[var(--font-heading)]">
              {heading}
            </h2>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, index) => (
              <div
                key={index}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {card.image && (
                    <Image
                      src={card.image}
                      alt={card.label}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="mb-2 text-xl font-bold text-[var(--color-secondary)] font-[var(--font-heading)]">
                    {card.label}
                  </h3>
                  {card.description && (
                    <p className="mb-4 flex-1 text-sm leading-relaxed text-[var(--color-foreground)]/75">
                      {card.description}
                    </p>
                  )}
                  <Link
                    href={card.href}
                    className="inline-flex items-center text-sm font-semibold text-[var(--color-accent)] hover:underline"
                  >
                    Learn More
                    <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // ---- Default variant: image-overlay cards (unchanged) ----
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <Link
              key={index}
              href={card.href}
              className="group relative overflow-hidden rounded-lg aspect-[4/3] block"
            >
              {card.image && (
                <Image
                  src={card.image}
                  alt={card.label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                <h3 className="text-2xl font-bold mb-2 font-[var(--font-heading)]">
                  {card.label}
                </h3>
                {card.description && (
                  <p className="text-white/80 text-sm mb-4 line-clamp-2">
                    {card.description}
                  </p>
                )}
                <span className="inline-flex items-center text-sm font-medium text-[var(--color-accent)] group-hover:underline">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
