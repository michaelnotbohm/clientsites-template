import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Supabase project URL - can also be set via NEXT_PUBLIC_SUPABASE_URL env var
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://toivhpeabwwqilbzbrfb.supabase.co'

export async function createClient() {
  // Support both standard and non-standard env var names
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_SUPABASE_ANON_KEY

  if (!key) {
    throw new Error('[Supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_SUPABASE_ANON_KEY must be set.')
  }

  const cookieStore = await cookies()

  return createServerClient(
    SUPABASE_URL,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // The "setAll" method was called from a Server Component.
            // This can be ignored if you have proxy refreshing
            // user sessions.
          }
        },
      },
    },
  )
}
