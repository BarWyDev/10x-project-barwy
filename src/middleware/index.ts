import { defineMiddleware } from 'astro:middleware';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '../db/database.types';
import type { AppUser } from '../env';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_KEY;

export const onRequest = defineMiddleware(async (context, next) => {
  // Create a Supabase client with proper SSR cookie handling
  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        const cookie = context.request.headers.get('cookie');
        if (!cookie) return undefined;
        
        const cookies = cookie.split(';').map(c => c.trim());
        for (const c of cookies) {
          const [cookieName, ...cookieValueParts] = c.split('=');
          if (cookieName === name) {
            const value = cookieValueParts.join('=');
            return decodeURIComponent(value);
          }
        }
        return undefined;
      },
      set() {
        // Cannot set cookies on the request, only on response
        // This is handled by the client-side
      },
      remove() {
        // Cannot remove cookies on the request
      },
    },
  });

  context.locals.supabase = supabase;

  // Get authenticated user from session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Map Supabase user to simplified AppUser type
  context.locals.user = user
    ? {
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
      }
    : null;

  // Route protection logic
  const pathname = context.url.pathname;

  // Protected routes - require authentication
  if (pathname.startsWith('/app')) {
    if (!context.locals.user) {
      return context.redirect('/login');
    }
  }

  // Auth routes - redirect to app if already logged in
  if (pathname === '/login' || pathname === '/register') {
    if (context.locals.user) {
      return context.redirect('/app');
    }
  }

  return next();
});



