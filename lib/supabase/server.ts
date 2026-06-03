import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseUrl, supabaseAnonKey, supabaseServiceKey } from "./env";

/** Server-side Supabase client bound to the request cookie store. */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // Safe to ignore when middleware refreshes the session.
        }
      },
    },
  });
}

/** Service-role client for trusted server-only operations (seeding, API routes). */
export function createServiceClient() {
  return createServerClient(supabaseUrl(), supabaseServiceKey(), {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}
