import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rainmakers555 — Referral platform for outsourcing introductions",
  description:
    "Retired professionals and students turn their network into referral income by connecting global outsourcing opportunities with Indian companies.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
