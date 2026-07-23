import type { SupabaseClient } from "@supabase/supabase-js";

export type RevisionEntityType = "section" | "team_member" | "tenant_settings";

const KEEP_PER_ENTITY = 20;

/**
 * Snapshot an entity's current state into the revisions table, then
 * prune to the newest KEEP_PER_ENTITY snapshots for that entity.
 *
 * Best-effort by design: a failed capture must never block the save
 * itself, so errors are swallowed.
 */
export async function captureRevision(
  supabase: SupabaseClient,
  params: {
    tenantId: string;
    entityType: RevisionEntityType;
    entityId: string;
    snapshot: Record<string, unknown>;
    createdBy?: string | null;
    createdByEmail?: string | null;
  }
): Promise<void> {
  try {
    await supabase.from("revisions").insert({
      tenant_id: params.tenantId,
      entity_type: params.entityType,
      entity_id: params.entityId,
      snapshot: params.snapshot,
      created_by: params.createdBy ?? null,
      created_by_email: params.createdByEmail ?? null,
    });

    // Prune: anything beyond the newest KEEP_PER_ENTITY
    const { data: stale } = await supabase
      .from("revisions")
      .select("id")
      .eq("tenant_id", params.tenantId)
      .eq("entity_type", params.entityType)
      .eq("entity_id", params.entityId)
      .order("created_at", { ascending: false })
      .range(KEEP_PER_ENTITY, KEEP_PER_ENTITY + 100);

    if (stale && stale.length > 0) {
      await supabase
        .from("revisions")
        .delete()
        .in(
          "id",
          stale.map((row) => row.id)
        );
    }
  } catch {
    // Never block a save because revision capture failed.
  }
}
