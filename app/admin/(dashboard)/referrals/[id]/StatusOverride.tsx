"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReferralStatus } from "@/lib/types";

const OPTIONS: ReferralStatus[] = [
  "submitted",
  "nda_pending",
  "nda_signed",
  "call_proposed",
  "call_scheduled",
  "completed",
  "rejected",
  "cancelled",
];

export default function StatusOverride({ id, current }: { id: string; current: ReferralStatus }) {
  const router = useRouter();
  const [value, setValue] = useState(current);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    await fetch(`/api/admin/referrals/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: value }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <select className="rb-input text-sm" value={value} onChange={(e) => setValue(e.target.value as ReferralStatus)}>
        {OPTIONS.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <button disabled={busy || value === current} onClick={save} className="rb-btn-secondary px-3 py-1.5 text-sm">
        Update status
      </button>
    </div>
  );
}
