"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/admin-server";
import { getAdminContext } from "@/lib/admin/get-admin-context";

export interface MediaActionResult {
  ok: boolean;
  error?: string;
}

export interface MediaListItem {
  id: string;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
}

export interface MediaListResult {
  ok: boolean;
  error?: string;
  tenantId?: string;
  items?: MediaListItem[];
}

/**
 * List the current tenant's media library (newest first).
 * Used by the image picker modal.
 */
export async function listMedia(): Promise<MediaListResult> {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.tenant) {
    return { ok: false, error: "Not authorized." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("media")
    .select("id, url, alt, width, height, created_at")
    .eq("tenant_id", ctx.tenant.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { ok: false, error: "Failed to load media." };
  }

  return {
    ok: true,
    tenantId: ctx.tenant.id,
    items: (data ?? []) as MediaListItem[],
  };
}

/**
 * Register an uploaded file in the media table. The browser uploads
 * directly to Storage (tenant-scoped path, enforced by storage RLS),
 * then calls this to index it.
 */
export async function registerMedia(
  formData: FormData
): Promise<MediaActionResult> {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.tenant) {
    return { ok: false, error: "Not authorized." };
  }

  const url = (formData.get("url") as string) || "";
  const alt = ((formData.get("alt") as string) || "").trim();
  const width = parseInt((formData.get("width") as string) || "", 10);
  const height = parseInt((formData.get("height") as string) || "", 10);

  if (!url.startsWith("http")) {
    return { ok: false, error: "Invalid file URL." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("media").insert({
    tenant_id: ctx.tenant.id,
    url,
    alt: alt || null,
    width: Number.isFinite(width) ? width : null,
    height: Number.isFinite(height) ? height : null,
    folder: null,
  });

  if (error) {
    return { ok: false, error: "Failed to index the upload." };
  }

  revalidatePath("/admin/media");
  return { ok: true };
}

/**
 * Delete a media record and its underlying Storage object.
 * The storage path is derived from the public URL.
 */
export async function deleteMedia(
  formData: FormData
): Promise<MediaActionResult> {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.tenant) {
    return { ok: false, error: "Not authorized." };
  }

  const mediaId = formData.get("mediaId") as string;
  if (!mediaId) return { ok: false, error: "Missing file." };

  const supabase = await createClient();

  const { data: media } = await supabase
    .from("media")
    .select("id, url")
    .eq("id", mediaId)
    .eq("tenant_id", ctx.tenant.id)
    .maybeSingle();

  if (!media) return { ok: false, error: "File not found." };

  // Derive the storage object path from the public URL
  const marker = "/object/public/media/";
  const markerIndex = media.url.indexOf(marker);
  if (markerIndex !== -1) {
    const objectPath = decodeURIComponent(
      media.url.slice(markerIndex + marker.length)
    );
    // Best effort — if the object is already gone, still remove the record
    await supabase.storage.from("media").remove([objectPath]);
  }

  const { error } = await supabase
    .from("media")
    .delete()
    .eq("id", media.id)
    .eq("tenant_id", ctx.tenant.id);

  if (error) return { ok: false, error: "Delete failed. Please try again." };

  revalidatePath("/admin/media");
  return { ok: true };
}
