"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ContributorProvider, useContributor } from "@/lib/ContributorContext";
import { supabase } from "@/lib/supabase";

function DashboardNav() {
  const router = useRouter();
  const { contributor } = useContributor();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <header className="border-b" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold" style={{ color: "var(--accent)" }}>
          RainmakerBOG
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {contributor && <span style={{ color: "var(--muted)" }}>{contributor.full_name}</span>}
          <button onClick={handleLogout} className="rb-btn-secondary px-3 py-1.5">
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ContributorProvider>
      <div className="flex-1 flex flex-col">
        <DashboardNav />
        <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">{children}</div>
      </div>
    </ContributorProvider>
  );
}
