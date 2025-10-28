/// <reference types="astro/client" />

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db/database.types";

/**
 * Simplified User type for application use
 * Contains essential user information from Supabase Auth
 */
export interface AppUser {
  id: string;
  email: string;
  created_at: string;
}

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      user: AppUser | null;
    }
  }
}

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  readonly OPENAI_API_KEY?: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
