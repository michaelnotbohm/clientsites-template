import { createClient } from "@/lib/supabase/admin-server";
import { getAdminContext } from "@/lib/admin/get-admin-context";
import {
  SettingsForm,
  type TenantSettingsValues,
} from "@/components/admin/settings-form";
import { RevisionHistory } from "@/components/admin/revision-history";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.tenant) return null;

  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select(
      "name, logo_url, email, phone, phone_tollfree, fax, address_line1, address_line2, city, state, postal_code, license_label, license_number, social_links, theme"
    )
    .eq("id", ctx.tenant.id)
    .maybeSingle();

  if (!tenant) return null;

  const initial: TenantSettingsValues = {
    name: tenant.name ?? "",
    logo_url: tenant.logo_url ?? "",
    email: tenant.email ?? "",
    phone: tenant.phone ?? "",
    phone_tollfree: tenant.phone_tollfree ?? "",
    fax: tenant.fax ?? "",
    address_line1: tenant.address_line1 ?? "",
    address_line2: tenant.address_line2 ?? "",
    city: tenant.city ?? "",
    state: tenant.state ?? "",
    postal_code: tenant.postal_code ?? "",
    license_label: tenant.license_label ?? "",
    license_number: tenant.license_number ?? "",
    social_links: (tenant.social_links ?? {}) as Record<string, string>,
    theme: (tenant.theme ?? {}) as Record<string, unknown>,
  };

  const canEditTheme = ctx.role === "super_admin" || ctx.role === "admin";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Theme &amp; Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Business identity, contact details, and the visual theme for{" "}
          {ctx.tenant.name}.
        </p>
      </div>

      <RevisionHistory entityType="tenant_settings" entityId={ctx.tenant.id} />

      <SettingsForm
        key={JSON.stringify(initial)}
        initial={initial}
        canEditTheme={canEditTheme}
      />
    </div>
  );
}
