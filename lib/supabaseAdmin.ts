import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

// Server-only client using the service-role key, which bypasses RLS
// entirely. Used exclusively inside API routes for actions an ordinary
// contributor should never be able to perform directly: approving/rejecting
// contributors, recording a business owner's NDA signature (a party with no
// account at all), and confirming call slots. Never import this file from
// any client component — the "server-only" import above makes accidentally
// bundling it into client code a build-time error.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  db: { schema: "rainmakerbog" },
  auth: { autoRefreshToken: false, persistSession: false },
});
