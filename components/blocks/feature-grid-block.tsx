import Link from 'next/link'
import { ArrowRight, Home, DollarSign, Shield, FileText, Users, TrendingUp, Building, Key, Briefcase, Heart, Clock, Share2 } from 'lucide-react'
import type { BlockProps, FeatureGridContent } from './types'
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  dollar: DollarSign,
  shield: Shield,
  file: FileText,
  users: Users,
  trending: TrendingUp,
  building: Building,
  key: Key,
  briefcase: Briefcase,
  heart: Heart,
  clock: Clock,
  share: Share2,
}
export function FeatureGridBlock({ content, variant = 'default' }: BlockProps<FeatureGridContent>) {
  const { heading, subheading, intro, items } = content as FeatureGridContent & { intro?: string }

  if (!items || items.length === 0) return null

  const isCards = variant === 'cards'
  const isWhyUs = variant === 'why-us'

  if (isWhyUs) {
    return (
      <section className="py-16 md:py-24 bg-[var(--color-background)]">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl mb-12 text-center">
            {heading && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-[var(--font-heading)] text-[var(--color-secondary)]">
                {heading}
              </h2>
            )}
            {intro && (
              <p className="text-lg text-[var(--color-foreground)]/70 leading-relaxed">
                {intro}
              </p>
            )}
          </div>

          <div className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => {
              const Icon = item.icon ? iconMap[item.icon] : null
              return (
                <div key={index} className="flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    {Icon && <Icon className="h-6 w-6 shrink-0 text-[var(--color-accent)]" />}
                    <h3 className="text-lg font-bold font-[var(--font-heading)] text-[var(--color-secondary)]">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-[var(--color-foreground)]/70 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {(heading || subheading) && (
          <div className="text-center mb-12">
            {heading && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-[var(--font-heading)] text-[var(--color-foreground)]">
                {heading}
              </h2>
            )}
            {subheading && (
              <p className="text-lg text-[var(--color-muted)] max-w-2xl mx-auto">
                {subheading}
              </p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => {
            const Icon = item.icon ? iconMap[item.icon] : null

            const cardContent = (
              <>
                {Icon && (
                  <div className="w-12 h-12 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-[var(--color-primary)]" />
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2 font-[var(--font-heading)] text-[var(--color-foreground)]">
                  {item.title}
                </h3>
                <p className="text-[var(--color-muted)] mb-4 leading-relaxed">
                  {item.body}
                </p>
                {item.href && (
                  <span className="inline-flex items-center text-sm font-medium text-[var(--color-primary)] group-hover:underline">
                    Learn more
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </>
            )

            const cardClassName = `group p-6 rounded-lg transition-all ${
              isCards
                ? 'bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:shadow-lg'
                : 'hover:bg-[var(--color-surface)]'
            } ${item.href ? 'cursor-pointer' : ''}`

            if (item.href) {
              return (
                <Link key={index} href={item.href} className={cardClassName}>
                  {cardContent}
                </Link>
              )
            }

            return (
              <div key={index} className={cardClassName}>
                {cardContent}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
