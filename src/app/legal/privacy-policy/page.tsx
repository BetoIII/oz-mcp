import { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"

export const metadata: Metadata = {
  title: "Privacy Policy | OZ-MCP",
  description: "How OZ-MCP collects, uses, and safeguards your personal information."
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar variant="default" />
      <section className="container mx-auto max-w-3xl px-4 py-20">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-1 text-sm text-muted-foreground">Last updated: <strong>8 July 2025</strong></p>

        {/* 1. Information We Collect */}
        <section className="mt-8 space-y-4">
          <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full table-auto text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-medium">Category</th>
                  <th className="px-4 py-2 font-medium">Examples</th>
                  <th className="px-4 py-2 font-medium">Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-2 font-medium">Account Data</td>
                  <td className="px-4 py-2">Name, email address, Google OAuth ID</td>
                  <td className="px-4 py-2">Create & secure your account, deliver Service</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 font-medium">Payment Data</td>
                  <td className="px-4 py-2">Limited billing details (tokenized card, ZIP) handled by Stripe</td>
                  <td className="px-4 py-2">Process subscriptions & invoices</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 font-medium">Usage Logs</td>
                  <td className="px-4 py-2">IP address, request headers, endpoint called, query string (address looked-up), timestamps, quota usage</td>
                  <td className="px-4 py-2">Provide core functionality, rate-limit abuse, analytics</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 font-medium">Cookies / Local Storage</td>
                  <td className="px-4 py-2">Auth session cookie, CSRF token, preference flags</td>
                  <td className="px-4 py-2">Keep you signed in, remember settings</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>We do <strong>not</strong> intentionally collect sensitive personal data (race, health, etc.).</p>
        </section>

        {/* 2. How We Use Your Information */}
        <section className="mt-8 space-y-2">
          <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
          <ol className="list-decimal space-y-1 pl-6">
            <li><strong>Provide & improve the Service</strong> (run look-ups, maintain infrastructure, debug).</li>
            <li><strong>Communicate with you</strong> (service announcements, invoices, support).</li>
            <li><strong>Billing & fraud prevention</strong> via Stripe and anti-abuse tooling.</li>
            <li><strong>Product analytics</strong> (aggregate metrics to understand feature adoption).</li>
            <li><strong>Legal compliance</strong> (respond to lawful requests, enforce Terms).</li>
          </ol>
          <p>We do not sell or rent your personal information.</p>
        </section>

        {/* 3. Legal Bases (GDPR) */}
        <section className="mt-8 space-y-4">
          <h2 className="text-2xl font-semibold">3. Legal Bases (GDPR)</h2>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full table-auto text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-medium">Basis</th>
                  <th className="px-4 py-2 font-medium">When applied</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-2 font-medium">Contract</td>
                  <td className="px-4 py-2">To deliver the Service you request (e.g., API look-ups).</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 font-medium">Legitimate Interests</td>
                  <td className="px-4 py-2">Security, service analytics, preventing fraud.</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 font-medium">Consent</td>
                  <td className="px-4 py-2">Marketing emails (opt-in, unsubscribe anytime).</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 font-medium">Legal Obligation</td>
                  <td className="px-4 py-2">Accounting & tax record-keeping.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. How We Share Information */}
        <section className="mt-8 space-y-4">
          <h2 className="text-2xl font-semibold">4. How We Share Information</h2>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full table-auto text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-medium">Recipient</th>
                  <th className="px-4 py-2 font-medium">Reason</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-2 font-medium">Infrastructure Providers (Vercel, AWS, Supabase/Postgres)</td>
                  <td className="px-4 py-2">Host servers & databases</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 font-medium">Payment Processor (Stripe)</td>
                  <td className="px-4 py-2">Manage subscriptions, refunds</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 font-medium">Analytics (Plausible, self-hosted)</td>
                  <td className="px-4 py-2">Privacy-friendly usage metrics</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 font-medium">Law enforcement or regulators</td>
                  <td className="px-4 py-2">Only when legally required</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>All vendors are bound by agreements that protect your data.</p>
        </section>

        {/* 5. Data Retention */}
        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold">5. Data Retention</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li><strong>Account data</strong> — while your account is active + 12 months.</li>
            <li><strong>Payment records</strong> — 7 years (tax laws).</li>
            <li><strong>Server logs</strong> — 30 days, unless we investigate abuse.</li>
            <li><strong>Lookup queries</strong> — anonymised and aggregated after 90 days.</li>
          </ul>
          <p>
            You may <strong>delete your account</strong> anytime via the Dashboard or by emailing{' '}
            <Link href="mailto:privacy@oz-mcp.com" className="underline">privacy@oz-mcp.com</Link>; we’ll erase identifying data within 30 days except where legal obligations require otherwise.
          </p>
        </section>

        {/* 6. Security */}
        <section className="mt-8 space-y-2">
          <h2 className="text-2xl font-semibold">6. Security</h2>
          <p>We use HTTPS, encrypted databases, least-privilege IAM roles, and audit logging. No method is 100 % secure, but we work hard to protect your data.</p>
        </section>

        {/* 7. Your Rights */}
        <section className="mt-8 space-y-2">
          <h2 className="text-2xl font-semibold">7. Your Rights</h2>
          <p>
            Depending on your jurisdiction, you may have rights to access, correct, delete, or port your personal data. Send requests to{' '}
            <Link href="mailto:privacy@oz-mcp.com" className="underline">privacy@oz-mcp.com</Link>. We’ll respond within 30 days.
          </p>
        </section>

        {/* 8. International Transfers */}
        <section className="mt-8 space-y-2">
          <h2 className="text-2xl font-semibold">8. International Transfers</h2>
          <p>We host the Service in the United States. If you access from outside the U.S., you consent to transferring your data to U.S. servers.</p>
        </section>

        {/* 9. Children */}
        <section className="mt-8 space-y-2">
          <h2 className="text-2xl font-semibold">9. Children</h2>
          <p>OZ-MCP is <strong>not</strong> directed to children under 16. We do not knowingly collect data from them.</p>
        </section>

        {/* 10. Changes */}
        <section className="mt-8 space-y-2">
          <h2 className="text-2xl font-semibold">10. Changes</h2>
          <p>We may update this policy. We’ll post the revision date and, for material changes, email account holders at least 7 days before it takes effect.</p>
        </section>

        {/* 11. Contact Us */}
        <section className="mt-8 space-y-2">
          <h2 className="text-2xl font-semibold">11. Contact Us</h2>
          <address className="not-italic leading-relaxed">
            <p><strong>Agiato LLC</strong></p>
            <p>548 Market St, PMB 12345</p>
            <p>San Francisco, CA 94104</p>
            <p>
              <Link href="mailto:privacy@oz-mcp.com" className="underline">privacy@oz-mcp.com</Link>
            </p>
          </address>
        </section>

        {/* Back to top link */}
        <div className="mt-12 text-center">
          <Link href="#" className="text-sm underline">Back to top</Link>
        </div>
      </section>
      <Footer />
    </div>
  )
}