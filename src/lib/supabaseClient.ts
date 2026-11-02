import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock-fitlead.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy_fitlead_anon_key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Checks if Supabase client is connected to a live production backend
 */
export function isLiveSupabaseConfigured(): boolean {
  return (
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock") &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("dummy")
  );
}
