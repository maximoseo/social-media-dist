export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-6 lg:grid-cols-[1.12fr_0.88fr]">
        <section className="page-hero hidden lg:block">
          <div className="absolute inset-0 bg-grid opacity-60" />
          <div className="absolute -left-16 top-0 h-48 w-48 rounded-full bg-accent/15 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-warning/10 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
          <div className="page-hero-inner h-full justify-between">
            <div className="max-w-2xl">
              <div className="toolbar-chip w-fit border-accent/20 bg-accent/10 text-accent">
                Premium internal publishing workspace
              </div>
              <p className="eyebrow mt-6">Social Distribution Control</p>
              <h1 className="mt-4 text-[2.85rem] font-semibold leading-[1.05] tracking-tight text-text-primary">
                Operational publishing for <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">every brand</span>, queue, and approval state.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-text-secondary">
                Receive article payloads from n8n, turn them into channel-ready campaigns, generate
                images, schedule months ahead, and keep publishing status observable inside one tool.
              </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
              <div className="space-y-4">
                <div className="data-card">
                  <p className="eyebrow">What the team sees</p>
                  <p className="mt-3 text-lg font-semibold text-text-primary">
                    One workspace for intake, drafting, approvals, calendar control, and publish logs.
                  </p>
                </div>
                <div className="data-card">
                  <p className="text-sm font-semibold text-text-primary">Security posture</p>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">
                    Server-side integrations, protected routes, and environment-only secret handling.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-3">
                {[
                  ['Ingestion', 'Webhook-safe article intake with idempotency controls.'],
                  ['Generation', 'AI copy variants and KIE asset tasks tied to drafts.'],
                  ['Publishing', 'Publer jobs, retry queues, Sheets sync, and audit trails.'],
                ].map(([title, copy]) => (
                  <div key={title} className="panel-muted p-5 transition-all hover:-translate-y-0.5 hover:border-accent/20">
                    <p className="text-sm font-semibold text-text-primary">{title}</p>
                    <p className="mt-3 text-sm leading-6 text-text-secondary">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="flex items-center justify-center">{children}</section>
      </div>
    </main>
  );
}
