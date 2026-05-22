'use client';

import { useState, useEffect } from 'react';

interface LookerReport {
  id: string;
  name: string;
  embedUrl: string;
  description: string;
}

const REPORTS: LookerReport[] = [
  {
    id: 'ga4-overview',
    name: 'GA4 Traffic Overview',
    embedUrl: process.env.NEXT_PUBLIC_LOOKER_GA4_URL || '',
    description: 'Sessions, users, page views, bounce rate from Google Analytics',
  },
  {
    id: 'revenue',
    name: 'Revenue Dashboard',
    embedUrl: process.env.NEXT_PUBLIC_LOOKER_REVENUE_URL || '',
    description: 'Sales, product performance, conversion funnel',
  },
  {
    id: 'seo',
    name: 'SEO Performance',
    embedUrl: process.env.NEXT_PUBLIC_LOOKER_SEO_URL || '',
    description: 'Search Console clicks, impressions, keyword rankings',
  },
];

export function LookerStudioPanel() {
  const [activeReport, setActiveReport] = useState(REPORTS[0]);
  const [hasUrl, setHasUrl] = useState(!!REPORTS[0].embedUrl);

  useEffect(() => {
    setHasUrl(!!activeReport.embedUrl);
  }, [activeReport]);

  return (
    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            📊 LOOKER STUDIO
          </h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">
            Connected to GA4 G-QZ4L9XW64F + Search Console
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="https://lookerstudio.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase hover:bg-blue-500/20 transition-all"
          >
            Open Looker ↗
          </a>
          <a
            href="https://lookerstudio.google.com/reporting/create"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-bold uppercase hover:text-white transition-all"
          >
            + New Report
          </a>
        </div>
      </div>

      {/* Report tabs */}
      <div className="flex gap-2 flex-wrap">
        {REPORTS.map(r => (
          <button
            key={r.id}
            onClick={() => setActiveReport(r)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
              activeReport.id === r.id
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'bg-white/[0.03] text-gray-500 border border-white/5 hover:text-gray-300'
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      {/* Report embed or setup guide */}
      {hasUrl ? (
        <div className="rounded-2xl overflow-hidden border border-white/5" style={{ height: '600px' }}>
          <iframe
            src={activeReport.embedUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            allowFullScreen
            title={activeReport.name}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-10 text-center space-y-6">
          <div className="text-5xl">📊</div>
          <div>
            <h3 className="text-white font-black text-lg">Connect Looker Studio Report</h3>
            <p className="text-gray-500 text-sm mt-2">Create a free report at lookerstudio.google.com and paste the embed URL below</p>
          </div>

          {/* Setup steps */}
          <div className="max-w-md mx-auto space-y-3 text-left">
            {[
              { step: '1', text: 'Go to lookerstudio.google.com', link: 'https://lookerstudio.google.com' },
              { step: '2', text: 'Click "+ Create" → "Report"' },
              { step: '3', text: 'Connect data source → "Google Analytics" → G-QZ4L9XW64F' },
              { step: '4', text: 'Design your dashboard' },
              { step: '5', text: 'Share → Embed → Copy iframe src URL → paste in env: NEXT_PUBLIC_LOOKER_GA4_URL' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-3 text-xs text-gray-400">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                  {s.step}
                </span>
                <span>
                  {s.link ? (
                    <a href={s.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{s.text}</a>
                  ) : s.text}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <a
              href="https://lookerstudio.google.com/reporting/create"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-black uppercase hover:bg-blue-500 transition-all"
            >
              🚀 Create Free Report →
            </a>
            <a
              href="https://lookerstudio.google.com/c/u/0/reporting/0B_U5RB2vqHBORm1XYnZfU2ViOGc/page/p_1jq6gmdmhd"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm font-bold uppercase hover:text-white transition-all"
            >
              Use GA4 Template →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
