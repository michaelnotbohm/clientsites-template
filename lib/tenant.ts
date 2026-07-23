import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { defaultTheme } from '@/lib/theme'
import type {
  Tenant,
  TenantTheme,
  Page,
  Section,
  Category,
  Post,
  TeamMember,
} from '@/lib/types/database'

export type { Tenant, TenantTheme, Page, Section, Category, Post, TeamMember }

// Resolve & cache tenant per request — returns null instead of throwing on missing env vars
export const getTenant = cache(async (): Promise<Tenant | null> => {
  try {
    const headersList = await headers()
    const host = headersList.get('host') || ''
    const cleanHost = host.toLowerCase().replace(/^www\./, '').split(':')[0]

    const supabase = await createClient()

    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('*')
      .or(`domain.eq.${cleanHost},domains.cs.{${cleanHost}}`)
      .eq('status', 'published')
      .single()

    if (error || !tenant) {
      // Local dev / preview fallback — return first active tenant
      const { data: fallback } = await supabase
        .from('tenants')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: true })
        .limit(1)
        .single()
      if (fallback) return normalizeTenant(fallback)
      return null
    }

    return normalizeTenant(tenant)
  } catch {
    return null
  }
})

// Apply defaults & merge theme
export function normalizeTenant(raw: Record<string, unknown>): Tenant {
  return {
    ...(raw as Tenant),
    theme: { ...defaultTheme, ...(raw.theme as TenantTheme) },
    social_links: (raw.social_links as Record<string, string>) ?? {},
    domains: (raw.domains as string[]) ?? [],
  }
}

// ── Pages ────────────────────────────────────────────────────────────────────

export async function getPage(tenantId: string, slug: string): Promise<Page | null> {
  const supabase = await createClient()

  const { data: page, error } = await supabase
    .from('pages')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !page) return null

  const { data: sections } = await supabase
    .from('sections')
    .select('*')
    .eq('page_id', page.id)
    .order('sort_order', { ascending: true })

  return { ...page, sections: sections ?? [] } as Page
}

export async function getPages(tenantId: string): Promise<Page[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
  if (error) return []
  return data as Page[]
}

// ── Posts ────────────────────────────────────────────────────────────────────

export async function getPosts(
  tenantId: string,
  options?: { categorySlug?: string; limit?: number; offset?: number }
): Promise<Post[]> {
  const supabase = await createClient()

  let query = supabase
    .from('posts')
    .select('*, category:categories(*)')
    .eq('tenant_id', tenantId)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (options?.categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('slug', options.categorySlug)
      .single()
    if (cat) query = query.eq('category_id', cat.id)
  }

  if (options?.limit) query = query.limit(options.limit)
  if (options?.offset) {
    const end = options.offset + (options.limit ?? 10) - 1
    query = query.range(options.offset, end)
  }

  const { data, error } = await query
  if (error) return []
  return data as Post[]
}

export async function getPost(tenantId: string, slug: string): Promise<Post | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .select('*, category:categories(*)')
    .eq('tenant_id', tenantId)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  if (error) return null
  return data as Post
}

// ── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(tenantId: string): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name', { ascending: true })
  if (error) return []
  return data as Category[]
}

// ── Team Members ─────────────────────────────────────────────────────────────

export async function getTeamMembers(tenantId: string): Promise<TeamMember[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('sort_order', { ascending: true })
  if (error) return []
  return data as TeamMember[]
}

// ── Leads ─────────────────────────────────────────────────────────────────────

export async function submitLead(
  tenantId: string,
  lead: {
    source?: string
    full_name?: string
    email?: string
    phone?: string
    subject_type?: string
    message?: string
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('leads')
    .insert({ tenant_id: tenantId, status: 'new', ...lead })
  if (error) return { success: false, error: error.message }
  return { success: true }
}
