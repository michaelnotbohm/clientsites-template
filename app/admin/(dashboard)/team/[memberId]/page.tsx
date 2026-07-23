import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/admin-server";
import { getAdminContext } from "@/lib/admin/get-admin-context";
import {
  TeamMemberForm,
  type TeamMemberValues,
} from "@/components/admin/team-member-form";
import { RevisionHistory } from "@/components/admin/revision-history";

export const dynamic = "force-dynamic";

export default async function AdminTeamMemberPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;

  const ctx = await getAdminContext();
  if (!ctx || !ctx.tenant) return null;

  const isNew = memberId === "new";

  let initial: TeamMemberValues = {
    id: null,
    name: "",
    title: "",
    license_no: "",
    phone: "",
    email: "",
    photo_url: "",
    photo_position: "",
    bio: "",
  };

  if (!isNew) {
    const supabase = await createClient();

    const { data: member } = await supabase
      .from("team_members")
      .select(
        "id, name, title, license_no, phone, email, photo_url, photo_position, bio"
      )
      .eq("id", memberId)
      .eq("tenant_id", ctx.tenant.id)
      .maybeSingle();

    if (!member) notFound();

    initial = {
      id: member.id,
      name: member.name ?? "",
      title: member.title ?? "",
      license_no: member.license_no ?? "",
      phone: member.phone ?? "",
      email: member.email ?? "",
      photo_url: member.photo_url ?? "",
      photo_position: member.photo_position ?? "",
      bio: member.bio ?? "",
    };
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/team"
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-violet-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Team
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {isNew ? "Add team member" : initial.name}
        </h1>
        {!isNew && initial.title && (
          <p className="mt-1 text-sm text-slate-500">{initial.title}</p>
        )}
      </div>

      {!isNew && initial.id && (
        <RevisionHistory entityType="team_member" entityId={initial.id} />
      )}

      <TeamMemberForm key={JSON.stringify(initial)} initial={initial} />
    </div>
  );
}
