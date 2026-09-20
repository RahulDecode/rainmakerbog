import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// The business owner never has an account — the NDA token embedded in the
// /nda/[token] link *is* their credential to sign this one referral's NDA.
export async function POST(request: Request) {
  let token = "";
  let signerName = "";
  let signerEmail = "";
  try {
    const body = await request.json();
    token = typeof body?.token === "string" ? body.token : "";
    signerName = typeof body?.signerName === "string" ? body.signerName.trim() : "";
    signerEmail = typeof body?.signerEmail === "string" ? body.signerEmail.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!token || !signerName || !signerEmail) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  const { data: referral, error: referralErr } = await supabaseAdmin
    .from("referrals")
    .select("id, status")
    .eq("nda_token", token)
    .single();
  if (referralErr || !referral) {
    return NextResponse.json({ error: "This NDA link is invalid." }, { status: 404 });
  }

  const { count } = await supabaseAdmin
    .from("nda_signatures")
    .select("id", { count: "exact", head: true })
    .eq("referral_id", referral.id)
    .eq("party", "business_owner");
  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: "This NDA has already been signed." }, { status: 409 });
  }

  const { error: insertErr } = await supabaseAdmin.from("nda_signatures").insert({
    referral_id: referral.id,
    party: "business_owner",
    signer_name: signerName,
    signer_email: signerEmail,
    agreed: true,
  });
  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  const { count: bothCount } = await supabaseAdmin
    .from("nda_signatures")
    .select("id", { count: "exact", head: true })
    .eq("referral_id", referral.id);

  const newStatus = (bothCount ?? 0) >= 2 ? "nda_signed" : "nda_pending";
  await supabaseAdmin.from("referrals").update({ status: newStatus }).eq("id", referral.id);

  return NextResponse.json({ ok: true, status: newStatus });
}
