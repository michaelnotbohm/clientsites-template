// types/database.ts — synced to live Supabase schema (project toivhpeabwwqilbzbrfb)

export type PublishStatus = 'draft' | 'published' | 'archived'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed' | 'lost'
export type AdminRole = 'super_admin' | 'admin' | 'editor'

// ── Tenant ──────────────────────────────────────────────────────────────────
export interface TenantTheme {
  primary?: string
  primaryForeground?: string
  secondary?: string
  secondaryForeground?: string
  accent?: string
  accentForeground?: string
  background?: string
  surface?: string
  foreground?: string
  muted?: string
  mutedForeground?: string
  border?: string
  fontHeading?: string
  fontBody?: string
  radius?: string
}

export interface Tenant {
  id: string
  name: string
  domain: string | null
  domains: string[]
  logo_url: string | null
  email: string | null
  phone: string | null
  phone_tollfree: string | null
  fax: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  social_links: Record<string, string>
  license_number: string | null
  license_label: string | null
  loan_officer_url: string | null
  theme: TenantTheme
  template_id: string | null
  status: PublishStatus
  noindex: boolean
  created_at: string
  updated_at: string
}

// ── Template ─────────────────────────────────────────────────────────────────
export interface Template {
  id: string
  name: string
  industry: string
  description: string | null
  default_theme: Record<string, unknown>
  default_pages: unknown[]
  created_at: string
}

// ── Page ─────────────────────────────────────────────────────────────────────
export interface Page {
  id: string
  tenant_id: string
  slug: string
  title: string
  meta_title: string | null
  meta_description: string | null
  canonical_url: string | null
  og_image: string | null
  schema_json: Record<string, unknown> | null
  status: PublishStatus
  sort_order: number
  noindex: boolean
  created_at: string
  updated_at: string
  sections?: Section[]
}

// ── Section ──────────────────────────────────────────────────────────────────
export type SectionType =
  | 'hero'
  | 'path_cards'
  | 'scroll_reveal'
  | 'stats'
  | 'testimonials'
  | 'faq'
  | 'cta_band'
  | 'lead_form'
  | 'team_grid'
  | 'loan_products'
  | 'rich_text'
  | 'image_text'
  | 'blog_list'
  | 'loan_product_detail'

export interface Section {
  id: string
  page_id: string
  tenant_id: string
  type: SectionType | string
  variant: string
  content: Record<string, unknown>
  sort_order: number
  created_at: string
  updated_at: string
}

// ── Category ─────────────────────────────────────────────────────────────────
export interface Category {
  id: string
  tenant_id: string
  name: string
  slug: string
  type: string | null
  description: string | null
  created_at: string
}

// ── Post ─────────────────────────────────────────────────────────────────────
export interface Post {
  id: string
  tenant_id: string
  title: string
  h1: string | null
  slug: string
  excerpt: string | null
  content: string | null
  featured_image_url: string | null
  featured_image_alt: string | null
  meta_title: string | null
  meta_description: string | null
  canonical_url: string | null
  focus_keyword: string | null
  secondary_keywords: string[]
  category_id: string | null
  tags: string[]
  target_loan_type: string | null
  target_city: string | null
  target_audience: string | null
  state: string | null
  region: string | null
  author: string | null
  status: PublishStatus
  published_at: string | null
  reading_time_minutes: number | null
  word_count: number | null
  schema_json: Record<string, unknown> | null
  created_at: string
  updated_at: string
  category?: Category
}

// ── TeamMember ────────────────────────────────────────────────────────────────
export interface TeamMember {
  id: string
  tenant_id: string
  name: string
  title: string | null
  license_no: string | null
  phone: string | null
  email: string | null
  photo_url: string | null
  bio: string | null
  sort_order: number
  created_at: string
}

// ── Lead ─────────────────────────────────────────────────────────────────────
export interface Lead {
  id: string
  tenant_id: string
  created_at: string
  source: string | null
  full_name: string | null
  email: string | null
  phone: string | null
  subject_type: string | null
  message: string | null
  status: LeadStatus
  notes: string | null
}

// ── Media ─────────────────────────────────────────────────────────────────────
export interface Media {
  id: string
  tenant_id: string
  url: string
  alt: string | null
  width: number | null
  height: number | null
  folder: string | null
  created_at: string
}

// ── Integration ───────────────────────────────────────────────────────────────
export interface Integration {
  id: string
  tenant_id: string
  ga4_id: string | null
  meta_pixel_id: string | null
  gtm_id: string | null
  other: Record<string, unknown>
  updated_at: string
}

// ── AdminUser ─────────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string
  auth_user_id: string
  tenant_id: string | null
  role: AdminRole
  email: string | null
  full_name: string | null
  created_at: string
}
