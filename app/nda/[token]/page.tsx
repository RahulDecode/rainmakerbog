"use client";

import { useEffect, useState, use as usePromise } from "react";
import { NDA_TEXT } from "@/lib/types";

interface Status {
  businessName: string;
  referralStatus: string;
  signatures: { party: string; signer_name: string; signed_at: string }[];
  error?: string;
}

export default function PublicNdaPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = usePromise(params);
  const [status, setStatus] = useState<Status | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch(`/api/nda/status?token=${encodeURIComponent(token)}`);
    const body = await res.json();
    setStatus(body);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch from the NDA status API on mount
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleSign(e: React.FormEvent) {
    e.preventDefault();
    if (!agree || !name.trim() || !email.trim()) return;
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/nda/business-sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, signerName: name.trim(), signerEmail: email.trim() }),
    });
    const body = await res.json();
    if (!res.ok) {
      setMessage(body.error ?? "Could not sign the NDA.");
    } else {
      await load();
    }
    setBusy(false);
  }

  if (!status) {
    return (
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <p style={{ color: "var(--muted)" }}>Loading…</p>
      </main>
    );
  }

  if (status.error) {
    return (
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="rb-card max-w-md w-full p-8 text-center">
          <h1 className="text-xl font-semibold" style={{ color: "var(--danger)" }}>
            Link not found
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>{status.error}</p>
        </div>
      </main>
    );
  }

  const businessSigned = status.signatures.some((s) => s.party === "business_owner");
  const contributorSigned = status.signatures.some((s) => s.party === "contributor");

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="rb-card max-w-lg w-full p-8 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide" style={{ color: "var(--accent)" }}>
            RainmakerBOG
          </p>
          <h1 className="text-xl font-semibold mt-1">NDA for {status.businessName}</h1>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <span style={{ color: contributorSigned ? "var(--success)" : "var(--muted)" }}>
            {contributorSigned ? "✓" : "○"} Contributor {contributorSigned ? "signed" : "not signed yet"}
          </span>
          <span style={{ color: businessSigned ? "var(--success)" : "var(--muted)" }}>
            {businessSigned ? "✓" : "○"} You {businessSigned ? "signed" : "haven't signed yet"}
          </span>
        </div>

        {message && <p className="text-sm">{message}</p>}

        {businessSigned ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Thanks — you&apos;ve signed this NDA. RainmakerBOG will be in touch to schedule a call
            once both sides are ready.
          </p>
        ) : (
          <form onSubmit={handleSign} className="space-y-3">
            <div
              className="rb-input text-xs max-h-48 overflow-y-auto whitespace-pre-wrap"
              style={{ color: "var(--muted)" }}
            >
              {NDA_TEXT}
            </div>
            <input
              required
              placeholder="Your full legal name"
              className="rb-input w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              required
              type="email"
              placeholder="Your email"
              className="rb-input w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              I agree to the terms above and am electronically signing this NDA.
            </label>
            <button
              type="submit"
              disabled={busy || !agree || !name.trim() || !email.trim()}
              className="rb-btn-primary w-full py-2.5"
            >
              {busy ? "Signing…" : "Sign NDA"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
