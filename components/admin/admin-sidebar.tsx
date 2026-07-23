"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  FileText,
  Newspaper,
  Image as ImageIcon,
  Palette,
  Users,
  Contact,
  type LucideIcon,
} from "lucide-react";
import { SignOutButton } from "@/components/admin/sign-out-button";
import type { AdminRole } from "@/lib/admin/get-admin-context";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  ready: boolean; // false → rendered as disabled with a "Soon" badge
  superAdminOnly?: boolean;
}

interface NavSection {
  heading: string;
  items: NavItem[];
}

const NAV: NavSection[] = [
  {
    heading: "Content",
    items: [
      { label: "Overview", href: "/admin", icon: LayoutGrid, ready: true },
      { label: "Pages", href: "/admin/pages", icon: FileText, ready: true },
      { label: "Team", href: "/admin/team", icon: Contact, ready: true },
      { label: "Media", href: "/admin/media", icon: ImageIcon, ready: true },
      { label: "Blog", href: "/admin/blog", icon: Newspaper, ready: false },
    ],
  },
  {
    heading: "Settings",
    items: [
      {
        label: "Theme & Settings",
        href: "/admin/settings",
        icon: Palette,
        ready: true,
      },
      {
        label: "Users",
        href: "/admin/users",
        icon: Users,
        ready: true,
        superAdminOnly: true,
      },
    ],
  },
];

const BRAND_LOGO_URL =
  "https://toivhpeabwwqilbzbrfb.supabase.co/storage/v1/object/public/Website%20Photos/B2B-logo.png";

interface AdminSidebarProps {
  fullName: string;
  email: string;
  role: AdminRole;
  tenantName: string;
}

export function AdminSidebar({
  fullName,
  email,
  role,
  tenantName,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const initials = fullName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white">
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={BRAND_LOGO_URL}
          alt="Bay to Bay Lending"
          className="h-8 w-auto shrink-0"
        />
        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-700">
          Admin
        </span>
      </div>

      {/* Active tenant */}
      <div className="mx-4 mb-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Site
        </p>
        <p className="truncate text-sm font-medium text-slate-800">
          {tenantName}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3">
        {NAV.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !item.superAdminOnly || role === "super_admin"
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.heading} className="mb-6">
              <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {section.heading}
              </p>
              <ul className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  if (!item.ready) {
                    return (
                      <li key={item.href}>
                        <div className="flex cursor-default items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300">
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                          <span className="ml-auto rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                            Soon
                          </span>
                        </div>
                      </li>
                    );
                  }

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={
                          isActive
                            ? "flex items-center gap-3 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700"
                            : "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                        }
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* User chip */}
      <div className="flex items-center gap-3 border-t border-slate-200 px-4 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
          {initials || "?"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-800">
            {fullName}
          </p>
          <p className="truncate text-xs text-slate-400">{email}</p>
        </div>
        <SignOutButton />
      </div>
    </aside>
  );
}
