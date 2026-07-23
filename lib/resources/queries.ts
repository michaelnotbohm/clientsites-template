// lib/resources/queries.ts
//
// Server-side data access for the Resources (blog) surface.
//
// Adapted from the SCM Roofing pattern, with two deliberate differences for the
// Bay to Bay tenant's actual schema:
//   1. The category discriminator column here is `type` (values 'location' |
//      'topic'), NOT SCM's `category_type`.
//   2. There is NO `county` column and NO county grouping — this tenant uses a
//      flat, city-only filter (per product decision). If county grouping is
//      added later, reintroduce it here and in the filter bar.
//
// URL model (matches SCM): articles live FLAT at /resources/<post-slug>.
// City pages are CATEGORY pages at /resources/<city-slug>. The city is never a
// path segment on an article URL.
//
// Body column note: the posts table has exactly one body column, `content`,
// which stores rendered HTML (verified against production data). There is no
// `content_html` and no `body` column — selecting either 400s the whole query
// in PostgREST and silently returns null (the cause of the article 404s).
//
// All queries are tenant-scoped. Pass the resolved tenantId from your existing
// host-based tenant resolver.
import { createClient } from "@supabase/supabase-js";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
function db() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
export interface ResourceCategory {
  id: string;
  name: string;
  slug: string;
  type: string | null; // 'location' | 'topic' | null
  description: string | null;
}
export interface ResourcePost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  published_at: string | null;
  reading_time_minutes: number | null;
  target_city: string | null;
  category_id: string | null;
  category?: ResourceCategory | null;
}
export interface ResourceArticle extends ResourcePost {
  content: string | null;
  meta_title: string | null;
  meta_description: string | null;
}
const POST_FIELDS =
  "id, slug, title, excerpt, featured_image_url, featured_image_alt, published_at, reading_time_minutes, target_city, category_id";
const ARTICLE_FIELDS =
  "id, slug, title, excerpt, featured_image_url, featured_image_alt, published_at, reading_time_minutes, target_city, category_id, content, meta_title, meta_description";
/** All categories for the tenant (both location and topic types). */
export async function getCategories(tenantId: string): Promise<ResourceCategory[]> {
  const { data, error } = await db()
    .from("categories")
    .select("id, name, slug, type, description")
    .eq("tenant_id", tenantId)
    .order("name", { ascending: true });
  if (error || !data) return [];
  return data as ResourceCategory[];
}
/** A single category by slug, or null. */
export async function getCategoryBySlug(
  tenantId: string,
  slug: string
): Promise<ResourceCategory | null> {
  const { data, error } = await db()
    .from("categories")
    .select("id, name, slug, type, description")
    .eq("tenant_id", tenantId)
    .eq("slug", slug)
    .limit(1);
  if (error || !data || data.length === 0) return null;
  return data[0] as ResourceCategory;
}
/** All published posts for the tenant, newest first. Used by /resources (All). */
export async function getAllPosts(tenantId: string): Promise<ResourcePost[]> {
  const { data, error } = await db()
    .from("posts")
    .select(POST_FIELDS)
    .eq("tenant_id", tenantId)
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error || !data) return [];
  return data as ResourcePost[];
}
/** Published posts in one category, newest first. Used by /resources/<city>. */
export async function getPostsByCategory(
  tenantId: string,
  categoryId: string
): Promise<ResourcePost[]> {
  const { data, error } = await db()
    .from("posts")
    .select(POST_FIELDS)
    .eq("tenant_id", tenantId)
    .eq("status", "published")
    .eq("category_id", categoryId)
    .order("published_at", { ascending: false });
  if (error || !data) return [];
  return data as ResourcePost[];
}
/** A single published article by slug, or null. Used by /resources/<post-slug>. */
export async function getPostBySlug(
  tenantId: string,
  slug: string
): Promise<ResourceArticle | null> {
  const { data, error } = await db()
    .from("posts")
    .select(ARTICLE_FIELDS)
    .eq("tenant_id", tenantId)
    .eq("status", "published")
    .eq("slug", slug)
    .limit(1);
  if (error || !data || data.length === 0) return null;
  return data[0] as ResourceArticle;
}
/** The category a post belongs to, or null. */
export async function getCategoryById(
  tenantId: string,
  categoryId: string
): Promise<ResourceCategory | null> {
  const { data, error } = await db()
    .from("categories")
    .select("id, name, slug, type, description")
    .eq("tenant_id", tenantId)
    .eq("id", categoryId)
    .limit(1);
  if (error || !data || data.length === 0) return null;
  return data[0] as ResourceCategory;
}
/** Convenience splitter for the filter bar. */
export function splitCategories(categories: ResourceCategory[]) {
  return {
    locationCategories: categories.filter((c) => c.type === "location"),
    topicCategories: categories.filter((c) => c.type === "topic"),
  };
}
