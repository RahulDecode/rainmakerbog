"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useContributor } from "@/lib/ContributorContext";
import { supabase } from "@/lib/supabase";
import type { Referral } from "@/lib/types";

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

export default function DashboardHome() {
  const { loading, contributor } = useContributor();
  const [referrals, setReferrals] = useState<Referral[] | null>(null);

  useEffect(() => {
    if (!contributor || contributor.status !== "approved") return;
    supabase
      .from("referrals")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setReferrals((data as Referral[]) ?? []));
  }, [contributor]);

  if (loading) {
    return <p style={{ color: "var(--muted)" }}>Loading…</p>;
  }

  if (!contributor) return null;

  if (contributor.status === "pending") {
    return (
      <div className="rb-card p-8 text-center">
        <span className="rb-badge" style={{ background: "rgba(251,191,36,0.15)", color: "var(--warning)" }}>
          Pending review
        </span>
        <h1 className="text-xl font-semibold mt-4">Your application is under review</h1>
        <p className="mt-2 text-sm max-w-md mx-auto" style={{ color: "var(--muted)" }}>
          Our admin team reviews every application manually. You&apos;ll get access to the referral
          dashboard as soon as you&apos;re approved.
        </p>
      </div>
    );
  }

  if (contributor.status === "rejected") {
    return (
      <div className="rb-card p-8 text-center">
        <span className="rb-badge" style={{ background: "rgba(248,113,113,0.15)", color: "var(--danger)" }}>
          Not approved
        </span>
        <h1 className="text-xl font-semibold mt-4">Your application wasn&apos;t approved</h1>
        {contributor.rejection_reason && (
          <p className="mt-2 text-sm max-w-md mx-auto" style={{ color: "var(--muted)" }}>
            {contributor.rejection_reason}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Your referrals</h1>
        <Link href="/dashboard/referrals/new" className="rb-btn-primary px-4 py-2">
          + New referral
        </Link>
      </div>

      {referrals === null && <p style={{ color: "var(--muted)" }}>Loading…</p>}
      {referrals?.length === 0 && (
        <div className="rb-card p-8 text-center">
          <p style={{ color: "var(--muted)" }}>
            You haven&apos;t submitted any referrals yet. When you come across an outsourcing
            opportunity, submit it here.
          </p>
        </div>
      )}
      <div className="space-y-3">
        {referrals?.map((r) => (
          <Link
            key={r.id}
            href={`/dashboard/referrals/${r.id}`}
            className="rb-card p-4 flex items-center justify-between block hover:border-[var(--accent)]"
          >
            <div>
              <p className="font-medium">{r.business_name}</p>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                {r.contact_name} · {new Date(r.created_at).toLocaleDateString()}
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
