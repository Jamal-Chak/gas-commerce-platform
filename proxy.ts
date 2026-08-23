import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { readEnv } from '@/lib/config/env';

/**
 * Next.js 16 Proxy (replaces deprecated middleware.ts).
 *
 * Refreshes the Supabase auth session on every request and protects
 * authenticated routes by redirecting anonymous users to /login.
 */
export async function proxy(request: NextRequest) {
  const url = readEnv('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (!url || !anonKey || url.includes('your-project') || anonKey === 'your-anon-key') {
    // Supabase is not configured — let all requests through.
    return NextResponse.next();
  }

  // Create a response first so setAll can write Set-Cookie headers to it.
  const supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          request.cookies.set(name, value);
          supabaseResponse.cookies.set(name, value, options);
        }
      },
    },
  });

  // Refresh the session from cookies — this may trigger setAll if tokens are refreshed.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthRoute =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup') ||
    request.nextUrl.pathname.startsWith('/forgot-password');

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/account');
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  // Admin routes require authentication
  if (isAdminRoute && !session) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/account', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
