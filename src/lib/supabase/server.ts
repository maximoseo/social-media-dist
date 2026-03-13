import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { hasBrowserSupabaseConfig } from '@/lib/social/env';

export function createServerSupabaseClient() {
  if (!hasBrowserSupabaseConfig()) {
    return null;
  }

  const cookieStore = cookies();

  return createServerClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server components can read session cookies even when writes are not allowed.
          }
        },
      },
    },
  );
}
