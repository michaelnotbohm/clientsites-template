import type { BlockProps } from './types'

interface ProcessStep {
  title: string
  body: string
}

interface ProcessTimelineContent {
  heading?: string
  intro?: string
  steps: ProcessStep[]
}

export function ProcessTimelineBlock({ content }: BlockProps<ProcessTimelineContent>) {
  const { heading, intro, steps } = content as ProcessTimelineContent
  if (!steps || steps.length === 0) return null

  return (
    <section className="py-16 md:py-24 bg-[var(--color-background)]">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-12">
          {heading && (
            <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-heading)] text-[var(--color-secondary)]">
              {heading}
            </h2>
          )}
          {intro && (
            <p className="mt-4 text-lg leading-relaxed text-[var(--color-foreground)]/70">
              {intro}
            </p>
          )}
        </div>

        <div className="mx-auto max-w-2xl">
          {steps.map((step, i) => (
            <div key={i} className="relative flex gap-6 pb-10 last:pb-0">
              {i < steps.length - 1 && (
                <div className="absolute left-6 top-12 h-full w-px bg-[var(--color-border)]" />
              )}
              <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-lg font-bold text-white font-[var(--font-heading)]">
                {i + 1}
              </div>
              <div className="pt-1.5">
                <h3 className="text-xl font-bold font-[var(--font-heading)] text-[var(--color-secondary)]">
                  {step.title}
                </h3>
                <p className="mt-2 leading-relaxed text-[var(--color-foreground)]/70">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
