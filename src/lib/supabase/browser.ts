import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabasePublicConfigStatus } from '@/lib/social/env';

let browserClient: SupabaseClient<any> | null = null;

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;
  const config = getSupabasePublicConfigStatus();
  if (!config.configured) return null;

  browserClient = createBrowserClient<any>(
    config.supabaseUrl,
    config.supabaseAnonKey,
    { isSingleton: true },
  );

  return browserClient;
}
