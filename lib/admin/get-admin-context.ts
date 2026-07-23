import { createClient } from "@/lib/supabase/admin-server";

export type AdminRole = "super_admin" | "admin" | "editor";

export interface AdminContext {
  authUserId: string;
  email: string;
  fullName: string;
  role: AdminRole;
  tenant: {
    id: string;
    name: string;
    /** Production domain — the tenant's permanent SEO identity. */
    domain: string | null;
    /** Sandbox/staging domain set during build-out; null after go-live. */
    previewDomain: string | null;
    /** The domain the site is actually browsable at right now. */
    liveDomain: string | null;
    /** True while the site is being served from the sandbox domain. */
    isPreview: boolean;
  } | null;
}

/**
 * Resolves the signed-in user's admin identity and working tenant.
 *
 * Returns null when the user has a valid auth session but NO admin_users
 * row — i.e. they signed in but were never granted access. The dashboard
 * layout treats null as "show the unauthorized screen."
 *
 * First-sign-in invite claim: if no admin_users row exists, we attempt
 * claim_admin_invite() — a security-definer function that converts a
 * pending invite matching the user's verified email into an admin_users
 * row, then we re-check. This is how invited users get access
 * automatically on their first sign-in.
 *
 * Tenant resolution:
 * - admin/editor rows have a tenant_id → that tenant
 * - super_admin rows have tenant_id NULL → defaults to the first tenant.
 *   (A tenant switcher replaces this once there are multiple tenants.)
 */
export async function getAdminContext(): Promise<AdminContext | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  let { data: adminRow } = await supabase
    .from("admin_users")
    .select("role, tenant_id, email, full_name")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  // No access yet? See if a pending invite matches this email.
  if (!adminRow) {
    const { data: claimed } = await supabase.rpc("claim_admin_invite");
    if (claimed === true) {
      const retry = await supabase
        .from("admin_users")
        .select("role, tenant_id, email, full_name")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      adminRow = retry.data;
    }
  }

  if (!adminRow) return null;

  type TenantRow = {
    id: string;
    name: string;
    domain: string | null;
    preview_domain: string | null;
  };

  let tenantRow: TenantRow | null = null;

  if (adminRow.tenant_id) {
    const { data } = await supabase
      .from("tenants")
      .select("id, name, domain, preview_domain")
      .eq("id", adminRow.tenant_id)
      .maybeSingle();
    tenantRow = data ?? null;
  } else {
    // super_admin: default to the first tenant for now
    const { data } = await supabase
      .from("tenants")
      .select("id, name, domain, preview_domain")
      .order("name")
      .limit(1)
      .maybeSingle();
    tenantRow = data ?? null;
  }

  const tenant: AdminContext["tenant"] = tenantRow
    ? {
        id: tenantRow.id,
        name: tenantRow.name,
        domain: tenantRow.domain,
        previewDomain: tenantRow.preview_domain,
        liveDomain: tenantRow.preview_domain ?? tenantRow.domain,
        isPreview: Boolean(tenantRow.preview_domain),
      }
    : null;

  return {
    authUserId: user.id,
    email: adminRow.email ?? user.email ?? "",
    fullName: adminRow.full_name ?? "Admin",
    role: adminRow.role as AdminRole,
    tenant,
  };
}
