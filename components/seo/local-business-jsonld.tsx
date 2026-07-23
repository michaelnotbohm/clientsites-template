// components/seo/local-business-jsonld.tsx
//
// Injects LocalBusiness / FinancialService JSON-LD for the tenant. Intended for
// the HOME page (and safe to include site-wide if you prefer a single org node).
//
// Every value is read from the tenant row and every URL is the tenant's own
// primary domain — never the platform origin. This is the home-page counterpart
// to the Article/FAQPage schema the content studio already writes for posts, and
// it fills the gap the audit found: 0 of 25 pages currently emit any schema.
//
// Usage (server component) in app/(site)/page.tsx or wherever home renders:
//
//   import { LocalBusinessJsonLd } from "@/components/seo/local-business-jsonld";
//   ...
//   const tenant = await getTenantByHost();
//   return (
//     <>
//       {tenant && <LocalBusinessJsonLd tenant={tenant} />}
//       ... page content ...
//     </>
//   );
//
// It accepts the full tenant row (not just the SEO subset) so it can use
// address, phone, license, and social links. Fetch that row however your home
// page already does; the shape it expects is documented in TenantForSchema.

import React from "react";

export interface TenantForSchema {
  name: string;
  primaryDomain: string; // bare host, no scheme
  logo_url?: string | null;
  email?: string | null;
  phone?: string | null;
  phone_tollfree?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  license_number?: string | null;
  license_label?: string | null;
  social_links?: Record<string, string> | null;
}

function abs(domain: string, path = ""): string {
  const clean = path.replace(/^\/+/, "");
  return clean ? `https://${domain}/${clean}` : `https://${domain}`;
}

export function LocalBusinessJsonLd({ tenant }: { tenant: TenantForSchema }) {
  const base = abs(tenant.primaryDomain);

  const sameAs = tenant.social_links
    ? Object.values(tenant.social_links).filter(
        (v): v is string => typeof v === "string" && v.startsWith("http")
      )
    : [];

  const telephone = tenant.phone || tenant.phone_tollfree || undefined;

  const hasAddress =
    tenant.address_line1 || tenant.city || tenant.state || tenant.postal_code;

  const address = hasAddress
    ? {
        "@type": "PostalAddress",
        streetAddress:
          [tenant.address_line1, tenant.address_line2]
            .filter(Boolean)
            .join(", ") || undefined,
        addressLocality: tenant.city || undefined,
        addressRegion: tenant.state || undefined,
        postalCode: tenant.postal_code || undefined,
        addressCountry: "US",
      }
    : undefined;

  // FinancialService is a subtype of LocalBusiness — the most specific accurate
  // type for a mortgage lender, and it matches the #organization type the post
  // schema already uses, so the entity stays consistent across the site.
  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "@id": `${base}#organization`,
    name: tenant.name,
    url: base,
    ...(tenant.logo_url ? { logo: tenant.logo_url, image: tenant.logo_url } : {}),
    ...(telephone ? { telephone } : {}),
    ...(tenant.email ? { email: tenant.email } : {}),
    ...(address ? { address } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    areaServed: { "@type": "State", name: "Florida" },
    ...(tenant.license_number
      ? {
          identifier: {
            "@type": "PropertyValue",
            name: tenant.license_label || "License",
            value: tenant.license_number,
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      // Stored/derived values only; no user-controlled HTML. JSON.stringify
      // escapes the payload so it is safe to inject.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
    />
  );
}
