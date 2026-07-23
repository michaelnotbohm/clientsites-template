import Link from "next/link";
import {
  FileText,
  Layers,
  Newspaper,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/admin-server";
import { getAdminContext } from "@/lib/admin/get-admin-context";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.tenant) return null; // layout handles the unauthorized state

  const supabase = await createClient();
  const tenantId = ctx.tenant.id;

  const [pagesRes, sectionsRes, postsRes, mediaRes] = await Promise.all([
    supabase
      .from("pages")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId),
    supabase
      .from("sections")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId),
    supabase
      .from("media")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId),
  ]);

  const firstName = ctx.fullName.split(" ")[0];

  const stats = [
    {
      label: "Pages",
      value: pagesRes.count ?? 0,
      icon: FileText,
      tint: "bg-violet-50 text-violet-600",
    },
    {
      label: "Sections",
      value: sectionsRes.count ?? 0,
      icon: Layers,
      tint: "bg-sky-50 text-sky-600",
    },
    {
      label: "Blog posts",
      value: postsRes.count ?? 0,
      icon: Newspaper,
      tint: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Media files",
      value: mediaRes.count ?? 0,
      icon: ImageIcon,
      tint: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here&apos;s a snapshot of {ctx.tenant.name}
        </p>
      </div>

      {/* Site card */}
      <div className="mb-8 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {ctx.tenant.isPreview ? "Site" : "Live site"}
            </p>
            {ctx.tenant.isPreview && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                Sandbox
              </span>
            )}
          </div>
          <p className="text-base font-semibold text-slate-900">
            {ctx.tenant.name}
          </p>
          {ctx.tenant.liveDomain && (
            <p className="text-sm text-slate-500">{ctx.tenant.liveDomain}</p>
          )}
          {ctx.tenant.isPreview && ctx.tenant.domain && (
            <p className="mt-0.5 text-xs text-slate-400">
              Goes live at {ctx.tenant.domain}
            </p>
          )}
        </div>
        {ctx.tenant.liveDomain && (
          <Link
            href={`https://${ctx.tenant.liveDomain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            View site
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div
                className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${stat.tint}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* What's next */}
      <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-5">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-700">Coming soon:</span>{" "}
          page &amp; section editing, media manager, theme settings, and user
          management. Items marked{" "}
          <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Soon
          </span>{" "}
          in the sidebar light up as each ships.
        </p>
      </div>
    </div>
  );
}
