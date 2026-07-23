// app/api/askable-webhook/route.ts
//
// Receives article publish events from Askable (askable.dev) Content Studio and
// writes them into Bay to Bay Lending's `posts` table.
//
// MIRRORED FROM SCM Roofing's webhook, with these deliberate differences:
//   - SITE_URL is baytobaylending.com. canonical_url is written to the TENANT
//     domain (never the askable.dev blog origin). This is the publish-time
//     guard against the platform-leak bug.
//   - Category resolution is CITY-ONLY with AUTO-CREATE (see
//     lib/askable-category-map.ts). No county model. SCM's resolveCounty /
//     county fields are intentionally gone; target_county is left null.
//   - Cache revalidation uses Next.js revalidatePath() directly — no separate
//     /api/askable-revalidate route or extra secret.
//   - tenant_id is stamped on insert; SCM was single-tenant and relied on a
//     column default. Bay to Bay's posts default tenant_id too, but we set it
//     explicitly so this route stays correct if reused for another tenant.
//   - Bay to Bay's posts table has no `target_service` column (SCM had one);
//     it is not written. Region is left to the column default.
//
// Requests are HMAC-SHA256 signed (x-askable-signature), identical to SCM, so
// the studio's existing destination signing works unchanged — only the secret
// value and target URL differ.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import { resolveCategoryId, isCategorySlug } from '@/lib/askable-category-map'

// ─── Config ──────────────────────────────────────────────────────────────────

const TENANT_ID = '00000000-0000-0000-0000-0000000000b2'
const SITE_URL = 'https://baytobaylending.com'
const BUCKET_NAME = 'Website Photos' // Bay to Bay storage bucket
const MIRROR_IMAGES = process.env.ASKABLE_MIRROR_IMAGES !== 'false' // default on

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// ─── Types ───────────────────────────────────────────────────────────────────

interface AskableWebhookPayload {
  event?: string
  article_id: string

  slug: string
  title: string
  h1?: string
  content_html?: string
  content?: string
  excerpt?: string

  meta_title?: string
  meta_description?: string
  canonical_url?: string
  target_keyword?: string
  focus_keyword?: string
  secondary_keywords?: string[]
  schema_markup?: string | object
  schema_json?: string | object
  tags?: string[]

  city?: string
  state?: string
  city_slug?: string
  city_name?: string
  location_data?: { city?: string; state?: string; country?: string }

  category?: string

  status?: 'draft' | 'published' | 'pending'
  published_at?: string | null
  author?: string
  word_count?: number
  estimated_read_time?: number

  // Bay to Bay specific (mortgage), optional
  loan_type?: string
  target_loan_type?: string

  featured_image_url?: string
  featured_image_alt?: string
  og_image_url?: string
}

// ─── HMAC verification ───────────────────────────────────────────────────────

function verifyAskableSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.ASKABLE_WEBHOOK_SECRET
  if (!secret || !signature) return false

  const provided = signature.startsWith('sha256=') ? signature.slice(7) : signature
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')

  try {
    return crypto.timingSafeEqual(Buffer.from(provided, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

// ─── Content transformation ──────────────────────────────────────────────────
// Strip inline styles (site uses Tailwind prose) and any Askable-branded CTAs.

function stripInlineStyles(html: string): string {
  return html.replace(/\s*style="[^"]*"/gi, '').replace(/\s*style='[^']*'/gi, '')
}

function stripAskableCTAs(html: string): string {
  let cleaned = html

  cleaned = cleaned.replace(/<a[^>]*href="[^"]*askable\.dev[^"]*"[^>]*>.*?<\/a>/gi, '')

  const askablePatterns = [
    /askable\.dev/i,
    /askable\s+score/i,
    /get\s+your\s+free\s+score/i,
    /free\s+askable/i,
    /ready\s+to\s+see\s+how\s+ai\s+platforms\s+view/i,
  ]

  cleaned = cleaned.replace(/<p[^>]*>[\s\S]*?<\/p>/gi, (match) => {
    for (const pattern of askablePatterns) if (pattern.test(match)) return ''
    return match
  })

  cleaned = cleaned.replace(/<div[^>]*>[\s\S]*?<\/div>/gi, (match) => {
    for (const pattern of askablePatterns) if (pattern.test(match)) return ''
    return match
  })

  return cleaned.replace(/\n{3,}/g, '\n\n').trim()
}

function transformContent(html: string): string {
  return stripAskableCTAs(stripInlineStyles(html))
}

// ─── Image mirroring ─────────────────────────────────────────────────────────

async function mirrorImage(sourceUrl: string, slug: string): Promise<string | null> {
  try {
    const res = await fetch(sourceUrl, { redirect: 'follow' })
    if (!res.ok) {
      console.warn(`[askable-webhook] Image fetch failed ${res.status}: ${sourceUrl}`)
      return null
    }

    const contentType = res.headers.get('content-type') ?? 'image/png'
    const ext = contentType.includes('jpeg') ? 'jpg' : contentType.split('/')[1] ?? 'png'
    const buffer = Buffer.from(await res.arrayBuffer())
    const fileName = `askable/${slug}-${Date.now()}.${ext}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, { contentType, upsert: true, cacheControl: '31536000' })

    if (uploadError) {
      console.error('[askable-webhook] Image upload failed:', uploadError)
      return null
    }

    const { data } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(fileName)
    return data.publicUrl
  } catch (err) {
    console.error('[askable-webhook] Image mirror error:', err)
    return null
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function firstDefined<T>(...vals: (T | undefined | null)[]): T | undefined {
  for (const v of vals) if (v !== undefined && v !== null) return v
  return undefined
}

function schemaToJsonb(input: unknown): object | null {
  if (!input) return null
  if (typeof input === 'object') return input as object
  if (typeof input === 'string') {
    try {
      return JSON.parse(input)
    } catch {
      return null
    }
  }
  return null
}

function estimateReadingTime(wordCount?: number): number {
  if (!wordCount || wordCount <= 0) return 5
  return Math.max(1, Math.ceil(wordCount / 200))
}

// ─── Route handler ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const startTime = Date.now()

  const rawBody = await req.text()
  const signature = req.headers.get('x-askable-signature') ?? req.headers.get('x-signature')

  if (!verifyAskableSignature(rawBody, signature)) {
    console.warn('[askable-webhook] Invalid or missing HMAC signature')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: AskableWebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!payload.article_id || !payload.slug || !payload.title) {
    return NextResponse.json(
      { error: 'Missing required fields: article_id, slug, title' },
      { status: 400 }
    )
  }

  // Guard: a post slug must never collide with a category slug (city or topic),
  // or it would shadow a /resources/<city> page in the [slug] route.
  if (await isCategorySlug(payload.slug)) {
    return NextResponse.json(
      {
        error: 'Slug conflicts with an existing category slug',
        slug: payload.slug,
        hint: 'Post slugs cannot match a location or topic category slug',
      },
      { status: 400 }
    )
  }

  try {
    const { data: existing } = await supabaseAdmin
      .from('posts')
      .select('id, slug')
      .eq('tenant_id', TENANT_ID)
      .eq('askable_article_id', payload.article_id)
      .maybeSingle()

    const rawContentHtml = firstDefined(payload.content_html, payload.content) ?? ''
    const contentHtml = transformContent(rawContentHtml)
    const focusKeyword = firstDefined(payload.target_keyword, payload.focus_keyword) ?? ''
    const schemaJson = schemaToJsonb(firstDefined(payload.schema_markup, payload.schema_json))
    const cityName = firstDefined(payload.city_name, payload.city, payload.location_data?.city)
    const state = firstDefined(payload.state, payload.location_data?.state) ?? 'Florida'
    const loanType = firstDefined(payload.target_loan_type, payload.loan_type) ?? null

    // City-only category resolution with auto-create. No county.
    const categoryId = await resolveCategoryId(cityName, payload.category)

    let finalImageUrl = payload.featured_image_url ?? null
    if (finalImageUrl && MIRROR_IMAGES && finalImageUrl.includes('r2.dev')) {
      const mirrored = await mirrorImage(finalImageUrl, payload.slug)
      if (mirrored) finalImageUrl = mirrored
    }

    const postRow = {
      tenant_id: TENANT_ID,
      askable_article_id: payload.article_id,
      slug: payload.slug,
      title: payload.title,
      h1: payload.h1 ?? payload.title,
      content: contentHtml,
      excerpt: payload.excerpt ?? null,
      featured_image_url: finalImageUrl,
      featured_image_alt: payload.featured_image_alt ?? null,
      meta_title: payload.meta_title ?? null,
      meta_description: payload.meta_description ?? null,
      // Canonical ALWAYS points at the tenant domain — never the blog origin.
      canonical_url: `${SITE_URL}/resources/${payload.slug}`,
      focus_keyword: focusKeyword,
      secondary_keywords: payload.secondary_keywords ?? [],
      category_id: categoryId,
      tags: payload.tags ?? [],
      target_city: cityName ?? null,
      target_county: null, // city-only model
      target_loan_type: loanType,
      state: state === 'FL' ? 'Florida' : state,
      author: payload.author ?? 'Bay to Bay Lending',
      status: payload.status ?? 'draft',
      published_at:
        payload.status === 'published'
          ? payload.published_at ?? new Date().toISOString()
          : null,
      word_count: payload.word_count ?? null,
      reading_time_minutes:
        payload.estimated_read_time ?? estimateReadingTime(payload.word_count),
      schema_json: schemaJson,
    }

    let resultId: string
    let action: 'created' | 'updated'

    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('posts')
        .update({ ...postRow, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select('id, slug')
        .single()

      if (error) throw error
      resultId = data.id
      action = 'updated'
    } else {
      // Slug uniqueness is enforced by posts_tenant_id_slug_key. Check first so
      // we can return a clean 409 instead of a raw constraint error when the
      // slug already exists from a non-Askable source.
      const { data: slugConflict } = await supabaseAdmin
        .from('posts')
        .select('id')
        .eq('tenant_id', TENANT_ID)
        .eq('slug', payload.slug)
        .maybeSingle()

      if (slugConflict) {
        return NextResponse.json(
          {
            error: 'Slug already exists from a non-Askable source',
            slug: payload.slug,
            hint: 'Change the slug in Askable or remove the existing post',
          },
          { status: 409 }
        )
      }

      const { data, error } = await supabaseAdmin
        .from('posts')
        .insert(postRow)
        .select('id, slug')
        .single()
      if (error) throw error
      resultId = data.id
      action = 'created'
    }

    // Revalidate the article and the listing surfaces so the change is live now.
    try {
      revalidatePath(`/resources/${payload.slug}`)
      revalidatePath('/resources')
      if (categoryId && cityName) {
        // also bust the city page this post appears on
        const { data: cat } = await supabaseAdmin
          .from('categories')
          .select('slug')
          .eq('id', categoryId)
          .maybeSingle()
        if (cat?.slug) revalidatePath(`/resources/${cat.slug}`)
      }
    } catch (e) {
      console.warn('[askable-webhook] revalidatePath failed (non-fatal):', e)
    }

    return NextResponse.json({
      success: true,
      action,
      post_id: resultId,
      slug: payload.slug,
      url: `${SITE_URL}/resources/${payload.slug}`,
      category_id: categoryId,
      image_mirrored: finalImageUrl !== payload.featured_image_url,
      styles_stripped: true,
      askable_ctas_stripped: true,
      processing_ms: Date.now() - startTime,
    })
  } catch (err) {
    console.error('[askable-webhook] Processing error:', err)
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}

// ─── GET — health check ─────────────────────────────────────────────────────

export async function GET() {
  const hasSecret = !!process.env.ASKABLE_WEBHOOK_SECRET
  const hasSupabase = !!process.env.SUPABASE_SERVICE_ROLE_KEY

  return NextResponse.json({
    service: 'baytobaylending.com askable webhook',
    status: 'ok',
    ready: hasSecret && hasSupabase,
    config: {
      webhook_secret_configured: hasSecret,
      supabase_configured: hasSupabase,
      image_mirroring: MIRROR_IMAGES,
      category_model: 'city-only, auto-create',
      inline_styles: 'stripped (tailwind prose)',
      askable_ctas: 'stripped',
    },
  })
}
