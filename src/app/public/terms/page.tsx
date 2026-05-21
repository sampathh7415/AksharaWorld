export const runtime = 'edge';
import React from 'react'

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 text-slate-700">
      <h1 className="text-4xl font-black mb-4 text-slate-900">Terms of Service</h1>
      <p className="mb-10 text-slate-400 text-sm">Last Updated: May 21, 2026</p>

      {/* ── General Terms ── */}
      <div className="space-y-8 mb-16">
        <section>
          <h2 className="text-xl font-bold mb-2 text-slate-800">1. Use of Content</h2>
          <p>All content published on Akshara World is protected by copyright. Unauthorized reproduction is prohibited. By accessing Akshara World, you agree to comply with these terms. The platform and its content are provided "as is" without any warranties.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-2 text-slate-800">2. Account Responsibility</h2>
          <p>Users are responsible for maintaining the security of their accounts and any activity under their credentials. Clerk authentication is used for all access — 2FA is enforced for operator accounts.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-2 text-slate-800">3. Digital Products — General</h2>
          <p>Purchases of digital products are subject to the specific refund policy stated at checkout and in the relevant section below. Delivery timelines vary by product type.</p>
        </section>
      </div>

      {/* ── Launch Pilot Addendum ── */}
      <div className="border-t-2 border-slate-200 pt-12">
        <div className="inline-block px-3 py-1 mb-6 text-xs font-bold tracking-widest text-indigo-700 bg-indigo-50 rounded-full uppercase">Akshara Launch Pilot — Terms Addendum</div>
        <p className="mb-8 text-slate-500 text-sm">This section supplements the general Terms above and applies specifically to the Akshara Launch Pilot service.</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-2 text-slate-800">4. Service</h2>
            <p>Akshara World provides access to the Command Center dashboard, Sam AI CEO automated department directives (subject to your approval), Google Sheets-based business operations templates, and onboarding support as described at purchase.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-slate-800">5. Pricing</h2>
            <p>Prices are listed in Indian Rupees (INR) at checkout. Early-bird pricing (₹999) applies only to the first five (5) qualifying purchases per promotional period; standard pricing (₹1,500 or as displayed) applies thereafter. Premium tier (₹4,999) includes one live strategy session and priority support.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-slate-800">6. Delivery</h2>
            <p>Access is provisioned within 48 hours of successful Razorpay payment. You are responsible for maintaining a valid Google account for Sheets and Chat onboarding.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-slate-800">7. Refunds</h2>
            <p>You may request a full refund within seven (7) calendar days of purchase if Command Center access was not provisioned. Refunds are not available after live demo delivery, export of operational data from provided Sheets, or seven (7) days from purchase, whichever occurs first. Razorpay handles payment disputes per gateway rules.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-slate-800">8. Support</h2>
            <p>Weekday support (Monday–Saturday) targets a first response within twenty-four (24) hours via Google Chat. Critical payment or API incidents: Telegram alert acknowledgment within 4 hours. This is not a 24/7 on-call SLA.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-slate-800">9. AI Assistance</h2>
            <p>Sam AI CEO produces recommendations and automated actions subject to human approval (maximum 2 approvals per day during the 30-day launch period). You remain responsible for all business, tax, and compliance decisions. Sam's directives are advisory — not legally binding instructions.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-slate-800">10. Payments</h2>
            <p>Payments are processed by Razorpay. We do not store card data. Razorpay's terms and PCI-DSS compliance apply to payment processing.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-slate-800">11. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Akshara World's liability is limited to the amount you paid for the Launch Pilot in the twelve (12) months preceding the claim. We are not liable for indirect, consequential, or lost-profit damages.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-slate-800">12. Governing Law</h2>
            <p>These terms are governed by the laws of India. Disputes are subject to the courts of India.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-slate-800">13. Contact</h2>
            <p>For support queries, reach us via the Google Chat group provided at onboarding, or use the Contact page on this site.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
