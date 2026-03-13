'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  CalendarDays,
  FolderKanban,
  History,
  LayoutDashboard,
  LibraryBig,
  Settings2,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { LogoutButton } from './LogoutButton';
import { cn } from '@/lib/utils';

type ShellSite = {
  id: string;
  name: string;
  domain: string;
};

type ShellUser = {
  email: string;
  displayName: string;
};

const siteIcons = [
  { label: 'Overview', suffix: '', icon: LayoutDashboard },
  { label: 'Articles', suffix: '/articles', icon: LibraryBig },
  { label: 'Calendar', suffix: '/calendar', icon: CalendarDays },
  { label: 'History', suffix: '/history', icon: History },
  { label: 'Activity', suffix: '/activity', icon: Activity },
  { label: 'Settings', suffix: '/settings', icon: Settings2 },
];

export function AppShell({
  children,
  user,
  sites,
}: {
  children: React.ReactNode;
  user: ShellUser;
  sites: ShellSite[];
}) {
  const pathname = usePathname();
  const currentSiteId = pathname.startsWith('/sites/') ? pathname.split('/')[2] : null;
  const currentSite = currentSiteId ? sites.find((site) => site.id === currentSiteId) : null;

  return (
    <div className="flex min-h-screen bg-transparent">
      <aside className="hidden w-[312px] shrink-0 flex-col border-r border-border/70 bg-sidebar-bg px-5 py-6 text-sidebar-text lg:flex">
        <Link
          href="/dashboard"
          className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur"
        >
          <p className="eyebrow text-white/60">Workspace index</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/20 text-accent">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold text-white">Social Media Dist</p>
              <p className="text-sm text-white/60">Operational publishing surface</p>
            </div>
          </div>
        </Link>

        <nav className="mt-8 space-y-2">
          <SidebarLink href="/dashboard" active={pathname === '/dashboard'} icon={LayoutDashboard}>
            Workspaces
          </SidebarLink>
          {currentSite &&
            siteIcons.map((item) => (
              <SidebarLink
                key={item.label}
                href={`/sites/${currentSite.id}${item.suffix}`}
                active={pathname === `/sites/${currentSite.id}${item.suffix}`}
                icon={item.icon}
              >
                {item.label}
              </SidebarLink>
            ))}
        </nav>

        <div className="mt-8">
          <p className="px-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
            Sites
          </p>
          <div className="mt-3 space-y-2">
            {sites.map((site) => (
              <Link
                key={site.id}
                href={`/sites/${site.id}`}
                className={cn(
                  'block rounded-2xl border px-4 py-3 transition-colors',
                  currentSiteId === site.id
                    ? 'border-accent/30 bg-accent/15 text-white'
                    : 'border-white/5 bg-white/5 text-white/70 hover:border-white/10 hover:bg-white/10',
                )}
              >
                <p className="text-sm font-medium">{site.name}</p>
                <p className="mt-1 text-xs text-white/50">{site.domain}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-white">{user.displayName}</p>
          <p className="mt-1 text-xs text-white/50">{user.email}</p>
          <div className="mt-4 flex items-center justify-between">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <div>
              <p className="eyebrow">Publishing control</p>
              <h1 className="mt-2 text-lg font-semibold tracking-tight">
                {currentSite ? currentSite.name : 'Workspace Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-3 lg:hidden">
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 py-6 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarLink({
  href,
  active,
  icon: Icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors',
        active ? 'bg-sidebar-active text-white' : 'text-white/65 hover:bg-white/8 hover:text-white',
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}
