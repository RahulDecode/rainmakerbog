import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { Contributor } from "@/lib/types";
import ContributorActions from "./ContributorActions";

const TYPE_LABEL: Record<string, string> = {
  retired_professional: "Retired professional",
  student: "Student / fresh graduate",
};

export const dynamic = "force-dynamic";

export default async function AdminContributorsPage() {
  const { data } = await supabaseAdmin
    .from("contributors")
    .select("*")
    .order("created_at", { ascending: false });
  const contributors = (data as Contributor[]) ?? [];
  const pending = contributors.filter((c) => c.status === "pending");
  const decided = contributors.filter((c) => c.status !== "pending");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold mb-4">Pending applications ({pending.length})</h1>
        {pending.length === 0 && <p style={{ color: "var(--muted)" }}>No pending applications.</p>}
        <div className="space-y-3">
          {pending.map((c) => (
            <div key={c.id} className="rb-card p-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="font-medium">{c.full_name}</p>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  {c.email} · {TYPE_LABEL[c.contributor_type] ?? c.contributor_type}
                </p>
                {c.background && <p className="text-sm mt-1">{c.background}</p>}
              </div>
              <ContributorActions id={c.id} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h1 className="text-xl font-semibold mb-4">Reviewed</h1>
        <div className="space-y-2">
          {decided.map((c) => (
            <div key={c.id} className="rb-card p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{c.full_name}</p>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  {c.email} · {TYPE_LABEL[c.contributor_type] ?? c.contributor_type}
                </p>
              </div>
              <span
                className="rb-badge"
                style={{
                  background: c.status === "approved" ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)",
                  color: c.status === "approved" ? "var(--success)" : "var(--danger)",
                }}
              >
                {c.status === "approved" ? "Approved" : "Rejected"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
