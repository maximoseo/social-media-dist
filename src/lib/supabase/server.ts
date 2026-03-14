import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabasePublicConfigStatus } from '@/lib/social/env';

export function createServerSupabaseClient() {
  const config = getSupabasePublicConfigStatus();
  if (!config.configured) {
    return null;
  }

  const cookieStore = cookies();

  return createServerClient<any>(
    config.supabaseUrl,
    config.supabaseAnonKey,
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
