import { getAdminContext } from "@/lib/admin/get-admin-context";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SignOutButton } from "@/components/admin/sign-out-button";

export const metadata = {
  title: "ClientSites Admin",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getAdminContext();

  // Signed in, but no admin_users row → access was never granted.
  if (!ctx) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <span className="text-xl">🔒</span>
          </div>
          <h1 className="mb-2 text-lg font-semibold text-slate-900">
            Access not granted
          </h1>
          <p className="mb-6 text-sm text-slate-500">
            Your account is signed in, but it hasn&apos;t been given access to
            this dashboard. Contact your site administrator to request access.
          </p>
          <div className="flex justify-center">
            <SignOutButton label />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar
        fullName={ctx.fullName}
        email={ctx.email}
        role={ctx.role}
        tenantName={ctx.tenant?.name ?? "No site"}
      />
      <main className="pl-64">
        <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
