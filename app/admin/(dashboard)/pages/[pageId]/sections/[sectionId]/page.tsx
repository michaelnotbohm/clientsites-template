import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentProps } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/admin-server";
import { getAdminContext } from "@/lib/admin/get-admin-context";
import { SectionContentForm } from "@/components/admin/section-content-form";

export const dynamic = "force-dynamic";

type SectionContent = ComponentProps
  typeof SectionContentForm
>["initialContent"];

export default async function AdminSectionEditPage({
  params,
}: {
  params: Promise<{ pageId: string; sectionId: string }>;
}) {
  const { pageId, sectionId } = await params;

  const ctx = await getAdminContext();
  if (!ctx || !ctx.tenant) return null;

  const supabase = await createClient();

  const { data: page } = await supabase
    .from("pages")
    .select("id, slug, title")
    .eq("id", pageId)
    .eq("tenant_id", ctx.tenant.id)
    .maybeSingle();

  if (!page) notFound();

  const { data: section } = await supabase
    .from("sections")
    .select("id, type, variant, content")
    .eq("id", sectionId)
    .eq("page_id", page.id)
    .eq("tenant_id", ctx.tenant.id)
    .maybeSingle();

  if (!section) notFound();

  const initialContent = (section.content ?? {}) as SectionContent;

  const publicPath = page.slug === "home" ? "/" : `/${page.slug}`;
  const liveUrl = ctx.tenant.liveDomain
    ? `https://${ctx.tenant.liveDomain}${publicPath === "/" ? "" : publicPath}`
    : null;

  return (
    <div>
      {/* Breadcrumb + header */}
      <div className="mb-8">
        <Link
          href={`/admin/pages/${page.id}`}
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-violet-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {page.title || page.slug}
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {section.type}
              </h1>
              {section.variant && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-500">
                  {section.variant}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Edit this section&apos;s content. Saving updates the live page
              immediately.
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

      <SectionContentForm
        sectionId={section.id}
        initialContent={initialContent}
      />
    </div>
  );
}
