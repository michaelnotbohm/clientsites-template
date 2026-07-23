import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/admin-server";
import { getAdminContext } from "@/lib/admin/get-admin-context";
import { TeamList, type TeamMemberRow } from "@/components/admin/team-list";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.tenant) return null;

  const supabase = await createClient();

  const { data: members } = await supabase
    .from("team_members")
    .select("id, name, title, license_no, photo_url, sort_order")
    .eq("tenant_id", ctx.tenant.id)
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Team
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            The people shown on {ctx.tenant.name}&apos;s team pages. Changes
            update the live site immediately.
          </p>
        </div>
        <Link
          href="/admin/team/new"
          className="flex shrink-0 items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
        >
          <Plus className="h-4 w-4" />
          Add member
        </Link>
      </div>

      <TeamList members={(members ?? []) as TeamMemberRow[]} />
    </div>
  );
}
