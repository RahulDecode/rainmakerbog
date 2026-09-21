"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LOGO_SRC } from "@/lib/logoData";

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
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_SRC} alt="Rainmakers555" className="h-7 w-auto" />
            <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>
              Admin
            </span>
          </div>
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
