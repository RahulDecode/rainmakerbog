"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const tabs = [
    { href: "/admin/contributors", label: "Contributors" },
    { href: "/admin/referrals", label: "Referrals" },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-semibold" style={{ color: "var(--accent)" }}>
            RainmakerBOG Admin
          </span>
          <div className="flex items-center gap-4 text-sm">
            {tabs.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                style={{ color: pathname?.startsWith(t.href) ? "var(--accent)" : "var(--foreground)" }}
              >
                {t.label}
              </Link>
            ))}
            <button onClick={handleLogout} className="rb-btn-secondary px-3 py-1.5">
              Log out
            </button>
          </div>
        </div>
      </header>
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">{children}</div>
    </div>
  );
}
