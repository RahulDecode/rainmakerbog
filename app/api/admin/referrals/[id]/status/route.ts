import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { ReferralStatus } from "@/lib/types";

const ALLOWED: ReferralStatus[] = [
  "submitted",
  "nda_pending",
  "nda_signed",
  "call_proposed",
  "call_scheduled",
  "completed",
  "rejected",
  "cancelled",
];

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { id } = await params;
  let status = "";
  try {
    const body = await request.json();
    status = body?.status;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!ALLOWED.includes(status as ReferralStatus)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("referrals").update({ status }).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
