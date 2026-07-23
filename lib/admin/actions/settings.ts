"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/admin-server";
import { getAdminContext } from "@/lib/admin/get-admin-context";
import { captureRevision } from "@/lib/admin/revisions";

export interface SettingsActionResult {
  ok: boolean;
  error?: string;
}

const SETTINGS_SNAPSHOT_FIELDS =
  "name, logo_url, email, phone, phone_tollfree, fax, address_line1, address_line2, city, state, postal_code, license_label, license_number, social_links, theme";

/**
 * Save tenant business info, social links, and theme. The previous
 * state is snapshotted to revisions first for one-click restore.
 *
 * social_links and theme arrive as full JSON strings built client-side
 * from the existing objects, so unknown keys are preserved.
 *
 * Deliberately NOT editable here: domain, preview_domain, status, noindex —
 * those are operator-level SEO-identity controls (Section 10) and belong
 * to a super-admin provisioning surface, not the client settings screen.
 */
export async function saveTenantSettings(
  formData: FormData
): Promise<SettingsActionResult> {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.tenant) {
    return { ok: false, error: "Not authorized." };
  }

  const name = ((formData.get("name") as string) || "").trim();
  if (!name) {
    return { ok: false, error: "Business name is required." };
  }

  const nullable = (key: string) => {
    const value = ((formData.get(key) as string) || "").trim();
    return value.length > 0 ? value : null;
  };

  let socialLinks: unknown;
  let theme: unknown;
  try {
    socialLinks = JSON.parse((formData.get("social_links") as string) || "{}");
    theme = JSON.parse((formData.get("theme") as string) || "{}");
  } catch {
    return { ok: false, error: "Invalid settings payload." };
  }

  if (
    typeof socialLinks !== "object" || socialLinks === null || Array.isArray(socialLinks) ||
    typeof theme !== "object" || theme === null || Array.isArray(theme)
  ) {
    return { ok: false, error: "Invalid settings payload." };
  }

  const supabase = await createClient();
  const tenantId = ctx.tenant.id;

  // Snapshot the outgoing version before overwriting
  const { data: current } = await supabase
    .from("tenants")
    .select(SETTINGS_SNAPSHOT_FIELDS)
    .eq("id", tenantId)
    .maybeSingle();

  if (current) {
    await captureRevision(supabase, {
      tenantId,
      entityType: "tenant_settings",
      entityId: tenantId,
      snapshot: current as unknown as Record<string, unknown>,
      createdBy: ctx.authUserId,
      createdByEmail: ctx.email,
    });
  }

  const { error } = await supabase
    .from("tenants")
    .update({
      name,
      logo_url: nullable("logo_url"),
      email: nullable("email"),
      phone: nullable("phone"),
      phone_tollfree: nullable("phone_tollfree"),
      fax: nullable("fax"),
      address_line1: nullable("address_line1"),
      address_line2: nullable("address_line2"),
      city: nullable("city"),
      state: nullable("state"),
      postal_code: nullable("postal_code"),
      license_label: nullable("license_label"),
      license_number: nullable("license_number"),
      social_links: socialLinks,
      theme,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tenantId);

  if (error) {
    return { ok: false, error: "Save failed. Please try again." };
  }

  // Theme and business identity affect every page — revalidate the whole tree
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");

  return { ok: true };
}
