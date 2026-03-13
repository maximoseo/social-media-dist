import { notFound } from 'next/navigation';
import { SiteSettingsForm } from '@/components/social/SiteSettingsForm';
import { requireSiteBundle } from '@/lib/social/guards';

export default async function SiteSettingsPage({ params }: { params: { siteId: string } }) {
  const bundle = await requireSiteBundle(params.siteId);

  if (!bundle) {
    notFound();
  }

  return <SiteSettingsForm bundle={bundle} />;
}
