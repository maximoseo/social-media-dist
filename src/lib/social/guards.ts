import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import type { SiteBundle } from './types';

export async function getAuthenticatedUser() {
  const supabase = createServerSupabaseClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ?? null;
}

export async function requireAuthenticatedUser() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect('/auth/login');
  }
  return user;
}

export async function listAccessibleSites(userId: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  const { data: memberships } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', userId);

  const organizationIds = memberships?.map((membership) => membership.organization_id) ?? [];
  if (!organizationIds.length) return [];

  const { data: sites } = await supabase
    .from('sites')
    .select('*')
    .in('organization_id', organizationIds)
    .order('created_at', { ascending: true });

  return (sites ?? []) as Array<{ id: string; name: string; domain: string; organization_id: string }>;
}

export async function requireSiteBundle(siteId: string): Promise<SiteBundle | null> {
  const user = await requireAuthenticatedUser();
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;

  const { data: site } = await supabase.from('sites').select('*').eq('id', siteId).single();
  if (!site) return null;

  const { data: membership } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', site.organization_id)
    .eq('user_id', user.id)
    .single();

  if (!membership) {
    redirect('/dashboard');
  }

  const [{ data: settings }, { data: socialAccounts }] = await Promise.all([
    supabase.from('site_settings').select('*').eq('site_id', siteId).single(),
    supabase.from('social_accounts').select('*').eq('site_id', siteId).order('platform'),
  ]);

  return {
    site,
    settings,
    socialAccounts: socialAccounts ?? [],
  };
}

export async function assertUserCanAccessSite(siteId: string) {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error('Supabase service role is not configured.');
  }

  const { data: site } = await supabase.from('sites').select('*').eq('id', siteId).single();
  if (!site) {
    throw new Error('Site not found.');
  }

  const { data: membership } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', site.organization_id)
    .eq('user_id', user.id)
    .single();

  if (!membership) {
    throw new Error('Forbidden');
  }

  return { user, site };
}
