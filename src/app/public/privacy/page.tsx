export const runtime = 'edge';
import React from 'react'

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 text-slate-700">
      <h1 className="text-4xl font-black mb-4 text-slate-900">Privacy Policy</h1>
      <p className="mb-10 text-slate-400 text-sm">Last Updated: May 21, 2026</p>

      {/* ── General Privacy ── */}
      <div className="space-y-8 mb-16">
        <section>
          <h2 className="text-xl font-bold mb-2 text-slate-800">1. Data Collection</h2>
          <p>We collect minimal data required to provide our services. This includes email addresses for newsletter subscriptions and transaction data via Razorpay for product purchases.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-2 text-slate-800">2. Use of Data</h2>
          <p>Your data is used solely for service delivery, customer support, and essential business analytics. We do not sell your personal information to third parties.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-2 text-slate-800">3. Cookies &amp; Tracking</h2>
          <p>We use essential cookies and Google Analytics 4 (GA4) to improve user experience and measure business performance. You can opt-out of tracking via your browser settings.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-2 text-slate-800">4. Third-Party Services</h2>
          <p>Our site uses Clerk for authentication and Razorpay for payments. Please refer to their respective privacy policies for data handling details.</p>
        </section>
      </div>

      {/* ── Launch Pilot Privacy Addendum ── */}
      <div className="border-t-2 border-slate-200 pt-12">
        <div className="inline-block px-3 py-1 mb-6 text-xs font-bold tracking-widest text-indigo-700 bg-indigo-50 rounded-full uppercase">Akshara Launch Pilot — Privacy Addendum</div>
        <p className="mb-8 text-slate-500 text-sm">This section details additional data practices that apply to Akshara Launch Pilot customers.</p>

        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-bold mb-4 text-slate-800">5. Data We Collect for Launch Pilot Customers</h2>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-3 font-bold text-slate-600">Data</th>
                    <th className="text-left p-3 font-bold text-slate-600">Purpose</th>
                    <th className="text-left p-3 font-bold text-slate-600">Storage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    ['Name, email, payment ID', 'Account, receipt, support', 'Google Sheets Transactions, Clerk'],
                    ['Google account (OAuth)', 'Dashboard access, Sheets SOT', 'Clerk, Google APIs'],
                    ['Chat messages', 'Customer support', 'Google Chat'],
                    ['Usage analytics', 'Product improvement', 'Google Analytics 4'],
                    ['Sam directive logs', 'Operations audit', 'Google Sheets SystemLog'],
                  ].map(([d, p, s]) => (
                    <tr key={d} className="hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-800">{d}</td>
                      <td className="p-3 text-slate-600">{p}</td>
                      <td className="p-3 text-slate-500 text-xs">{s}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-slate-800">6. Retention and Deletion</h2>
            <ul className="space-y-2 list-disc list-inside text-slate-600">
              <li><strong>Transactions and SystemLog:</strong> retained in Google Sheets until you request deletion.</li>
              <li><strong>Deletion requests:</strong> contact us via the support channel provided at onboarding. We will delete or anonymize Sheets rows tied to your account within thirty (30) days.</li>
              <li><strong>Backups:</strong> Google Drive sync and GitHub code backups may retain data per Google/GitHub retention policies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-slate-800">7. Third-Party Processors</h2>
            <div className="flex flex-wrap gap-2 mt-3">
              {['Cloudflare (hosting)', 'Razorpay (payments)', 'Clerk (auth)', 'Google Sheets/Drive/GA4/Gmail', 'GitHub (code)', 'Telegram (operational alerts)'].map(p => (
                <span key={p} className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-700">{p}</span>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-500">Full vendor list maintained in the Guardian_Ops Google Drive folder. Each vendor processes only the data necessary for their service function.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-slate-800">8. Your Rights (India / GDPR-aligned)</h2>
            <p>You may request access, correction, or deletion of personal data we control in Sheets and Clerk. Payment records held by Razorpay are subject to Razorpay's privacy policy. To exercise any right, contact us via the Google Chat onboarding group or the Contact page on this site.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
