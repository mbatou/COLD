import { createBrowserClient } from "@supabase/ssr";

// Fallbacks keep `next build` from throwing when env vars are absent in CI.
// At runtime the real values from .env.local are used.
const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "public-anon-placeholder-key";

/** Browser-side Supabase client (auth + realtime). */
export function createClient() {
  return createBrowserClient(url, anonKey);
}

export type SupabaseBrowserClient = ReturnType<typeof createClient>;
