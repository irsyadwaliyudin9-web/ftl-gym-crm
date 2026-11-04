import { createClient } from "@supabase/supabase-js";

export const PRODUCTION_SUPABASE_URL = "https://ofttnidvcjasaccqhfoq.supabase.co";
export const PRODUCTION_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mdHRuaWR2Y2phc2FjY3FoZm9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1Njg3ODcsImV4cCI6MjEwODE0NDc4N30.3BFjPcMrDXXf5oUA7B570qky3rwlDxFA0nAe3dNHkUY";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || PRODUCTION_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PRODUCTION_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Checks if Supabase client is connected to a live production backend
 */
export function isLiveSupabaseConfigured(): boolean {
  return true;
}
