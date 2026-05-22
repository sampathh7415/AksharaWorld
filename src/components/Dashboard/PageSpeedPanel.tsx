'use client';

import { useState, useEffect } from 'react';

interface PageSpeedData {
  url: string;
  strategy: 'mobile' | 'desktop';
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  fcp: string;   // First Contentful Paint
  lcp: string;   // Largest Contentful Paint
  tbt: string;   // Total Blocking Time
  cls: string;   // Cumulative Layout Shift
  si: string;    // Speed Index
  tti: string;   // Time to Interactive
  loading: boolean;
  tested: string;
}

const DEFAULT: PageSpeedData = {
  url: 'https://aksharaworld.in',
  strategy: 'mobile',
  performance: 0, accessibility: 0, bestPractices: 0, seo: 0,
  fcp: '—', lcp: '—', tbt: '—', cls: '—', si: '—', tti: '—',
  loading: false, tested: '',
};

function scoreColor(score: number) {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 50) return 'text-yellow-400';
  return 'text-red-400';
}

function scoreRing(score: number) {
  if (score >= 90) return 'stroke-emerald-400';
  if (score >= 50) return 'stroke-yellow-400';
  return 'stroke-red-400';
}

function ScoreCircle({ score, label }: { score: number; label: string }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <circle
            cx="36" cy="36" r={radius} fill="none"
            className={scoreRing(score)}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center text-xl font-black ${scoreColor(score)}`}>
          {score}
        </div>
      </div>
      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">{label}</div>
    </div>
  );
}

export function PageSpeedPanel() {
  const [data, setData]   = useState<PageSpeedData>(DEFAULT);
  const [url, setUrl]     = useState('https://aksharaworld.in');
  const [strategy, setStrategy] = useState<'mobile' | 'desktop'>('mobile');

  const runTest = async () => {
    setData(prev => ({ ...prev, loading: true, performance: 0, accessibility: 0, bestPractices: 0, seo: 0 }));
    try {
      const res = await fetch(`/api/pagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}`);
      const d   = await res.json();
      if (d.success) {
        setData({ ...d.data, loading: false, url, strategy });
      } else {
        setData(prev => ({ ...prev, loading: false }));
      }
    } catch {
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => { runTest(); }, []); // Auto-test on mount

  const metrics = [
    { label: 'First Contentful Paint', value: data.fcp, info: 'How quickly content first appears' },
    { label: 'Largest Contentful Paint', value: data.lcp, info: 'How quickly the largest element loads' },
    { label: 'Total Blocking Time', value: data.tbt, info: 'Time page is blocked from user input' },
    { label: 'Cumulative Layout Shift', value: data.cls, info: 'Visual stability score' },
    { label: 'Speed Index', value: data.si, info: 'How quickly content is visually populated' },
    { label: 'Time to Interactive', value: data.tti, info: 'When page fully responds to user input' },
  ];

  return (
    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            ⚡ GOOGLE PAGESPEED INSIGHTS
          </h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">
            Core Web Vitals — Real performance scores from Google
          </p>
        </div>
        <a
          href={`https://pagespeed.web.dev/report?url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-xs font-bold uppercase hover:text-white transition-all"
        >
          Full Report ↗
        </a>
      </div>

      {/* URL + Strategy controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://aksharaworld.in"
          className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/5 text-white text-sm focus:outline-none focus:border-blue-500/30"
        />
        <div className="flex gap-2">
          {(['mobile', 'desktop'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStrategy(s)}
              className={`px-4 py-3 rounded-xl text-xs font-bold uppercase transition-all ${
                strategy === s
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-white/[0.03] text-gray-500 border border-white/5 hover:text-gray-300'
              }`}
            >
              {s === 'mobile' ? '📱' : '🖥️'} {s}
            </button>
          ))}
        </div>
        <button
          onClick={runTest}
          disabled={data.loading}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black uppercase hover:opacity-90 transition-all disabled:animate-pulse"
        >
          {data.loading ? '⏳ Testing...' : '🔍 Run Test'}
        </button>
      </div>

      {/* Score circles */}
      <div className="flex flex-wrap justify-around gap-6 py-4">
        <ScoreCircle score={data.performance}   label="Performance" />
        <ScoreCircle score={data.accessibility} label="Accessibility" />
        <ScoreCircle score={data.bestPractices} label="Best Practices" />
        <ScoreCircle score={data.seo}           label="SEO" />
      </div>

      {/* Core web vitals */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {metrics.map(m => (
          <div key={m.label} className="p-4 rounded-2xl bg-black/30 border border-white/5">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{m.label}</div>
            <div className="text-lg font-black text-white">{data.loading ? '...' : m.value}</div>
            <div className="text-[9px] text-gray-600 mt-1">{m.info}</div>
          </div>
        ))}
      </div>

      {data.tested && (
        <p className="text-[10px] text-gray-600 text-center">Last tested: {data.tested}</p>
      )}
    </div>
  );
}
