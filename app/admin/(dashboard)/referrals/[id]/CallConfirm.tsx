"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CallConfirm({ proposalId, slots }: { proposalId: string; slots: string[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function confirm(slot: string) {
    setBusy(true);
    await fetch(`/api/admin/call-proposals/${proposalId}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmedSlot: slot }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      {slots.map((s, i) => (
        <div key={i} className="flex items-center justify-between rb-input">
          <span className="text-sm">{s}</span>
          <button disabled={busy} onClick={() => confirm(s)} className="rb-btn-primary px-3 py-1 text-sm">
            Confirm this slot
          </button>
        </div>
      ))}
    </div>
  );
}
