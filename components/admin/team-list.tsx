"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  UserRound,
} from "lucide-react";
import { moveTeamMember, deleteTeamMember } from "@/lib/admin/actions/team";

export interface TeamMemberRow {
  id: string;
  name: string;
  title: string | null;
  license_no: string | null;
  photo_url: string | null;
  sort_order: number;
}

export function TeamList({ members }: { members: TeamMemberRow[] }) {
  const [isPending, startTransition] = useTransition();

  function handleMove(memberId: string, direction: "up" | "down") {
    const formData = new FormData();
    formData.set("memberId", memberId);
    formData.set("direction", direction);
    startTransition(async () => {
      await moveTeamMember(formData);
    });
  }

  function handleDelete(memberId: string, name: string) {
    if (
      !window.confirm(
        `Remove ${name} from the team? This also removes them from the live site.`
      )
    ) {
      return;
    }
    const formData = new FormData();
    formData.set("memberId", memberId);
    startTransition(async () => {
      await deleteTeamMember(formData);
    });
  }

  if (members.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center text-sm text-slate-400">
        No team members yet. Add the first one above.
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
      {members.map((member, index) => {
        const isFirst = index === 0;
        const isLast = index === members.length - 1;

        return (
          <div
            key={member.id}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
          >
            {/* Position */}
            <span className="w-6 shrink-0 text-center font-mono text-xs text-slate-300">
              {index + 1}
            </span>

            {/* Photo */}
            {member.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.photo_url}
                alt={member.name}
                className="h-11 w-11 shrink-0 rounded-full border border-slate-200 object-cover"
              />
            ) : (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <UserRound className="h-5 w-5" />
              </span>
            )}

            {/* Identity — links to the editor */}
            <Link
              href={`/admin/team/${member.id}`}
              className="group min-w-0 flex-1"
            >
              <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-violet-700">
                {member.name}
              </p>
              <p className="truncate text-xs text-slate-400">
                {[member.title, member.license_no && `NMLS ${member.license_no}`]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </Link>

            {/* Edit */}
            <Link
              href={`/admin/team/${member.id}`}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Link>

            {/* Delete */}
            <button
              type="button"
              onClick={() => handleDelete(member.id, member.name)}
              className="flex shrink-0 items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              title="Remove"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>

            {/* Reorder */}
            <div className="flex shrink-0 flex-col gap-1">
              <button
                type="button"
                disabled={isFirst || isPending}
                onClick={() => handleMove(member.id, "up")}
                className="flex h-6 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                title="Move up"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                disabled={isLast || isPending}
                onClick={() => handleMove(member.id, "down")}
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
