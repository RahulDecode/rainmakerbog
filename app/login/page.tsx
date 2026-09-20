"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <form onSubmit={handleSubmit} className="rb-card max-w-sm w-full p-8 space-y-4">
        <h1 className="text-2xl font-semibold">Contributor login</h1>

        <div>
          <label className="text-sm block mb-1">Email</label>
          <input
            required
            type="email"
            className="rb-input w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm block mb-1">Password</label>
          <input
            required
            type="password"
            className="rb-input w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}

        <button type="submit" disabled={loading} className="rb-btn-primary w-full py-2.5">
          {loading ? "Logging in…" : "Log in"}
        </button>

        <p className="text-sm text-center" style={{ color: "var(--muted)" }}>
          New here?{" "}
          <Link href="/signup" className="underline" style={{ color: "var(--accent)" }}>
            Apply as a contributor
          </Link>
        </p>
      </form>
    </main>
  );
}
