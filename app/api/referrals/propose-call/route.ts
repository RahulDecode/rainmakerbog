import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Contributor proposes call time slots for their own, already NDA-signed
// referral. Authenticated the same way as /api/nda/contributor-sign — a
// bearer access token verified against Supabase Auth, since writing the
// referral's status column requires the service role either way.
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let referralId = "";
  let slots: string[] = [];
  try {
    const body = await request.json();
    referralId = body?.referralId;
    slots = Array.isArray(body?.slots) ? body.slots.filter((s: unknown) => typeof s === "string" && s) : [];
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!referralId || slots.length === 0) {
    return NextResponse.json({ error: "referralId and at least one slot are required." }, { status: 400 });
  }

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !userData?.user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data: contributor } = await supabaseAdmin
    .from("contributors")
    .select("id")
    .eq("auth_user_id", userData.user.id)
    .single();
  if (!contributor) {
    return NextResponse.json({ error: "Contributor profile not found." }, { status: 404 });
  }

  const { data: referral } = await supabaseAdmin
    .from("referrals")
    .select("id, contributor_id, status")
    .eq("id", referralId)
    .single();
  if (!referral || referral.contributor_id !== contributor.id) {
    return NextResponse.json({ error: "Referral not found." }, { status: 404 });
  }
  if (referral.status !== "nda_signed" && referral.status !== "call_proposed") {
    return NextResponse.json({ error: "The NDA must be fully signed before proposing call times." }, { status: 409 });
  }

  const { error: upsertErr } = await supabaseAdmin
    .from("call_proposals")
    .upsert(
      { referral_id: referralId, proposed_slots: slots, status: "proposed", confirmed_slot: null, confirmed_at: null },
      { onConflict: "referral_id" }
    );
  if (upsertErr) {
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }

  await supabaseAdmin.from("referrals").update({ status: "call_proposed" }).eq("id", referralId);

  return NextResponse.json({ ok: true });
}
