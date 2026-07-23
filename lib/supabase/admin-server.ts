import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client for the admin dashboard
 * (Server Components, Server Actions, Route Handlers).
 * Reads/writes the auth session from cookies, so RLS policies see the
 * logged-in admin user (auth.uid()) instead of the anonymous role.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component where cookies can't be written.
            // Safe to ignore — the middleware handles session refresh.
          }
        },
      },
    }
  );
}
