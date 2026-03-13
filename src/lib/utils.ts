import { clsx, type ClassValue } from 'clsx';
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(value: string | Date | null | undefined, fallback = 'Not set') {
  if (!value) return fallback;
  const parsed = value instanceof Date ? value : parseISO(value);
  if (!isValid(parsed)) return fallback;
  return format(parsed, 'MMM d, yyyy · HH:mm');
}

export function formatShortDate(value: string | Date | null | undefined, fallback = 'Not set') {
  if (!value) return fallback;
  const parsed = value instanceof Date ? value : parseISO(value);
  if (!isValid(parsed)) return fallback;
  return format(parsed, 'MMM d');
}

export function formatRelative(value: string | Date | null | undefined, fallback = 'Just now') {
  if (!value) return fallback;
  const parsed = value instanceof Date ? value : parseISO(value);
  if (!isValid(parsed)) return fallback;
  return formatDistanceToNow(parsed, { addSuffix: true });
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function toTitleCase(value: string) {
  return value
    .split(/[_\s-]+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

export function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function absoluteUrl(pathname: string) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!siteUrl) return pathname;

  try {
    return new URL(pathname, siteUrl).toString();
  } catch {
    return pathname;
  }
}
