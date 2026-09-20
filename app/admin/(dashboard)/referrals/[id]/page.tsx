import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { CallProposal, Contributor, NdaSignature, Referral } from "@/lib/types";
import CallConfirm from "./CallConfirm";
import StatusOverride from "./StatusOverride";

export const dynamic = "force-dynamic";

export default async function AdminReferralDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: referral } = await supabaseAdmin.from("referrals").select("*").eq("id", id).single();
  if (!referral) {
    return <p style={{ color: "var(--muted)" }}>Referral not found.</p>;
  }
  const r = referral as Referral;

  const { data: contributor } = await supabaseAdmin
    .from("contributors")
    .select("*")
    .eq("id", r.contributor_id)
    .single();
  const c = contributor as Contributor | null;

  const { data: sigData } = await supabaseAdmin.from("nda_signatures").select("*").eq("referral_id", id);
  const signatures = (sigData as NdaSignature[]) ?? [];

  const { data: proposalData } = await supabaseAdmin
    .from("call_proposals")
    .select("*")
    .eq("referral_id", id)
    .maybeSingle();
  const proposal = proposalData as CallProposal | null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">{r.business_name}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          {r.contact_name} · {r.contact_email}
          {r.contact_phone ? ` · ${r.contact_phone}` : ""}
        </p>
        <p className="mt-3 text-sm">{r.opportunity_description}</p>
        {r.estimated_value && (
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Estimated value: {r.estimated_value}
          </p>
        )}
      </div>

      <div className="rb-card p-6">
        <h2 className="font-semibold mb-2">Contributor</h2>
        {c ? (
          <p className="text-sm">
            {c.full_name} · {c.email} · {c.contributor_type === "student" ? "Student / fresh graduate" : "Retired professional"}
          </p>
        ) : (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Unknown
          </p>
        )}
      </div>

      <div className="rb-card p-6">
        <h2 className="font-semibold mb-3">NDA signatures</h2>
        {signatures.length === 0 && <p className="text-sm" style={{ color: "var(--muted)" }}>No signatures yet.</p>}
        <div className="space-y-2">
          {signatures.map((s) => (
            <p key={s.id} className="text-sm">
              <span style={{ color: "var(--success)" }}>✓</span> {s.party === "contributor" ? "Contributor" : "Business owner"}{" "}
              — {s.signer_name} ({s.signer_email}), {new Date(s.signed_at).toLocaleString()}
            </p>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: "var(--muted)" }}>
          NDA link for the business owner: {typeof r.nda_token === "string" ? `/nda/${r.nda_token}` : ""}
        </p>
      </div>

      <div className="rb-card p-6">
        <h2 className="font-semibold mb-3">Call scheduling</h2>
        {!proposal && <p className="text-sm" style={{ color: "var(--muted)" }}>No call times proposed yet.</p>}
        {proposal?.confirmed_slot ? (
          <p className="text-sm">
            <span style={{ color: "var(--success)" }}>✓ Confirmed:</span>{" "}
            {new Date(proposal.confirmed_slot).toLocaleString()}
          </p>
        ) : (
          proposal && <CallConfirm proposalId={proposal.id} slots={proposal.proposed_slots} />
        )}
      </div>

      <div className="rb-card p-6">
        <h2 className="font-semibold mb-3">Manual status override</h2>
        <StatusOverride id={r.id} current={r.status} />
      </div>
    </div>
  );
}
