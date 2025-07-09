import { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"

export const metadata: Metadata = {
  title: "Terms of Service | OZ-MCP",
  description: "Legal terms governing the use of OZ-MCP."
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar variant="default" />
      <section className="container mx-auto max-w-3xl px-4 py-20">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="mt-1 text-sm text-muted-foreground">Effective: <strong>8 July 2025</strong></p>

        {/* Intro */}
        <section className="mt-6 space-y-2">
          <p>Thank you for using OZ-MCP. By accessing <strong>oz-mcp.vercel.app</strong>, creating an account, or making API calls, you ("<strong>Customer</strong>", "<strong>you</strong>") agree to these Terms and our <Link href="/legal/privacy-policy" className="underline">Privacy Policy</Link>.</p>
        </section>

        {/* 1. The Service */}
        <section className="mt-8 space-y-2">
          <h2 className="text-2xl font-semibold">1. The Service</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li><strong>Free Tier</strong> – up to 15 look-ups per month, no charge.</li>
            <li><strong>Paid Plans</strong> – higher quotas as listed on our Pricing page.</li>
            <li><strong>API Keys</strong> – personal and non-transferable. Keep them secret.</li>
          </ul>
          <p>We may modify features, quotas, or pricing with reasonable notice (email or banner).</p>
        </section>

        {/* 2. Acceptable Use */}
        <section className="mt-8 space-y-2">
          <h2 className="text-2xl font-semibold">2. Acceptable Use</h2>
          <p>You <strong>must not</strong>:</p>
          <ol className="list-decimal space-y-1 pl-6">
            <li>Repackage or resell raw OZ-MCP results without written consent.</li>
            <li>Attempt to reverse-engineer, scrape, or attack the Service.</li>
            <li>Use the Service for unlawful, fraudulent, or defamatory purposes.</li>
            <li>Exceed plan quotas or circumvent rate limits.</li>
          </ol>
          <p>We may throttle, suspend, or terminate accounts that violate these rules.</p>
        </section>

        {/* 3. No Professional Advice */}
        <section className="mt-8 space-y-2">
          <h2 className="text-2xl font-semibold">3. No Professional Advice</h2>
          <p>OZ-MCP provides <strong>informational data only</strong>.<br/>We are <strong>not</strong> your attorney, CPA, or investment adviser.<br/>Always verify critical determinations with qualified professionals before making investment or tax decisions.</p>
        </section>

        {/* 4. Data Sources & Accuracy */}
        <section className="mt-8 space-y-2">
          <h2 className="text-2xl font-semibold">4. Data Sources & Accuracy</h2>
          <p>We source Qualified Opportunity Zone boundaries from the latest public IRS TCE and U.S. Census TIGER/Line shapefiles and refresh monthly. However, the dataset may contain errors or become outdated.<br/><strong>You accept the Service “AS IS” and use it at your own risk.</strong></p>
        </section>

        {/* 5. Fees & Payment */}
        <section className="mt-8 space-y-2">
          <h2 className="text-2xl font-semibold">5. Fees & Payment</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>Fees are billed in advance, monthly or annually, via Stripe.</li>
            <li>All charges are in <strong>USD</strong> and exclude applicable taxes.</li>
            <li>Failed payments may result in suspension after 7 days’ notice.</li>
            <li>Fees are non-refundable except where required by law.</li>
          </ul>
        </section>

        {/* 6. Ownership */}
        <section className="mt-8 space-y-2">
          <h2 className="text-2xl font-semibold">6. Ownership</h2>
          <p>All software, logos, and compiled data remain the property of Agiato LLC.<br/>You own the prompts you send and the results you receive, subject to Section 4.</p>
        </section>

        {/* 7. Feedback */}
        <section className="mt-8 space-y-2">
          <h2 className="text-2xl font-semibold">7. Feedback</h2>
          <p>If you submit ideas or suggestions, you grant us a perpetual, royalty-free license to use them without further obligation.</p>
        </section>

        {/* 8. Disclaimer of Warranties */}
        <section className="mt-8 space-y-2">
          <h2 className="text-2xl font-semibold">8. Disclaimer of Warranties</h2>
          <p>THE SERVICE IS PROVIDED <strong>“AS IS”</strong> AND <strong>“AS AVAILABLE.”</strong><br/>WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
        </section>

        {/* 9. Limitation of Liability */}
        <section className="mt-8 space-y-2">
          <h2 className="text-2xl font-semibold">9. Limitation of Liability</h2>
          <p>To the fullest extent allowed by law, <strong>Agiato LLC’s total liability</strong> for any claim arising out of these Terms or the Service <strong>will not exceed the greater of (a) US $100 or (b) the amount you paid us in the 12 months before the event</strong>.<br/>We are not liable for indirect, incidental, special, or consequential damages.</p>
        </section>

        {/* 10. Indemnification */}
        <section className="mt-8 space-y-2">
          <h2 className="text-2xl font-semibold">10. Indemnification</h2>
          <p>You agree to indemnify and hold harmless Agiato LLC from any third-party claims arising from:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Your use or misuse of the Service,</li>
            <li>Your violation of these Terms or applicable law,</li>
            <li>Content or data you submit to the Service.</li>
          </ul>
        </section>

        {/* 11. Termination */}
        <section className="mt-8 space-y-2">
          <h2 className="text-2xl font-semibold">11. Termination</h2>
          <p>You may cancel anytime in the Dashboard; we’ll stop billing at the end of the current period.<br/>We may terminate or suspend the Service with 30 days’ emailed notice, or immediately for abuse or non-payment.<br/><br/>Sections <strong>3–10</strong> survive termination.</p>
        </section>

        {/* 12. Governing Law & Dispute Resolution */}
        <section className="mt-8 space-y-2">
          <h2 className="text-2xl font-semibold">12. Governing Law & Dispute Resolution</h2>
          <p>These Terms are governed by the laws of <strong>California, USA</strong>, excluding conflict-of-law rules.<br/>Any dispute will be resolved exclusively in the state or federal courts of San Francisco County, and the parties consent to personal jurisdiction there.</p>
        </section>

        {/* 13. Changes */}
        <section className="mt-8 space-y-2">
          <h2 className="text-2xl font-semibold">13. Changes</h2>
          <p>We may update these Terms. If we make material changes, we’ll notify you at least 7 days in advance by email or site banner. Continued use after the effective date constitutes acceptance.</p>
        </section>

        {/* 14. Contact */}
        <section className="mt-8 space-y-2">
          <h2 className="text-2xl font-semibold">14. Contact</h2>
          <address className="not-italic leading-relaxed">
            <p>Questions? Reach us at <Link href="mailto:legal@oz-mcp.com" className="underline">legal@oz-mcp.com</Link> or:</p>
            <p><strong>Agiato LLC</strong></p>
            <p>865 Florida St. Unit 4</p>
            <p>San Francisco, CA 94110</p>
          </address>
        </section>

        {/* Back to top */}
        <div className="mt-12 text-center">
          <Link href="#" className="text-sm underline">Back to top</Link>
        </div>
      </section>
      <Footer />
    </div>
  )
}