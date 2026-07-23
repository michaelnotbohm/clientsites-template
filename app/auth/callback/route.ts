import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/admin-server";

/**
 * Auth callback handler.
 * Google OAuth (and any email-link flows) redirect here with a `code`
 * which we exchange for a session cookie, then forward to the admin.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/admin/login?error=auth_failed`);
}
