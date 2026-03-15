import { NextRequest, NextResponse } from 'next/server';
import { getSupabasePublicConfigStatus } from '@/lib/social/env';
import { refreshSupabaseSession, getOriginFromRequest } from '@/lib/supabase/auth';

const PROTECTED_PATHS = ['/dashboard', '/sites', '/calendar', '/history', '/activity', '/settings'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const { response, user } = await refreshSupabaseSession(request);

  if (!user) {
    const origin = getOriginFromRequest(request);
    const loginUrl = new URL('/auth/login', origin);
    const supabaseConfig = getSupabasePublicConfigStatus();
    if (!supabaseConfig.configured) {
      loginUrl.searchParams.set('authSetup', 'missing-env');
    }
    loginUrl.searchParams.set(
      'redirect',
      `${pathname}${request.nextUrl.search}${request.nextUrl.hash}`,
    );
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/sites/:path*', '/calendar/:path*', '/history/:path*', '/activity/:path*', '/settings/:path*'],
};
