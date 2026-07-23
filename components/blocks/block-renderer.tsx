import type { Tenant } from '@/lib/tenant'
import type { Section } from './types'
import { getBlockComponent } from './registry'

interface BlockRendererProps {
  sections: Section[]
  tenant: Tenant
}

/**
 * Renders an array of sections using the shared block registry.
 * Unknown block types are silently skipped (never crash).
 */
export function BlockRenderer({ sections, tenant }: BlockRendererProps) {
  return (
    <>
      {sections.map((section) => {
        const Component = getBlockComponent(section.type)

        if (!Component) {
          // Unknown block type - skip silently
          return null
        }

        return (
          <Component
            key={section.id}
            content={section.content}
            tenant={tenant}
            variant={section.variant}
          />
        )
      })}
    </>
  )
}
