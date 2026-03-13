import { AppShell } from '@/components/social/AppShell';
import { listAccessibleSites, requireAuthenticatedUser } from '@/lib/social/guards';

export default async function ProtectedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuthenticatedUser();
  const sites = await listAccessibleSites(user.id);

  return (
    <AppShell
      user={{
        email: user.email ?? '',
        displayName:
          (user.user_metadata?.display_name as string | undefined) ??
          user.email?.split('@')[0] ??
          'Operator',
      }}
      sites={sites.map((site) => ({
        id: site.id,
        name: site.name,
        domain: site.domain,
      }))}
    >
      {children}
    </AppShell>
  );
}
