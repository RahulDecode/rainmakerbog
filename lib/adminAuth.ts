import { createHash } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "rainmakerbog_admin_session";

/** Derives a cookie token from the server-side ADMIN_PASSWORD env var, so
 * the plaintext password is never itself stored in the browser — only this
 * derived value, which is meaningless without the original password. */
export function computeAdminToken(password: string): string {
  return createHash("sha256").update(`${password}:rainmakerbog-admin-salt-v1`).digest("hex");
}

/** Used inside /api/admin/* route handlers (which proxy.ts's matcher does
 * NOT cover, since it only matches /admin page routes) to independently
 * verify the admin cookie before performing any service-role mutation. */
export async function isAdminRequest(): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const store = await cookies();
  const cookie = store.get(ADMIN_COOKIE)?.value;
  return !!cookie && cookie === computeAdminToken(expected);
}
