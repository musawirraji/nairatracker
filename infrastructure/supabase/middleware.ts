import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Refreshes the Supabase auth session on every request.
 * This is required so Server Components always get a valid token.
 * Uses getAll/setAll (current pattern) — NOT the old get/set/remove.
 *
 * IMPORTANT: always return supabaseResponse, not a new NextResponse,
 * or the session will go out of sync.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // First: write to the request so downstream middleware sees them
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Re-create the response to pick up the mutated request cookies
          supabaseResponse = NextResponse.next({ request });
          // Then: write to the response so the browser gets them
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    },
  );

  // getUser() — not getSession() — validates the token with the Auth server
  const { data: { user } } = await supabase.auth.getUser();

  return { supabaseResponse, user };
}
