'use client';

import { useState } from 'react';

interface NewsItem   { title: string; source: string; link: string; pubDate: string; snippet: string; }
interface TrendItem  { keyword: string; traffic: string; relatedQueries: string[]; }
interface PatentResult { title: string; inventor: string; filingDate: string; abstract: string; link: string; }
interface ScholarResult { title: string; authors: string; year: string; citations: number; abstract: string; link: string; }

interface ScoutReport {
  timestamp: string;
  news: NewsItem[];
  trends: TrendItem[];
  patents: PatentResult[];
  scholar: ScholarResult[];
  summary: string;
}

export function InnovationScoutPanel() {
  const [tab, setTab]         = useState<'news' | 'trends' | 'patents' | 'scholar'>('news');
  const [report, setReport]   = useState<ScoutReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);

  const runScan = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/scout', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setReport(data.data);
        setLastRun(new Date().toLocaleTimeString('en-IN'));
      }
    } catch (e) {
      console.error('Scout scan failed', e);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'news',    label: '📰 Google News',    count: report?.news.length    || 0 },
    { key: 'trends',  label: '📈 Google Trends',  count: report?.trends.length  || 0 },
    { key: 'patents', label: '🔬 Google Patents',  count: report?.patents.length || 0 },
    { key: 'scholar', label: '📚 Scholar',         count: report?.scholar.length || 0 },
  ] as const;

  return (
    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            🔎 INNOVATION_SCOUT — LIVE R&D ENGINE
          </h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">
            Google News · Google Trends · Google Patents · Semantic Scholar — all zero-cost
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRun && (
            <span className="text-[10px] text-gray-500 font-mono">Last run: {lastRun}</span>
          )}
          <button
            onClick={runScan}
            disabled={loading}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              loading
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 animate-pulse'
                : 'bg-purple-500 text-black hover:scale-[1.02] shadow-[0_0_15px_rgba(168,85,247,0.2)]'
            }`}
          >
            {loading ? '⏳ Scanning...' : '▶ Run Scout Scan'}
          </button>
        </div>
      </div>

      {/* Summary box */}
      {report?.summary && (
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
          <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">Scan Summary</div>
          <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">{report.summary}</pre>
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              tab === t.key
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-white/[0.03] text-gray-500 border border-white/5 hover:text-gray-300'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[9px] font-black">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[200px]">
        {!report && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <span className="text-4xl">🕵️</span>
            <div className="text-sm font-black text-white">Scout is ready</div>
            <p className="text-xs text-gray-500 max-w-sm">
              Click "Run Scout Scan" to fetch live data from Google News, Trends, Patents, and Scholar.
            </p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
            <p className="text-xs text-purple-400 font-bold animate-pulse uppercase tracking-widest">
              Scanning Google News · Trends · Patents · Scholar...
            </p>
          </div>
        )}

        {/* NEWS */}
        {report && tab === 'news' && (
          <div className="space-y-3">
            {report.news.length === 0 && <p className="text-xs text-gray-500 text-center py-8">No news fetched yet.</p>}
            {report.news.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-purple-500/30 transition-colors group"
              >
                <div className="flex justify-between items-start gap-3 mb-1">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-white leading-snug">{item.title}</span>
                  <span className="text-[9px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded font-bold uppercase whitespace-nowrap">{item.source}</span>
                </div>
                <div className="text-[10px] text-gray-500">{new Date(item.pubDate).toLocaleDateString('en-IN')}</div>
              </a>
            ))}
          </div>
        )}

        {/* TRENDS */}
        {report && tab === 'trends' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {report.trends.map((t, i) => (
              <div key={i} className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">{t.keyword}</span>
                  <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{t.traffic}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {t.relatedQueries.map((q, j) => (
                    <span key={j} className="text-[9px] bg-white/5 text-gray-400 px-2 py-0.5 rounded-full">{q}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PATENTS */}
        {report && tab === 'patents' && (
          <div className="space-y-3">
            {report.patents.length === 0 && <p className="text-xs text-gray-500 text-center py-8">No patents fetched yet.</p>}
            {report.patents.map((p, i) => (
              <a
                key={i}
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-blue-500/30 transition-colors group space-y-2"
              >
                <div className="text-xs font-bold text-slate-200 group-hover:text-white">{p.title}</div>
                <div className="flex gap-4 text-[10px] text-gray-500">
                  <span>👤 {p.inventor}</span>
                  <span>📅 {p.filingDate}</span>
                </div>
                {p.abstract && <p className="text-[11px] text-gray-500 italic line-clamp-2">{p.abstract}</p>}
              </a>
            ))}
          </div>
        )}

        {/* SCHOLAR */}
        {report && tab === 'scholar' && (
          <div className="space-y-3">
            {report.scholar.length === 0 && <p className="text-xs text-gray-500 text-center py-8">No papers fetched yet.</p>}
            {report.scholar.map((s, i) => (
              <a
                key={i}
                href={s.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-cyan-500/30 transition-colors group space-y-2"
              >
                <div className="text-xs font-bold text-slate-200 group-hover:text-white">{s.title}</div>
                <div className="flex gap-4 text-[10px] text-gray-500">
                  <span>✍️ {s.authors}</span>
                  <span>📅 {s.year}</span>
                  <span className="text-cyan-400 font-bold">🔗 {s.citations} citations</span>
                </div>
                {s.abstract && <p className="text-[11px] text-gray-500 italic line-clamp-2">{s.abstract}</p>}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
