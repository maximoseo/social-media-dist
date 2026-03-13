import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { sanitizeRedirectPath } from '@/lib/supabase/auth';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = sanitizeRedirectPath(
    searchParams.get('next') ?? searchParams.get('redirect'),
    '/dashboard',
  );
  const redirectUrl = new URL(next, origin);
  const redirectResponse = NextResponse.redirect(redirectUrl);

  if (code) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                request.cookies.set(name, value);
                redirectResponse.cookies.set(name, value, options);
              });
            },
          },
        },
      );
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return redirectResponse;
      }
    } catch {
      // Fall through to redirect without a session cookie if the exchange fails.
    }
  }

  return redirectResponse;
}
