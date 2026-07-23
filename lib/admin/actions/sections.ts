"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/admin-server";
import { getAdminContext } from "@/lib/admin/get-admin-context";
import { captureRevision } from "@/lib/admin/revisions";

/**
 * Resolve the public path for a page slug so we can revalidate
 * the live site after an edit. The home page renders at "/".
 */
function publicPathForSlug(slug: string): string {
  return slug === "home" ? "/" : `/${slug}`;
}

/**
 * Move a section up or down within its page by swapping sort_order
 * with its nearest neighbor. The two updates are issued as separate
 * statements deliberately — do not combine them.
 *
 * RLS enforces tenant scoping (is_tenant_admin), but we still match
 * on tenant_id explicitly as defense in depth.
 */
export async function moveSection(formData: FormData) {
  const sectionId = formData.get("sectionId") as string;
  const direction = formData.get("direction") as "up" | "down";

  if (!sectionId || (direction !== "up" && direction !== "down")) return;

  const supabase = await createClient();

  // 1. Load the section being moved
  const { data: section } = await supabase
    .from("sections")
    .select("id, page_id, tenant_id, sort_order")
    .eq("id", sectionId)
    .maybeSingle();

  if (!section) return;

  // 2. Find its nearest neighbor in the move direction
  let neighborQuery = supabase
    .from("sections")
    .select("id, sort_order")
    .eq("page_id", section.page_id)
    .eq("tenant_id", section.tenant_id);

  neighborQuery =
    direction === "up"
      ? neighborQuery
          .lt("sort_order", section.sort_order)
          .order("sort_order", { ascending: false })
      : neighborQuery
          .gt("sort_order", section.sort_order)
          .order("sort_order", { ascending: true });

  const { data: neighbor } = await neighborQuery.limit(1).maybeSingle();

  if (!neighbor) return; // already at the top/bottom

  // 3. Swap sort_order values — two separate update statements
  const { error: errA } = await supabase
    .from("sections")
    .update({ sort_order: neighbor.sort_order })
    .eq("id", section.id)
    .eq("tenant_id", section.tenant_id);

  if (errA) return;

  const { error: errB } = await supabase
    .from("sections")
    .update({ sort_order: section.sort_order })
    .eq("id", neighbor.id)
    .eq("tenant_id", section.tenant_id);

  if (errB) return;

  // 4. Revalidate the admin view and the live public page
  const { data: page } = await supabase
    .from("pages")
    .select("slug")
    .eq("id", section.page_id)
    .maybeSingle();

  revalidatePath(`/admin/pages/${section.page_id}`);
  if (page?.slug) {
    revalidatePath(publicPathForSlug(page.slug));
  }
}

/**
 * Save a section's edited content JSON. The previous content is
 * snapshotted into the revisions table first, enabling one-click
 * restore from the section editor.
 */
export async function updateSectionContent(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.tenant) {
    return { ok: false, error: "Not authorized." };
  }

  const sectionId = formData.get("sectionId") as string;
  const contentJson = formData.get("content") as string;

  if (!sectionId || !contentJson) {
    return { ok: false, error: "Missing section or content." };
  }

  let content: unknown;
  try {
    content = JSON.parse(contentJson);
  } catch {
    return { ok: false, error: "Content is not valid JSON." };
  }

  if (
    typeof content !== "object" ||
    content === null ||
    Array.isArray(content)
  ) {
    return { ok: false, error: "Content must be a JSON object." };
  }

  const supabase = await createClient();

  // Load the current state for the revision snapshot + revalidation info
  const { data: section } = await supabase
    .from("sections")
    .select("id, page_id, tenant_id, content")
    .eq("id", sectionId)
    .maybeSingle();

  if (!section) {
    return { ok: false, error: "Section not found." };
  }

  // Snapshot the outgoing version before overwriting
  await captureRevision(supabase, {
    tenantId: section.tenant_id,
    entityType: "section",
    entityId: section.id,
    snapshot: { content: section.content },
    createdBy: ctx.authUserId,
    createdByEmail: ctx.email,
  });

  const { error } = await supabase
    .from("sections")
    .update({ content })
    .eq("id", section.id)
    .eq("tenant_id", section.tenant_id);

  if (error) {
    return { ok: false, error: "Save failed. Please try again." };
  }

  const { data: page } = await supabase
    .from("pages")
    .select("slug")
    .eq("id", section.page_id)
    .maybeSingle();

  revalidatePath(`/admin/pages/${section.page_id}`);
  revalidatePath(`/admin/pages/${section.page_id}/sections/${section.id}`);
  if (page?.slug) {
    revalidatePath(publicPathForSlug(page.slug));
  }

  return { ok: true };
}
