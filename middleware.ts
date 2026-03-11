import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/infrastructure/supabase/middleware';
import { isProtected, isAuthRoute, ROUTES } from '@/lib/routes';

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Unauthenticated user hitting a protected route → send to login
  if (!user && isProtected(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.login;
    return NextResponse.redirect(url);
  }

  // Authenticated user hitting login → send to dashboard
  if (user && isAuthRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.dashboard;
    return NextResponse.redirect(url);
  }

  // Always return supabaseResponse — never a plain NextResponse.next()
  // or the cookie refresh won't reach the browser
  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
