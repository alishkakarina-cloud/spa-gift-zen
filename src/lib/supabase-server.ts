import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client. Never import this from a component — it reads
 * secrets that must not reach the client bundle (no `VITE_` prefix), and per
 * this framework's execution model those must be read inside a per-request
 * handler, not at module scope.
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY only (bypasses Row Level Security; the
 * certificates table ships with RLS on and no policies, so this is the only
 * key that can read/write it). Deliberately does not fall back to an anon
 * key — this client only ever runs server-side, so there's no reason to use
 * a weaker credential here.
 */
export function getSupabaseServerClient() {
  const url = process.env["SUPABASE_URL"];
  const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase is not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY as server environment variables.",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
