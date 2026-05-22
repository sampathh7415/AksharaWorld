'use client';

import { useState } from 'react';

interface NewsletterFormProps {
  className?: string;
  variant?: 'inline' | 'card' | 'minimal';
  source?: string;
}

export function NewsletterSignup({ className, variant = 'card', source = 'website' }: NewsletterFormProps) {
  const [email, setEmail]     = useState('');
  const [name, setName]       = useState('');
  const [status, setStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, name, source }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setMessage('🎉 You\'re subscribed! Expect zero-fluff AI business insights weekly.');
        setEmail('');
        setName('');
      } else {
        setStatus('error');
        setMessage(data.message || 'Something went wrong. Try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  if (variant === 'minimal') {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className || ''}`}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold uppercase hover:bg-blue-500 transition-all disabled:opacity-50"
        >
          {status === 'loading' ? '⏳' : 'Subscribe'}
        </button>
      </form>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={className}>
        {status === 'success' ? (
          <div className="text-center p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-sm">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name (optional)"
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50"
            />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-black uppercase hover:opacity-90 transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {status === 'loading' ? '⏳ Subscribing...' : '✉️ Subscribe Free'}
            </button>
          </form>
        )}
        {status === 'error' && (
          <p className="text-red-400 text-xs mt-2">{message}</p>
        )}
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className={`p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/10 ${className || ''}`}>
      <div className="text-center space-y-3 mb-6">
        <div className="text-3xl">✉️</div>
        <h3 className="text-xl font-black text-white">Weekly AI Business Insights</h3>
        <p className="text-sm text-gray-400 max-w-sm mx-auto">
          Zero-fluff strategies for building autonomous businesses. Join 500+ founders.
        </p>
      </div>

      {status === 'success' ? (
        <div className="text-center p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="text-2xl mb-2">🎉</div>
          <p className="text-emerald-400 font-bold">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-50 text-sm"
          >
            {status === 'loading' ? '⏳ Subscribing...' : '🚀 Get Free Weekly Insights'}
          </button>
          {status === 'error' && (
            <p className="text-red-400 text-xs text-center">{message}</p>
          )}
          <p className="text-[10px] text-gray-500 text-center">
            No spam. Unsubscribe anytime. Sent from sampathh7415@gmail.com
          </p>
        </form>
      )}
    </div>
  );
}
