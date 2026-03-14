import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { getSupabasePublicConfigStatus } from '@/lib/social/env';

function applyCookies(
  response: NextResponse,
  cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>,
  request?: NextRequest,
) {
  for (const cookie of cookiesToSet) {
    if (request) {
      request.cookies.set(cookie.name, cookie.value);
    }

    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
}

export async function refreshSupabaseSession(request: NextRequest): Promise<{
  response: NextResponse;
  user: User | null;
}> {
  let response = NextResponse.next({ request });

  const config = getSupabasePublicConfigStatus();
  if (!config.configured) {
    return { response, user: null };
  }

  const supabase = createServerClient(
    config.supabaseUrl,
    config.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          response = NextResponse.next({ request });
          applyCookies(response, cookiesToSet, request);
        },
      },
    },
  );

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return { response, user: user ?? null };
  } catch {
    return { response, user: null };
  }
}

export function sanitizeRedirectPath(rawPath: string | null | undefined, fallback = '/dashboard') {
  if (!rawPath || !rawPath.startsWith('/') || rawPath.startsWith('//')) {
    return fallback;
  }

  try {
    const url = new URL(rawPath, 'http://localhost');
    if (url.pathname.startsWith('/auth')) {
      return fallback;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
