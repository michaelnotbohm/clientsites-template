"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  History,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  listRevisions,
  revertRevision,
  type RevisionListItem,
} from "@/lib/admin/actions/revisions";
import type { RevisionEntityType } from "@/lib/admin/revisions";

interface RevisionHistoryProps {
  entityType: RevisionEntityType;
  entityId: string;
}

export function RevisionHistory({
  entityType,
  entityId,
}: RevisionHistoryProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<RevisionListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function load() {
    setLoading(true);
    setError(null);
    const result = await listRevisions(entityType, entityId);
    setLoading(false);
    if (result.ok && result.items) {
      setItems(result.items);
    } else {
      setError(result.error ?? "Failed to load history.");
    }
  }

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && items === null) {
      void load();
    }
  }

  function handleRestore(revisionId: string) {
    if (
      !window.confirm(
        "Restore this version? The current version is saved to history first, so you can undo this too."
      )
    ) {
      return;
    }
    const formData = new FormData();
    formData.set("revisionId", revisionId);
    startTransition(async () => {
      const result = await revertRevision(formData);
      if (result.ok) {
        await load();
        router.refresh();
      } else {
        setError(result.error ?? "Restore failed.");
      }
    });
  }

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <History className="h-4 w-4 text-slate-400" />
          Version history
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="border-t border-slate-100 px-5 py-4">
          {loading && (
            <p className="flex items-center gap-2 py-2 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading history…
            </p>
          )}

          {error && (
            <p className="flex items-center gap-1.5 py-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          )}

          {!loading && !error && items && items.length === 0 && (
            <p className="py-2 text-sm text-slate-400">
              No saved versions yet — history starts with your next save.
            </p>
          )}

          {!loading && !error && items && items.length > 0 && (
            <ul
              className={
                isPending
                  ? "pointer-events-none divide-y divide-slate-100 opacity-60"
                  : "divide-y divide-slate-100"
              }
            >
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-slate-700">
                      {formatDistanceToNow(new Date(item.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                    {item.created_by_email && (
                      <p className="truncate text-xs text-slate-400">
                        {item.created_by_email}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleRestore(item.id)}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-50"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
