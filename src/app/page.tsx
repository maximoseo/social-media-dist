import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  FolderKanban,
  ImagePlus,
  ShieldCheck,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { getEnabledIntegrations } from '@/lib/social/env';

const features = [
  {
    title: 'Multi-site control',
    copy: 'Keep each workspace isolated with its own voice, approvals, publishing rules, and platform mappings.',
    icon: FolderKanban,
  },
  {
    title: 'Calendar-first operations',
    copy: 'Plan months ahead, bulk schedule campaigns, and keep queue state visible across teams and brands.',
    icon: CalendarDays,
  },
  {
    title: 'AI drafts and visuals',
    copy: 'Turn imported articles into platform-aware copy and KIE-powered visuals without exposing operational secrets.',
    icon: ImagePlus,
  },
  {
    title: 'Observable publishing',
    copy: 'Track every Publer job, retry path, and Google Sheets sync inside one operational interface.',
    icon: ShieldCheck,
  },
];

export default function HomePage() {
  const integrations = getEnabledIntegrations();

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col gap-10">
        <header className="flex items-center justify-between rounded-3xl border border-border/70 bg-surface/80 px-5 py-4 backdrop-blur sm:px-6">
          <div>
            <p className="eyebrow">MAXIMO Operations</p>
            <h1 className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">
              Social Media Dist
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/dashboard">
              <Button icon={<ArrowRight className="h-4 w-4" />}>Open dashboard</Button>
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <Card className="relative overflow-hidden rounded-[28px] border-border/70 bg-surface/80 p-0 shadow-[0_40px_120px_-48px_rgba(15,23,42,0.4)]">
            <div className="absolute inset-0 bg-grid opacity-50" />
            <div className="relative flex h-full flex-col gap-8 px-6 py-10 sm:px-10">
              <div className="inline-flex w-fit items-center rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                Internal publishing workspace
              </div>
              <div className="max-w-3xl">
                <h2 className="text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
                  Ingest articles, generate channel-ready posts, build assets, and publish on a long-range calendar.
                </h2>
                <p className="mt-5 max-w-2xl text-base text-text-secondary sm:text-lg">
                  Designed for n8n-driven article pipelines, multi-brand governance, Publer scheduling,
                  Supabase persistence, and Google Sheets visibility with server-side secret handling.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {features.map((feature) => (
                  <div key={feature.title} className="panel-muted p-5">
                    <feature.icon className="h-5 w-5 text-accent" />
                    <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-text-secondary">{feature.copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="grid gap-6">
            <Card className="rounded-[28px] border-border/70 bg-[linear-gradient(180deg,hsl(var(--surface)),hsl(var(--surface-raised)))]">
              <p className="eyebrow">Execution surface</p>
              <h3 className="mt-3 text-2xl font-semibold">Production-oriented by default</h3>
              <div className="mt-6 space-y-3 text-sm text-text-secondary">
                <p>Protected routes, Supabase sessions, env-only integrations, and structured audit logging.</p>
                <p>Server-side wrappers for ingestion, draft generation, KIE image tasks, Publer jobs, and Sheets sync.</p>
                <p>Operational dashboards built for internal usage rather than a thin demo veneer.</p>
              </div>
            </Card>

            <Card className="rounded-[28px] border-border/70">
              <p className="eyebrow">Integration readiness</p>
              <div className="mt-5 space-y-3">
                {Object.entries(integrations).map(([key, enabled]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-2xl border border-border/80 bg-surface-raised/60 px-4 py-3"
                  >
                    <span className="text-sm font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        enabled ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                      }`}
                    >
                      {enabled ? 'Configured' : 'Needs env'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
