import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { hasServiceRoleConfig } from '@/lib/social/env';

let adminClient: SupabaseClient<any> | null = null;

export function getSupabaseAdminClient() {
  if (adminClient) return adminClient;
  if (!hasServiceRoleConfig()) return null;

  adminClient = createClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  return adminClient;
}
