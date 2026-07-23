"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Trash2,
  MailQuestion,
  AlertCircle,
  Check,
} from "lucide-react";
import {
  inviteAdminUser,
  revokeInvite,
  updateAdminRole,
  removeAdminUser,
} from "@/lib/admin/actions/users";
import type { AdminRole } from "@/lib/admin/get-admin-context";

export interface AdminUserRow {
  id: string;
  auth_user_id: string;
  email: string | null;
  full_name: string | null;
  role: AdminRole;
  tenant_id: string | null;
  created_at: string;
}

export interface InviteRow {
  id: string;
  email: string;
  role: AdminRole;
  created_at: string;
}

const ROLE_OPTIONS: { value: AdminRole; label: string }[] = [
  { value: "editor", label: "Editor" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super admin" },
];

const ROLE_HINTS: Record<AdminRole, string> = {
  editor: "Edits content. No theme or user access.",
  admin: "Edits content and theme. No user access.",
  super_admin: "Full access to all sites, including user management.",
};

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500";

export function UsersManager({
  currentAuthUserId,
  tenantName,
  users,
  invites,
}: {
  currentAuthUserId: string;
  tenantName: string;
  users: AdminUserRow[];
  invites: InviteRow[];
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("editor");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  function run(action: () => Promise<{ ok: boolean; error?: string }>, successText: string) {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        setMessage({ kind: "success", text: successText });
        router.refresh();
      } else {
        setMessage({ kind: "error", text: result.error ?? "Action failed." });
      }
    });
  }

  function handleInvite() {
    const formData = new FormData();
    formData.set("email", email);
    formData.set("role", role);
    run(
      () => inviteAdminUser(formData),
      `Invited ${email.trim().toLowerCase()} — they get access the first time they sign in with that email.`
    );
    setEmail("");
  }

  function handleRevoke(invite: InviteRow) {
    if (!window.confirm(`Revoke the pending invite for ${invite.email}?`)) return;
    const formData = new FormData();
    formData.set("inviteId", invite.id);
    run(() => revokeInvite(formData), "Invite revoked.");
  }

  function handleRoleChange(user: AdminUserRow, newRole: AdminRole) {
    const formData = new FormData();
    formData.set("adminUserId", user.id);
    formData.set("role", newRole);
    run(() => updateAdminRole(formData), "Role updated.");
  }

  function handleRemove(user: AdminUserRow) {
    if (
      !window.confirm(
        `Remove dashboard access for ${user.email ?? user.full_name}? They will no longer be able to sign in to the admin.`
      )
    ) {
      return;
    }
    const formData = new FormData();
    formData.set("adminUserId", user.id);
    run(() => removeAdminUser(formData), "Access removed.");
  }

  return (
    <div
      className={
        isPending ? "pointer-events-none space-y-6 opacity-70" : "space-y-6"
      }
    >
      {message && (
        <div
          className={
            message.kind === "success"
              ? "flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
              : "flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          }
        >
          {message.kind === "success" ? (
            <Check className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {message.text}
        </div>
      )}

      {/* Invite form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Invite a user
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">
          They get access automatically the first time they sign in with this
          email — via Google, or by creating a password on the login page.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="person@company.com"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as AdminRole)}
            className={`${inputClass} sm:max-w-[180px]`}
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={isPending || email.trim().length === 0}
            onClick={handleInvite}
            className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
          >
            <UserPlus className="h-4 w-4" />
            Invite
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-400">{ROLE_HINTS[role]}</p>
      </div>

      {/* Pending invites */}
      {invites.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <MailQuestion className="h-4 w-4 text-slate-400" />
              Pending invites
            </h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {invites.map((invite) => (
              <li
                key={invite.id}
                className="flex items-center justify-between gap-4 px-6 py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {invite.email}
                  </p>
                  <p className="text-xs text-slate-400">
                    {ROLE_OPTIONS.find((r) => r.value === invite.role)?.label}
                    {" · waiting for first sign-in"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRevoke(invite)}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Active users */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Users with access
          </h2>
        </div>
        <ul className="divide-y divide-slate-100">
          {users.map((user) => {
            const isSelf = user.auth_user_id === currentAuthUserId;
            const initials = (user.full_name ?? user.email ?? "?")
              .split(" ")
              .map((part) => part[0])
              .filter(Boolean)
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <li
                key={user.id}
                className="flex items-center gap-4 px-6 py-3.5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {user.full_name || user.email}
                    {isSelf && (
                      <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        You
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {user.email}
                    {" · "}
                    {user.tenant_id === null ? "All sites" : tenantName}
                  </p>
                </div>

                <select
                  value={user.role}
                  disabled={isSelf || isPending}
                  onChange={(e) =>
                    handleRoleChange(user, e.target.value as AdminRole)
                  }
                  className="shrink-0 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  disabled={isSelf || isPending}
                  onClick={() => handleRemove(user)}
                  className="flex shrink-0 items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                  title={isSelf ? "You can't remove yourself" : "Remove access"}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
