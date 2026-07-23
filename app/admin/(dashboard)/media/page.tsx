import { createClient } from "@/lib/supabase/admin-server";
import { getAdminContext } from "@/lib/admin/get-admin-context";
import { MediaGrid, type MediaRow } from "@/components/admin/media-grid";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.tenant) return null;

  const supabase = await createClient();

  const { data: media } = await supabase
    .from("media")
    .select("id, url, alt, width, height, created_at")
    .eq("tenant_id", ctx.tenant.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Media
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload and manage images for {ctx.tenant.name}. Copy a URL and paste
          it into any image field in Pages or Team.
        </p>
      </div>

      <MediaGrid tenantId={ctx.tenant.id} media={(media ?? []) as MediaRow[]} />
    </div>
  );
}
