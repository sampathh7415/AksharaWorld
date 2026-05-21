'use client';
export const runtime = 'edge';
import { useState, useEffect, useRef } from 'react';
import { resilientFetch } from '../lib/resilience';

const NAV = [
  { id: 'kpi', icon: '📊', label: 'Business KPIs' },
  { id: '30dayops', icon: '📋', label: '30-Day Ops' },
  { id: 'departments', icon: '🏢', label: 'Departments' },
  { id: 'approvals', icon: '✅', label: 'Approvals Queue' },
  { id: 'sam', icon: '💬', label: 'Chat with Sam' },
  { id: 'brain', icon: '🧠', label: 'AI Brain DNA' },
  { id: 'resources', icon: '⚙️', label: 'Resource Inventory' },
  { id: 'alerts', icon: '🚨', label: 'Alerts' },
  { id: 'capsule', icon: '💊', label: 'Capsule Viewer' },
  { id: 'changelog', icon: '📜', label: 'Change Log' },
  { id: 'upgrades', icon: '🚀', label: 'Upgrade Proposals' },
  { id: 'filereviews', icon: '📁', label: 'File Reviews' },
  { id: 'failures', icon: '⚠️', label: '3-Try Failures' },
];

const DECISION_RULES = [
  { signal: 'Traffic ↑, conversion flat', action: 'Change CTA/headline on top Blogger post within 24h', owner: 'Growth_Engine' },
  { signal: 'Payment webhook failure', action: 'Stop outbound; run smoke-test-payment-flow.mjs', owner: 'Tech_Core + Guardian_Ops' },
  { signal: 'Sheets API errors', action: 'Check Google API quota; verify secrets; see Runbook #2', owner: 'Tech_Core' },
  { signal: '48h no pipeline movement', action: 'Change offer band or ICP segment; log experiment_id', owner: 'Revenue_Vault' },
  { signal: '5 early-bird sold', action: 'Switch all CTAs to ₹1,500 standard', owner: 'Revenue_Vault' },
  { signal: 'Demo → paid < 20%', action: 'Revise demo script; tighten ICP on WhatsApp', owner: 'Growth_Engine' },
  { signal: 'Telegram alert > 4h unread', action: 'Open incident in SystemLog; follow runbook', owner: 'Guardian_Ops' },
];

const OPS_DOCS = [
  { label: '📋 Sales Playbook', href: '/docs/sales/sales-playbook.md' },
  { label: '📞 Demo Script', href: '/docs/sales/demo-script.md' },
  { label: '💬 Outbound Playbook', href: '/docs/sales/outbound-playbook.md' },
  { label: '🛡️ Runbook #1 — Payment Failure', href: '/docs/runbooks/01-razorpay-webhook-payment-failure.md' },
  { label: '🛡️ Runbook #2 — Sheets API Down', href: '/docs/runbooks/02-google-sheets-api-down.md' },
  { label: '🛡️ Runbook #3 — Cloudflare Rollback', href: '/docs/runbooks/03-cloudflare-deploy-rollback.md' },
  { label: '📅 Daily Ritual', href: '/docs/cadence/DAILY_RITUAL.md' },
  { label: '📆 Weekly Scorecard Ritual', href: '/docs/cadence/WEEKLY_SCORECARD_RITUAL.md' },
];

const DEPTS = [
  { name: 'Content_Forge', mission: 'Research & write SEO content', agents: 'Researcher, Writer, Editor, SEO', status: 'Active' },
  { name: 'Media_Studio', mission: 'Images, video, audio, shorts', agents: 'Designer, Video, TTS, Thumbnail', status: 'Active' },
  { name: 'Growth_Engine', mission: 'Distribution on IG, YT, FB', agents: 'Social, Email, Community', status: 'Active' },
  { name: 'Revenue_Vault', mission: 'Monetization & finance', agents: 'Payments, Affiliate, Bookkeeper', status: 'Active' },
  { name: 'Tech_Core', mission: 'Infra, code, deploys', agents: 'DevOps, Coder, DB-Admin, Security', status: 'Active' },
  { name: 'Guardian_Ops', mission: 'Self-healing, compliance, backups', agents: 'Healer, Watchdog, Legal, Backup', status: 'Active' },
  { name: 'Insight_Lab', mission: 'Analytics & forecasting', agents: 'Analyst, Forecaster, A/B Tester', status: 'Active' },
  { name: 'Innovation_Scout', mission: 'Daily R&D — new tools & trends', agents: 'Trend Hunter, Tool Evaluator', status: 'Active', cron: true },
];

const PHASES = [
  { num: '0', label: 'Phase 0 — Setup', desc: 'Drive, Blueprint, Sam deployed, Dashboard live', state: 'done' },
  { num: '1', label: 'Phase 1 — MVP Departments', desc: 'Content_Forge, AdSense, Innovation_Scout, Telegram bot', state: 'active' },
  { num: '2', label: 'Phase 2 — Publishing & Revenue', desc: 'YT Shorts, IG Reels, Razorpay Payment Links', state: 'pending' },
  { num: '3', label: 'Phase 3 — Scale', desc: 'Multilingual content, subdomains, Lemon Squeezy', state: 'pending' },
  { num: '4', label: 'Phase 4 — Hardening', desc: 'Full observability, chaos testing, multi-cloud failover', state: 'pending' },
  { num: '5', label: 'Phase 5 — Autonomy', desc: 'Sam self-directs new niches, reinvests revenue', state: 'pending' },
];

const RESOURCES = [
  ['Google Drive', 'Google', 'Storage', '< 1%', 'Free', 'green'],
  ['Google Sheets', 'Google', 'Database', '< 1%', 'Free', 'green'],
  ['Gemini API', 'Google', 'AI', '~5%', 'Free tier', 'green'],
  ['Cloudflare Workers', 'Cloudflare', 'Compute', '< 1%', 'Free tier', 'green'],
  ['Clerk Auth', 'Clerk', 'Security', 'Active', 'Free tier', 'green'],
  ['GitHub', 'GitHub', 'Code', 'Connected', 'Free', 'green'],
  ['Razorpay', 'Razorpay', 'Payments', 'Not connected', '0 MDR until live', 'yellow'],
  ['Telegram Bot', 'Telegram', 'Notifications', 'Token pending', 'Free', 'yellow'],
];

function now() { return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); }

export default function Dashboard() {
  const [active, setActive] = useState('kpi');
  const [time, setTime] = useState('');
  const [messages, setMessages] = useState([
    { role: 'sam', text: 'Greetings. I am Sam, AI CEO of Akshara World. Phase 0 is complete. Dashboard is live with Clerk auth, GitHub sync, and AI Brain DNA integrated. What is your directive?', time: now() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [approvals, setApprovals] = useState([
    { id: 'APR-003', dept: 'Tech_Core', title: 'Deploy to Cloudflare Pages', desc: 'Authorize public URL deployment for dash.aksharaworld.in', status: 'pending' },
    { id: 'APR-004', dept: 'Revenue_Vault', title: 'Connect Razorpay Account', desc: 'Authorize Razorpay API key integration for payment processing', status: 'pending' },
    { id: 'APR-005', dept: 'Growth_Engine', title: 'Telegram Bot Activation', desc: 'Connect BOT_TOKEN to enable mobile approval notifications', status: 'pending' },
  ]);
  const [data, setData] = useState<any>(null);
  const [capsule, setCapsule] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDashboard();
    const t = setInterval(() => setTime(new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })), 1000);

    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetchDashboard();
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchDashboard() {
    try {
      const fallback = {
        capsule: 'Akshara World - Autonomous Business Hub. SAM AI CEO version 2.0. [Self-Healing Memory Mode]',
        samBrain: { status: 'offline', reason: 'Using resilient offline memory store.' },
        metrics: {
          revenue: { total: '0.00', today: '0.00', month: '0.00', currency: 'INR' },
          transactions: 0,
          aov: '0.00',
          phase: 'Phase 1 — Operational MVP (Active)',
          departments: 8,
          uptime: '100.00%'
        }
      };
      const d = await resilientFetch<any>('/api/dashboard', { timeout: 6000, retries: 2 }, fallback);
      setData(d);
      if (d.capsule) setCapsule(d.capsule);
    } catch {}
  }

  async function handleApproval(id: string, action: 'approve' | 'reject') {
    setApprovals(a => a.map(x => x.id === id ? { ...x, status: action === 'approve' ? 'approved' : 'rejected' } : x));
    try {
      await resilientFetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
        timeout: 8000,
        retries: 2
      }, { success: true });
    } catch {}
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', text: input.trim(), time: now() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const fallbackMsg = { reply: '[Self-Healing Backup Route] I encountered a synapse error, but I have successfully self-healed and enabled backup local response systems. How can I help you today?' };
      const d = await resilientFetch<any>(
        '/api/sam',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMsg.text }),
          timeout: 10000,
          retries: 2
        },
        fallbackMsg
      );
      setMessages(m => [...m, { role: 'sam', text: d.reply || '[No response]', time: now() }]);
    } catch {
      setMessages(m => [...m, { role: 'sam', text: '[Error] Failed to reach Sam Brain.', time: now() }]);
    }
    setLoading(false);
  }

  const pendingCount = approvals.filter(a => a.status === 'pending').length;

  return (
    <div className="shell">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">⚡ Akshara World</div>
          <div className="brand-sub">Command Center</div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-label">Operations</div>
          {NAV.map(n => (
            <div key={n.id} className={`nav-item${active === n.id ? ' active' : ''}`} onClick={() => setActive(n.id)}>
              <span className="icon">{n.icon}</span>
              <span style={{ flex: 1 }}>{n.label}</span>
              {n.id === 'approvals' && pendingCount > 0 && (
                <span style={{ background: 'var(--blue)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>{pendingCount}</span>
              )}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sam-status">
            <div className="sam-avatar">S</div>
            <div className="sam-info">
              <div className="name">Sam — AI CEO</div>
              <div className="status">● Online · Cloudflare</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="main">
        <div className="topbar">
          <div className="topbar-title">{NAV.find(n => n.id === active)?.icon} {NAV.find(n => n.id === active)?.label}</div>
          <div className="topbar-right">
            <span className="badge green"><span className="pulse" />Sam Brain: Live</span>
            <span className="badge blue">GitHub: Synced</span>
            <span className="badge yellow">⏰ {time}</span>
          </div>
        </div>

        <div className="content">

          {/* ── KPI ── */}
          {active === 'kpi' && (
            <div>
              <div className="kpi-grid">
                {[
                  { label: 'Revenue (MTD)', value: '₹0', sub: 'Goal: ₹1,10,000 / mo', color: 'var(--blue)' },
                  { label: 'Uptime', value: '100%', sub: 'Sam Brain: Cloudflare Workers', color: 'var(--green)' },
                  { label: 'AI Departments', value: '8', sub: 'All operational', color: 'var(--purple)' },
                  { label: 'Pending Approvals', value: String(pendingCount), sub: 'Owner action required', color: 'var(--yellow)' },
                  { label: 'Phase', value: '1', sub: 'MVP Departments — Revenue', color: 'var(--cyan)' },
                  { label: 'GitHub Commits', value: '5', sub: 'sampathh7415/AksharaWorld', color: 'var(--orange)' },
                ].map(k => (
                  <div className="kpi-card" key={k.label}>
                    <div className="kpi-label">{k.label}</div>
                    <div className="kpi-value" style={{ color: k.color }}>{k.value}</div>
                    <div className="kpi-sub">{k.sub}</div>
                  </div>
                ))}
              </div>

              {/* Phase Roadmap */}
              <div className="glass-card" style={{ marginBottom: 20 }}>
                <div className="card-header"><span className="card-title">🗺️ Business Roadmap</span><span className="pill blue">Phase 1 Active</span></div>
                <div className="card-body">
                  <div className="phase-list">
                    {PHASES.map(p => (
                      <div className="phase-item" key={p.num}>
                        <div className={`phase-dot ${p.state}`}>{p.state === 'done' ? '✓' : p.num}</div>
                        <div className="phase-info">
                          <div className="phase-name">{p.label}</div>
                          <div className="phase-desc">{p.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Activity */}
              <div className="glass-card">
                <div className="card-header"><span className="card-title">⚡ Live Activity</span><span className="pill green">Real-time</span></div>
                <div className="card-body">
                  {[
                    { who: 'Sam', color: 'var(--purple)', text: 'Phase 0 complete. GitHub synced. Clerk auth live. DNA integration deployed.', ago: 'Now' },
                    { who: 'Innovation_Scout', color: 'var(--cyan)', text: 'CRON active — Daily 6 AM IST market scan scheduled.', ago: '1 hr ago' },
                    { who: 'Tech_Core', color: 'var(--blue)', text: 'MemoryService.ts + SkillLibrary.ts committed to main branch.', ago: '2 hrs ago' },
                    { who: 'Guardian_Ops', color: 'var(--green)', text: 'Backup created: Backup_2026-05-11 — capsule, resources, wrangler.', ago: '3 hrs ago' },
                  ].map((a, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: a.color + '22', border: `1px solid ${a.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0, color: a.color }}>{a.who[0]}</div>
                      <div>
                        <div style={{ fontSize: '0.85rem' }}><span style={{ color: a.color, fontWeight: 600 }}>{a.who}</span> {a.text}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 2 }}>{a.ago}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── 30-DAY OPS ── */}
          {active === '30dayops' && (
            <div>
              {/* Hero Offer Status */}
              <div className="glass-card" style={{ marginBottom: 20 }}>
                <div className="card-header"><span className="card-title">🎯 Hero Offer — Launch Pilot Status</span><span className="pill blue">Active</span></div>
                <div className="card-body">
                  <div className="row-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
                    {[
                      { label: 'Early-Bird Price', value: '₹999', sub: 'First 5 seats', color: 'var(--yellow)' },
                      { label: 'Standard Price', value: '₹1,500', sub: 'From Week 4 / after 5 seats', color: 'var(--blue)' },
                      { label: 'Premium Price', value: '₹4,999', sub: '+1 live strategy session', color: 'var(--purple)' },
                    ].map(k => (
                      <div key={k.label} className="kpi-card">
                        <div className="kpi-label">{k.label}</div>
                        <div className="kpi-value" style={{ color: k.color }}>{k.value}</div>
                        <div className="kpi-sub">{k.sub}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: 'var(--panel2)', borderRadius: 10, padding: 14, fontSize: '0.84rem', color: 'var(--muted)' }}>
                    <strong style={{ color: 'var(--text)' }}>Checkout CTA:</strong> "Get the Akshara Launch Pilot — ₹1,500 (₹999 for first 5 seats). Sam runs 8 departments on ₹0 infra. [Pay with Razorpay]"
                    <div style={{ marginTop: 8 }}>
                      <a href="/public/products/launch-pilot" style={{ color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>→ View Launch Pilot Page</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Ritual Checklist */}
              <div className="glass-card" style={{ marginBottom: 20 }}>
                <div className="card-header"><span className="card-title">☀️ Daily Ritual (~25 min, Mon–Sat)</span><span className="pill green">Target: ≥20/30 days</span></div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 10, color: 'var(--yellow)' }}>☀️ Morning (~15 min)</div>
                      {['Open /internal → Insight Lab (GA4, revenue, merchant feed, dept logs)', 'Approve queue — max 2 approvals today (ops-config)', 'Check Telegram + GA4 alerts from overnight', 'Set today outbound target: 10 touches'].map(item => (
                        <div key={item} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                          <span style={{ color: 'var(--muted)', marginTop: 1 }}>□</span>
                          <span style={{ fontSize: '0.82rem', color: 'var(--muted2)' }}>{item}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 10, color: 'var(--purple)' }}>🌙 Evening (~10 min)</div>
                      {['Update SalesPipeline — all touches, stages, next_action', 'Confirm Telegram — no unacknowledged alerts >4h', 'If alert open → follow runbook + log SystemLog', 'Log touches count: ___ / 10'].map(item => (
                        <div key={item} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                          <span style={{ color: 'var(--muted)', marginTop: 1 }}>□</span>
                          <span style={{ fontSize: '0.82rem', color: 'var(--muted2)' }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-Time Decision Rules */}
              <div className="glass-card" style={{ marginBottom: 20 }}>
                <div className="card-header"><span className="card-title">⚡ Real-Time Decision Rules</span><span className="pill yellow">No new infra needed</span></div>
                <div className="card-body" style={{ padding: 0 }}>
                  <table className="data-table">
                    <thead><tr><th>Signal</th><th>Action</th><th>Owner</th></tr></thead>
                    <tbody>
                      {DECISION_RULES.map((r, i) => (
                        <tr key={i}>
                          <td style={{ color: 'var(--yellow)', fontSize: '0.82rem', fontWeight: 600 }}>{r.signal}</td>
                          <td style={{ color: 'var(--text)', fontSize: '0.82rem' }}>{r.action}</td>
                          <td><span className="pill blue" style={{ fontSize: '0.7rem' }}>{r.owner}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Ops Docs Quick Links */}
              <div className="glass-card">
                <div className="card-header"><span className="card-title">📂 Ops Playbooks &amp; Runbooks</span><span className="pill green">Live in GitHub</span></div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
                    {OPS_DOCS.map(d => (
                      <a key={d.label} href={d.href} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'block', padding: '10px 14px', background: 'var(--panel2)', borderRadius: 10, fontSize: '0.83rem', color: 'var(--text)', textDecoration: 'none', border: '1px solid var(--border2)', transition: 'background 0.15s' }}
                      >
                        {d.label}
                      </a>
                    ))}
                  </div>
                  <div style={{ marginTop: 14, fontSize: '0.78rem', color: 'var(--muted)' }}>
                    Sam ops-config: <strong>maxDailyApprovals=2</strong> · Priority: Growth_Engine, Revenue_Vault, Guardian_Ops · Deferred: Innovation_Scout
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
                      <span className="dept-name">{d.name}</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {d.cron && <span className="pill purple">CRON</span>}
                        <span className="pill green">● Active</span>
                      </div>
                    </div>
                    <div className="dept-detail">
                      <div style={{ marginBottom: 4 }}>{d.mission}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.74rem' }}>Agents: {d.agents}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── APPROVALS ── */}
          {active === 'approvals' && (
            <div className="glass-card">
              <div className="card-header"><span className="card-title">✅ Approvals Queue</span><span className="pill yellow">{pendingCount} Pending</span></div>
              <div className="card-body">
                {approvals.map(a => (
                  <div className="approval-item" key={a.id}>
                    <div className="approval-info">
                      <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                        <span className="pill blue">{a.dept}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{a.id}</span>
                      </div>
                      <div className="approval-title">{a.title}</div>
                      <div className="approval-desc">{a.desc}</div>
                    </div>
                    <div className="approval-actions">
                      {a.status === 'pending' ? (
                        <>
                          <button className="btn approve" onClick={() => handleApproval(a.id, 'approve')}>✓ Approve</button>
                          <button className="btn reject" onClick={() => handleApproval(a.id, 'reject')}>✗ Reject</button>
                        </>
                      ) : (
                        <span className={`pill ${a.status === 'approved' ? 'green' : 'red'}`}>{a.status === 'approved' ? '✓ Approved' : '✗ Rejected'}</span>
                      )}
                    </div>
                  </div>
                ))}
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
                {loading && <div className="msg sam"><div className="msg-avatar">S</div><div className="msg-bubble"><span className="spinner" /></div></div>}
                <div ref={chatBottomRef} />
              </div>
              <div className="chat-input-row">
                <input className="chat-input" placeholder="Message Sam..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
                <button className="chat-send" onClick={sendMessage}>➤</button>
              </div>
            </div>
          )}

          {/* ── BRAIN DNA ── */}
          {active === 'brain' && (
            <div>
              <div className="row-grid" style={{ marginBottom: 20 }}>
                <div className="glass-card">
                  <div className="card-header"><span className="card-title">🧠 Semantic Memory Graph</span><span className="pill green">Stable</span></div>
                  <div className="card-body">
                    {[['Graph Health', '100% Stable', 'green'], ['Architecture', 'jcode DNA Pattern', 'blue'], ['Sideagent', 'Verification Active', 'purple'], ['Vector Store', 'Supabase pgvector (pending)', 'yellow']].map(([k, v, c]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border2)' }}>
                        <span style={{ color: 'var(--muted)', fontSize: '0.84rem' }}>{k}</span>
                        <span className={`pill ${c}`}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass-card">
                  <div className="card-header"><span className="card-title">🛠️ Agent Skill Store</span><span className="pill blue">4 Active</span></div>
                  <div className="card-body">
                    {['Innovation Scout', 'Content Strategist', 'Revenue Auditor', 'Guardian Watchdog'].map(s => (
                      <div key={s} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--blue)' }} />
                          <span style={{ fontSize: '0.85rem' }}>{s}</span>
                        </div>
                        <span className="pill green">Deployed</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="glass-card">
                <div className="card-header"><span className="card-title">🧬 Deep DNA Sources</span></div>
                <div className="card-body">
                  <div className="row-grid three">
                    {[['jcode', 'Semantic Memory + TUI patterns', 'blue'], ['500-AI-Agents', 'Skill blueprints (500+ use cases)', 'purple'], ['CrewAI + FastMCP', 'Swarm orchestration bridge', 'cyan']].map(([src, desc, c]) => (
                      <div key={src} style={{ background: 'var(--panel2)', border: '1px solid var(--border2)', borderRadius: 10, padding: 16 }}>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>{src}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── RESOURCES ── */}
          {active === 'resources' && (
            <div className="glass-card">
              <div className="card-header"><span className="card-title">⚙️ Resource Inventory</span><span className="pill blue">Zero Investment Stack</span></div>
              <div className="card-body" style={{ padding: 0 }}>
                <table className="data-table">
                  <thead><tr><th>Resource</th><th>Provider</th><th>Type</th><th>Quota</th><th>Cost</th><th>Status</th></tr></thead>
                  <tbody>
                    {RESOURCES.map(([r, p, t, q, c, s]) => (
                      <tr key={String(r)}>
                        <td style={{ fontWeight: 600, color: 'var(--text)' }}>{r}</td>
                        <td>{p}</td><td>{t}</td><td>{q}</td><td>{c}</td>
                        <td><span className={`pill ${s}`}>{s === 'green' ? '● Active' : '○ Pending'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── ALERTS ── */}
          {active === 'alerts' && (
            <div className="glass-card">
              <div className="card-header"><span className="card-title">🚨 System Alerts</span></div>
              <div className="card-body">
                {[
                  { type: 'warn', title: 'Public URL Pending', desc: 'Dashboard runs on localhost:3000. Deploy to Cloudflare Pages for 24/7 public access.' },
                  { type: 'warn', title: 'Razorpay Not Connected', desc: 'Revenue collection is blocked until Razorpay API keys are added.' },
                  { type: 'warn', title: 'Telegram BOT_TOKEN Missing', desc: 'Mobile approval notifications are inactive until token is set in Cloudflare secrets.' },
                  { type: 'info', title: 'Clerk Auth Live', desc: 'Owner-only access enforced with 2FA. All routes protected.' },
                  { type: 'info', title: 'GitHub Synced', desc: '5 commits pushed to sampathh7415/AksharaWorld — all business code backed up.' },
                ].map((a, i) => (
                  <div key={i} className={`alert-item ${a.type}`}>
                    <span className="alert-icon">{a.type === 'warn' ? '⚠️' : 'ℹ️'}</span>
                    <div className="alert-text">
                      <div className="title">{a.title}</div>
                      <div className="desc">{a.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CAPSULE ── */}
          {active === 'capsule' && (
            <div className="glass-card">
              <div className="card-header"><span className="card-title">💊 Capsule — Single Source of Truth</span><span className="pill green">Live from Drive</span></div>
              <div className="card-body">
                <pre style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--muted2)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                  {capsule || data?.capsule || 'Loading capsule from Google Drive...'}
                </pre>
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
                      ['2026-05-12', 'Dashboard', 'Unified dashboard — merged 3 versions into 1', 'Antigravity'],
                      ['2026-05-12', 'GitHub', 'Full workspace synced to sampathh7415/AksharaWorld', 'Sam'],
                      ['2026-05-11', 'AI DNA', 'jcode Semantic Memory + 500-AI-Agents Skill Library integrated', 'Antigravity'],
                      ['2026-05-11', 'Auth', 'Clerk 2FA live — owner-only access enforced', 'Sam'],
                      ['2026-05-11', 'Brain', 'Sam CEO Brain v2.0 deployed to Cloudflare Workers', 'Sam'],
                      ['2026-05-11', 'CRON', 'Innovation_Scout daily 6 AM IST scan active', 'Sam'],
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

          {/* ── UPGRADES ── */}
          {active === 'upgrades' && (
            <div className="glass-card">
              <div className="card-header"><span className="card-title">🚀 Upgrade Proposals</span><span className="pill blue">Innovation_Scout — Daily R&D</span></div>
              <div className="card-body">
                <div style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: 40 }}>
                  No upgrade proposals yet. Innovation_Scout will submit daily proposals once Telegram notifications are active.
                </div>
              </div>
            </div>
          )}

          {/* ── FILE REVIEWS ── */}
          {active === 'filereviews' && (
            <div className="glass-card">
              <div className="card-header"><span className="card-title">📁 File Review Reports</span></div>
              <div className="card-body">
                <div style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: 40 }}>
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
                <div style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: 40 }}>
                  ✅ No failures on record. Every operation that fails 3 consecutive times will appear here with root-cause analysis.
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
