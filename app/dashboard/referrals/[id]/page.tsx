"use client";

import { useEffect, useState, use as usePromise } from "react";
import { useContributor } from "@/lib/ContributorContext";
import { supabase } from "@/lib/supabase";
import type { CallProposal, NdaSignature, Referral } from "@/lib/types";
import { NDA_TEXT } from "@/lib/types";

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

export default function ReferralDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const { contributor, accessToken } = useContributor();
  const [referral, setReferral] = useState<Referral | null>(null);
  const [signatures, setSignatures] = useState<NdaSignature[]>([]);
  const [proposal, setProposal] = useState<CallProposal | null>(null);
  const [ndaName, setNdaName] = useState("");
  const [ndaAgree, setNdaAgree] = useState(false);
  const [slots, setSlots] = useState(["", "", ""]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const { data: r } = await supabase.from("referrals").select("*").eq("id", id).single();
    setReferral(r as Referral | null);
    const { data: sigs } = await supabase.from("nda_signatures").select("*").eq("referral_id", id);
    setSignatures((sigs as NdaSignature[]) ?? []);
    const { data: cp } = await supabase.from("call_proposals").select("*").eq("referral_id", id).maybeSingle();
    setProposal(cp as CallProposal | null);
  }

  useEffect(() => {
    if (!contributor) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch from Supabase on mount
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contributor, id]);

  if (!contributor || !referral) {
    return <p style={{ color: "var(--muted)" }}>Loading…</p>;
  }

  const contributorSigned = signatures.some((s) => s.party === "contributor");
  const businessSigned = signatures.some((s) => s.party === "business_owner");
  const ndaLink = typeof window !== "undefined" ? `${window.location.origin}/nda/${referral.nda_token}` : "";

  async function signNda(e: React.FormEvent) {
    e.preventDefault();
    if (!ndaAgree || !ndaName.trim()) return;
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/nda/contributor-sign", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ referralId: id, signerName: ndaName.trim() }),
    });
    const body = await res.json();
    if (!res.ok) {
      setMessage(body.error ?? "Could not sign the NDA.");
    } else {
      await load();
    }
    setBusy(false);
  }

  async function proposeCall(e: React.FormEvent) {
    e.preventDefault();
    const clean = slots.map((s) => s.trim()).filter(Boolean);
    if (clean.length === 0) return;
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/referrals/propose-call", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ referralId: id, slots: clean }),
    });
    const body = await res.json();
    if (!res.ok) {
      setMessage(body.error ?? "Could not propose call times.");
    } else {
      await load();
    }
    setBusy(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(ndaLink);
    setMessage("NDA link copied — send it to the business owner.");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{referral.business_name}</h1>
          <span className="rb-badge" style={{ background: "rgba(212,175,55,0.12)", color: "var(--accent)" }}>
            {STATUS_LABEL[referral.status] ?? referral.status}
          </span>
        </div>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          {referral.contact_name} · {referral.contact_email}
          {referral.contact_phone ? ` · ${referral.contact_phone}` : ""}
        </p>
        <p className="mt-3 text-sm">{referral.opportunity_description}</p>
        {referral.estimated_value && (
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Estimated value: {referral.estimated_value}
          </p>
        )}
      </div>

      {message && (
        <p className="text-sm rb-card p-3" style={{ color: "var(--foreground)" }}>
          {message}
        </p>
      )}

      {/* NDA section */}
      <div className="rb-card p-6">
        <h2 className="font-semibold mb-3">Non-disclosure agreement</h2>
        <div className="flex flex-wrap gap-4 text-sm mb-4">
          <span style={{ color: contributorSigned ? "var(--success)" : "var(--muted)" }}>
            {contributorSigned ? "✓" : "○"} You{contributorSigned ? " have signed" : " haven't signed yet"}
          </span>
          <span style={{ color: businessSigned ? "var(--success)" : "var(--muted)" }}>
            {businessSigned ? "✓" : "○"} Business owner
            {businessSigned ? " has signed" : " hasn't signed yet"}
          </span>
        </div>

        {!contributorSigned && (
          <form onSubmit={signNda} className="space-y-3">
            <div className="rb-input text-xs max-h-40 overflow-y-auto whitespace-pre-wrap" style={{ color: "var(--muted)" }}>
              {NDA_TEXT}
            </div>
            <input
              required
              placeholder="Type your full legal name"
              className="rb-input w-full"
              value={ndaName}
              onChange={(e) => setNdaName(e.target.value)}
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={ndaAgree} onChange={(e) => setNdaAgree(e.target.checked)} />
              I agree to the terms above and am electronically signing this NDA.
            </label>
            <button type="submit" disabled={busy || !ndaAgree || !ndaName.trim()} className="rb-btn-primary px-5 py-2">
              Sign NDA
            </button>
          </form>
        )}

        {contributorSigned && !businessSigned && (
          <div>
            <p className="text-sm mb-2" style={{ color: "var(--muted)" }}>
              Share this link with the business owner so they can sign their side — no account
              needed on their end.
            </p>
            <div className="flex gap-2">
              <input readOnly className="rb-input flex-1 text-xs" value={ndaLink} />
              <button onClick={copyLink} type="button" className="rb-btn-secondary px-4">
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Call scheduling section */}
      {(referral.status === "nda_signed" ||
        referral.status === "call_proposed" ||
        referral.status === "call_scheduled" ||
        referral.status === "completed") && (
        <div className="rb-card p-6">
          <h2 className="font-semibold mb-3">Call scheduling</h2>

          {proposal?.confirmed_slot ? (
            <p className="text-sm">
              <span style={{ color: "var(--success)" }}>✓ Confirmed:</span>{" "}
              {new Date(proposal.confirmed_slot).toLocaleString()}
            </p>
          ) : proposal ? (
            <div className="text-sm">
              <p style={{ color: "var(--muted)" }}>Proposed times, waiting on admin to confirm one:</p>
              <ul className="list-disc list-inside mt-1">
                {proposal.proposed_slots.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs" style={{ color: "var(--muted)" }}>
                Want to change these? Submit new proposed times below.
              </p>
            </div>
          ) : null}

          {!proposal?.confirmed_slot && (
            <form onSubmit={proposeCall} className="space-y-2 mt-3">
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Propose up to 3 call time windows (e.g. &quot;Tue Oct 7, 3–4pm IST&quot;):
              </p>
              {slots.map((s, i) => (
                <input
                  key={i}
                  className="rb-input w-full"
                  value={s}
                  onChange={(e) => {
                    const next = [...slots];
                    next[i] = e.target.value;
                    setSlots(next);
                  }}
                  placeholder={`Option ${i + 1}`}
                />
              ))}
              <button type="submit" disabled={busy} className="rb-btn-primary px-5 py-2">
                {proposal ? "Update proposed times" : "Propose call times"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
