export const runtime = 'edge';
import React from 'react'

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 text-slate-700">
      <h1 className="text-4xl font-black mb-8 text-slate-900">Privacy Policy</h1>
      <p className="mb-4">Last Updated: May 15, 2026</p>
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-bold mb-2">1. Data Collection</h2>
          <p>We collect minimal data required to provide our services. This includes email addresses for newsletter subscriptions and transaction data via Razorpay for product purchases.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-2">2. Use of Data</h2>
          <p>Your data is used solely for service delivery, customer support, and essential business analytics. We do not sell your personal information to third parties.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-2">3. Cookies & Tracking</h2>
          <p>We use essential cookies and Google Analytics to improve user experience. You can opt-out of tracking via your browser settings.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-2">4. Third-Party Services</h2>
          <p>Our site uses Clerk for authentication and Razorpay for payments. Please refer to their respective privacy policies for data handling details.</p>
        </section>
      </div>
    </div>
  )
}
