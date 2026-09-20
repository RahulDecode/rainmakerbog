"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useContributor } from "@/lib/ContributorContext";
import { supabase } from "@/lib/supabase";

export default function NewReferralPage() {
  const router = useRouter();
  const { contributor } = useContributor();
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contributor) return;
    setError("");
    setLoading(true);

    const { data, error: insertError } = await supabase
      .from("referrals")
      .insert({
        contributor_id: contributor.id,
        business_name: businessName,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone || null,
        opportunity_description: description,
        estimated_value: estimatedValue || null,
      })
      .select("id")
      .single();

    if (insertError || !data) {
      setError(insertError?.message ?? "Could not submit the referral.");
      setLoading(false);
      return;
    }

    router.push(`/dashboard/referrals/${data.id}`);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Submit a referral</h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        Bring in the business owner&apos;s contact details — we&apos;ll take it from there.
      </p>
      <form onSubmit={handleSubmit} className="rb-card p-6 space-y-4 max-w-xl">
        <div>
          <label className="text-sm block mb-1">Business / company name</label>
          <input
            required
            className="rb-input w-full"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm block mb-1">Business owner&apos;s name</label>
            <input
              required
              className="rb-input w-full"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm block mb-1">Business owner&apos;s email</label>
            <input
              required
              type="email"
              className="rb-input w-full"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="text-sm block mb-1">Business owner&apos;s phone (optional)</label>
          <input className="rb-input w-full" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
        </div>
        <div>
          <label className="text-sm block mb-1">Describe the opportunity</label>
          <textarea
            required
            rows={4}
            className="rb-input w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What outsourcing work are they looking for? Any relevant context."
          />
        </div>
        <div>
          <label className="text-sm block mb-1">Estimated deal value (optional)</label>
          <input
            className="rb-input w-full"
            value={estimatedValue}
            onChange={(e) => setEstimatedValue(e.target.value)}
            placeholder="e.g. $50,000 / year"
          />
        </div>

        {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}

        <button type="submit" disabled={loading} className="rb-btn-primary px-5 py-2.5">
          {loading ? "Submitting…" : "Submit referral"}
        </button>
      </form>
    </div>
  );
}
