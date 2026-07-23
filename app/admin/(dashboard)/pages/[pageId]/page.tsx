import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/admin-server";
import { getAdminContext } from "@/lib/admin/get-admin-context";
import { SectionList, type SectionRow } from "@/components/admin/section-list";

export const dynamic = "force-dynamic";

export default async function AdminPageDetail({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;

  const ctx = await getAdminContext();
  if (!ctx || !ctx.tenant) return null;

  const supabase = await createClient();

  const { data: page } = await supabase
    .from("pages")
    .select("id, slug, title, status")
    .eq("id", pageId)
    .eq("tenant_id", ctx.tenant.id)
    .maybeSingle();

  if (!page) notFound();

  const { data: sections } = await supabase
    .from("sections")
    .select("id, type, variant, content, sort_order")
    .eq("page_id", page.id)
    .eq("tenant_id", ctx.tenant.id)
    .order("sort_order", { ascending: true });

  const publicPath = page.slug === "home" ? "/" : `/${page.slug}`;
  const liveUrl = ctx.tenant.liveDomain
    ? `https://${ctx.tenant.liveDomain}${publicPath === "/" ? "" : publicPath}`
    : null;

  return (
    <div>
      {/* Breadcrumb + header */}
      <div className="mb-8">
        <Link
          href="/admin/pages"
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-violet-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All pages
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {page.title || page.slug}
            </h1>
            <p className="mt-1 font-mono text-xs text-slate-400">
              {publicPath}
            </p>
          </div>
          {liveUrl && (
            <Link
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              {ctx.tenant.isPreview ? "View on sandbox" : "View live"}
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      <SectionList pageId={page.id} sections={(sections ?? []) as SectionRow[]} />
    </div>
  );
}
