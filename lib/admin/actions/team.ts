"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/admin-server";
import { getAdminContext } from "@/lib/admin/get-admin-context";
import { captureRevision } from "@/lib/admin/revisions";

const TEAM_SNAPSHOT_FIELDS =
  "id, name, title, license_no, phone, email, photo_url, photo_position, bio, sort_order";

/**
 * Revalidate every public page that renders a team_grid block,
 * plus the admin team views. Pages are found by querying for
 * team_grid sections rather than hardcoding a slug, so this stays
 * correct if team grids are added to other pages later.
 */
async function revalidateTeamSurfaces(tenantId: string) {
  const supabase = await createClient();

  const { data: pages } = await supabase
    .from("pages")
    .select("slug, sections!inner(type)")
    .eq("tenant_id", tenantId)
    .eq("sections.type", "team_grid");

  for (const page of pages ?? []) {
    revalidatePath(page.slug === "home" ? "/" : `/${page.slug}`);
  }

  revalidatePath("/admin/team");
}

export interface TeamActionResult {
  ok: boolean;
  error?: string;
  memberId?: string;
}

/**
 * Create or update a team member. If memberId is present → update
 * (snapshotting the previous state to revisions first), otherwise →
 * insert with the next sort_order for the tenant.
 */
export async function saveTeamMember(
  formData: FormData
): Promise<TeamActionResult> {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.tenant) {
    return { ok: false, error: "Not authorized." };
  }

  const memberId = (formData.get("memberId") as string) || null;
  const name = ((formData.get("name") as string) || "").trim();

  if (!name) {
    return { ok: false, error: "Name is required." };
  }

  const nullable = (key: string) => {
    const value = ((formData.get(key) as string) || "").trim();
    return value.length > 0 ? value : null;
  };

  const fields = {
    name,
    title: nullable("title"),
    license_no: nullable("license_no"),
    phone: nullable("phone"),
    email: nullable("email"),
    photo_url: nullable("photo_url"),
    photo_position: nullable("photo_position"),
    bio: nullable("bio"),
  };

  const supabase = await createClient();
  const tenantId = ctx.tenant.id;

  if (memberId) {
    // Snapshot the outgoing version before overwriting
    const { data: current } = await supabase
      .from("team_members")
      .select(TEAM_SNAPSHOT_FIELDS)
      .eq("id", memberId)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (current) {
      await captureRevision(supabase, {
        tenantId,
        entityType: "team_member",
        entityId: memberId,
        snapshot: current as unknown as Record<string, unknown>,
        createdBy: ctx.authUserId,
        createdByEmail: ctx.email,
      });
    }

    const { error } = await supabase
      .from("team_members")
      .update(fields)
      .eq("id", memberId)
      .eq("tenant_id", tenantId);

    if (error) return { ok: false, error: "Save failed. Please try again." };

    await revalidateTeamSurfaces(tenantId);
    revalidatePath(`/admin/team/${memberId}`);
    return { ok: true, memberId };
  }

  // Insert: next sort_order
  const { data: last } = await supabase
    .from("team_members")
    .select("sort_order")
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextSort = (last?.sort_order ?? -1) + 1;

  const { data: inserted, error } = await supabase
    .from("team_members")
    .insert({ ...fields, tenant_id: tenantId, sort_order: nextSort })
    .select("id")
    .maybeSingle();

  if (error || !inserted) {
    return { ok: false, error: "Create failed. Please try again." };
  }

  await revalidateTeamSurfaces(tenantId);
  return { ok: true, memberId: inserted.id };
}

/**
 * Delete a team member. The full row is snapshotted to revisions
 * first, so a deleted member can be restored from version history.
 */
export async function deleteTeamMember(
  formData: FormData
): Promise<TeamActionResult> {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.tenant) {
    return { ok: false, error: "Not authorized." };
  }

  const memberId = formData.get("memberId") as string;
  if (!memberId) return { ok: false, error: "Missing member." };

  const supabase = await createClient();

  // Snapshot the full row before deletion — makes delete recoverable
  const { data: current } = await supabase
    .from("team_members")
    .select(TEAM_SNAPSHOT_FIELDS)
    .eq("id", memberId)
    .eq("tenant_id", ctx.tenant.id)
    .maybeSingle();

  if (!current) return { ok: false, error: "Member not found." };

  await captureRevision(supabase, {
    tenantId: ctx.tenant.id,
    entityType: "team_member",
    entityId: memberId,
    snapshot: current as unknown as Record<string, unknown>,
    createdBy: ctx.authUserId,
    createdByEmail: ctx.email,
  });

  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("id", memberId)
    .eq("tenant_id", ctx.tenant.id);

  if (error) return { ok: false, error: "Delete failed. Please try again." };

  await revalidateTeamSurfaces(ctx.tenant.id);
  return { ok: true };
}

/**
 * Move a team member up or down by swapping sort_order with its
 * nearest neighbor — two separate update statements, never batched.
 */
export async function moveTeamMember(
  formData: FormData
): Promise<TeamActionResult> {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.tenant) {
    return { ok: false, error: "Not authorized." };
  }

  const memberId = formData.get("memberId") as string;
  const direction = formData.get("direction") as "up" | "down";

  if (!memberId || (direction !== "up" && direction !== "down")) {
    return { ok: false, error: "Invalid move." };
  }

  const supabase = await createClient();
  const tenantId = ctx.tenant.id;

  const { data: member } = await supabase
    .from("team_members")
    .select("id, sort_order")
    .eq("id", memberId)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (!member) return { ok: false, error: "Member not found." };

  let neighborQuery = supabase
    .from("team_members")
    .select("id, sort_order")
    .eq("tenant_id", tenantId);

  neighborQuery =
    direction === "up"
      ? neighborQuery
          .lt("sort_order", member.sort_order)
          .order("sort_order", { ascending: false })
      : neighborQuery
          .gt("sort_order", member.sort_order)
          .order("sort_order", { ascending: true });

  const { data: neighbor } = await neighborQuery.limit(1).maybeSingle();
  if (!neighbor) return { ok: true }; // already at an edge

  const { error: errA } = await supabase
    .from("team_members")
    .update({ sort_order: neighbor.sort_order })
    .eq("id", member.id)
    .eq("tenant_id", tenantId);

  if (errA) return { ok: false, error: "Reorder failed." };

  const { error: errB } = await supabase
    .from("team_members")
    .update({ sort_order: member.sort_order })
    .eq("id", neighbor.id)
    .eq("tenant_id", tenantId);

  if (errB) return { ok: false, error: "Reorder failed." };

  await revalidateTeamSurfaces(tenantId);
  return { ok: true };
}
