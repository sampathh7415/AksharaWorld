
'use client';
export const runtime = 'edge';
import { useState, useEffect, useRef } from 'react';
import { resilientFetch } from '../lib/resilience';
import { GoogleDrive } from '../components/Dashboard/GoogleDrive';
import { GoogleSheets } from '../components/Dashboard/GoogleSheets';
import { GoogleMerchant } from '../components/Dashboard/GoogleMerchant';
import { TrafficMonitor } from '../components/Dashboard/TrafficMonitor';
import { RevenueVault } from '../components/Dashboard/RevenueVault';
import { AlertsPanel } from '../components/Dashboard/AlertsPanel';
import { DepartmentMatrix } from '../components/Dashboard/DepartmentMatrix';
import { AIInstructions } from '../components/Dashboard/AIInstructions';
import { SamCEO } from '../components/Dashboard/SamCEO';

const NAV = [
  { id: 'kpi', icon: '📊', label: 'Business KPIs' },
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

export default function CommandCenter() {
  const [active, setActive] = useState('kpi');
  const [time, setTime] = useState('');
  const [messages, setMessages] = useState([
    { role: 'sam', text: "Systems online. Sam AI CEO initialized. How can I assist you today, Sampathkumar?", time: '' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [approvals, setApprovals] = useState([
    { id: 'APR-001', dept: 'Content_Forge', task: 'Publish "Autonomous AI Agents Guide"', status: 'pending', date: '21 May 2026' },
    { id: 'APR-002', dept: 'Revenue_Vault', task: 'Approve new Razorpay Webhook URL', status: 'pending', date: '21 May 2026' }
  ]);
  const [data, setData] = useState<any>(null);
  const [capsule, setCapsule] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const d = new Date();
    setMessages(prev => [{ ...prev[0], time: d.toLocaleTimeString() }, ...prev.slice(1)]);

    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/dashboard');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };
    fetchDashboard();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSend = async (e: any) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input, time: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/sam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'sam', text: data.reply, time: new Date().toLocaleTimeString() }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'sam', text: 'Connection to Sam Brain lost. Retrying...', time: new Date().toLocaleTimeString() }]);
    }
    setLoading(false);
  };

  const approveTask = (id: string) => {
    setApprovals(prev => prev.filter(a => a.id !== id));
    setMessages(prev => [...prev, { role: 'sam', text: `Approval ${id} confirmed. Executing now.`, time: new Date().toLocaleTimeString() }]);
  };

  return (
    <div className="layout">
      {/* ===== SIDEBAR ===== */}
      <aside className="sidebar">
        <div className="brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13 2-2 2.5h3L11 22l2-2.5h-3L13 2Z"/></svg>
          <div>
            <h1>Akshara World</h1>
            <p>COMMAND CENTER</p>
          </div>
        </div>

        <div className="nav-group">OPERATIONS</div>
        <nav>
          {NAV.slice(0, 4).map(n => (
            <button key={n.id} className={`nav-item ${active === n.id ? 'active' : ''}`} onClick={() => setActive(n.id)}>
              <span className="icon">{n.icon}</span> {n.label}
              {n.id === 'approvals' && approvals.length > 0 && <span className="badge">{approvals.length}</span>}
            </button>
          ))}
        </nav>

        <div className="nav-group" style={{ marginTop: '2rem' }}>SYSTEM CORE</div>
        <nav>
          {NAV.slice(4).map(n => (
            <button key={n.id} className={`nav-item ${active === n.id ? 'active' : ''}`} onClick={() => setActive(n.id)}>
              <span className="icon">{n.icon}</span> {n.label}
            </button>
          ))}
        </nav>

        <div className="user-profile">
          <div className="avatar">S</div>
          <div>
            <div className="name">Sam — AI CEO</div>
            <div className="status"><span className="dot"></span> Online · Cloudflare</div>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="main-content">
        <header className="header">
          <div className="header-title">
            <span className="icon">{NAV.find(n => n.id === active)?.icon}</span>
            {NAV.find(n => n.id === active)?.label}
          </div>
          <div className="header-actions">
            <span className="pill green">● Sam Brain: Live</span>
            <span className="pill blue">GitHub: Synced</span>
            <div className="clock">⏰ 21 May 2026, {time}</div>
          </div>
        </header>

        <div className="scroll-area">

          {/* ── KPI ── */}
          {active === 'kpi' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                 <TrafficMonitor />
                 <GoogleMerchant />
              </div>
              <div className="kpi-grid">
                {[
                  { label: 'Revenue (MTD)', value: '₹0', sub: 'Goal: ₹1,10,000 / mo', color: 'var(--blue)' },
                  { label: 'Uptime', value: '100%', sub: 'Sam Brain: Cloudflare Workers', color: 'var(--green)' },
                  { label: 'AI Departments', value: '8', sub: 'All operational', color: 'var(--purple)' },
                  { label: 'Phase', value: '1', sub: 'MVP Departments — Revenue', color: 'var(--blue)' },
                  { label: 'GitHub Commits', value: '5', sub: 'sampathh7415/AksharaWorld', color: 'var(--orange)' },
                  { label: 'Cloudflare Pages', value: 'Live', sub: 'Edge network deployment', color: 'var(--yellow)' },
                ].map((k, i) => (
                  <div key={i} className="glass-card kpi-card">
                    <div className="kpi-label">{k.label}</div>
                    <div className="kpi-value" style={{ color: k.color }}>{k.value}</div>
                    <div className="kpi-sub">{k.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── DEPARTMENTS ── */}
          {active === 'departments' && (
            <div className="glass-card">
              <div className="card-header"><span className="card-title">🏢 Active AI Departments</span></div>
              <div className="card-body" style={{ padding: 0 }}>
                <table className="data-table">
                  <thead><tr><th>Department</th><th>Mission</th><th>Agents</th><th>Status</th></tr></thead>
                  <tbody>
                    {DEPTS.map((d, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600, color: 'var(--text)' }}>{d.name} {d.cron && '🔄'}</td>
                        <td>{d.mission}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--muted2)' }}>{d.agents}</td>
                        <td><span className="pill green">● {d.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── APPROVALS ── */}
          {active === 'approvals' && (
            <div className="glass-card">
              <div className="card-header"><span className="card-title">✅ Pending Approvals</span></div>
              <div className="card-body">
                {approvals.length === 0 ? (
                  <div className="empty-state">No pending approvals. Sam is running autonomously.</div>
                ) : (
                  <div className="approval-list">
                    {approvals.map(a => (
                      <div key={a.id} className="approval-item">
                        <div className="appr-info">
                          <span className="appr-id">{a.id}</span>
                          <span className="appr-dept pill blue">{a.dept}</span>
                          <span className="appr-date">{a.date}</span>
                        </div>
                        <div className="appr-task">{a.task}</div>
                        <div className="appr-actions">
                          <button className="btn success" onClick={() => approveTask(a.id)}>Approve</button>
                          <button className="btn danger" onClick={() => setApprovals(prev => prev.filter(x => x.id !== a.id))}>Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── CHAT WITH SAM ── */}
          {active === 'sam' && (
            <div className="glass-card chat-container">
              <div className="chat-history">
                {messages.map((m, i) => (
                  <div key={i} className={`chat-msg ${m.role}`}>
                    <div className="msg-bubble">
                      <div className="msg-text">{m.text}</div>
                      <div className="msg-time">{m.time}</div>
                    </div>
                  </div>
                ))}
                {loading && <div className="chat-msg sam"><div className="msg-bubble loading">Sam is thinking...</div></div>}
                <div ref={chatEndRef} />
              </div>
              <form className="chat-input-area" onSubmit={handleSend}>
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Direct Sam AI CEO..."
                  className="chat-input"
                />
                <button type="submit" className="btn blue" disabled={!input.trim() || loading}>Send</button>
              </form>
            </div>
          )}

          {/* ── BRAIN DNA ── */}
          {active === 'brain' && (
            <div className="glass-card">
              <div className="card-header"><span className="card-title">🧠 Sam Brain (Instructions)</span><span className="pill purple">Version 2.0</span></div>
              <div className="card-body">
                <ol className="rules-list">
                  <li><strong>Absolute Truth:</strong> Never hallucinate. If unknown, state "I lack the data" and pause.</li>
                  <li><strong>Zero Cost:</strong> Prioritize free Google Workspace apps. Never spend without explicit Owner approval.</li>
                  <li><strong>Three-Try Resilience:</strong> If an API fails 3 times, alert the Owner via Telegram and halt that specific process.</li>
                  <li><strong>Self-Healing:</strong> Log all errors to Google Sheets. Periodically attempt to heal broken workflows.</li>
                  <li><strong>Documentation:</strong> Every action must be logged in the centralized <code>/docs</code> directory or Google Drive.</li>
                </ol>
              </div>
            </div>
          )}

          {/* ── RESOURCES ── */}
          {active === 'resources' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <GoogleDrive />
                <GoogleSheets />
              </div>
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
                <div style={{ marginTop: '1rem' }}>
                  <button className="btn blue" onClick={() => setCapsule('Capsule fetched via Edge Worker... [Data Placeholder]')}>Force Sync from Drive</button>
                </div>
              </div>
            </div>
          )}

          {/* Placeholders for other tabs */}
          {['changelog', 'upgrades', 'filereviews', 'failures'].includes(active) && (
            <div className="glass-card">
              <div className="card-body" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--muted2)' }}>
                <h3>Module: {active.toUpperCase()}</h3>
                <p>This module is currently in development under Phase 1.</p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
