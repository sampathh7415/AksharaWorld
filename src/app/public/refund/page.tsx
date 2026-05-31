/**
 * 💰 REFUND & RETURN POLICY — aksharaworld.in/public/refund
 * Required by Google Merchant Center for account approval
 * Digital products — no physical returns, but we offer credit/re-delivery
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund & Return Policy – Akshara World',
  description: 'Akshara World refund and return policy for digital products. We offer a 7-day satisfaction guarantee.',
  alternates: { canonical: 'https://aksharaworld.in/public/refund' },
};

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-200">
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-indigo-500/[0.03] to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="mb-12">
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block mb-3">
            Legal
          </span>
          <h1 className="text-4xl font-black text-white mb-4" style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>
            Refund &amp; Return Policy
          </h1>
          <p className="text-slate-500 text-sm">
            Last updated: <time dateTime="2026-05-31">31 May 2026</time>
          </p>
        </div>

        <div className="space-y-10 text-sm text-slate-400 leading-relaxed">

          {/* Guarantee Banner */}
          <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
            <p className="text-cyan-300 font-bold text-base">🛡️ 7-Day Satisfaction Guarantee</p>
            <p className="mt-1 text-cyan-400/80 text-xs">
              If you are not satisfied with your purchase for any reason, contact us within 7 days of purchase and we will make it right.
            </p>
          </div>

          {/* Overview */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Overview</h2>
            <p>
              All products on <strong className="text-slate-200">Akshara World</strong> are
              <strong className="text-slate-200"> digital products</strong> delivered electronically.
              Due to the instant nature of digital delivery, we cannot accept returns in the traditional sense.
              However, we are fully committed to your satisfaction.
            </p>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Refund Eligibility</h2>
            <p className="mb-3">You are eligible for a <strong className="text-slate-200">full refund</strong> if:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You request a refund within <strong className="text-slate-200">7 days</strong> of your purchase date.</li>
              <li>The product did not match the description on the product page.</li>
              <li>You experienced a <strong className="text-slate-200">technical issue</strong> preventing access to your purchased content and our support team could not resolve it within 48 hours.</li>
              <li>You were charged more than once for the same product (duplicate payment).</li>
            </ul>

            <p className="mt-4 mb-3">Refunds will <strong className="text-slate-200">not</strong> be issued if:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You simply changed your mind after downloading and using the product.</li>
              <li>You purchased the wrong product — in this case, we will offer a <strong className="text-slate-200">free exchange</strong>.</li>
              <li>More than 7 days have passed since your purchase.</li>
            </ul>
          </section>

          {/* How to Request */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. How to Request a Refund</h2>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                Email <a href="mailto:aksharasam@aksharaworld.in" className="text-cyan-400 hover:underline">aksharasam@aksharaworld.in</a> with the subject line: <code className="bg-white/5 px-2 py-0.5 rounded text-cyan-300">Refund Request – [Your Order ID]</code>
              </li>
              <li>Include your <strong className="text-slate-200">Razorpay Payment ID</strong> (found in your payment confirmation email).</li>
              <li>Briefly describe the reason for your refund request.</li>
            </ol>
            <p className="mt-3">
              We will respond within <strong className="text-slate-200">2 business days</strong>. Approved refunds are processed within
              <strong className="text-slate-200"> 5–7 business days</strong> to your original payment method.
            </p>
          </section>

          {/* Refund Timeline */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Refund Timeline</h2>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 pr-4 text-slate-300 font-bold">Stage</th>
                  <th className="text-left py-2 text-slate-300 font-bold">Time</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-4 text-slate-400">Request acknowledged</td>
                  <td className="py-2 text-slate-300">Within 24 hours</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-4 text-slate-400">Refund decision</td>
                  <td className="py-2 text-slate-300">Within 2 business days</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-4 text-slate-400">Razorpay processes refund</td>
                  <td className="py-2 text-slate-300">3–5 business days</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-slate-400">Credit appears in account</td>
                  <td className="py-2 text-slate-300">5–7 business days (bank dependent)</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Return Window */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Return Window</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-emerald-400 font-bold text-sm">✅ 0–7 Days</p>
                <p className="text-xs text-slate-400 mt-1">Full refund available upon request</p>
              </div>
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 font-bold text-sm">❌ After 7 Days</p>
                <p className="text-xs text-slate-400 mt-1">Refunds not available (except technical failures)</p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <h2 className="text-lg font-bold text-white mb-2">Contact &amp; Support</h2>
            <p className="text-slate-500 text-xs">Business Hours: Monday – Saturday, 9 AM – 6 PM IST</p>
            <p className="mt-2">
              Email: <a href="mailto:aksharasam@aksharaworld.in" className="text-cyan-400 hover:underline">aksharasam@aksharaworld.in</a>
            </p>
            <p>Phone: Available on request via email</p>
            <p>Website: <a href="https://aksharaworld.in" className="text-cyan-400 hover:underline">aksharaworld.in</a></p>
          </section>

        </div>
      </div>
    </div>
  );
}
