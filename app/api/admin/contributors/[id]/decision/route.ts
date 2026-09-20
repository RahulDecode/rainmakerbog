import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { id } = await params;
  let decision = "";
  let reason = "";
  try {
    const body = await request.json();
    decision = body?.decision;
    reason = typeof body?.reason === "string" ? body.reason : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (decision !== "approved" && decision !== "rejected") {
    return NextResponse.json({ error: "decision must be 'approved' or 'rejected'." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("contributors")
    .update({
      status: decision,
      approved_at: decision === "approved" ? new Date().toISOString() : null,
      rejection_reason: decision === "rejected" ? reason || "Not specified" : null,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
