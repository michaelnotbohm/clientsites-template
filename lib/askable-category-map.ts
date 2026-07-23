// lib/askable-category-map.ts
//
// Bay to Bay Lending category resolution for the Askable publish webhook.
//
// This REPLACES SCM Roofing's version of this file. SCM's was built around 8
// fixed counties with hardcoded city→categoryId maps and a county lookup. Bay
// to Bay uses a CITY-ONLY model (no counties) with AUTO-CREATE: if the studio
// sends a city we don't have a category for, we create it on the fly so the
// publish never blocks.
//
// All lookups are tenant-scoped to Bay to Bay. The category discriminator
// column here is `type` ('location' | 'topic'), not SCM's `category_type`.

import { createClient } from '@supabase/supabase-js'

const TENANT_ID = '00000000-0000-0000-0000-0000000000b2'

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

/**
 * Normalize a city into a stable slug, matching the convention used when the
 * 5 seed categories were created (tampa, brandon, sarasota, st-petersburg,
 * clearwater). Lowercase, strip punctuation (so "St. Petersburg" and
 * "St Petersburg" converge), collapse whitespace to single hyphens.
 */
export function citySlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\./g, '')          // "st. petersburg" -> "st petersburg"
    .replace(/[^a-z0-9\s-]/g, '') // drop other punctuation
    .replace(/\s+/g, '-')         // spaces -> hyphens
    .replace(/-+/g, '-')          // collapse repeats
    .replace(/^-|-$/g, '')        // trim hyphens
}

/** Title-case a city name for display when auto-creating ("st petersburg" -> "St Petersburg"). */
function cityDisplayName(raw: string): string {
  return raw
    .trim()
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(' ')
}

/** Does this slug already belong to ANY category (location or topic)? */
export async function isCategorySlug(slug: string): Promise<boolean> {
  const { data } = await admin()
    .from('categories')
    .select('id')
    .eq('tenant_id', TENANT_ID)
    .eq('slug', slug)
    .maybeSingle()
  return !!data
}

/**
 * Resolve the category_id for an incoming article.
 *
 * Priority:
 *   1. If a city is provided, match an existing `location` category by slug.
 *   2. If no match and a city is provided, AUTO-CREATE the location category.
 *   3. If a topic `category` name is provided (and no city), match an existing
 *      `topic` category by slug. Topics are NOT auto-created — an unknown topic
 *      falls through to null rather than spawning stray categories.
 *   4. Otherwise null (post publishes, appears under "All" only).
 *
 * Returns the category id or null. Never throws on a missing category.
 */
export async function resolveCategoryId(
  cityName?: string | null,
  topicName?: string | null
): Promise<string | null> {
  const db = admin()

  // 1 + 2: city → location category (auto-create)
  if (cityName && cityName.trim()) {
    const slug = citySlug(cityName)
    if (slug) {
      const { data: existing } = await db
        .from('categories')
        .select('id')
        .eq('tenant_id', TENANT_ID)
        .eq('slug', slug)
        .eq('type', 'location')
        .maybeSingle()

      if (existing) return existing.id as string

      // Auto-create. Use upsert on the (tenant_id, slug) unique constraint so
      // two near-simultaneous publishes for a new city can't double-insert.
      const display = cityDisplayName(cityName)
      const { data: created, error } = await db
        .from('categories')
        .upsert(
          {
            tenant_id: TENANT_ID,
            name: display,
            slug,
            type: 'location',
            description: `Mortgage and home-lending resources for ${display}, FL.`,
          },
          { onConflict: 'tenant_id,slug' }
        )
        .select('id')
        .single()

      if (!error && created) return created.id as string
      // If the insert raced and another worker won, re-read.
      const { data: reread } = await db
        .from('categories')
        .select('id')
        .eq('tenant_id', TENANT_ID)
        .eq('slug', slug)
        .maybeSingle()
      return reread ? (reread.id as string) : null
    }
  }

  // 3: topic category (match only, no auto-create)
  if (topicName && topicName.trim()) {
    const slug = citySlug(topicName) // same normalization works for topic slugs
    const { data: topic } = await db
      .from('categories')
      .select('id')
      .eq('tenant_id', TENANT_ID)
      .eq('slug', slug)
      .eq('type', 'topic')
      .maybeSingle()
    if (topic) return topic.id as string
  }

  // 4: uncategorized
  return null
}
