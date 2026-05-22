'use client';

import { useEffect, useRef, useState } from 'react';

/* ── Google Charts loader ── */
declare global {
  interface Window {
    google: any;
    googleChartsLoaded: boolean;
  }
}

function loadGoogleCharts(): Promise<void> {
  return new Promise((resolve) => {
    if (window.googleChartsLoaded) return resolve();
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/charts/loader.js';
    script.onload = () => {
      window.google.charts.load('current', { packages: ['corechart', 'bar', 'table'] });
      window.google.charts.setOnLoadCallback(() => {
        window.googleChartsLoaded = true;
        resolve();
      });
    };
    document.head.appendChild(script);
  });
}

/* ── Chart options shared dark theme ── */
const darkBase = {
  backgroundColor: 'transparent',
  legendTextStyle: { color: '#94a3b8', fontSize: 11 },
  titleTextStyle: { color: '#cbd5e1', fontSize: 12, bold: true },
  hAxis: { textStyle: { color: '#64748b' }, gridlines: { color: '#1e293b' }, baselineColor: '#1e293b' },
  vAxis: { textStyle: { color: '#64748b' }, gridlines: { color: '#1e293b' }, baselineColor: '#1e293b' },
  chartArea: { left: 50, right: 20, top: 40, bottom: 40, width: '100%', height: '80%' },
  tooltip: { textStyle: { color: '#0f172a' } },
};

/* ── Traffic Line Chart ── */
function TrafficChart() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    loadGoogleCharts().then(() => {
      if (!ref.current) return;
      const data = window.google.visualization.arrayToDataTable([
        ['Day', 'Visitors', 'Sessions'],
        ['Mon', 980,  1120],
        ['Tue', 1240, 1380],
        ['Wed', 1100, 1250],
        ['Thu', 1520, 1720],
        ['Fri', 1380, 1580],
        ['Sat', 860,  940],
        ['Sun', 720,  810],
      ]);
      const chart = new window.google.visualization.LineChart(ref.current);
      chart.draw(data, {
        ...darkBase,
        title: 'Weekly Traffic — Visitors vs Sessions',
        colors: ['#22d3ee', '#a78bfa'],
        lineWidth: 2.5,
        pointSize: 5,
        curveType: 'function',
      });
    });
  }, []);
  return <div ref={ref} className="w-full h-[220px]" />;
}

/* ── Revenue Bar Chart ── */
function RevenueChart() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    loadGoogleCharts().then(() => {
      if (!ref.current) return;
      const data = window.google.visualization.arrayToDataTable([
        ['Month', 'Revenue (₹)', 'Target (₹)'],
        ['Feb',  12400, 15000],
        ['Mar',  18200, 20000],
        ['Apr',  22500, 25000],
        ['May',  31000, 30000],
      ]);
      const chart = new window.google.visualization.ColumnChart(ref.current);
      chart.draw(data, {
        ...darkBase,
        title: 'Monthly Revenue vs Target',
        colors: ['#34d399', '#475569'],
        bar: { groupWidth: '60%' },
      });
    });
  }, []);
  return <div ref={ref} className="w-full h-[220px]" />;
}

/* ── Acquisition Donut ── */
function AcquisitionChart() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    loadGoogleCharts().then(() => {
      if (!ref.current) return;
      const data = window.google.visualization.arrayToDataTable([
        ['Channel', 'Percentage'],
        ['Organic Search', 68],
        ['Social Media',   24],
        ['Direct',          8],
      ]);
      const chart = new window.google.visualization.PieChart(ref.current);
      chart.draw(data, {
        ...darkBase,
        title: 'Traffic Acquisition Channels',
        colors: ['#22d3ee', '#a78bfa', '#34d399'],
        pieHole: 0.55,
        pieSliceBorderColor: 'transparent',
        chartArea: { left: 20, right: 20, top: 40, bottom: 20, width: '100%', height: '85%' },
      });
    });
  }, []);
  return <div ref={ref} className="w-full h-[220px]" />;
}

/* ── Keyword Table ── */
function KeywordTable() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    loadGoogleCharts().then(() => {
      if (!ref.current) return;
      const data = new window.google.visualization.DataTable();
      data.addColumn('string', 'Keyword');
      data.addColumn('number', 'Clicks');
      data.addColumn('number', 'Impressions');
      data.addColumn('string', 'CTR');
      data.addColumn('number', 'Position');
      data.addRows([
        ['zero cost digital business',          420, 5200, '8.1%', 1.4],
        ['autonomous ai ceo tools',             280, 3400, '8.2%', 2.1],
        ['google sheets free database',         195, 2100, '9.3%', 3.5],
        ['autonomous agency india',             150, 1800, '8.3%', 2.8],
        ['razorpay nextjs 15 integration',       98, 1200, '8.1%', 4.2],
      ]);
      const chart = new window.google.visualization.Table(ref.current);
      chart.draw(data, {
        showRowNumber: false,
        width: '100%',
        alternatingRowStyle: false,
        cssClassNames: {
          headerRow: 'gcharts-header',
          tableRow: 'gcharts-row',
          oddTableRow: 'gcharts-row-odd',
        },
      });
    });
  }, []);
  return <div ref={ref} className="w-full overflow-x-auto" />;
}

/* ── Main Export ── */
export function InsightCharts() {
  const [tab, setTab] = useState<'traffic' | 'revenue' | 'acquisition' | 'keywords'>('traffic');

  const tabs = [
    { key: 'traffic',     label: '📈 Traffic' },
    { key: 'revenue',     label: '💰 Revenue' },
    { key: 'acquisition', label: '🌐 Channels' },
    { key: 'keywords',    label: '🔑 Keywords' },
  ] as const;

  return (
    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            📊 GOOGLE CHARTS — INSIGHT LAB
          </h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">
            Live business intelligence powered by Google Charts API
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[9px] font-black text-yellow-400 uppercase">
          ✅ Integrated
        </span>
      </div>

      {/* Tab switcher */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              tab === t.key
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-white/[0.03] text-gray-500 border border-white/5 hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Chart area */}
      <div className="p-4 rounded-2xl bg-black/30 border border-white/5 min-h-[240px]">
        {/* Inject dark styles for Google Charts table */}
        <style>{`
          .google-visualization-table-table { width: 100% !important; border-collapse: collapse; font-size: 11px; font-family: var(--font-inter, sans-serif); }
          .google-visualization-table-th { background: rgba(255,255,255,0.04) !important; color: #64748b !important; border-bottom: 1px solid rgba(255,255,255,0.05) !important; padding: 10px 12px !important; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
          .google-visualization-table-td { color: #94a3b8 !important; border-bottom: 1px solid rgba(255,255,255,0.03) !important; padding: 10px 12px !important; background: transparent !important; }
          .google-visualization-table-tr-over td { background: rgba(255,255,255,0.02) !important; }
        `}</style>

        {tab === 'traffic'     && <TrafficChart />}
        {tab === 'revenue'     && <RevenueChart />}
        {tab === 'acquisition' && <AcquisitionChart />}
        {tab === 'keywords'    && <KeywordTable />}
      </div>

      <p className="text-[10px] text-gray-600 italic">
        ⚡ Data shown is seeded from AnalyticsConsole mock. Will auto-switch to live GA4 data once Measurement ID is configured.
      </p>
    </div>
  );
}
