import type { TenantTheme } from '@/lib/types/database'
import type React from 'react'

/**
 * Generate inline style object from flat TenantTheme tokens.
 * The theme jsonb in the DB stores flat keys matching TenantTheme fields.
 */
export function getThemeStyleObject(theme: TenantTheme): React.CSSProperties {
  const styles: Record<string, string> = {}

  const map: Record<keyof TenantTheme, string> = {
    primary:            '--color-primary',
    primaryForeground:  '--color-primary-foreground',
    secondary:          '--color-secondary',
    secondaryForeground:'--color-secondary-foreground',
    accent:             '--color-accent',
    accentForeground:   '--color-accent-foreground',
    background:         '--color-background',
    surface:            '--color-surface',
    foreground:         '--color-foreground',
    muted:              '--color-muted',
    mutedForeground:    '--color-muted-foreground',
    border:             '--color-border',
    fontHeading:        '--font-heading',
    fontBody:           '--font-body',
    radius:             '--radius',
  }

  for (const [key, cssVar] of Object.entries(map) as [keyof TenantTheme, string][]) {
    const value = theme[key]
    if (value) {
      // Font keys are passed as-is; color keys may need hex→CSS-var treatment
      styles[cssVar] = value as string
    }
  }

  return styles as React.CSSProperties
}

/** Default Bay to Bay teal theme — used as fallback when tenant.theme is empty */
export const defaultTheme: TenantTheme = {
  primary:             '#0E7C86',
  primaryForeground:   '#FFFFFF',
  secondary:           '#1B3A5B',
  secondaryForeground: '#FFFFFF',
  accent:              '#F5B301',
  accentForeground:    '#1B3A5B',
  background:          '#FFFDF8',
  surface:             '#FFFFFF',
  foreground:          '#1B3A5B',
  muted:               '#6B7280',
  mutedForeground:     '#9CA3AF',
  border:              '#E5E7EB',
  fontHeading:         'Plus Jakarta Sans',
  fontBody:            'Plus Jakarta Sans',
  radius:              '0.5rem',
}
