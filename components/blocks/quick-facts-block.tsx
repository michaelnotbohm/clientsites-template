import type { BlockProps } from './types'

interface QuickFact {
  label: string
  value: string
  detail?: string
}

interface QuickFactsContent {
  heading?: string
  facts: QuickFact[]
}

export function QuickFactsBlock({ content }: BlockProps<QuickFactsContent>) {
  const { heading, facts } = content as QuickFactsContent
  if (!facts || facts.length === 0) return null

  return (
    <section className="py-12 md:py-16 bg-[var(--color-surface)]">
      <div className="container mx-auto px-4">
        {heading && (
          <h2 className="mb-8 text-center text-2xl md:text-3xl font-bold font-[var(--font-heading)] text-[var(--color-secondary)]">
            {heading}
          </h2>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6 text-center shadow-sm"
            >
              <div className="text-3xl md:text-4xl font-bold font-[var(--font-heading)] text-[var(--color-primary)]">
                {fact.value}
              </div>
              <div className="mt-2 text-sm font-semibold text-[var(--color-secondary)]">
                {fact.label}
              </div>
              {fact.detail && (
                <div className="mt-1 text-xs text-[var(--color-foreground)]/60">
                  {fact.detail}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
