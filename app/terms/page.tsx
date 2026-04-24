import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service · Salience",
  description: "Terms of service for Salience and the /friends AI email cockpit.",
};

const UPDATED = "April 23, 2026";

export default function TermsPage() {
  return (
    <main className="min-h-[100dvh] bg-white text-slate-900">
      <div className="mx-auto max-w-3xl px-6 md:px-8 py-16 md:py-24">
        <p className="text-[11px] tracking-[0.14em] uppercase text-slate-500">
          legal
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
          Terms of Service
        </h1>
        <p className="mt-3 text-slate-600">Last updated: {UPDATED}</p>

        <Section title="Agreement">
          <p>
            By signing into the Salience cockpit at /friends/&#123;slug&#125; or otherwise using Salience services (the &ldquo;Services&rdquo;), you agree to these Terms of Service. If you do not agree, don&rsquo;t use the Services.
          </p>
        </Section>

        <Section title="What the Services do">
          <p>
            Salience provides AI-assisted email analysis and reply drafting. You connect a Google account; we read recent messages (with your explicit OAuth consent) and produce summaries and draft replies you can review, edit, and optionally push to your own Gmail Drafts.
          </p>
        </Section>

        <Section title="Your responsibilities">
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>You&rsquo;ll only connect Google accounts you own or are authorized to use.</li>
            <li>You&rsquo;ll review AI-generated drafts before sending any of them yourself. The Services never send mail on your behalf.</li>
            <li>You won&rsquo;t use the Services for anything illegal, abusive, or that violates third-party rights.</li>
          </ul>
        </Section>

        <Section title="Our responsibilities and limits">
          <p>
            We handle your data per our{" "}
            <a className="underline" href="/privacy">Privacy Policy</a>. The Services are provided &ldquo;as is&rdquo; during this preview phase — AI outputs may be inaccurate. Don&rsquo;t rely on them for time-critical or high-stakes decisions without human review.
          </p>
          <p className="mt-3">
            To the maximum extent permitted by law, Salience is not liable for any indirect, incidental, or consequential damages arising from your use of the Services.
          </p>
        </Section>

        <Section title="Termination">
          <p>
            You may stop using the Services at any time and revoke Google access via{" "}
            <a className="underline" href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">
              your Google account permissions
            </a>
            . We may suspend or end your access if we believe you&rsquo;re violating these terms or applicable law.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            We may update these terms. Material changes get a visible notice before they take effect.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Aqeel Ali · Salience Ventures ·{" "}
            <a className="underline" href="mailto:aqeel@aqeelali.com">aqeel@aqeelali.com</a>
          </p>
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
        {title}
      </h2>
      <div className="mt-3 text-slate-700 leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}
