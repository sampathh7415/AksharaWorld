'use client';
export const runtime = 'edge';

import React, { useState } from 'react';
import { getRecaptchaToken } from '../../../lib/recaptcha';
import { gaContactFormSubmit } from '../../../lib/analytics';

type FormState = 'idle' | 'sending' | 'success' | 'error' | 'blocked';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      // 🛡️ Get reCAPTCHA Enterprise token before submitting
      const recaptchaToken = await getRecaptchaToken('CONTACT_FORM');

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, recaptchaToken }),
      });

      const data = await res.json();

      if (data.blocked) {
        setStatus('blocked');
      } else if (data.success) {
        setStatus('success');
        gaContactFormSubmit(form.subject); // 📊 GA4: track lead
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please check your connection.');
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <div className="max-w-5xl mx-auto px-6 py-24">

        {/* Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6">
            🛡️ reCAPTCHA Protected
          </div>
          <h1 className="text-5xl font-black text-white mb-4" style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>
            Contact Akshara World
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            Have questions about our AI systems or your purchase? We typically respond within 24 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">

          {/* Left — Contact info */}
          <div className="lg:col-span-2 space-y-6">
            {[
              { icon: '✉️', label: 'Email Support', value: 'sampathh7415@gmail.com', href: 'mailto:sampathh7415@gmail.com' },
              { icon: '💼', label: 'Business Inquiries', value: 'admin@aksharaworld.in', href: 'mailto:admin@aksharaworld.in' },
              { icon: '💬', label: 'Telegram', value: '@Akshara23bot', href: 'https://t.me/Akshara23bot' },
            ].map(item => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-xl">{item.icon}</div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.label}</div>
                    <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{item.value}</div>
                  </div>
                </div>
              </a>
            ))}

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Security</div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="text-green-400">🛡️</span>
                This form is protected by{' '}
                <strong className="text-white">Google reCAPTCHA Enterprise</strong>
              </div>
              <div className="text-[10px] text-gray-600 mt-2">
                Score-based v3 — invisible to you, blocks automated bots silently.
              </div>
            </div>
          </div>

          {/* Right — Contact form */}
          <div className="lg:col-span-3">
            <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5">

              {/* Success state */}
              {status === 'success' && (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="text-5xl">✅</div>
                  <div className="text-xl font-black text-white">Message Sent!</div>
                  <p className="text-sm text-gray-400">We've received your message and will reply within 24 hours.</p>
                  <button onClick={() => setStatus('idle')} className="mt-4 px-6 py-2.5 rounded-xl bg-cyan-500 text-black text-xs font-black uppercase">
                    Send Another
                  </button>
                </div>
              )}

              {/* Blocked state */}
              {status === 'blocked' && (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="text-5xl">🤖</div>
                  <div className="text-xl font-black text-red-400">Request Blocked</div>
                  <p className="text-sm text-gray-400">Our reCAPTCHA system flagged this as suspicious. Please try again from a real browser.</p>
                  <button onClick={() => setStatus('idle')} className="mt-4 px-6 py-2.5 rounded-xl bg-white/10 text-white text-xs font-black uppercase">
                    Try Again
                  </button>
                </div>
              )}

              {/* Form */}
              {(status === 'idle' || status === 'sending' || status === 'error') && (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Full Name *</label>
                      <input
                        name="name" required value={form.name} onChange={handleChange}
                        placeholder="Sampathkumar"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 transition-colors placeholder:text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Email Address *</label>
                      <input
                        type="email" name="email" required value={form.email} onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 transition-colors placeholder:text-gray-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Subject *</label>
                    <select
                      name="subject" required value={form.subject} onChange={handleChange}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 transition-colors"
                    >
                      <option value="" className="bg-[#020617]">Select a topic...</option>
                      <option value="product-support" className="bg-[#020617]">Product Support</option>
                      <option value="purchase-inquiry" className="bg-[#020617]">Purchase Inquiry</option>
                      <option value="business-partnership" className="bg-[#020617]">Business Partnership</option>
                      <option value="technical-issue" className="bg-[#020617]">Technical Issue</option>
                      <option value="other" className="bg-[#020617]">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Message *</label>
                    <textarea
                      name="message" required value={form.message} onChange={handleChange}
                      rows={5} placeholder="Tell us about your question or issue..."
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 transition-colors placeholder:text-gray-600 resize-none"
                    />
                  </div>

                  {status === 'error' && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                      ⚠️ {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className={`w-full py-4 rounded-xl font-black uppercase tracking-wider text-sm transition-all ${
                      status === 'sending'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse cursor-not-allowed'
                        : 'bg-cyan-500 text-black hover:scale-[1.01] shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                    }`}
                  >
                    {status === 'sending' ? '🛡️ Verifying with reCAPTCHA...' : '✉️ Send Message'}
                  </button>

                  <p className="text-[10px] text-center text-gray-600">
                    Protected by Google reCAPTCHA Enterprise •{' '}
                    <a href="/public/privacy" className="underline hover:text-gray-400">Privacy Policy</a>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
