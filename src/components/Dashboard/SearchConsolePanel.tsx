'use client';

import { useState, useEffect } from 'react';

interface GSCQuery {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface GSCPage {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface GSCData {
  totalClicks: number;
  totalImpressions: number;
  avgCTR: number;
  avgPosition: number;
  topQueries: GSCQuery[];
  topPages: GSCPage[];
  lastUpdated: string;
  connected: boolean;
}

// Seeded data (replaces with live GSC data once OAuth is configured)
const MOCK_DATA: GSCData = {
  totalClicks:      1842,
  totalImpressions: 28400,
  avgCTR:           6.5,
  avgPosition:      2.8,
  connected:        false,
  lastUpdated:      new Date().toISOString(),
  topQueries: [
    { query: 'zero cost digital business',           clicks: 420, impressions: 5200, ctr: 8.1, position: 1.4 },
    { query: 'autonomous ai ceo tools',              clicks: 280, impressions: 3400, ctr: 8.2, position: 2.1 },
    { query: 'google sheets free database nextjs',  clicks: 195, impressions: 2100, ctr: 9.3, position: 3.5 },
    { query: 'autonomous agency india',              clicks: 150, impressions: 1800, ctr: 8.3, position: 2.8 },
    { query: 'razorpay nextjs 15 integration',       clicks:  98, impressions: 1200, ctr: 8.1, position: 4.2 },
    { query: 'cloudflare workers edge india',        clicks:  85, impressions: 1050, ctr: 8.1, position: 3.9 },
    { query: 'gemini api business automation',       clicks:  72, impressions:  890, ctr: 8.1, position: 5.1 },
  ],
  topPages: [
    { page: '/public/products/ai-blueprint',  clicks: 620, impressions: 8200, ctr: 7.6, position: 1.2 },
    { page: '/',                              clicks: 480, impressions: 7400, ctr: 6.5, position: 2.0 },
    { page: '/blog/zero-cost-digital-business', clicks: 380, impressions: 5100, ctr: 7.5, position: 1.8 },
    { page: '/public/contact',               clicks: 210, impressions: 3200, ctr: 6.6, position: 3.2 },
  ],
};

export function SearchConsolePanel() {
  const [data, setData]   = useState<GSCData>(MOCK_DATA);
  const [tab, setTab]     = useState<'queries' | 'pages'>('queries');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/gsc').then(r => r.json()).then(d => {
      if (d.success && d.data) setData(d.data);
    }).catch(() => {});
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/gsc?refresh=1');
      const d = await r.json();
      if (d.success && d.data) setData(d.data);
    } finally { setLoading(false); }
  };

  const kpis = [
    { label: 'Total Clicks',       value: data.totalClicks.toLocaleString(), color: 'cyan',   icon: '👆' },
    { label: 'Impressions',        value: data.totalImpressions.toLocaleString(), color: 'purple', icon: '👁️' },
    { label: 'Avg CTR',            value: `${data.avgCTR.toFixed(1)}%`, color: 'green', icon: '🎯' },
    { label: 'Avg Position',       value: `#${data.avgPosition.toFixed(1)}`, color: 'yellow', icon: '📍' },
  ];

  const colorMap: Record<string, string> = {
    cyan:   'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    green:  'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  };

  return (
    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            🔍 GOOGLE SEARCH CONSOLE
          </h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">
            aksharaworld.in — Organic search performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
            data.connected
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
          }`}>
            {data.connected ? '✅ Live Data' : '⏳ Seeded — Connect GSC API for live'}
          </span>
          <button
            onClick={refresh}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-xs font-bold uppercase hover:text-white hover:border-white/20 transition-all disabled:animate-pulse"
          >
            {loading ? '⏳' : '🔄'} Refresh
          </button>
          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-black uppercase hover:bg-green-500/20 transition-all"
          >
            Open GSC ↗
          </a>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className={`p-4 rounded-2xl border ${colorMap[k.color]} space-y-1`}>
            <div className="text-lg">{k.icon}</div>
            <div className="text-2xl font-black" style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>
              {k.value}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['queries', 'pages'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              tab === t
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-white/[0.03] text-gray-500 border border-white/5 hover:text-gray-300'
            }`}
          >
            {t === 'queries' ? '🔑 Top Queries' : '📄 Top Pages'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/5">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              {tab === 'queries'
                ? ['Query', 'Clicks', 'Impressions', 'CTR', 'Position'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{h}</th>
                  ))
                : ['Page', 'Clicks', 'Impressions', 'CTR', 'Position'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{h}</th>
                  ))
              }
            </tr>
          </thead>
          <tbody>
            {tab === 'queries'
              ? data.topQueries.map((q, i) => (
                  <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-300">{q.query}</td>
                    <td className="px-4 py-3 text-cyan-400 font-black">{q.clicks.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-400">{q.impressions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-emerald-400 font-bold">{q.ctr.toFixed(1)}%</td>
                    <td className="px-4 py-3">
                      <span className={`font-black ${q.position <= 3 ? 'text-emerald-400' : q.position <= 10 ? 'text-yellow-400' : 'text-gray-500'}`}>
                        #{q.position.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))
              : data.topPages.map((p, i) => (
                  <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{p.page}</td>
                    <td className="px-4 py-3 text-cyan-400 font-black">{p.clicks.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-400">{p.impressions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-emerald-400 font-bold">{p.ctr.toFixed(1)}%</td>
                    <td className="px-4 py-3">
                      <span className={`font-black ${p.position <= 3 ? 'text-emerald-400' : p.position <= 10 ? 'text-yellow-400' : 'text-gray-500'}`}>
                        #{p.position.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      {/* Sitemap status */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-black/30 border border-white/5">
        <div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Sitemap Submitted</div>
          <div className="text-xs font-bold text-white">aksharaworld.in/sitemap.xml</div>
          <div className="text-[10px] text-gray-600 mt-0.5">{new Date().toLocaleDateString('en-IN')} — Auto-generated by Next.js</div>
        </div>
        <a
          href="https://aksharaworld.in/sitemap.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-[10px] font-bold uppercase hover:text-white transition-all"
        >
          View Sitemap ↗
        </a>
      </div>
    </div>
  );
}
