import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { Contributor, Referral } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  submitted: "Submitted",
  nda_pending: "NDA pending",
  nda_signed: "NDA signed",
  call_proposed: "Call proposed",
  call_scheduled: "Call scheduled",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export const dynamic = "force-dynamic";

export default async function AdminReferralsPage() {
  const { data: referralsData } = await supabaseAdmin
    .from("referrals")
    .select("*")
    .order("created_at", { ascending: false });
  const referrals = (referralsData as Referral[]) ?? [];

  const { data: contributorsData } = await supabaseAdmin.from("contributors").select("id, full_name");
  const contributorMap = new Map((contributorsData as Pick<Contributor, "id" | "full_name">[])?.map((c) => [c.id, c.full_name]));

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">All referrals ({referrals.length})</h1>
      {referrals.length === 0 && <p style={{ color: "var(--muted)" }}>No referrals submitted yet.</p>}
      <div className="space-y-3">
        {referrals.map((r) => (
          <Link key={r.id} href={`/admin/referrals/${r.id}`} className="rb-card p-4 flex items-center justify-between block">
            <div>
              <p className="font-medium">{r.business_name}</p>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Referred by {contributorMap.get(r.contributor_id) ?? "—"} · {new Date(r.created_at).toLocaleDateString()}
              </p>
            </div>
            <span className="rb-badge" style={{ background: "rgba(212,175,55,0.12)", color: "var(--accent)" }}>
              {STATUS_LABEL[r.status] ?? r.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
