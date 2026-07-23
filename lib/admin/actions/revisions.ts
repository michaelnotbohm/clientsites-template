"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/admin-server";
import { getAdminContext } from "@/lib/admin/get-admin-context";
import {
  captureRevision,
  type RevisionEntityType,
} from "@/lib/admin/revisions";

export interface RevisionListItem {
  id: string;
  created_at: string;
  created_by_email: string | null;
}

export interface RevisionListResult {
  ok: boolean;
  error?: string;
  items?: RevisionListItem[];
}

export interface RevisionActionResult {
  ok: boolean;
  error?: string;
}

const TENANT_SETTINGS_KEYS = [
  "name",
  "logo_url",
  "email",
  "phone",
  "phone_tollfree",
  "fax",
  "address_line1",
  "address_line2",
  "city",
  "state",
  "postal_code",
  "license_label",
  "license_number",
  "social_links",
  "theme",
] as const;

const TEAM_MEMBER_KEYS = [
  "name",
  "title",
  "license_no",
  "phone",
  "email",
  "photo_url",
  "photo_position",
  "bio",
  "sort_order",
] as const;

function pick(
  source: Record<string, unknown>,
  keys: readonly string[]
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    if (key in source) result[key] = source[key];
  }
  return result;
}

/** List recent revisions for an entity (newest first). */
export async function listRevisions(
  entityType: RevisionEntityType,
  entityId: string
): Promise<RevisionListResult> {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.tenant) return { ok: false, error: "Not authorized." };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("revisions")
    .select("id, created_at, created_by_email")
    .eq("tenant_id", ctx.tenant.id)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });

  if (error) return { ok: false, error: "Failed to load history." };

  return { ok: true, items: (data ?? []) as RevisionListItem[] };
}

/**
 * Restore a revision. The current state is snapshotted first, so a
 * restore is itself revertible. Handles all three entity types,
 * including re-inserting a deleted team member.
 */
export async function revertRevision(
  formData: FormData
): Promise<RevisionActionResult> {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.tenant) return { ok: false, error: "Not authorized." };

  const revisionId = formData.get("revisionId") as string;
  if (!revisionId) return { ok: false, error: "Missing revision." };

  const supabase = await createClient();
  const tenantId = ctx.tenant.id;

  const { data: revision } = await supabase
    .from("revisions")
    .select("id, entity_type, entity_id, snapshot")
    .eq("id", revisionId)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (!revision) return { ok: false, error: "Revision not found." };

  const entityType = revision.entity_type as RevisionEntityType;
  const entityId = revision.entity_id as string;
  const snapshot = (revision.snapshot ?? {}) as Record<string, unknown>;

  // ---------- section ----------
  if (entityType === "section") {
    const { data: current } = await supabase
      .from("sections")
      .select("id, page_id, content")
      .eq("id", entityId)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (!current) {
      return { ok: false, error: "This section no longer exists." };
    }

    await captureRevision(supabase, {
      tenantId,
      entityType: "section",
      entityId,
      snapshot: { content: current.content },
      createdBy: ctx.authUserId,
      createdByEmail: ctx.email,
    });

    const { error } = await supabase
      .from("sections")
      .update({ content: snapshot.content ?? {} })
      .eq("id", entityId)
      .eq("tenant_id", tenantId);

    if (error) return { ok: false, error: "Restore failed." };

    const { data: page } = await supabase
      .from("pages")
      .select("id, slug")
      .eq("id", current.page_id)
      .maybeSingle();

    if (page) {
      revalidatePath(page.slug === "home" ? "/" : `/${page.slug}`);
      revalidatePath(`/admin/pages/${page.id}`);
      revalidatePath(`/admin/pages/${page.id}/sections/${entityId}`);
    }
    return { ok: true };
  }

  // ---------- team_member ----------
  if (entityType === "team_member") {
    const { data: current } = await supabase
      .from("team_members")
      .select(
        "id, name, title, license_no, phone, email, photo_url, photo_position, bio, sort_order"
      )
      .eq("id", entityId)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (current) {
      await captureRevision(supabase, {
        tenantId,
        entityType: "team_member",
        entityId,
        snapshot: pick(
          current as unknown as Record<string, unknown>,
          TEAM_MEMBER_KEYS
        ),
        createdBy: ctx.authUserId,
        createdByEmail: ctx.email,
      });
    }

    const fields = pick(snapshot, TEAM_MEMBER_KEYS);

    // Upsert: restores edits AND resurrects deleted members
    const { error } = await supabase.from("team_members").upsert({
      id: entityId,
      tenant_id: tenantId,
      ...fields,
    });

    if (error) return { ok: false, error: "Restore failed." };

    // Revalidate every page rendering a team_grid, plus admin views
    const { data: pages } = await supabase
      .from("pages")
      .select("slug, sections!inner(type)")
      .eq("tenant_id", tenantId)
      .eq("sections.type", "team_grid");

    for (const page of pages ?? []) {
      revalidatePath(page.slug === "home" ? "/" : `/${page.slug}`);
    }
    revalidatePath("/admin/team");
    revalidatePath(`/admin/team/${entityId}`);
    return { ok: true };
  }

  // ---------- tenant_settings ----------
  if (entityType === "tenant_settings") {
    const { data: current } = await supabase
      .from("tenants")
      .select(TENANT_SETTINGS_KEYS.join(", "))
      .eq("id", tenantId)
      .maybeSingle();

    if (current) {
      await captureRevision(supabase, {
        tenantId,
        entityType: "tenant_settings",
        entityId: tenantId,
        snapshot: pick(
          current as unknown as Record<string, unknown>,
          TENANT_SETTINGS_KEYS
        ),
        createdBy: ctx.authUserId,
        createdByEmail: ctx.email,
      });
    }

    const fields = pick(snapshot, TENANT_SETTINGS_KEYS);

    const { error } = await supabase
      .from("tenants")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("id", tenantId);

    if (error) return { ok: false, error: "Restore failed." };

    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
    return { ok: true };
  }

  return { ok: false, error: "Unknown revision type." };
}
