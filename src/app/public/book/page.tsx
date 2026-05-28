'use client';
export const runtime = 'edge';

import React, { useState } from 'react';
import { getRecaptchaToken } from '../../../lib/recaptcha';

type BookState = 'idle' | 'booking' | 'success' | 'error' | 'blocked';

export default function BookPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', date: '', time: '', offer: 'launch-pilot' });
  const [status, setStatus] = useState<BookState>('idle');
  const [meetLink, setMeetLink] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const availableTimes = ['10:00 AM', '11:30 AM', '2:00 PM', '3:30 PM', '5:00 PM'];

  // Helper to generate dates for slot selector (next 5 weekdays)
  const getNextFiveWeekdays = () => {
    const dates = [];
    let current = new Date();
    while (dates.length < 5) {
      current.setDate(current.getDate() + 1);
      const day = current.getDay();
      if (day !== 0 && day !== 6) { // Exclude weekends
        dates.push(new Date(current));
      }
    }
    return dates;
  };

  const weekdays = getNextFiveWeekdays();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.time) {
      setStatus('error');
      setErrorMsg('Please select a preferred date and time slot.');
      return;
    }

    setStatus('booking');

    try {
      // 🛡️ Get reCAPTCHA Enterprise token before booking
      const recaptchaToken = await getRecaptchaToken('BOOK_DEMO');

      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, recaptchaToken }),
      });

      const data = await res.json();

      if (data.blocked) {
        setStatus('blocked');
      } else if (data.success) {
        setStatus('success');
        setMeetLink(data.meetLink);
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
    <div className="min-h-screen bg-[#030712] text-slate-200">
      <div className="max-w-4xl mx-auto px-6 py-24">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6">
            📅 Google Calendar & Meet Integration
          </div>
          <h1 className="text-5xl font-black text-white mb-4" style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>
            Schedule an Autonomous Business Demo
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            Book a 15-minute slot to see our serverless AI agents in action and map your custom digital empire.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl shadow-[0_0_50px_rgba(6,182,212,0.05)]">
            
            {/* Success State */}
            {status === 'success' && (
              <div className="text-center space-y-6 py-8">
                <div className="text-6xl animate-bounce">🎉</div>
                <h2 className="text-3xl font-black text-white" style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>
                  Demo Booked Successfully!
                </h2>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  A Google Calendar invitation with details has been compiled and logged. Your session details are listed below:
                </p>

                <div className="p-6 rounded-2xl bg-black/40 border border-white/5 text-left max-w-md mx-auto space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Prospect:</span>
                    <span className="font-bold text-white">{form.name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Date slot:</span>
                    <span className="font-bold text-white">{form.date}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Time slot:</span>
                    <span className="font-bold text-cyan-400">{form.time} (IST)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Interest Offer:</span>
                    <span className="font-bold text-white uppercase">{form.offer.replace('-', ' ')}</span>
                  </div>
                  <div className="border-t border-white/5 pt-3 mt-3">
                    <span className="text-[10px] text-slate-500 block mb-1.5 uppercase font-bold tracking-widest">🎥 Google Meet Video Link:</span>
                    <a href={meetLink} target="_blank" rel="noopener noreferrer" 
                       className="text-xs font-black text-cyan-400 hover:underline break-all block">
                      {meetLink}
                    </a>
                  </div>
                </div>

                <div className="pt-6">
                  <button onClick={() => setStatus('idle')} 
                          className="px-8 py-3 rounded-xl bg-cyan-500 text-black font-black uppercase text-xs hover:scale-105 transition-transform">
                    Book Another Slot
                  </button>
                </div>
              </div>
            )}

            {/* Blocked State */}
            {status === 'blocked' && (
              <div className="text-center py-12 space-y-4">
                <div className="text-5xl">🤖</div>
                <h3 className="text-xl font-bold text-red-400">Security Verification Blocked</h3>
                <p className="text-slate-400 text-sm">Our bot prevention system flagged this request as suspicious. Please try booking from a standard browser.</p>
                <button onClick={() => setStatus('idle')} className="mt-4 px-6 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold uppercase">
                  Try Again
                </button>
              </div>
            )}

            {/* In-flight and Idle form states */}
            {(status === 'idle' || status === 'booking' || status === 'error') && (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Inputs Row */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Your Name *</label>
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

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Company / Individual</label>
                    <input
                      name="company" value={form.company} onChange={handleChange}
                      placeholder="Akshara Tech"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 transition-colors placeholder:text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Interest Tier *</label>
                    <select
                      name="offer" value={form.offer} onChange={handleChange}
                      className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 transition-colors"
                    >
                      <option value="launch-pilot">Akshara Launch Pilot — ₹999</option>
                      <option value="ai-blueprint">AI Productivity Blueprint — ₹499</option>
                      <option value="custom-integration">Custom AI Business Swarms — Premium</option>
                    </select>
                  </div>
                </div>

                {/* 1. Date Selector */}
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-3">1. Select Preferred Date *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {weekdays.map((dateObj, i) => {
                      const dateString = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                      const rawDate = dateObj.toISOString().split('T')[0];
                      const isSelected = form.date === rawDate;
                      return (
                        <button
                          key={i} type="button"
                          onClick={() => setForm(prev => ({ ...prev, date: rawDate }))}
                          className={`py-3 rounded-xl border text-center transition-all ${
                            isSelected 
                              ? 'bg-cyan-500 border-cyan-500 text-black font-black scale-105' 
                              : 'bg-white/[0.02] border-white/5 hover:border-white/20 text-slate-300'
                          }`}
                        >
                          <span className="text-[10px] block uppercase font-bold tracking-wider opacity-60">
                            {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                          <span className="text-xs font-black block mt-0.5">
                            {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Time Selector */}
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-3">2. Select Preferred Time (IST) *</label>
                  <div className="flex flex-wrap gap-2">
                    {availableTimes.map((time, i) => {
                      const isSelected = form.time === time;
                      return (
                        <button
                          key={i} type="button"
                          onClick={() => setForm(prev => ({ ...prev, time }))}
                          className={`px-4 py-2.5 rounded-lg border text-xs font-bold transition-all ${
                            isSelected 
                              ? 'bg-cyan-500 border-cyan-500 text-black font-black' 
                              : 'bg-white/[0.02] border-white/5 hover:border-white/25 text-slate-300'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Error status info */}
                {status === 'error' && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                    ⚠️ {errorMsg}
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={status === 'booking'}
                  className={`w-full py-4 rounded-xl font-black uppercase tracking-wider text-sm transition-all ${
                    status === 'booking'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse cursor-not-allowed'
                      : 'bg-cyan-500 text-black hover:scale-[1.01] shadow-[0_4px_20px_rgba(6,182,212,0.3)]'
                  }`}
                >
                  {status === 'booking' ? '📅 Securing Meet Invitation Slot...' : '⚡ Confirm Demo Booking'}
                </button>

                <p className="text-[10px] text-center text-gray-600">
                  Protected by Google reCAPTCHA Enterprise • 15-Minute Zero-Cost slots.
                </p>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
