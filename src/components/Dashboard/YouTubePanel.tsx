'use client';

import { useState, useEffect } from 'react';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  duration: string;
  url: string;
}

interface ChannelData {
  channelId: string;
  handle: string;
  name: string;
  subscribers: number;
  totalViews: number;
  videoCount: number;
  videos: Video[];
  connected: boolean;
}

const MOCK_DATA: ChannelData = {
  channelId:    'UCxxx',   // Will be fetched live via YouTube Data API
  handle:       '@AksharaAI',
  name:         'Akshara World',
  subscribers:  0,
  totalViews:   0,
  videoCount:   0,
  videos:       [],
  connected:    false,
};

export function YouTubePanel() {
  const [data, setData] = useState<ChannelData>(MOCK_DATA);
  const [tab, setTab]   = useState<'videos' | 'stats'>('videos');

  useEffect(() => {
    fetch('/api/youtube').then(r => r.json()).then(d => {
      if (d.success && d.data) setData(d.data);
    }).catch(() => {});
  }, []);

  return (
    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-2xl font-black text-white">
            ▶
          </div>
          <div>
            <h2 className="text-xl font-black text-white">{data.name}</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              {data.handle} — YouTube Channel
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
            data.connected
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
          }`}>
            {data.connected ? '✅ Live' : '⏳ Add API Key for live data'}
          </span>
          <a
            href="https://youtube.com/@AksharaAI"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-red-600/20 border border-red-600/30 text-red-400 text-xs font-black uppercase hover:bg-red-600/30 transition-all"
          >
            Open Channel ↗
          </a>
          <a
            href="https://studio.youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-bold uppercase hover:text-white transition-all"
          >
            Studio ↗
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Subscribers', value: data.subscribers.toLocaleString(), icon: '👥', color: 'text-red-400' },
          { label: 'Total Views',  value: data.totalViews.toLocaleString(), icon: '👁️', color: 'text-purple-400' },
          { label: 'Videos',       value: data.videoCount, icon: '🎬', color: 'text-blue-400' },
          { label: 'Channel',      value: data.handle, icon: '📺', color: 'text-yellow-400' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl bg-black/30 border border-white/5 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className={`text-xl font-black ${s.color} truncate`} style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>{s.value}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Videos list or empty state */}
      {data.videos.length === 0 ? (
        <div className="text-center py-10 space-y-3">
          <div className="text-5xl">🎬</div>
          <p className="text-gray-500 font-bold text-sm">No videos yet</p>
          <p className="text-gray-600 text-xs">Add YOUTUBE_API_KEY to env to load live channel data</p>
          <a
            href="https://studio.youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 rounded-xl bg-red-600/20 border border-red-600/30 text-red-400 text-xs font-black uppercase hover:bg-red-600/30 transition-all mt-2"
          >
            📹 Upload First Video → YouTube Studio ↗
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.videos.map(v => (
            <a
              key={v.id}
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-black/30 border border-white/5 hover:border-red-500/20 transition-all group"
            >
              <div className="flex gap-3">
                {v.thumbnail && (
                  <img src={v.thumbnail} alt={v.title} className="w-24 h-14 rounded-xl object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white line-clamp-2 group-hover:text-red-300 transition-colors">{v.title}</p>
                  <div className="flex gap-3 mt-2 text-[10px] text-gray-500">
                    <span>👁️ {v.views.toLocaleString()}</span>
                    <span>👍 {v.likes.toLocaleString()}</span>
                    <span>💬 {v.comments.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* YouTube Setup Guide */}
      <div className="p-5 rounded-2xl bg-black/30 border border-white/5">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Content Strategy</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {[
            { icon: '📹', title: 'AI Business Tutorials', desc: 'Zero-cost automation walkthroughs' },
            { icon: '💡', title: 'Product Demos', desc: 'AI Blueprint showcase videos' },
            { icon: '📊', title: 'Revenue Reports', desc: 'Monthly transparent P&L videos' },
          ].map(c => (
            <div key={c.title} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-lg mb-1">{c.icon}</div>
              <div className="font-bold text-white text-[11px]">{c.title}</div>
              <div className="text-gray-500 text-[10px] mt-0.5">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
