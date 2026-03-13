import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { hasBrowserSupabaseConfig } from '@/lib/social/env';

let browserClient: SupabaseClient<any> | null = null;

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;
  if (!hasBrowserSupabaseConfig()) return null;

  browserClient = createBrowserClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { isSingleton: true },
  );

  return browserClient;
}
