import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "public-anon-placeholder-key";

/** Server-side Supabase client bound to the request cookie store. */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(url, anonKey, {
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
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || "service-role-placeholder-key";
  return createServerClient(url, serviceKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}
