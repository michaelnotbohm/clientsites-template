import { createClient } from "@/lib/supabase/admin-server";
import { getAdminContext } from "@/lib/admin/get-admin-context";
import {
  UsersManager,
  type AdminUserRow,
  type InviteRow,
} from "@/components/admin/users-manager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.tenant) return null;

  // Server-side guard: super_admin only
  if (ctx.role !== "super_admin") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
        <p className="text-sm text-slate-500">
          User management is available to super admins only.
        </p>
      </div>
    );
  }

  const supabase = await createClient();

  const [{ data: users }, { data: invites }] = await Promise.all([
    supabase
      .from("admin_users")
      .select("id, auth_user_id, email, full_name, role, tenant_id, created_at")
      .order("created_at", { ascending: true }),
    supabase
      .from("admin_invites")
      .select("id, email, role, created_at")
      .order("created_at", { ascending: true }),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Users
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Control who can sign in to this dashboard and what they can do.
        </p>
      </div>

      <UsersManager
        currentAuthUserId={ctx.authUserId}
        tenantName={ctx.tenant.name}
        users={(users ?? []) as AdminUserRow[]}
        invites={(invites ?? []) as InviteRow[]}
      />
    </div>
  );
}
