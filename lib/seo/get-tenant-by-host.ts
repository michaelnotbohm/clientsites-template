// lib/seo/get-tenant-by-host.ts
//
// Server-only helper. Resolves the tenant that owns the incoming request host,
// then exposes the published, indexable URLs for that tenant. Used by:
//   - app/sitemap.ts
//   - app/robots.ts
//   - app/llms.txt/route.ts
//
// Why this exists:
// Per the platform architecture, NOTHING about identity may be sourced from a
// code constant or the origin domain. Every URL these routes emit must be
// derived from the host-resolved tenant. This helper is the single place that
// resolution happens for SEO surfaces, so the logic can't drift per-route.
//
// It uses the Supabase SERVICE ROLE key and is imported only by server route
// handlers (app/sitemap.ts, app/robots.ts, app/llms.txt/route.ts). It must
// never be imported into a client component.

import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export interface SeoTenant {
  id: string;
  name: string;
  primaryDomain: string; // bare host, no scheme, no trailing slash
  noindex: boolean;
}

export interface SeoPage {
  slug: string; // "/" for home, otherwise no leading slash (e.g. "loan-options/fha")
  updatedAt: string | null;
}

export interface SeoPost {
  slug: string;
  updatedAt: string | null;
  publishedAt: string | null;
}

function admin() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Strip scheme, port, leading "www.", and any trailing slash to a bare host. */
function normalizeHost(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let h = raw.trim().toLowerCase();
  h = h.replace(/^https?:\/\//, "");
  h = h.split("/")[0];
  h = h.split(":")[0];
  h = h.replace(/^www\./, "");
  return h || null;
}

/** Read the incoming request host from headers (App Router server context). */
export async function getRequestHost(): Promise<string | null> {
  const h = await headers();
  // x-forwarded-host is set by Vercel's proxy; host is the fallback.
  return normalizeHost(h.get("x-forwarded-host") ?? h.get("host"));
}

/**
 * Resolve the tenant for the current request host.
 * Matches against both `domain` and the `domains[]` array, comparing on the
 * normalized bare host so apex/www/scheme/trailing-slash variants all resolve.
 */
export async function getTenantByHost(): Promise<SeoTenant | null> {
  const host = await getRequestHost();
  if (!host) return null;

  const db = admin();
  const { data, error } = await db
    .from("tenants")
    .select("id, name, domain, domains, noindex, status")
    .or(`domain.eq.${host},domains.cs.{${host}}`)
    .limit(1);

  if (error || !data || data.length === 0) return null;

  const t = data[0] as {
    id: string;
    name: string;
    domain: string | null;
    domains: string[] | null;
    noindex: boolean | null;
    status: string | null;
  };

  // The primary domain is the canonical identity for every URL we emit.
  const primaryDomain = normalizeHost(t.domain) ?? host;

  return {
    id: t.id,
    name: t.name,
    primaryDomain,
    noindex: Boolean(t.noindex),
  };
}

/** Published, non-noindex pages for the tenant. */
export async function getIndexablePages(tenantId: string): Promise<SeoPage[]> {
  const db = admin();
  const { data, error } = await db
    .from("pages")
    .select("slug, updated_at, status, noindex")
    .eq("tenant_id", tenantId)
    .eq("status", "published")
    .eq("noindex", false)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data.map((p: any) => ({ slug: p.slug as string, updatedAt: p.updated_at }));
}

/**
 * Published posts for the tenant. NOTE: the `posts` table has no `noindex`
 * column (only `pages`/`tenants` do), so publication status is the only gate.
 */
export async function getIndexablePosts(tenantId: string): Promise<SeoPost[]> {
  const db = admin();
  const { data, error } = await db
    .from("posts")
    .select("slug, updated_at, published_at, status")
    .eq("tenant_id", tenantId)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error || !data) return [];
  return data.map((p: any) => ({
    slug: p.slug as string,
    updatedAt: p.updated_at,
    publishedAt: p.published_at,
  }));
}

/** Build an absolute URL on the tenant's primary domain. */
export function tenantUrl(primaryDomain: string, path = ""): string {
  const clean = path.replace(/^\/+/, "");
  return clean ? `https://${primaryDomain}/${clean}` : `https://${primaryDomain}`;
}
