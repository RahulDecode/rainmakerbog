import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// RainmakerBOG's tables live in their own "rainmakerbog" Postgres schema,
// isolated from this Supabase project's other ventures. This client uses the
// anon key and is subject to RLS (scoped to auth.uid() via
// contributors.auth_user_id) — safe to use from the browser.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: "rainmakerbog" },
});
