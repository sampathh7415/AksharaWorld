/**
 * 📦 SHIPPING POLICY PAGE — aksharaworld.in/public/shipping
 * Required by Google Merchant Center for account approval
 * Digital products = instant delivery, no physical shipping
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Policy – Akshara World',
  description: 'Akshara World delivers all products digitally with instant access. No physical shipping. Learn about our delivery process.',
  alternates: { canonical: 'https://aksharaworld.in/public/shipping' },
};

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-200">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-cyan-500/[0.03] to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="mb-12">
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block mb-3">
            Legal
          </span>
          <h1 className="text-4xl font-black text-white mb-4" style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>
            Shipping &amp; Delivery Policy
          </h1>
          <p className="text-slate-500 text-sm">
            Last updated: <time dateTime="2026-05-31">31 May 2026</time>
          </p>
        </div>

        <div className="space-y-10 text-sm text-slate-400 leading-relaxed">

          {/* Instant Digital Delivery */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Digital Delivery (Instant)</h2>
            <p>
              All products sold by <strong className="text-slate-200">Akshara World</strong> are
              <strong className="text-cyan-400"> digital downloads</strong> delivered electronically.
              There is no physical shipment. Upon successful payment:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>You receive an <strong className="text-slate-200">automated email</strong> with your secure download link within <strong className="text-slate-200">5 minutes</strong>.</li>
              <li>Access is granted immediately through your <strong className="text-slate-200">Akshara World account</strong> on our dashboard.</li>
              <li>Download links remain valid for <strong className="text-slate-200">7 days</strong> from purchase date.</li>
            </ul>
          </section>

          {/* Shipping Costs */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Shipping Cost</h2>
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-emerald-400 font-bold">
                ✅ FREE — There are no shipping charges. All products are delivered digitally at zero delivery cost.
              </p>
            </div>
          </section>

          {/* Delivery Time */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Delivery Time</h2>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 pr-4 text-slate-300 font-bold">Product</th>
                  <th className="text-left py-2 pr-4 text-slate-300 font-bold">Delivery Method</th>
                  <th className="text-left py-2 text-slate-300 font-bold">Time</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-4 text-slate-400">AI Autonomous Business Blueprint</td>
                  <td className="py-2 pr-4 text-slate-400">Email + Dashboard</td>
                  <td className="py-2 text-emerald-400 font-bold">Instant (≤ 5 min)</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-4 text-slate-400">Launch Pilot Strategy Pack</td>
                  <td className="py-2 pr-4 text-slate-400">Email + Dashboard</td>
                  <td className="py-2 text-emerald-400 font-bold">Instant (≤ 5 min)</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Access Issues */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Didn&apos;t Receive Your Product?</h2>
            <p>If you did not receive your access email within 10 minutes of payment:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Check your <strong className="text-slate-200">spam / junk folder</strong>.</li>
              <li>Log into your dashboard at <a href="https://aksharaworld.in/dashboard" className="text-cyan-400 hover:underline">aksharaworld.in/dashboard</a>.</li>
              <li>Contact us at <a href="mailto:aksharasam@aksharaworld.in" className="text-cyan-400 hover:underline">aksharasam@aksharaworld.in</a> with your Razorpay payment ID.</li>
            </ul>
          </section>

          {/* Geographic Availability */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Geographic Availability</h2>
            <p>
              Our digital products are available <strong className="text-slate-200">worldwide</strong>.
              Payments are processed in <strong className="text-slate-200">Indian Rupees (INR)</strong> via Razorpay.
              International customers may purchase using international cards — currency conversion is handled by your bank.
            </p>
          </section>

          {/* Contact */}
          <section className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <h2 className="text-lg font-bold text-white mb-2">Contact &amp; Support</h2>
            <p className="text-slate-500 text-xs">Business Hours: Monday – Saturday, 9 AM – 6 PM IST</p>
            <p className="mt-2">
              Email: <a href="mailto:aksharasam@aksharaworld.in" className="text-cyan-400 hover:underline">aksharasam@aksharaworld.in</a>
            </p>
            <p>Website: <a href="https://aksharaworld.in" className="text-cyan-400 hover:underline">aksharaworld.in</a></p>
          </section>

        </div>
      </div>
    </div>
  );
}
