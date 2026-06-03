import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseUrl, supabaseAnonKey } from "@/lib/supabase/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Deploy diagnostics. Reports which env vars are *present* (booleans only — no
 * secret values) and whether the database + anonymous auth are reachable.
 * Safe to leave in; remove once the deploy is confirmed healthy.
 */
export async function GET() {
  const env = {
    // The browser bundle can ONLY use these two — if false, the client UI breaks.
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
    // Server-only fallbacks (Vercel Supabase integration naming).
    SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
    SUPABASE_ANON_KEY: Boolean(process.env.SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    ANTHROPIC_API_KEY: Boolean(process.env.ANTHROPIC_API_KEY),
    ANTHROPIC_SECRET_KEY: Boolean(process.env.ANTHROPIC_SECRET_KEY),
  };

  const checks: Record<string, unknown> = {
    browserClientConfigured:
      env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    anthropicConfigured: env.ANTHROPIC_API_KEY || env.ANTHROPIC_SECRET_KEY,
  };

  // DB reachability + migration check: a trivial read against the rooms table.
  try {
    const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
      cookies: { getAll: () => [], setAll: () => {} },
    });
    const { error } = await supabase
      .from("rooms")
      .select("id", { head: true, count: "exact" });
    checks.database = error
      ? { ok: false, error: error.message }
      : { ok: true, note: "rooms table reachable" };
  } catch (e) {
    checks.database = { ok: false, error: (e as Error).message };
  }

  // Anonymous auth check.
  try {
    const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
      cookies: { getAll: () => [], setAll: () => {} },
    });
    const { error } = await supabase.auth.signInAnonymously();
    checks.anonymousAuth = error
      ? { ok: false, error: error.message }
      : { ok: true };
  } catch (e) {
    checks.anonymousAuth = { ok: false, error: (e as Error).message };
  }

  return NextResponse.json({ env, checks }, { status: 200 });
}
