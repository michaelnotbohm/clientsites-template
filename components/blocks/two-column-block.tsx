import type { BlockProps, TwoColumnContent, ChildBlock } from './types'
import { getEmbeddableComponent } from './registry'

// =============================================================================
// components/blocks/two-column-block.tsx
//
// Generic layout primitive: renders two child blocks side by side. Each child
// is looked up from the shared block registry and rendered in EMBEDDED mode
// (no outer section chrome), so this block owns the section padding, optional
// heading, container, and the responsive two-column grid.
//
// Industry-agnostic and reusable: any two embeddable blocks can be composed
// (rates + calculator, testimonial + image, faq + form, ...). The children are
// defined inline in this block's content JSON — no schema/nesting change.
//
// content shape (TwoColumnContent):
//   { heading?, subheading?, left: ChildBlock, right: ChildBlock,
//     ratio?: '1:1'|'5:7'|'7:5'|'4:6'|'6:4', align?: 'start'|'center'|'stretch' }
//
// On mobile the columns stack (left on top). Unknown / non-embeddable child
// types render nothing (never crash), matching the renderer's skip behavior.
// =============================================================================

// Desktop column templates per ratio. Mobile is always single-column (stack).
const RATIO_CLASS: Record<NonNullable<TwoColumnContent['ratio']>, string> = {
  '1:1': 'lg:grid-cols-2',
  '5:7': 'lg:grid-cols-[5fr_7fr]',
  '7:5': 'lg:grid-cols-[7fr_5fr]',
  '4:6': 'lg:grid-cols-[4fr_6fr]',
  '6:4': 'lg:grid-cols-[6fr_4fr]',
}

const ALIGN_CLASS: Record<NonNullable<TwoColumnContent['align']>, string> = {
  start: 'items-start',
  center: 'items-center',
  stretch: 'items-stretch',
}

export function TwoColumnBlock({ content, tenant }: BlockProps<TwoColumnContent>) {
  const c = content as TwoColumnContent
  const ratioClass = RATIO_CLASS[c.ratio ?? '1:1']
  const alignClass = ALIGN_CLASS[c.align ?? 'stretch']

  const renderChild = (child: ChildBlock | undefined) => {
    if (!child || !child.type) return null
    const Component = getEmbeddableComponent(child.type)
    if (!Component) return null
    return (
      <Component
        content={child.content}
        tenant={tenant}
        variant={child.variant}
        embedded
      />
    )
  }

  const left = renderChild(c.left)
  const right = renderChild(c.right)

  return (
    <section className="py-16 md:py-24 bg-[var(--color-surface)]">
      <div className="container mx-auto px-4">
        {(c.heading || c.subheading) && (
          <div className="mx-auto max-w-2xl text-center mb-10">
            {c.heading && (
              <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-heading)] text-[var(--color-secondary)]">
                {c.heading}
              </h2>
            )}
            {c.subheading && (
              <p className="mt-4 text-lg leading-relaxed text-[var(--color-foreground)]/70">
                {c.subheading}
              </p>
            )}
          </div>
        )}

        <div className={`grid grid-cols-1 gap-8 ${ratioClass} ${alignClass}`}>
          <div className="min-w-0">{left}</div>
          <div className="min-w-0">{right}</div>
        </div>
      </div>
    </section>
  )
}
