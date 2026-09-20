import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { id } = await params;
  let confirmedSlot = "";
  try {
    const body = await request.json();
    confirmedSlot = typeof body?.confirmedSlot === "string" ? body.confirmedSlot : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!confirmedSlot) {
    return NextResponse.json({ error: "confirmedSlot is required." }, { status: 400 });
  }

  const { data: proposal, error: proposalErr } = await supabaseAdmin
    .from("call_proposals")
    .update({
      confirmed_slot: confirmedSlot,
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("referral_id")
    .single();

  if (proposalErr || !proposal) {
    return NextResponse.json({ error: proposalErr?.message ?? "Proposal not found." }, { status: 500 });
  }

  const { error: referralErr } = await supabaseAdmin
    .from("referrals")
    .update({ status: "call_scheduled" })
    .eq("id", proposal.referral_id);

  if (referralErr) {
    return NextResponse.json({ error: referralErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
