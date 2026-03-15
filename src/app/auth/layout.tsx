export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-accent/8 blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full bg-accent/3 blur-[150px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      
      <div className="relative flex min-h-screen">
        <section className="hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-between p-12 xl:p-16">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/8 px-4 py-2 text-xs font-medium text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              Social Distribution Platform
            </div>
            <h1 className="mt-8 text-4xl font-bold tracking-tight text-text-primary xl:text-5xl xl:leading-tight">
              Streamline your{' '}
              <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">
                content pipeline
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-text-secondary xl:text-lg">
              Manage articles, approvals, and publishing schedules across all your social media channels from one unified workspace.
            </p>
          </div>

          <div className="relative z-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/50 bg-surface-raised/40 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text-primary">Fast Intake</h3>
              </div>
              <p className="text-sm leading-relaxed text-text-secondary">
                Receive article payloads from n8n webhooks with automatic deduplication and validation.
              </p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-surface-raised/40 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text-primary">AI Generation</h3>
              </div>
              <p className="text-sm leading-relaxed text-text-secondary">
                Generate copy variants and image assets with integrated AI capabilities.
              </p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-surface-raised/40 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text-primary">Calendar View</h3>
              </div>
              <p className="text-sm leading-relaxed text-text-secondary">
                Visualize and manage your content schedule with an intuitive calendar interface.
              </p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-surface-raised/40 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text-primary">Multi-channel</h3>
              </div>
              <p className="text-sm leading-relaxed text-text-secondary">
                Publish to multiple social platforms with Publer integration and sync to Google Sheets.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-6 text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              Secure authentication
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              Server-side processing
            </span>
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">{children}</div>
        </section>
      </div>
    </main>
  );
}
