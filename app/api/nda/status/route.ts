import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Public read-only lookup used by the /nda/[token] page to render current
// signature state without exposing anything beyond what that token permits.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  if (!token) {
    return NextResponse.json({ error: "token is required." }, { status: 400 });
  }

  const { data: referral, error } = await supabaseAdmin
    .from("referrals")
    .select("id, business_name, status")
    .eq("nda_token", token)
    .single();
  if (error || !referral) {
    return NextResponse.json({ error: "This NDA link is invalid." }, { status: 404 });
  }

  const { data: signatures } = await supabaseAdmin
    .from("nda_signatures")
    .select("party, signer_name, signed_at")
    .eq("referral_id", referral.id);

  return NextResponse.json({
    businessName: referral.business_name,
    referralStatus: referral.status,
    signatures: signatures ?? [],
  });
}
