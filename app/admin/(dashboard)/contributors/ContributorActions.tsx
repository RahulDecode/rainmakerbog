"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ContributorActions({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  async function decide(decision: "approved" | "rejected", rejectReason?: string) {
    setBusy(true);
    await fetch(`/api/admin/contributors/${id}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, reason: rejectReason }),
    });
    setBusy(false);
    router.refresh();
  }

  if (showReject) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          placeholder="Reason (optional)"
          className="rb-input text-sm py-1"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <button disabled={busy} onClick={() => decide("rejected", reason)} className="rb-btn-danger px-3 py-1.5 text-sm">
          Confirm reject
        </button>
        <button onClick={() => setShowReject(false)} className="rb-btn-secondary px-3 py-1.5 text-sm">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button disabled={busy} onClick={() => decide("approved")} className="rb-btn-primary px-3 py-1.5 text-sm">
        Approve
      </button>
      <button disabled={busy} onClick={() => setShowReject(true)} className="rb-btn-danger px-3 py-1.5 text-sm">
        Reject
      </button>
    </div>
  );
}
