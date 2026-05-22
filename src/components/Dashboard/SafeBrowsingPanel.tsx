'use client';

import { useState } from 'react';

interface SafetyResult {
  url: string;
  isSafe: boolean;
  threats: string[];
  checked: string;
}

export function SafeBrowsingPanel() {
  const [urlToCheck, setUrlToCheck]   = useState('');
  const [result, setResult]           = useState<SafetyResult | null>(null);
  const [loading, setLoading]         = useState(false);
  const [recentChecks, setRecentChecks] = useState<SafetyResult[]>([]);

  const checkUrl = async () => {
    if (!urlToCheck.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/safe-browsing', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ url: urlToCheck }),
      });
      const data = await res.json();
      const r: SafetyResult = {
        url:      urlToCheck,
        isSafe:   data.isSafe ?? true,
        threats:  data.threats || [],
        checked:  new Date().toLocaleTimeString('en-IN'),
      };
      setResult(r);
      setRecentChecks(prev => [r, ...prev.slice(0, 4)]);
    } catch {
      setResult({ url: urlToCheck, isSafe: false, threats: ['Network error'], checked: '—' });
    } finally {
      setLoading(false);
    }
  };

  const commonChecks = [
    'https://aksharaworld.in',
    'https://aksharaworld.in/products',
    'https://aksharaworld.in/contact',
    'https://aksharaworld.in/api',
  ];

  return (
    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            🛡️ GOOGLE SAFE BROWSING
          </h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">
            Malware / Phishing detection — Real-time URL safety check
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
          Google Transparency Report
        </span>
      </div>

      {/* URL Input */}
      <div className="flex gap-3">
        <input
          type="url"
          value={urlToCheck}
          onChange={e => setUrlToCheck(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && checkUrl()}
          placeholder="https://example.com — check any URL for malware"
          className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/5 text-white text-sm focus:outline-none focus:border-red-500/30 placeholder:text-gray-600"
        />
        <button
          onClick={checkUrl}
          disabled={loading || !urlToCheck.trim()}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-black uppercase hover:opacity-90 transition-all disabled:opacity-40 whitespace-nowrap"
        >
          {loading ? '⏳ Checking...' : '🔍 Check Safety'}
        </button>
      </div>

      {/* Quick site checks */}
      <div className="flex flex-wrap gap-2">
        {commonChecks.map(u => (
          <button
            key={u}
            onClick={() => { setUrlToCheck(u); }}
            className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] text-gray-500 hover:text-gray-300 hover:border-white/10 transition-all font-mono"
          >
            {u.replace('https://aksharaworld.in', '~')}
          </button>
        ))}
      </div>

      {/* Result */}
      {result && (
        <div className={`p-6 rounded-2xl border ${
          result.isSafe
            ? 'bg-emerald-500/5 border-emerald-500/20'
            : 'bg-red-500/10 border-red-500/30'
        }`}>
          <div className="flex items-center gap-4">
            <div className="text-4xl">{result.isSafe ? '✅' : '⛔'}</div>
            <div>
              <div className={`text-lg font-black ${result.isSafe ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.isSafe ? 'SAFE — No threats detected' : 'WARNING — Threats found!'}
              </div>
              <div className="text-xs text-gray-500 font-mono mt-1 break-all">{result.url}</div>
              {!result.isSafe && result.threats.length > 0 && (
                <div className="mt-2 space-y-1">
                  {result.threats.map((t, i) => (
                    <div key={i} className="text-[11px] text-red-400 font-bold">⚠️ {t}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent checks */}
      {recentChecks.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Recent Checks</div>
          {recentChecks.map((r, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/[0.03]">
              <span className="text-xs font-mono text-gray-400 truncate max-w-xs">{r.url}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-600">{r.checked}</span>
                <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${
                  r.isSafe
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  {r.isSafe ? '✅ Safe' : '⛔ Threat'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note */}
      <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-[10px] text-blue-400">
        💡 Add <code className="font-mono">GOOGLE_CLOUD_API_KEY</code> in env for enhanced Safe Browsing API v4 — or use the free Transparency Report for basic checks.
      </div>
    </div>
  );
}
