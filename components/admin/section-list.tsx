"use client";

import Link from "next/link";
import { useTransition } from "react";
import { ChevronUp, ChevronDown, Layers, Pencil } from "lucide-react";
import { moveSection } from "@/lib/admin/actions/sections";

export interface SectionRow {
  id: string;
  type: string;
  variant: string | null;
  content: Record<string, unknown> | null;
  sort_order: number;
}

/**
 * Pulls a human-readable preview string out of a section's content JSON
 * by checking the most common text-bearing keys.
 */
function previewText(content: Record<string, unknown> | null): string {
  if (!content) return "";
  const keys = [
    "headline",
    "heading",
    "title",
    "eyebrow",
    "subheadline",
    "subheading",
    "text",
    "body",
  ];
  for (const key of keys) {
    const value = content[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.length > 90 ? `${value.slice(0, 90)}…` : value;
    }
  }
  return "";
}

export function SectionList({
  pageId,
  sections,
}: {
  pageId: string;
  sections: SectionRow[];
}) {
  const [isPending, startTransition] = useTransition();

  function handleMove(sectionId: string, direction: "up" | "down") {
    const formData = new FormData();
    formData.set("sectionId", sectionId);
    formData.set("direction", direction);
    startTransition(async () => {
      await moveSection(formData);
    });
  }

  if (sections.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center text-sm text-slate-400">
        This page has no sections yet.
      </div>
    );
  }

  return (
    <div
      className={
        isPending
          ? "pointer-events-none space-y-3 opacity-60 transition-opacity"
          : "space-y-3 transition-opacity"
      }
    >
      {sections.map((section, index) => {
        const preview = previewText(section.content);
        const isFirst = index === 0;
        const isLast = index === sections.length - 1;

        return (
          <div
            key={section.id}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
          >
            {/* Position */}
            <span className="w-6 shrink-0 text-center font-mono text-xs text-slate-300">
              {index + 1}
            </span>

            {/* Type icon */}
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Layers className="h-4 w-4" />
            </span>

            {/* Type / variant / preview — links to the editor */}
            <Link
              href={`/admin/pages/${pageId}/sections/${section.id}`}
              className="group min-w-0 flex-1"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-800 group-hover:text-violet-700">
                  {section.type}
                </span>
                {section.variant && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-500">
                    {section.variant}
                  </span>
                )}
              </div>
              {preview && (
                <p className="mt-0.5 truncate text-xs text-slate-400">
                  {preview}
                </p>
              )}
            </Link>

            {/* Edit */}
            <Link
              href={`/admin/pages/${pageId}/sections/${section.id}`}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Link>

            {/* Reorder controls */}
            <div className="flex shrink-0 flex-col gap-1">
              <button
                type="button"
                disabled={isFirst || isPending}
                onClick={() => handleMove(section.id, "up")}
                className="flex h-6 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                title="Move up"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                disabled={isLast || isPending}
                onClick={() => handleMove(section.id, "down")}
                className="flex h-6 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                title="Move down"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
