'use client'

import { useEffect, useRef } from 'react'
import type { BlockProps } from './types'

interface ClarkyFormContent {
  formId?: string
  heading?: string
  intro?: string
  mapEmbedUrl?: string
}

export function ClarkyFormBlock({ content, variant = 'default' }: BlockProps<ClarkyFormContent>) {
  const c = content as ClarkyFormContent
  const formId = c.formId
  const containerRef = useRef<HTMLDivElement>(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (!formId || loadedRef.current) return
    loadedRef.current = true

    const container = containerRef.current
    if (!container) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `https://clarky.ai/form/${formId}/embed.css`
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = `https://clarky.ai/form/${formId}/embed.js`
    script.setAttribute('data-container', container.id)
    script.async = true
    container.appendChild(script)

    return () => {
      loadedRef.current = false
      link.remove()
      script.remove()
      if (container) container.innerHTML = ''
    }
  }, [formId])

  if (!formId) return null

  const isSplitMap = variant === 'split-map' && c.mapEmbedUrl

  const formCard = (
    <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-background)] p-6 md:p-10 shadow-lg">
      <div id={`clarky-form-${formId}`} ref={containerRef} className="w-full" />
    </div>
  )

  if (isSplitMap) {
    return (
      <section className="py-12 md:py-16 bg-[var(--color-surface)]">
        <div className="container mx-auto px-4">
          {(c.heading || c.intro) && (
            <div className="mx-auto max-w-2xl text-center mb-8">
              {c.heading && (
                <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-heading)] text-[var(--color-secondary)]">
                  {c.heading}
                </h2>
              )}
              {c.intro && (
                <p className="mt-4 text-lg leading-relaxed text-[var(--color-foreground)]/70">
                  {c.intro}
                </p>
              )}
            </div>
          )}
          <div className="mx-auto grid max-w-6xl items-stretch gap-6 lg:grid-cols-2">
            <div className="flex flex-col">
              {formCard}
            </div>
            <div className="min-h-[420px] overflow-hidden rounded-3xl border border-[var(--color-border)] shadow-lg">
              <iframe
                src={c.mapEmbedUrl}
                title="Office location map"
                className="h-full min-h-[420px] w-full border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 md:py-16 bg-[var(--color-surface)]">
      <div className="container mx-auto px-4">
        {(c.heading || c.intro) && (
          <div className="mx-auto max-w-2xl text-center mb-8">
            {c.heading && (
              <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-heading)] text-[var(--color-secondary)]">
                {c.heading}
              </h2>
            )}
            {c.intro && (
              <p className="mt-4 text-lg leading-relaxed text-[var(--color-foreground)]/70">
                {c.intro}
              </p>
            )}
          </div>
        )}
        <div className="mx-auto max-w-3xl">
          {formCard}
        </div>
      </div>
    </section>
  )
}
