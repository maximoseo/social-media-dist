import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Layers3,
  FolderKanban,
  ImagePlus,
  Network,
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
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-[30px] border border-border/70 bg-surface/80 px-5 py-4 backdrop-blur sm:px-6">
          <div>
            <p className="eyebrow">MAXIMO Operations</p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
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

        <section className="grid gap-6 lg:grid-cols-[1.28fr_0.72fr]">
          <Card className="page-hero p-0">
            <div className="absolute inset-0 bg-grid opacity-50" />
            <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-accent/15 blur-3xl" />
            <div className="absolute right-0 top-8 h-48 w-48 rounded-full bg-warning/10 blur-3xl" />
            <div className="page-hero-inner">
              <div className="inline-flex w-fit items-center rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                Internal publishing workspace
              </div>
              <div className="max-w-3xl">
                <h2 className="text-4xl font-semibold tracking-tight text-text-primary sm:text-[3.6rem] sm:leading-[1.02]">
                  Ingest articles, generate <span className="bg-gradient-to-r from-accent to-info bg-clip-text text-transparent">channel-ready posts</span>, build assets, and publish on a long-range calendar.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">
                  Designed for n8n-driven article pipelines, multi-brand governance, Publer scheduling,
                  Supabase persistence, and Google Sheets visibility with server-side secret handling.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard">
                  <Button size="lg" icon={<ArrowRight className="h-4 w-4" />}>Open dashboard</Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="secondary" size="lg">Sign in</Button>
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {features.map((feature) => (
                  <div key={feature.title} className="panel-muted p-5 transition-all hover:-translate-y-0.5 hover:border-accent/25 hover:shadow-[0_20px_40px_-24px_rgba(0,0,0,0.5)]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">{feature.copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="grid gap-6">
            <Card className="rounded-[30px] border-border/70">
              <p className="eyebrow">Execution surface</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">Production-oriented by default</h3>
              <div className="mt-6 space-y-4">
                {[
                  ['Protected access', 'Supabase sessions, protected routes, and environment-only integrations.'],
                  ['Workflow visibility', 'Every draft, asset, publish job, retry, and sync stays attached to the right workspace.'],
                  ['Operational control', 'Built for internal teams who need clarity more than a pretty demo shell.'],
                ].map(([title, copy], index) => {
                  const icons = [ShieldCheck, Layers3, BadgeCheck];
                  const Icon = icons[index];
                  return (
                    <div key={title} className="data-card">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{title}</p>
                          <p className="mt-2 text-sm leading-6 text-text-secondary">{copy}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="rounded-[30px] border-border/70">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Integration readiness</p>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight">Current environment status</h3>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-surface-raised/75 text-accent">
                  <Network className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {Object.entries(integrations).map(([key, enabled]) => (
                  <div
                    key={key}
                    className="list-card flex items-center justify-between gap-3"
                  >
                    <span className="text-sm font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        enabled ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full bg-current ${enabled ? 'animate-pulse-dot' : ''}`} />
                      {enabled ? 'Configured' : 'Needs env'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <footer className="mt-auto border-t border-border/50 py-6 text-center text-sm text-text-muted">
          <p>Social Media Dist · Internal publishing workspace · MAXIMO Operations</p>
        </footer>
      </div>
    </main>
  );
}
