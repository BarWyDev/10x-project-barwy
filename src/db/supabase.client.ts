import { createClient, type SupabaseClient as SupabaseClientBase } from '@supabase/supabase-js';

import type { Database } from './database.types';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Type-safe Supabase client with Database schema
 * Use this type instead of importing SupabaseClient from @supabase/supabase-js
 */
export type SupabaseClient = SupabaseClientBase<Database>;



