// app/robots.ts
//
// Dynamic, per-tenant robots.txt. Next.js serves this at /robots.txt.
//
// Behavior:
//   - The Sitemap line points at the RESOLVED TENANT's own domain, never the
//     platform/origin — a sitemap reference on the wrong host re-introduces the
//     canonical-leak bug.
//   - Major AI crawlers are explicitly allowed (maximize AI answer-engine
//     visibility), in addition to the implicit allow-all.
//   - Admin / API / auth surfaces are disallowed for every agent.
//   - If the tenant is noindex (e.g. a preview build), the whole site is
//     disallowed so nothing is indexed under the wrong identity.

import type { MetadataRoute } from "next";
import { getTenantByHost, tenantUrl } from "@/lib/seo/get-tenant-by-host";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Paths no crawler should index, for any tenant.
const DISALLOWED = ["/admin", "/api/", "/auth/", "/login"];

// AI crawlers we explicitly welcome. Listing them by name documents intent and
// guards against an over-broad disallow elsewhere accidentally catching them.
const AI_AGENTS = [
  "GPTBot", // OpenAI training/crawl
  "OAI-SearchBot", // OpenAI search
  "ChatGPT-User", // ChatGPT browsing on user request
  "ClaudeBot", // Anthropic crawl
  "Claude-Web", // Anthropic browsing
  "anthropic-ai", // Anthropic (legacy token)
  "PerplexityBot", // Perplexity crawl
  "Perplexity-User", // Perplexity browsing on user request
  "Google-Extended", // Google Gemini/Vertex training opt-in token
  "Applebot-Extended", // Apple AI token
  "Bytespider", // ByteDance
  "Amazonbot", // Amazon
  "CCBot", // Common Crawl (feeds many models)
  "cohere-ai", // Cohere
  "Meta-ExternalAgent", // Meta AI
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const tenant = await getTenantByHost();

  // Unknown host or preview/noindex tenant: refuse everything. Better to block
  // than to let content be indexed under an unresolved or wrong identity.
  if (!tenant || tenant.noindex) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  const sitemapUrl = tenantUrl(tenant.primaryDomain, "sitemap.xml");

  return {
    rules: [
      // Baseline: everyone may crawl everything except sensitive surfaces.
      { userAgent: "*", allow: "/", disallow: DISALLOWED },
      // Explicit per-AI-agent allow with the same sensitive-path exclusions.
      ...AI_AGENTS.map((agent) => ({
        userAgent: agent,
        allow: "/",
        disallow: DISALLOWED,
      })),
    ],
    sitemap: sitemapUrl,
    host: tenant.primaryDomain,
  };
}
