export const SOCIAL_PLATFORMS = [
  'facebook',
  'instagram',
  'linkedin',
  'twitter',
  'google_business_profile',
] as const;

export const DRAFT_STATUSES = ['pending', 'generated', 'approved', 'rejected', 'scheduled'] as const;

export const CALENDAR_STATUSES = ['draft', 'scheduled', 'published', 'failed'] as const;

export const JOB_STATUSES = ['pending', 'running', 'scheduled', 'succeeded', 'failed', 'retrying'] as const;

export const APPROVAL_STATUSES = ['draft', 'pending_review', 'approved', 'rejected'] as const;

export const AI_MODELS = {
  openai: 'gpt-4.1-mini',
  openrouter: 'openai/gpt-4o-mini',
  anthropic: 'claude-3-7-sonnet-latest',
  kie: 'nanobanana-2',
};

export const APP_NAVIGATION = [
  { label: 'Dashboard', href: '/dashboard', icon: 'layout-dashboard' },
  { label: 'Calendar', href: '/calendar', icon: 'calendar-days' },
  { label: 'History', href: '/history', icon: 'history' },
  { label: 'Activity', href: '/activity', icon: 'activity' },
  { label: 'Settings', href: '/settings', icon: 'settings-2' },
];
