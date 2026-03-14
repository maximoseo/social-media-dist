import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { hasBrowserSupabaseConfig } from '@/lib/social/env';

export async function GET(request: NextRequest) {
  const loginUrl = new URL('/auth/login', request.url);
  const response = NextResponse.redirect(loginUrl);

  if (!hasBrowserSupabaseConfig()) {
    return response;
  }

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
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    await supabase.auth.signOut();
  } catch {
    // Redirect to the login boundary even if Supabase sign-out fails.
  }

  return response;
}
