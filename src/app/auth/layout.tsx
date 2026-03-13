export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-6 lg:grid-cols-[1fr_420px]">
        <section className="panel relative hidden overflow-hidden rounded-[32px] p-8 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-grid opacity-60" />
          <div className="relative max-w-xl">
            <p className="eyebrow">Social Distribution Control</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">
              Operational publishing for every brand, queue, and approval state.
            </h1>
            <p className="mt-5 text-base text-text-secondary">
              Receive article payloads from n8n, turn them into channel-ready campaigns, generate
              images, schedule months ahead, and keep publishing status observable inside one tool.
            </p>
          </div>
          <div className="relative grid gap-4 md:grid-cols-3">
            {[
              ['Ingestion', 'Webhook-safe article intake with idempotency controls.'],
              ['Generation', 'AI copy variants and KIE asset tasks tied to drafts.'],
              ['Publishing', 'Publer jobs, retry queues, Sheets sync, and audit trails.'],
            ].map(([title, copy]) => (
              <div key={title} className="panel-muted p-4">
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-2 text-sm text-text-secondary">{copy}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="flex items-center justify-center">{children}</section>
      </div>
    </main>
  );
}
