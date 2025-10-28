import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient as SupabaseClientBase } from "@supabase/supabase-js";

import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
  cookies: {
    get(name) {
      if (typeof document === "undefined") return undefined;

      const cookies = document.cookie.split(";").map((c) => c.trim());
      for (const cookie of cookies) {
        const [cookieName, ...cookieValueParts] = cookie.split("=");
        if (cookieName === name) {
          return decodeURIComponent(cookieValueParts.join("="));
        }
      }
      return undefined;
    },
    set(name, value, options) {
      if (typeof document === "undefined") return;

      let cookie = `${name}=${encodeURIComponent(value)}`;
      cookie += "; path=/";
      cookie += "; SameSite=Lax";

      if (options?.maxAge) {
        cookie += `; max-age=${options.maxAge}`;
      }

      document.cookie = cookie;
    },
    remove(name) {
      if (typeof document === "undefined") return;

      let cookie = `${name}=`;
      cookie += "; path=/";
      cookie += "; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      document.cookie = cookie;
    },
  },
});

/**
 * Type-safe Supabase client with Database schema
 * Use this type instead of importing SupabaseClient from @supabase/supabase-js
 */
export type SupabaseClient = SupabaseClientBase<Database>;
