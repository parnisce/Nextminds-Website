import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// The project URL and publishable key are public by design: every browser that
// opens the site receives them. What protects the data is Row Level Security in
// supabase/schema.sql, not the secrecy of this key. Never put the secret
// (service_role) key anywhere in this repo.
export const SUPABASE_URL = "https://bdmoarvprhxfbeswvtdo.supabase.co";
export const SUPABASE_KEY = "sb_publishable_91RFw6Ty8YITjiQgeEaVog_xjQiXZxI";

let browserClient: SupabaseClient | undefined;

/** Browser client: keeps the admin session in localStorage. Call from effects/handlers only. */
export function supabase(): SupabaseClient {
  browserClient ??= createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  });
  return browserClient;
}

/** Anonymous read-only client for server-side loaders (no session, nothing stored). */
export function supabasePublic(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
