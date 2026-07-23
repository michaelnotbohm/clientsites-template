"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/admin-server";
import { getAdminContext } from "@/lib/admin/get-admin-context";
import type { AdminRole } from "@/lib/admin/get-admin-context";

export interface UserActionResult {
  ok: boolean;
  error?: string;
}

const VALID_ROLES: AdminRole[] = ["super_admin", "admin", "editor"];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Invite a new admin user by email. super_admin only.
 * super_admin invites are platform-wide (tenant_id null);
 * admin/editor invites are scoped to the current tenant.
 */
export async function inviteAdminUser(
  formData: FormData
): Promise<UserActionResult> {
  const ctx = await getAdminContext();
  if (!ctx || ctx.role !== "super_admin" || !ctx.tenant) {
    return { ok: false, error: "Super admins only." };
  }

  const email = ((formData.get("email") as string) || "").trim().toLowerCase();
  const role = formData.get("role") as AdminRole;

  if (!isValidEmail(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (!VALID_ROLES.includes(role)) {
    return { ok: false, error: "Invalid role." };
  }

  const supabase = await createClient();

  // Already has access?
  const { data: existing } = await supabase
    .from("admin_users")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  if (existing) {
    return { ok: false, error: "That email already has access." };
  }

  const { error } = await supabase.from("admin_invites").insert({
    email,
    role,
    tenant_id: role === "super_admin" ? null : ctx.tenant.id,
    invited_by: ctx.authUserId,
    invited_by_email: ctx.email,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "That email already has a pending invite." };
    }
    return { ok: false, error: "Invite failed. Please try again." };
  }

  revalidatePath("/admin/users");
  return { ok: true };
}

/** Revoke a pending invite. super_admin only. */
export async function revokeInvite(
  formData: FormData
): Promise<UserActionResult> {
  const ctx = await getAdminContext();
  if (!ctx || ctx.role !== "super_admin") {
    return { ok: false, error: "Super admins only." };
  }

  const inviteId = formData.get("inviteId") as string;
  if (!inviteId) return { ok: false, error: "Missing invite." };

  const supabase = await createClient();

  const { error } = await supabase
    .from("admin_invites")
    .delete()
    .eq("id", inviteId);

  if (error) return { ok: false, error: "Revoke failed. Please try again." };

  revalidatePath("/admin/users");
  return { ok: true };
}

/**
 * Change an existing user's role. super_admin only; you cannot change
 * your own role (prevents locking yourself out). Promoting to
 * super_admin clears tenant scoping; demoting scopes to the current tenant.
 */
export async function updateAdminRole(
  formData: FormData
): Promise<UserActionResult> {
  const ctx = await getAdminContext();
  if (!ctx || ctx.role !== "super_admin" || !ctx.tenant) {
    return { ok: false, error: "Super admins only." };
  }

  const adminUserId = formData.get("adminUserId") as string;
  const role = formData.get("role") as AdminRole;

  if (!adminUserId) return { ok: false, error: "Missing user." };
  if (!VALID_ROLES.includes(role)) {
    return { ok: false, error: "Invalid role." };
  }

  const supabase = await createClient();

  const { data: target } = await supabase
    .from("admin_users")
    .select("id, auth_user_id")
    .eq("id", adminUserId)
    .maybeSingle();

  if (!target) return { ok: false, error: "User not found." };

  if (target.auth_user_id === ctx.authUserId) {
    return { ok: false, error: "You can't change your own access." };
  }

  const { error } = await supabase
    .from("admin_users")
    .update({
      role,
      tenant_id: role === "super_admin" ? null : ctx.tenant.id,
    })
    .eq("id", adminUserId);

  if (error) return { ok: false, error: "Update failed. Please try again." };

  revalidatePath("/admin/users");
  return { ok: true };
}

/**
 * Remove a user's dashboard access (deletes the admin_users row; the
 * underlying auth account remains but can no longer reach the admin).
 * super_admin only; you cannot remove yourself.
 */
export async function removeAdminUser(
  formData: FormData
): Promise<UserActionResult> {
  const ctx = await getAdminContext();
  if (!ctx || ctx.role !== "super_admin") {
    return { ok: false, error: "Super admins only." };
  }

  const adminUserId = formData.get("adminUserId") as string;
  if (!adminUserId) return { ok: false, error: "Missing user." };

  const supabase = await createClient();

  const { data: target } = await supabase
    .from("admin_users")
    .select("id, auth_user_id")
    .eq("id", adminUserId)
    .maybeSingle();

  if (!target) return { ok: false, error: "User not found." };

  if (target.auth_user_id === ctx.authUserId) {
    return { ok: false, error: "You can't remove your own access." };
  }

  const { error } = await supabase
    .from("admin_users")
    .delete()
    .eq("id", adminUserId);

  if (error) return { ok: false, error: "Remove failed. Please try again." };

  revalidatePath("/admin/users");
  return { ok: true };
}
