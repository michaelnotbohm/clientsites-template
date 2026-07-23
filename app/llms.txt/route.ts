// app/llms.txt/route.ts
//
// Dynamic, per-tenant llms.txt. Served at /llms.txt.
//
// HONEST CAVEAT (kept in the code on purpose): llms.txt is a PROPOSED
// convention, not an adopted standard. No major AI platform has publicly
// confirmed it consumes this file for crawling or ranking. It is a low-cost,
// no-harm bet — a clean, curated map of the site for any agent that does look
// for it. Do not treat its presence as a guaranteed visibility lever; the
// real levers are the sitemap, clean SSR HTML, and JSON-LD.
//
// Format follows the community llms.txt proposal: an H1 site name, a short
// summary blockquote, then H2 link sections.

import {
  getTenantByHost,
  getIndexablePages,
  getIndexablePosts,
  tenantUrl,
} from "@/lib/seo/get-tenant-by-host";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BLOG_PREFIX = "resources";
const MAX_POSTS = 30; // cap the post list so the file stays a digestible index

// Human-readable labels for known top-level page slugs. Anything not listed
// falls back to a title-cased version of the slug, so new pages still appear.
const PAGE_LABELS: Record<string, string> = {
  "/": "Home",
  buy: "Buy a Home",
  refinance: "Refinance",
  heloc: "HELOC",
  about: "About Us",
  "loan-options": "Loan Options",
  "loan-originators": "Loan Originators",
  apply: "Apply Now",
  "apply-refinance": "Refinance Application",
  connect: "Connect",
  resources: "Resources",
  calculators: "Mortgage Calculators",
};

function labelFor(slug: string): string {
  if (PAGE_LABELS[slug]) return PAGE_LABELS[slug];
  const last = slug.split("/").pop() ?? slug;
  return last
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function GET(): Promise<Response> {
  const tenant = await getTenantByHost();

  if (!tenant || tenant.noindex) {
    return new Response("", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const [pages, posts] = await Promise.all([
    getIndexablePages(tenant.id),
    getIndexablePosts(tenant.id),
  ]);

  const lines: string[] = [];

  lines.push(`# ${tenant.name}`);
  lines.push("");
  lines.push(
    `> ${tenant.name} — mortgage and home-lending resources, loan options, calculators, and guides for the Tampa Bay area. Pages and articles below are the canonical, crawlable sources of truth on ${tenant.primaryDomain}.`
  );
  lines.push("");

  // Core pages, splitting loan-product detail pages into their own section.
  const corePages = pages.filter((p) => !p.slug.startsWith("loan-options/"));
  const loanPages = pages.filter((p) => p.slug.startsWith("loan-options/"));

  lines.push("## Pages");
  for (const p of corePages) {
    const path = p.slug === "/" ? "" : p.slug;
    lines.push(`- [${labelFor(p.slug)}](${tenantUrl(tenant.primaryDomain, path)})`);
  }
  lines.push("");

  if (loanPages.length) {
    lines.push("## Loan Options");
    for (const p of loanPages) {
      lines.push(`- [${labelFor(p.slug)}](${tenantUrl(tenant.primaryDomain, p.slug)})`);
    }
    lines.push("");
  }

  if (posts.length) {
    lines.push("## Articles");
    for (const post of posts.slice(0, MAX_POSTS)) {
      lines.push(
        `- [${labelFor(post.slug)}](${tenantUrl(
          tenant.primaryDomain,
          `${BLOG_PREFIX}/${post.slug}`
        )})`
      );
    }
    lines.push("");
  }

  const body = lines.join("\n");

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      // Short edge cache; content studio inserts should surface quickly.
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
