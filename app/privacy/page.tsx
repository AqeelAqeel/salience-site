import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy · Salience",
  description:
    "How Salience handles data, including Gmail data accessed via Google OAuth in the /friends cockpit.",
};

const UPDATED = "April 23, 2026";

export default function PrivacyPage() {
  return (
    <main className="min-h-[100dvh] bg-white text-slate-900">
      <div className="mx-auto max-w-3xl px-6 md:px-8 py-16 md:py-24">
        <p className="text-[11px] tracking-[0.14em] uppercase text-slate-500">
          legal
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
          Privacy Policy
        </h1>
        <p className="mt-3 text-slate-600">Last updated: {UPDATED}</p>

        <Section title="Who we are">
          <p>
            Salience Ventures (&ldquo;Salience,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) operates
            salience.ventures and the limited-access cockpit tools at
            /friends/&#123;slug&#125;. Questions: <a className="underline" href="mailto:aqeel@aqeelali.com">aqeel@aqeelali.com</a>.
          </p>
        </Section>

        <Section title="What this policy covers">
          <p>
            This policy covers data we process when you use any part of the
            Salience site, including the AI email cockpit at
            /friends/&#123;slug&#125; (the &ldquo;Cockpit&rdquo;), which accesses Gmail data on your
            behalf via Google OAuth.
          </p>
        </Section>

        <Section title="Gmail data — what we access, why, and what we never do">
          <p>
            The Cockpit requests the Google OAuth scope{" "}
            <code className="font-mono text-sm bg-slate-100 px-1.5 py-0.5 rounded">
              https://www.googleapis.com/auth/gmail.readonly
            </code>
            . This scope lets us read the metadata and bodies of your recent email threads.
          </p>

          <h3 className="mt-6 font-semibold text-slate-900">We access:</h3>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Up to ~100 of your most recent inbox threads (subject, participants, message bodies, timestamps).</li>
            <li>Your connected Google account email address, so we can label the cockpit and show who&rsquo;s signed in.</li>
          </ul>

          <h3 className="mt-6 font-semibold text-slate-900">We use that data only to:</h3>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Summarize each thread and identify what needs a reply.</li>
            <li>Draft reply suggestions in your voice, shown only to you.</li>
            <li>Surface relationship context (who someone is, what the thread is about).</li>
            <li>Store those summaries, drafts, and interpretations in our database so the Cockpit persists across sessions.</li>
          </ul>

          <h3 className="mt-6 font-semibold text-slate-900">We will never:</h3>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Send email on your behalf. Drafts go only to your own Gmail Drafts folder if you explicitly click &ldquo;Put in Gmail Drafts.&rdquo;</li>
            <li>Share, sell, or transfer your Gmail data to third parties.</li>
            <li>Use your Gmail data to train AI/ML models for anyone other than you.</li>
            <li>Read emails for advertising purposes.</li>
            <li>Let humans at Salience read your emails, except (a) with your explicit permission for a specific support issue you raise, or (b) as required by law.</li>
          </ul>

          <p className="mt-4">
            Our use of information received from Google APIs adheres to{" "}
            <a
              className="underline"
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noreferrer"
            >
              Google&rsquo;s API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>
        </Section>

        <Section title="Third-party processors">
          <p>We share the minimum data necessary with these processors to run the Cockpit:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>
              <strong>OpenAI</strong> — email thread contents are sent to OpenAI&rsquo;s Chat Completions API to generate summaries and reply drafts. OpenAI&rsquo;s API-tier terms state that API data is not used to train their models.
            </li>
            <li>
              <strong>Supabase</strong> — stores your Cockpit data (threads, summaries, drafts, OAuth tokens) in an encrypted Postgres database.
            </li>
            <li>
              <strong>Vercel</strong> — hosts the Salience site and handles request routing.
            </li>
          </ul>
        </Section>

        <Section title="Tokens and retention">
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>
              Google OAuth access and refresh tokens are stored server-side and used only to re-fetch your mail on your behalf.
            </li>
            <li>
              You can disconnect Salience at any time from your Google Account&rsquo;s{" "}
              <a className="underline" href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">
                third-party app permissions page
              </a>
              . Revoking there immediately prevents us from fetching new data.
            </li>
            <li>
              To delete your stored Cockpit data (threads, summaries, drafts), email{" "}
              <a className="underline" href="mailto:aqeel@aqeelali.com">aqeel@aqeelali.com</a> from the address you signed in with. We&rsquo;ll confirm and delete within 7 days.
            </li>
            <li>
              We retain Cockpit data until you ask us to delete it or the Cockpit link is retired.
            </li>
          </ul>
        </Section>

        <Section title="Cookies and analytics">
          <p>
            The public site uses Vercel Analytics for anonymized pageview counts. The /friends Cockpit uses first-party cookies only for your Supabase authentication session. We do not use third-party ad tracking.
          </p>
        </Section>

        <Section title="Security">
          <p>
            All traffic runs over HTTPS. Database rows are accessed only by server-side code using a service-role credential held in Vercel&rsquo;s environment variables. OAuth tokens are never sent to the browser after the initial callback.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            You can request access to, correction of, or deletion of any data we hold about you by emailing{" "}
            <a className="underline" href="mailto:aqeel@aqeelali.com">aqeel@aqeelali.com</a>. If you&rsquo;re in the EU/UK, you have additional rights under GDPR including the right to lodge a complaint with your supervisory authority.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            If we change this policy in a material way, we&rsquo;ll update the date at the top and, for existing Cockpit users, notify you at the email address connected to your Google account before the change takes effect.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Aqeel Ali · Salience Ventures · <a className="underline" href="mailto:aqeel@aqeelali.com">aqeel@aqeelali.com</a>
          </p>
        </Section>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
        {title}
      </h2>
      <div className="mt-3 text-slate-700 leading-relaxed space-y-3 [&_li]:leading-relaxed">
        {children}
      </div>
    </section>
  );
}
