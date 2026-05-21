export const runtime = 'edge';
import React from 'react'

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <h1 className="text-4xl font-black mb-8">Contact Us</h1>
      <p className="text-lg text-slate-600 mb-8">Have questions about our AI systems or your purchase? Get in touch with the team.</p>
      <div className="p-8 rounded-3xl bg-slate-100 border border-slate-200">
        <div className="space-y-4">
          <div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Email Support</div>
            <div className="text-xl font-bold">sampathh7415@gmail.com</div>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Business Inquiries</div>
            <div className="text-xl font-bold">admin@aksharaworld.in</div>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Telegram</div>
            <div className="text-xl font-bold">@Akshara23bot</div>
          </div>
        </div>
      </div>
    </div>
  )
}
