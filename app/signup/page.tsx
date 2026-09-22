"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contributorType, setContributorType] = useState<"retired_professional" | "student">(
    "retired_professional"
  );
  const [background, setBackground] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || null,
          contributor_type: contributorType,
          background: background || null,
        },
      },
    });
    if (signUpError || !signUpData.user) {
      setError(signUpError?.message ?? "Could not create your account.");
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="rb-card max-w-md w-full p-8 text-center">
          <h1 className="text-2xl font-semibold" style={{ color: "var(--accent)" }}>
            Application received
          </h1>
          <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>
            Check your inbox to confirm your email. Our admin team will review your application and
            approve your account — you&apos;ll be able to log in and submit referrals as soon as
            that happens.
          </p>
          <Link href="/login" className="rb-btn-primary px-5 py-2.5 inline-block mt-6">
            Go to login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <form onSubmit={handleSubmit} className="rb-card max-w-md w-full p-8 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Become a contributor</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Your application is reviewed by our admin team before you get access.
          </p>
        </div>

        <div>
          <label className="text-sm block mb-1">Full name</label>
          <input
            required
            className="rb-input w-full"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

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
          <label className="text-sm block mb-1">Phone (optional)</label>
          <input className="rb-input w-full" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div>
          <label className="text-sm block mb-1">I am a</label>
          <select
            className="rb-input w-full"
            value={contributorType}
            onChange={(e) => setContributorType(e.target.value as "retired_professional" | "student")}
          >
            <option value="retired_professional">Retired professional</option>
            <option value="student">Student / fresh graduate</option>
          </select>
        </div>

        <div>
          <label className="text-sm block mb-1">Tell us about your background &amp; network</label>
          <textarea
            className="rb-input w-full"
            rows={3}
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            placeholder="Industry, years of experience, geographies, the kind of contacts you can bring…"
          />
        </div>

        <div>
          <label className="text-sm block mb-1">Password</label>
          <input
            required
            type="password"
            minLength={8}
            className="rb-input w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}

        <button type="submit" disabled={loading} className="rb-btn-primary w-full py-2.5">
          {loading ? "Submitting…" : "Submit application"}
        </button>

        <p className="text-sm text-center" style={{ color: "var(--muted)" }}>
          Already applied?{" "}
          <Link href="/login" className="underline" style={{ color: "var(--accent)" }}>
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}
