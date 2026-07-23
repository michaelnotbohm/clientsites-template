"use client";

import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/admin-client";

export function SignOutButton({ label = false }: { label?: boolean }) {
  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Full reload so all server-rendered state is cleared
    window.location.href = "/admin/login";
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="flex items-center gap-2 rounded-lg p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
      title="Sign out"
    >
      <LogOut className="h-4 w-4" />
      {label && <span className="text-sm font-medium">Sign out</span>}
    </button>
  );
}
