import type { Tenant } from '@/lib/tenant'
import { getThemeStyleObject } from '@/lib/theme'

interface ThemeWrapperProps {
  tenant: Tenant
  children: React.ReactNode
}

/**
 * Injects tenant CSS custom properties so every block can reference
 * var(--color-primary), var(--font-heading), etc. without hard-coding values.
 */
export function ThemeWrapper({ tenant, children }: ThemeWrapperProps) {
  const themeStyles = getThemeStyleObject(tenant.theme)

  return (
    <div
      style={themeStyles}
      className="min-h-screen"
    >
      {children}
    </div>
  )
}
