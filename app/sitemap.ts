// app/sitemap.ts
//
// Dynamic, per-tenant XML sitemap. Next.js serves this at /sitemap.xml.
//
// Every URL is computed from the host-resolved tenant's primary domain — never
// from a code constant or the origin domain. Posts live under /resources/<slug>
// to match the site's blog route. If the tenant is noindex, the sitemap is
// returned empty so nothing is advertised for crawling.

import type { MetadataRoute } from "next";
import {
  getTenantByHost,
  getIndexablePages,
  getIndexablePosts,
  tenantUrl,
} from "@/lib/seo/get-tenant-by-host";

// Always evaluate at request time — the host header is required to resolve the
// tenant, and content changes (new posts) must appear without a rebuild.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const BLOG_PREFIX = "resources"; // posts are served at /resources/<slug>

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tenant = await getTenantByHost();
  if (!tenant || tenant.noindex) return [];

  const [pages, posts] = await Promise.all([
    getIndexablePages(tenant.id),
    getIndexablePosts(tenant.id),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  for (const page of pages) {
    const path = page.slug === "/" ? "" : page.slug;
    entries.push({
      url: tenantUrl(tenant.primaryDomain, path),
      lastModified: page.updatedAt ? new Date(page.updatedAt) : undefined,
      changeFrequency: page.slug === "/" ? "weekly" : "monthly",
      priority: page.slug === "/" ? 1.0 : 0.8,
    });
  }

  for (const post of posts) {
    const last = post.updatedAt ?? post.publishedAt;
    entries.push({
      url: tenantUrl(tenant.primaryDomain, `${BLOG_PREFIX}/${post.slug}`),
      lastModified: last ? new Date(last) : undefined,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
