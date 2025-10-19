import { defineMiddleware } from 'astro:middleware';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../db/database.types';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const onRequest = defineMiddleware(async (context, next) => {
  // Create a Supabase client for this request
  // This allows us to use the auth token from the request headers
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        // Forward the Authorization header from the request
        Authorization: context.request.headers.get('Authorization') || '',
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  context.locals.supabase = supabase;
  return next();
});



