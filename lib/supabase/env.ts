/**
 * Resolves Supabase connection details across the various env-var names that
 * different setups inject:
 *   - Local / standard: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   - Vercel Supabase integration: SUPABASE_URL, SUPABASE_ANON_KEY
 *
 * NOTE: only NEXT_PUBLIC_* vars are inlined into the browser bundle. The
 * server-only fallbacks below are visible to the server client and middleware,
 * not to `createClient()` in lib/supabase/client.ts.
 */
const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_KEY = "public-anon-placeholder-key";

export function supabaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    PLACEHOLDER_URL
  );
}

export function supabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    PLACEHOLDER_KEY
  );
}

export function supabaseServiceKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    "service-role-placeholder-key"
  );
}
