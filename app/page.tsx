import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex-1">
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 sm:pt-24 sm:pb-16">
        <div className="rb-badge" style={{ background: "rgba(212,175,55,0.12)", color: "var(--accent)" }}>
          Rainmaker Business Outsourcing Group
        </div>
        <h1 className="mt-5 text-4xl sm:text-5xl font-semibold leading-tight max-w-3xl">
          Turn your network into referral income.
        </h1>
        <p className="mt-5 text-lg max-w-2xl" style={{ color: "var(--muted)" }}>
          RainmakerBOG connects retired professionals and students with global outsourcing
          opportunities for Indian companies and exporters. Refer a lead, sign the NDA, get on a
          call — and earn a commission when it lands.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup" className="rb-btn-primary px-6 py-3 inline-block">
            Become a contributor
          </Link>
          <Link href="/login" className="rb-btn-secondary px-6 py-3 inline-block">
            Log in
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20 grid gap-5 sm:grid-cols-2">
        <div className="rb-card p-6">
          <h2 className="font-semibold text-lg" style={{ color: "var(--accent)" }}>
            Retired professionals
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
            Decades of relationships and domain expertise are worth more than ever. Refer
            outsourcing opportunities you come across to vetted Indian companies and earn a
            commission on every deal that closes.
          </p>
        </div>
        <div className="rb-card p-6">
          <h2 className="font-semibold text-lg" style={{ color: "var(--accent)" }}>
            Students &amp; fresh graduates
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
            Build real business development experience while you study. Refer leads, collaborate
            with exporters, and earn commissions alongside seasoned contributors.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-xl font-semibold mb-6">How it works</h2>
        <ol className="grid gap-5 sm:grid-cols-4 text-sm">
          {[
            ["1. Apply", "Sign up with your background. Our admin team reviews every applicant."],
            ["2. Get approved", "Once approved, you unlock the referral dashboard."],
            ["3. Refer & sign NDA", "Submit a lead and both sides sign an NDA in-platform."],
            ["4. Schedule & earn", "Propose call times, get on a call, and earn your commission."],
          ].map(([title, body]) => (
            <li key={title} className="rb-card p-5">
              <p className="font-semibold" style={{ color: "var(--accent)" }}>
                {title}
              </p>
              <p className="mt-2" style={{ color: "var(--muted)" }}>
                {body}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
