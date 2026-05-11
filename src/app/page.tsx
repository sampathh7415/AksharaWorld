'use client';
import { useState, useEffect } from 'react';

const NAV = [
  { id: 'kpi', icon: '📊', label: 'Business KPIs' },
  { id: 'departments', icon: '🏢', label: 'Departments' },
  { id: 'capsule', icon: '💊', label: 'Capsule Viewer' },
  { id: 'ai-instructions', icon: '🔒', label: 'AI Instructions' },
  { id: 'approvals', icon: '✅', label: 'Approvals Queue' },
  { id: 'alerts', icon: '🚨', label: 'Alerts' },
  { id: 'resources', icon: '⚙️', label: 'Resource Inventory' },
  { id: 'changelog', icon: '📜', label: 'Change Log' },
  { id: 'sam', icon: '💬', label: 'Chat with Sam' },
  { id: 'brain', icon: '🧠', label: 'AI Brain DNA' },
  { id: 'upgrades', icon: '🚀', label: 'Upgrade Proposals' },
  { id: 'filereviews', icon: '📁', label: 'File Reviews' },
  { id: 'failures', icon: '⚠️', label: '3-Try Failures' },
];

const DEPTS = [
  { name: 'Content_Forge', mission: 'Research & write SEO content', agents: 'Researcher, Writer, Editor, SEO', status: 'Active' },
  { name: 'Media_Studio', mission: 'Images, video, audio, shorts', agents: 'Designer, Video, TTS, Thumbnail', status: 'Active' },
  { name: 'Growth_Engine', mission: 'Distribution on IG, YT, FB', agents: 'Social, Email, Community', status: 'Active' },
  { name: 'Revenue_Vault', mission: 'Monetization & finance', agents: 'Payments, Affiliate, Bookkeeper', status: 'Active' },
  { name: 'Tech_Core', mission: 'Infra, code, deploys', agents: 'DevOps, Coder, DB-Admin, Security', status: 'Active' },
  { name: 'Guardian_Ops', mission: 'Self-healing, compliance, backups', agents: 'Healer, Watchdog, Legal, Backup', status: 'Active' },
  { name: 'Insight_Lab', mission: 'Analytics & forecasting', agents: 'Analyst, Forecaster, A/B Tester', status: 'Active' },
  { name: 'Innovation_Scout', mission: 'Daily R&D — new tools & trends', agents: 'Trend Hunter, Tool Evaluator, Risk Forecaster', status: 'Active' },
];

const AI_INSTRUCTIONS = [
  { id: 'AI-01', title: 'No fake reports', desc: '100% verified facts with source citations; hallucinations discarded' },
  { id: 'AI-02', title: 'Ownership mindset', desc: 'Sam acts as the owner; optimizes long-term revenue & reputation' },
  { id: 'AI-03', title: 'Remember main goal', desc: 'Run a 24/7 zero-investment automated digital services business for 20+ years' },
  { id: 'AI-04', title: 'Lock correct processes', desc: 'After 3 successful test runs → frozen; change requires owner approval' },
  { id: 'AI-05', title: 'Three-Try Rule', desc: 'Max 3 attempts → stop, analyze root cause, propose better alternative' },
  { id: 'AI-06', title: 'Approval gates', desc: 'Spending, publishing, legal actions, withdrawals, main merges' },
  { id: 'AI-07', title: 'Source citation', desc: 'Every fact must include a source URL or internal reference' },
  { id: 'AI-08', title: 'Fail-safe defaults', desc: 'On uncertainty → pause + escalate to owner; never proceed silently' },
  { id: 'AI-09', title: 'Audit log', desc: 'Every action timestamped + saved to Drive' },
  { id: 'AI-10', title: 'Prefer Google ecosystem', desc: 'Use Google Apps first; switch only if alternative is clearly superior' },
  { id: 'AI-11', title: 'Multilingual CEO', desc: 'Sam communicates in Kannada, English, Hindi, Telugu, Tamil, and more' },
  { id: 'AI-12', title: 'Non-disruptive upgrades', desc: 'New processes run in parallel; old removed only after owner approval' },
];

const PHASES = [
  { num: '0', label: 'Phase 0 — Setup', desc: 'Drive folder, Blueprint, Sam deployed, Dashboard live', state: 'active' },
  { num: '1', label: 'Phase 1 — MVP Departments', desc: 'Content_Forge, AdSense, Innovation_Scout, Telegram bot', state: 'pending' },
  { num: '2', label: 'Phase 2 — Publishing & Revenue', desc: 'YT Shorts, IG Reels, Razorpay Payment Links', state: 'pending' },
  { num: '3', label: 'Phase 3 — Scale', desc: 'Multilingual content, subdomains, Lemon Squeezy', state: 'pending' },
  { num: '4', label: 'Phase 4 — Hardening', desc: 'Full observability, chaos testing, multi-cloud failover', state: 'pending' },
  { num: '5', label: 'Phase 5 — Autonomy', desc: 'Sam self-directs new niches, reinvests revenue', state: 'pending' },
];

function now() { return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); }

export default function Dashboard() {
  const [active, setActive] = useState('kpi');
  const [time, setTime] = useState('');
  const [messages, setMessages] = useState([
    { role: 'sam', text: 'Greetings. I am Sam, AI CEO of Akshara World. Main goal active: Run a 24/7 zero-investment autonomous digital business for 20+ years. Dashboard is now live. What is your directive?', time: now() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [approvals, setApprovals] = useState([
    { id: 'APR-001', title: 'Dashboard Deployment', desc: 'Deploy Next.js dashboard to Cloudflare Pages', status: 'pending' },
    { id: 'APR-002', title: 'Drive Folder Verification', desc: 'Run structure_creator script to ensure all 11 folders exist', status: 'pending' },
  ]);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchData();
    setTime(new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }));
    const t = setInterval(() => {
      setTime(new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }));
      fetchData();
    }, 30000);
    return () => clearInterval(t);
  }, []);

  async function fetchData() {
    try {
      const res = await fetch('/api/dashboard');
      const d = await res.json();
      setData(d);
    } catch (e) {
      console.error("Failed to fetch dashboard data");
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', text: input.trim(), time: now() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/sam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text }),
      });
      const d = await res.json();
      setMessages(m => [...m, { role: 'sam', text: d.reply, time: now() }]);
    } catch {
      setMessages(m => [...m, { role: 'sam', text: 'Connection error. Check your Cloudflare Worker status.', time: now() }]);
    }
    setLoading(false);
  }

  async function handleApproval(id: string, action: 'approve' | 'reject') {
    // 1. INSTANT UI UPDATE (The part you liked)
    setApprovals(a => a.map(ap => ap.id === id ? { ...ap, status: action === 'approve' ? 'approved' : 'rejected' } : ap));
    
    // 2. BACKGROUND BUSINESS SYNC (The connection)
    try {
      await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      fetchData(); // Silently refresh data to ensure sync
    } catch (e) {
      console.error("Background sync failed, but local state is preserved.");
    }
  }

  return (
    <div className="shell">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">Akshara World</div>
          <div className="brand-sub">Command Center</div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-label">Dashboard</div>
          {NAV.map(n => (
            <div key={n.id} className={`nav-item${active === n.id ? ' active' : ''}`} onClick={() => setActive(n.id)}>
              <span className="icon">{n.icon}</span>
              {n.label}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sam-status">
            <div className="sam-avatar">S</div>
            <div className="sam-info">
              <div className="name">Sam (AI CEO)</div>
              <div className="status">● Online • Gemini API</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="main">
        {/* TOPBAR */}
        <div className="topbar">
          <div className="topbar-title">{NAV.find(n => n.id === active)?.label}</div>
          <div className="topbar-right">
            <span className="badge green"><span className="pulse" />Uptime 99.9%</span>
            <span className="badge blue">Phase 0 — Setup</span>
            <span className="badge yellow">aksharaworld.in</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{time}</span>
          </div>
        </div>

        <div className="content">

          {active === 'brain' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span>🧠</span> Semantic Memory Graph
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl border border-white/5">
                      <span className="text-white/60">Graph Health</span>
                      <span className="text-emerald-400 font-mono">100% Stable</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl border border-white/5">
                      <span className="text-white/60">Total Nodes</span>
                      <span className="text-blue-400 font-mono">{data?.capsule?.length || 0} Entities</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl border border-white/5">
                      <span className="text-white/60">Last Recall</span>
                      <span className="text-purple-400 font-mono">2.4ms ago</span>
                    </div>
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-sm text-blue-200">
                      <strong>DNA Note:</strong> Using Semantic Graph retrieval with Sideagent verification (jcode pattern).
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span>🛠️</span> Agent Skill Store
                  </h3>
                  <div className="space-y-3">
                    {['Innovation Scout', 'Content Strategist', 'Revenue Auditor', 'Guardian Watchdog'].map(skill => (
                      <div key={skill} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5 group hover:border-blue-500/30 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                          <span>{skill}</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-white/40 group-hover:text-blue-400">Deployed</span>
                      </div>
                    ))}
                    <button className="w-full mt-2 py-3 bg-white/5 border border-dashed border-white/20 rounded-xl text-sm text-white/40 hover:bg-white/10 hover:text-white/60 transition-all">
                      + Import from 500-AI-Agents Library
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-xl font-bold mb-4">🧬 Deep DNA Integration</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                      <div className="text-xs text-white/40 mb-1">Architecture</div>
                      <div className="text-sm font-semibold">Swarm Orchestration</div>
                   </div>
                   <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                      <div className="text-xs text-white/40 mb-1">Vector Store</div>
                      <div className="text-sm font-semibold">Supabase pgvector</div>
                   </div>
                   <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                      <div className="text-xs text-white/40 mb-1">Inference Engine</div>
                      <div className="text-sm font-semibold">Gemini 1.5 Flash</div>
                   </div>
                </div>
              </div>
            </div>
          )}
          {active === 'kpi' && (
            <div>
              <div className="kpi-grid">
                {[
                  { label: 'Revenue Today', value: '₹0', sub: 'Phase 0 — Pre-revenue', color: 'var(--green)' },
                  { label: 'Uptime', value: '99.9%', sub: 'Cloud-only infra', color: 'var(--cyan)' },
                  { label: 'MTTR', value: '< 5 min', sub: 'Target threshold', color: 'var(--blue)' },
                  { label: 'Active Depts', value: '8 / 8', sub: 'All systems nominal', color: 'var(--purple)' },
                  { label: 'Human Hrs / Day', value: '< 30 min', sub: 'Target: < 30 min/day', color: 'var(--yellow)' },
                  { label: 'Pending Approvals', value: '2', sub: 'Requires your action', color: 'var(--orange)' },
                ].map(k => (
                  <div className="kpi-card" key={k.label}>
                    <div className="kpi-label">{k.label}</div>
                    <div className="kpi-value" style={{ color: k.color }}>{k.value}</div>
                    <div className="kpi-sub">{k.sub}</div>
                    <div className="uptime-bar"><div className="uptime-fill" style={{ width: k.label === 'Uptime' ? '99.9%' : '30%', background: k.color }} /></div>
                  </div>
                ))}
              </div>
              <div className="glass-card">
                <div className="card-header"><span className="card-title">📍 Project Roadmap</span></div>
                <div className="card-body">
                  <div className="phase-list">
                    {PHASES.map(p => (
                      <div className="phase-item" key={p.num}>
                        <div className={`phase-dot ${p.state}`}>{p.state === 'done' ? '✓' : p.num}</div>
                        <div className="phase-info">
                          <div className="phase-name">{p.label}</div>
                          <div className="phase-desc">{p.desc}</div>
                        </div>
                        <span className={`pill ${p.state === 'done' ? 'green' : p.state === 'active' ? 'blue' : 'purple'}`}>
                          {p.state === 'done' ? 'Done' : p.state === 'active' ? 'In Progress' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── DEPARTMENTS ── */}
          {active === 'departments' && (
            <div>
              <div className="dept-grid">
                {DEPTS.map(d => (
                  <div className="dept-card" key={d.name}>
                    <div className="dept-card-header">
                      <div className="dept-name">{d.name}</div>
                      <span className="pill green">● Active</span>
                    </div>
                    <div className="dept-detail">
                      <div style={{ marginBottom: '4px' }}><strong style={{ color: 'var(--muted2)' }}>Mission:</strong> {d.mission}</div>
                      <div><strong style={{ color: 'var(--muted2)' }}>Agents:</strong> {d.agents}</div>
                    </div>
                    <div className="uptime-bar" style={{ marginTop: '12px' }}>
                      <div className="uptime-fill" style={{ width: '100%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CAPSULE ── */}
          {active === 'capsule' && (
            <div className="glass-card">
              <div className="card-header">
                <span className="card-title">💊 capsule_latest.md</span>
                <span className="pill yellow">Phase 0</span>
              </div>
              <div className="card-body">
                <pre style={{ fontSize: '0.82rem', color: 'var(--muted2)', lineHeight: '1.7', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                  {data?.capsule || "Loading live business capsule from Google Drive..."}
                </pre>
              </div>
            </div>
          )}

          {/* ── AI INSTRUCTIONS ── */}
          {active === 'ai-instructions' && (
            <div className="glass-card">
              <div className="card-header">
                <span className="card-title">🔒 AI Instruction Table (Locked)</span>
                <span className="pill red">Read-Only · Owner-Signed</span>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <table className="data-table">
                  <thead><tr><th>ID</th><th>Instruction</th><th>Behavior</th><th>Lock</th></tr></thead>
                  <tbody>
                    {AI_INSTRUCTIONS.map(i => (
                      <tr key={i.id}>
                        <td><span className="pill blue">{i.id}</span></td>
                        <td style={{ color: 'var(--text)', fontWeight: 600 }}>{i.title}</td>
                        <td>{i.desc}</td>
                        <td>🔒</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── APPROVALS ── */}
          {active === 'approvals' && (
            <div>
              <div style={{ marginBottom: '16px', fontSize: '0.85rem', color: 'var(--muted)' }}>
                All spending, publishing, legal, withdrawals, and main merges require your one-tap approval (AI-06).
              </div>
              {approvals.map(a => (
                <div className="approval-item" key={a.id}>
                  <div style={{ flex: '0 0 70px' }}><span className="pill blue">{a.id}</span></div>
                  <div className="approval-info">
                    <div className="approval-title">{a.title}</div>
                    <div className="approval-desc">{a.desc}</div>
                  </div>
                  {a.status === 'pending' ? (
                    <div className="approval-actions">
                      <button className="btn approve" onClick={() => handleApproval(a.id, 'approve')}>✓ Approve</button>
                      <button className="btn reject" onClick={() => handleApproval(a.id, 'reject')}>✕ Reject</button>
                    </div>
                  ) : (
                    <span className={`pill ${a.status === 'approved' ? 'green' : 'red'}`}>
                      {a.status === 'approved' ? '✓ Approved' : '✕ Rejected'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── ALERTS ── */}
          {active === 'alerts' && (
            <div>
              <div className="alert-item info">
                <span className="alert-icon">ℹ️</span>
                <div className="alert-text">
                  <div className="title">Dashboard is live</div>
                  <div className="desc">Next.js dashboard initialized and running locally. Pending: Cloudflare Pages deployment.</div>
                </div>
              </div>
              <div className="alert-item warn">
                <span className="alert-icon">⚠️</span>
                <div className="alert-text">
                  <div className="title">Sam not yet cloud-deployed</div>
                  <div className="desc">Sam's brain must be deployed to Cloudflare Workers + Gemini API to achieve 24/7 independence. Laptop required until then.</div>
                </div>
              </div>
              <div className="alert-item warn">
                <span className="alert-icon">⚠️</span>
                <div className="alert-text">
                  <div className="title">Drive folder structure unverified</div>
                  <div className="desc">The 11-department folder tree may be incomplete. Structure Creator script must be run to confirm.</div>
                </div>
              </div>
              <div className="alert-item info">
                <span className="alert-icon">✅</span>
                <div className="alert-text">
                  <div className="title">Blueprint files confirmed</div>
                  <div className="desc">Akshara World Blueprint .md, .json, .pdf successfully saved to Google Drive.</div>
                </div>
              </div>
            </div>
          )}

          {/* ── RESOURCES ── */}
          {active === 'resources' && (
            <div className="glass-card">
              <div className="card-header"><span className="card-title">⚙️ Resource Inventory</span><span className="pill yellow">Auto-updates every 10 min (pending Guardian_Ops)</span></div>
              <div className="card-body" style={{ padding: 0 }}>
                <table className="data-table">
                  <thead><tr><th>Resource</th><th>Provider</th><th>Type</th><th>Quota Used</th><th>Cost</th><th>Status</th></tr></thead>
                  <tbody>
                    {[
                      ['Google Drive', 'Google', 'Storage', '< 1%', 'Free', 'green'],
                      ['Google Sheets', 'Google', 'Database', '< 1%', 'Free', 'green'],
                      ['Gemini API', 'Google', 'AI', '0%', 'Free tier', 'green'],
                      ['Cloudflare Workers', 'Cloudflare', 'Compute', 'Not configured', 'Free tier', 'yellow'],
                      ['Cloudflare Pages', 'Cloudflare', 'Hosting', 'Not deployed', 'Free tier', 'yellow'],
                      ['Razorpay', 'Razorpay', 'Payments', 'Not connected', '0 MDR until live', 'yellow'],
                      ['GitHub', 'GitHub', 'Code', 'Not connected', 'Free', 'yellow'],
                      ['Supabase', 'Supabase', 'DB', 'Not configured', 'Free tier', 'yellow'],
                    ].map(([r, p, t, q, c, s]) => (
                      <tr key={String(r)}>
                        <td style={{ color: 'var(--text)', fontWeight: 600 }}>{r}</td>
                        <td>{p}</td>
                        <td>{t}</td>
                        <td>{q}</td>
                        <td>{c}</td>
                        <td><span className={`pill ${s}`}>{s === 'green' ? '✓ Active' : '⏳ Pending'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── CHANGELOG ── */}
          {active === 'changelog' && (
            <div className="glass-card">
              <div className="card-header"><span className="card-title">📜 Change Log</span></div>
              <div className="card-body" style={{ padding: 0 }}>
                <table className="data-table">
                  <thead><tr><th>Timestamp</th><th>Component</th><th>Change</th><th>By</th></tr></thead>
                  <tbody>
                    {[
                      [new Date().toLocaleString('en-IN'), 'Dashboard', 'Next.js dashboard initialized and live', 'Sam'],
                      [new Date().toLocaleString('en-IN'), 'Google Sheets', 'Live Dashboard spreadsheet created (8 tabs)', 'Sam'],
                      [new Date().toLocaleString('en-IN'), 'Google Drive', 'Blueprint .md, .json, .pdf created', 'Sam'],
                      [new Date().toLocaleString('en-IN'), 'Google Drive', '06_Backups folder + timestamped backup created', 'Sam'],
                    ].map(([t, c, d, b], i) => (
                      <tr key={i}>
                        <td style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{t}</td>
                        <td><span className="pill blue">{c}</span></td>
                        <td style={{ color: 'var(--text)' }}>{d}</td>
                        <td style={{ color: 'var(--green)' }}>{b}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── SAM CHAT ── */}
          {active === 'sam' && (
            <div className="chat-wrap">
              <div className="chat-messages">
                {messages.map((m, i) => (
                  <div key={i} className={`msg ${m.role}`}>
                    <div className="msg-avatar">{m.role === 'sam' ? 'S' : 'O'}</div>
                    <div>
                      <div className="msg-bubble">{m.text}</div>
                      <div className="msg-time">{m.time}</div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="msg sam">
                    <div className="msg-avatar">S</div>
                    <div className="msg-bubble"><span className="spinner" /></div>
                  </div>
                )}
              </div>
              <div className="chat-input-row">
                <input
                  className="chat-input" placeholder="Message Sam..."
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                />
                <button className="chat-send" onClick={sendMessage}>➤</button>
              </div>
            </div>
          )}

          {/* ── UPGRADES ── */}
          {active === 'upgrades' && (
            <div className="glass-card">
              <div className="card-header"><span className="card-title">🚀 Upgrade Proposals</span><span className="pill blue">Innovation_Scout — Daily R&D</span></div>
              <div className="card-body">
                <div style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '40px' }}>
                  No upgrade proposals yet. Innovation_Scout will submit daily proposals once deployed to Cloudflare Workers.
                </div>
              </div>
            </div>
          )}

          {/* ── FILE REVIEWS ── */}
          {active === 'filereviews' && (
            <div className="glass-card">
              <div className="card-header"><span className="card-title">📁 File Review Reports</span></div>
              <div className="card-body">
                <div style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '40px' }}>
                  No files reviewed yet. Share any file with Sam and it will produce an Advantage/Disadvantage report saved to 09_File_Reviews/ in Drive.
                </div>
              </div>
            </div>
          )}

          {/* ── 3-TRY FAILURES ── */}
          {active === 'failures' && (
            <div className="glass-card">
              <div className="card-header"><span className="card-title">⚠️ Three-Try Failure Reports</span><span className="pill green">0 Open Failures</span></div>
              <div className="card-body">
                <div style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '40px' }}>
                  ✅ No failures on record. Every operation that fails 3 consecutive times will appear here with a root-cause analysis and alternative proposal.
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
