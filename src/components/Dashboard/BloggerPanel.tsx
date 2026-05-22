'use client';

import { useState, useEffect } from 'react';

interface BlogPost {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
  status: 'published' | 'draft' | 'scheduled';
  views?: number;
  comments?: number;
}

interface BlogData {
  blogId: string;
  blogName: string;
  blogUrl: string;
  totalPosts: number;
  posts: BlogPost[];
  connected: boolean;
}

const MOCK_DATA: BlogData = {
  blogId:     '4758144517261750879',
  blogName:   'AksharaWorld Blog',
  blogUrl:    'https://aksharaworld.blogspot.com',
  totalPosts: 0,
  connected:  false,
  posts: [],
};

export function BloggerPanel() {
  const [data, setData]       = useState<BlogData>(MOCK_DATA);
  const [newTitle, setNewTitle] = useState('');
  const [posting, setPosting]   = useState(false);
  const [postMsg, setPostMsg]   = useState('');

  useEffect(() => {
    fetch('/api/blogger').then(r => r.json()).then(d => {
      if (d.success && d.data) setData(d.data);
    }).catch(() => {});
  }, []);

  const createPost = async () => {
    if (!newTitle) return;
    setPosting(true);
    try {
      const res = await fetch('/api/blogger', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ title: newTitle, action: 'create' }),
      });
      const d = await res.json();
      if (d.success) {
        setPostMsg('✅ Post created! Check Blogger dashboard.');
        setNewTitle('');
      } else {
        setPostMsg(`❌ ${d.message}`);
      }
    } finally { setPosting(false); }
  };

  return (
    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            📝 BLOGGER — AUTO-PUBLISHER
          </h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">
            Blog ID: {data.blogId} — {data.blogName}
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="https://www.blogger.com/blog/posts/4758144517261750879"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-black uppercase hover:bg-orange-500/20 transition-all"
          >
            Open Blogger ↗
          </a>
          <a
            href="https://www.blogger.com/blog/post/create/4758144517261750879"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-bold uppercase hover:text-white transition-all"
          >
            + New Post
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Posts',  value: data.totalPosts, icon: '📄' },
          { label: 'Published',    value: data.posts.filter(p => p.status === 'published').length, icon: '✅' },
          { label: 'Drafts',       value: data.posts.filter(p => p.status === 'draft').length, icon: '📋' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl bg-black/30 border border-white/5 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>{s.value}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{s.label}</div>
          </div>
        ))}
      </div>

      {/* AI Post Generator */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-900/20 to-red-900/10 border border-orange-500/10 space-y-3">
        <div className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">🤖 AI Auto-Publish to Blogger</div>
        <div className="flex gap-3">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Enter blog post topic (AI writes + publishes automatically)"
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-orange-500/40"
          />
          <button
            onClick={createPost}
            disabled={posting || !newTitle}
            className="px-5 py-3 rounded-xl bg-orange-600 text-white text-xs font-black uppercase hover:bg-orange-500 transition-all disabled:opacity-40 whitespace-nowrap"
          >
            {posting ? '⏳ Publishing...' : '🚀 Publish'}
          </button>
        </div>
        {postMsg && (
          <p className={`text-xs font-bold ${postMsg.startsWith('✅') ? 'text-emerald-400' : 'text-red-400'}`}>
            {postMsg}
          </p>
        )}
      </div>

      {/* Recent posts or empty state */}
      {data.posts.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-sm font-bold">No posts yet</p>
          <p className="text-xs text-gray-700 mt-1">Create your first post above or via Blogger dashboard</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.posts.map(post => (
            <div key={post.id} className="p-4 rounded-xl bg-black/30 border border-white/5 flex justify-between items-center">
              <div>
                <div className="text-sm font-bold text-white">{post.title}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{new Date(post.publishedAt).toLocaleDateString('en-IN')}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${
                  post.status === 'published'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                }`}>{post.status}</span>
                <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs hover:underline">View ↗</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
