import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Contributor signs the NDA for their own referral. Authenticated via the
// Supabase access token the browser client already holds (passed as a
// bearer token), verified here with the service-role client so we can also
// update referrals.status — a column contributors have no direct RLS write
// access to.
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let referralId = "";
  let signerName = "";
  try {
    const body = await request.json();
    referralId = body?.referralId;
    signerName = typeof body?.signerName === "string" ? body.signerName.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!referralId || !signerName) {
    return NextResponse.json({ error: "referralId and signerName are required." }, { status: 400 });
  }

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !userData?.user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data: contributor, error: contributorErr } = await supabaseAdmin
    .from("contributors")
    .select("id, email, status")
    .eq("auth_user_id", userData.user.id)
    .single();
  if (contributorErr || !contributor) {
    return NextResponse.json({ error: "Contributor profile not found." }, { status: 404 });
  }
  if (contributor.status !== "approved") {
    return NextResponse.json({ error: "Your account isn't approved yet." }, { status: 403 });
  }

  const { data: referral, error: referralErr } = await supabaseAdmin
    .from("referrals")
    .select("id, contributor_id, status")
    .eq("id", referralId)
    .single();
  if (referralErr || !referral || referral.contributor_id !== contributor.id) {
    return NextResponse.json({ error: "Referral not found." }, { status: 404 });
  }

  const { error: alreadyCheckErr, count } = await supabaseAdmin
    .from("nda_signatures")
    .select("id", { count: "exact", head: true })
    .eq("referral_id", referralId)
    .eq("party", "contributor");
  if (alreadyCheckErr) {
    return NextResponse.json({ error: alreadyCheckErr.message }, { status: 500 });
  }
  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: "You've already signed this NDA." }, { status: 409 });
  }

  const { error: insertErr } = await supabaseAdmin.from("nda_signatures").insert({
    referral_id: referralId,
    party: "contributor",
    signer_name: signerName,
    signer_email: contributor.email,
    agreed: true,
  });
  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  const { count: bothCount } = await supabaseAdmin
    .from("nda_signatures")
    .select("id", { count: "exact", head: true })
    .eq("referral_id", referralId);

  const newStatus = (bothCount ?? 0) >= 2 ? "nda_signed" : "nda_pending";
  await supabaseAdmin.from("referrals").update({ status: newStatus }).eq("id", referralId);

  return NextResponse.json({ ok: true, status: newStatus });
}
