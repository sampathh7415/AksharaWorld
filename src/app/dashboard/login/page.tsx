'use client';
export const runtime = 'edge';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('Synapse connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 flex items-center justify-center px-6 selection:bg-cyan-500/20">
      
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        
        {/* Header Branding */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-black text-black text-2xl mx-auto shadow-2xl mb-5">
            A
          </div>
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>
            Command Center
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Secure administrative gateway for Akshara World
          </p>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl shadow-[0_0_50px_rgba(6,182,212,0.05)]">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
                Administrative Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-800 text-center"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold text-center">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-black uppercase tracking-wider text-xs transition-transform ${
                loading
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse cursor-not-allowed'
                  : 'bg-cyan-500 text-black hover:scale-[1.01] shadow-[0_4px_20px_rgba(6,182,212,0.3)] cursor-pointer'
              }`}
            >
              {loading ? '🔐 Authorizing...' : '⚡ Enter Synapse'}
            </button>
          </form>
        </div>

        <div className="text-center mt-8">
          <a href="/" className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors">
            ← Return to Brand Hub
          </a>
        </div>
      </div>
    </div>
  );
}
