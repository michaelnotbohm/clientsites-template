import Link from "next/link";
import { FileText, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/admin-server";
import { getAdminContext } from "@/lib/admin/get-admin-context";

export const dynamic = "force-dynamic";

interface PageRow {
  id: string;
  slug: string;
  title: string | null;
  status: string;
  sort_order: number | null;
  sections: { count: number }[];
}

export default async function AdminPagesPage() {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.tenant) return null;

  const supabase = await createClient();

  const { data: pages } = await supabase
    .from("pages")
    .select("id, slug, title, status, sort_order, sections(count)")
    .eq("tenant_id", ctx.tenant.id)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("slug", { ascending: true });

  const rows = (pages ?? []) as PageRow[];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Pages
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Every page on {ctx.tenant.name}. Open a page to view and reorder its
          sections.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Page
              </th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Slug
              </th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Sections
              </th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Status
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((page) => {
              const sectionCount = page.sections?.[0]?.count ?? 0;
              const isPublished = page.status === "published";

              return (
                <tr
                  key={page.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                >
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/pages/${page.id}`}
                      className="flex items-center gap-3 font-medium text-slate-800 hover:text-violet-700"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                        <FileText className="h-4 w-4" />
                      </span>
                      {page.title || page.slug}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                    /{page.slug === "home" ? "" : page.slug}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {sectionCount}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={
                        isPublished
                          ? "inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
                          : "inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500"
                      }
                    >
                      <span
                        className={
                          isPublished
                            ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
                            : "h-1.5 w-1.5 rounded-full bg-slate-400"
                        }
                      />
                      {isPublished ? "Published" : page.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/admin/pages/${page.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-violet-700"
                    >
                      Open
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-sm text-slate-400"
                >
                  No pages found for this site.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
