'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  CalendarDays,
  ChevronRight,
  FolderKanban,
  History,
  LayoutDashboard,
  LibraryBig,
  ShieldCheck,
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
  const mobileLinks = currentSite
    ? siteIcons.map((item) => ({
        label: item.label,
        href: `/sites/${currentSite.id}${item.suffix}`,
      }))
    : [{ label: 'Workspaces', href: '/dashboard' }];

  return (
    <div className="flex min-h-screen bg-transparent">
      <aside className="hidden w-[320px] shrink-0 flex-col border-r border-white/5 bg-sidebar-bg px-5 py-5 text-sidebar-text lg:flex">
        <Link
          href="/dashboard"
          className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] px-5 py-5 shadow-[0_30px_80px_-55px_rgba(14,165,233,0.8)] backdrop-blur"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow text-white/55">Workspace index</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/25 bg-accent/15 text-accent">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-semibold text-white">Social Media Dist</p>
                  <p className="text-sm text-white/58">Operational publishing surface</p>
                </div>
              </div>
            </div>
            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
              Live
            </div>
          </div>
          <div className="mt-5 flex items-center gap-2 text-xs text-white/52">
            <ShieldCheck className="h-4 w-4 text-accent" />
            Auth, queue state, and publishing controls in one shell
          </div>
        </Link>

        <nav className="mt-8 space-y-2">
          <SidebarLink href="/dashboard" active={isLinkActive(pathname, '/dashboard')} icon={LayoutDashboard}>
            Workspaces
          </SidebarLink>
          {currentSite &&
            siteIcons.map((item) => (
              <SidebarLink
                key={item.label}
                href={`/sites/${currentSite.id}${item.suffix}`}
                active={isLinkActive(pathname, `/sites/${currentSite.id}${item.suffix}`)}
                icon={item.icon}
              >
                {item.label}
              </SidebarLink>
            ))}
        </nav>

        <div className="mt-8">
          <div className="flex items-center justify-between px-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
              Sites
            </p>
            <span className="rounded-full bg-white/6 px-2.5 py-1 text-[11px] font-medium text-white/55">
              {sites.length}
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {sites.map((site) => (
              <Link
                key={site.id}
                href={`/sites/${site.id}`}
                className={cn(
                  'block rounded-[24px] border px-4 py-3.5 transition-all',
                  currentSiteId === site.id
                    ? 'border-accent/25 bg-accent/[0.14] text-white shadow-[0_20px_45px_-32px_rgba(14,165,233,0.7)]'
                    : 'border-white/10 bg-white/[0.045] text-white/70 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.075]',
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{site.name}</p>
                    <p className="mt-1 text-xs text-white/48">{site.domain}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-60" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-auto rounded-[28px] border border-white/10 bg-white/[0.055] p-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white">
              {user.displayName.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user.displayName}</p>
              <p className="truncate text-xs text-white/50">{user.email}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div>
              <p className="eyebrow">{currentSite ? 'Site cockpit' : 'Publishing control'}</p>
              <h1 className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">
                {currentSite ? currentSite.name : 'Workspace Dashboard'}
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                {currentSite ? currentSite.domain : `${sites.length} workspaces available in this account`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden rounded-full border border-border/70 bg-surface-raised/70 px-3 py-1.5 text-xs font-medium text-text-secondary md:inline-flex">
                <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-success animate-pulse-dot" />
                Publishing services connected server-side
              </div>
              <div className="flex items-center gap-3 lg:hidden">
                <ThemeToggle />
                <LogoutButton />
              </div>
            </div>
          </div>
          <div className="border-t border-border/50 lg:hidden">
            <div className="mx-auto max-w-[1600px] px-4 py-3 sm:px-6">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {mobileLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-medium transition-all',
                      isLinkActive(pathname, item.href)
                        ? 'border-accent/30 bg-accent/[0.14] text-accent'
                        : 'border-border/70 bg-surface-raised/65 text-text-secondary',
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
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

function isLinkActive(pathname: string, href: string) {
  if (href === '/dashboard') {
    return pathname === href;
  }

  if (!href.includes('/sites/') || href.endsWith('/sites/')) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
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
        'flex items-center justify-between gap-3 rounded-[22px] border px-3.5 py-3 text-sm font-medium transition-all',
        active
          ? 'border-accent/25 bg-accent/[0.12] text-white shadow-[0_18px_40px_-34px_rgba(14,165,233,0.9)]'
          : 'border-transparent text-white/60 hover:border-white/10 hover:bg-white/[0.055] hover:text-white',
      )}
    >
      <span className="flex items-center gap-3">
        <Icon className="h-4 w-4" />
        {children}
      </span>
      {active ? <span className="h-2 w-2 rounded-full bg-accent" /> : null}
    </Link>
  );
}
