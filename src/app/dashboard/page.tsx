'use client';
export const runtime = 'edge';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const NAV = [
  { id: 'kpi', icon: '📊', label: 'Business KPIs' },
  { id: '30dayops', icon: '📋', label: '30-Day Ops' },
  { id: 'departments', icon: '🏢', label: 'Departments' },
  { id: 'approvals', icon: '✅', label: 'Approvals Queue' },
  { id: 'jobs', icon: '🤖', label: 'AI Jobs Queue' },
  { id: 'sam', icon: '💬', label: 'Chat with Sam' },
  { id: 'resources', icon: '⚙️', label: 'Resource Inventory' },
  { id: 'changelog', icon: '📜', label: 'Change Log' },
];

const DECISION_RULES = [
  { signal: 'Traffic ↑, conversion flat', action: 'Change CTA/headline on top Blogger post within 24h', owner: 'Growth_Engine' },
  { signal: 'Payment webhook failure', action: 'Stop outbound; run backup logging routes', owner: 'Tech_Core + Guardian_Ops' },
  { signal: 'Sheets API errors', action: 'Check Google API quota; verify secrets; run test-sheets.js', owner: 'Tech_Core' },
  { signal: '48h no pipeline movement', action: 'Change offer band or ICP segment; log experiment_id', owner: 'Revenue_Vault' },
  { signal: '5 early-bird sold', action: 'Switch all CTAs to ₹1,500 standard', owner: 'Revenue_Vault' },
  { signal: 'Demo → paid < 20%', action: 'Revise demo script; tighten ICP on WhatsApp', owner: 'Growth_Engine' },
];

const DEPTS = [
  { name: 'Content_Forge', mission: 'Research & write SEO content', agents: 'Researcher, Writer, Editor, SEO', status: 'Active' },
  { name: 'Media_Studio', mission: 'Images, video, audio, shorts', agents: 'Designer, Video, TTS, Thumbnail', status: 'Active' },
  { name: 'Growth_Engine', mission: 'Distribution on IG, YT, FB', agents: 'Social, Email, Community', status: 'Active' },
  { name: 'Revenue_Vault', mission: 'Monetization & finance', agents: 'Payments, Affiliate, Bookkeeper', status: 'Active' },
  { name: 'Tech_Core', mission: 'Infra, code, deploys', agents: 'DevOps, Coder, DB-Admin, Security', status: 'Active' },
  { name: 'Guardian_Ops', mission: 'Self-healing, compliance, backups', agents: 'Healer, Watchdog, Legal, Backup', status: 'Active' },
  { name: 'Insight_Lab', mission: 'Analytics & forecasting', agents: 'Analyst, Forecaster, A/B Tester', status: 'Active' },
  { name: 'Innovation_Scout', mission: 'Daily R&D — new tools & trends', agents: 'Trend Hunter, Tool Evaluator', status: 'Active' },
];

const RESOURCES = [
  ['Google Drive', 'Google', 'Storage', '< 1%', 'Free', 'green'],
  ['Google Sheets', 'Google', 'Database', '< 1%', 'Free', 'green'],
  ['Gemini API', 'Google', 'AI', 'Active', 'Free tier', 'green'],
  ['Cloudflare Workers', 'Cloudflare', 'Compute', 'Active', 'Free tier', 'green'],
  ['Clerk Auth', 'Clerk', 'Security', 'Active', 'Free tier', 'green'],
  ['GitHub', 'GitHub', 'Code', 'Connected', 'Free', 'green'],
  ['Razorpay Gateway', 'Razorpay', 'Payments', 'Connected', 'Live', 'green'],
  ['Telegram Webhook', 'Telegram', 'Alerts', 'Active', 'Free', 'green'],
  ['Ollama Sam (qwen3.6)', 'Ollama (Local)', 'AI (CEO Reasoning)', 'Active', 'Free (Local)', 'green'],
  ['Ollama Stitch (qwen3.6)', 'Ollama (Local)', 'AI (UI Design)', 'Active', 'Free (Local)', 'green'],
  ['Ollama Creative (gemma4)', 'Ollama (Local)', 'AI (Generative)', 'Active', 'Free (Local)', 'green'],
  ['Ollama Code (qwen2.5-coder)', 'Ollama (Local)', 'AI (Engineering)', 'Active', 'Free (Local)', 'green'],
  ['Ollama Fast (llama3)', 'Ollama (Local)', 'AI (Fast queries)', 'Active', 'Free (Local)', 'green'],
];


function now() { 
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); 
}

export default function Dashboard() {
  const [active, setActive] = useState('kpi');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState('');
  
  // Chat state
  const [messages, setMessages] = useState([
    { role: 'sam', text: 'Greetings. I am Sam, AI CEO of Akshara World. Command Center is fully online. Razorpay transactions, GA4 visitor telemetry, and Brevo mailing list counts are now wired dynamically. What is your directive?', time: now() },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  
  // Approvals State
  const [approvals, setApprovals] = useState([
    { id: 'APR-003', dept: 'Tech_Core', title: 'Deploy to Cloudflare Pages', desc: 'Authorize Edge build compilation for aksharaworld.in', status: 'pending' },
    { id: 'APR-004', dept: 'Revenue_Vault', title: 'Sheets Webhook Sync', desc: 'Authorize daily Apps Script log entry transaction backup sync', status: 'pending' },
    { id: 'APR-005', dept: 'Growth_Engine', title: 'WhatsApp Outbound Thread', desc: 'Activate WhatsApp notification pipeline trigger for leads list', status: 'pending' },
  ]);

  // AI Jobs Queue State
  const [aiJobs, setAiJobs] = useState<any[]>([]);

  const router = useRouter();

  useEffect(() => {
    fetchRealData();
    setTime(new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }));
    
    // Auto-refresh loop: 10 seconds
    const dataTimer = setInterval(fetchRealData, 10000);
    const clockTimer = setInterval(() => {
      setTime(new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }));
    }, 30000);

    return () => {
      clearInterval(dataTimer);
      clearInterval(clockTimer);
    };
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchRealData = async () => {
    try {
      const res = await fetch('/api/dashboard/real-data');
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (err) {
      console.warn('Failed to fetch real-time telemetry:', err);
    }

    try {
      const jobsRes = await fetch('/api/google/ai-jobs');
      if (jobsRes.ok) {
        const jobs = await jobsRes.json();
        setAiJobs(jobs);
      }
    } catch (err) {
      console.warn('Failed to fetch AI jobs telemetry:', err);
    }
  };


  const handleLogout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/dashboard/login');
        router.refresh();
      }
    } catch {
      alert('SYNAPSE DISCONNECT ERROR');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (id: string, action: 'approve' | 'reject') => {
    setApprovals(curr => curr.map(item => item.id === id ? { ...item, status: action === 'approve' ? 'approved' : 'rejected' } : item));
    try {
      await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
    } catch {}
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText, time: now() }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/sam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });
      const resData = await res.json();
      setMessages(prev => [...prev, { role: 'sam', text: resData.reply || 'synapse error. offline memory engaged.', time: now() }]);
    } catch {
      setMessages(prev => [...prev, { role: 'sam', text: 'Error contacting Sam Brain. Fallback memory online.', time: now() }]);
    } finally {
      setChatLoading(false);
    }
  };

  const pendingCount = approvals.filter(item => item.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 flex selection:bg-cyan-500/20">
      
      {/* Sidebar Navigation */}
      <aside className="w-80 bg-black/40 border-r border-white/5 flex flex-col p-6 space-y-8 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-black text-black text-lg">A</div>
          <div>
            <span className="font-bold tracking-widest text-white uppercase text-sm block">Akshara World</span>
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">Command Center</span>
          </div>
        </div>

        <nav className="flex-1 flex flex-col space-y-1.5">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block px-3 mb-2">OPERATIONS MONITOR</span>
          {NAV.map(n => {
            const isActive = active === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setActive(n.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-white/[0.04] border border-white/10 text-white shadow-xl'
                    : 'text-slate-400 hover:text-slate-200 bg-transparent border border-transparent'
                }`}
              >
                <span>{n.icon}</span>
                <span className="flex-1">{n.label}</span>
                {n.id === 'approvals' && pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-black text-[10px] font-black">{pendingCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer / User Info */}
        <div className="pt-6 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold">S</div>
            <div>
              <span className="text-xs font-black text-white block">Sam — AI CEO</span>
              <span className="text-[9px] text-emerald-500 font-bold block flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" /> Online · Active
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full py-3 border border-red-500/10 hover:border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            {loading ? 'Disconnecting...' : 'Disconnect Session'}
          </button>
        </div>
      </aside>

      {/* Main Panel Viewport */}
      <main className="flex-1 p-10 flex flex-col space-y-8 relative overflow-y-auto max-h-screen">
        
        {/* Header Telemetry */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-white" style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>
              {NAV.find(n => n.id === active)?.label}
            </h2>
            <p className="text-xs text-slate-500 mt-1">Live Synapse Telemetry Index</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">{time}</span>
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest block mt-0.5">⏱️ Refresh Loop: 10s</span>
          </div>
        </div>

        {/* TAB 1: BUSINESS KPIs */}
        {active === 'kpi' && (
          <div className="space-y-8">
            
            {/* 4 KPI Metric cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* Card 1: Captured Revenue */}
              <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col justify-between aspect-[1.4/1]">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">💸 Total Captured Revenue</span>
                <div>
                  <div className="text-3xl font-black text-white mb-1">
                    ₹{data?.metrics?.revenue?.total || '0.00'}
                  </div>
                  <span className="text-[10px] text-emerald-500 font-bold block">
                    ✓ Today: ₹{data?.metrics?.revenue?.today || '0.00'}
                  </span>
                </div>
              </div>

              {/* Card 2: Visitor Telemetry */}
              <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col justify-between aspect-[1.4/1]">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">📊 Active visitors (GA4)</span>
                <div>
                  <div className="text-3xl font-black text-cyan-400 mb-1">
                    {data?.metrics?.traffic?.activeVisitors || '0'}
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold block">
                    ⚡ Conversion: {data?.metrics?.traffic?.conversionRate || '0%'}
                  </span>
                </div>
              </div>

              {/* Card 3: Brevo Mailing List */}
              <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col justify-between aspect-[1.4/1]">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">📧 Newsletter Subscribers</span>
                <div>
                  <div className="text-3xl font-black text-white mb-1">
                    {data?.metrics?.subscribers || '0'}
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold block">
                    Mapped directly to Brevo lists
                  </span>
                </div>
              </div>

              {/* Card 4: Operations Phase */}
              <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col justify-between aspect-[1.4/1]">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">🤖 System state index</span>
                <div>
                  <div className="text-sm font-black text-white mb-1 uppercase tracking-tight">
                    {data?.metrics?.phase || 'MVP Operations'}
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold block">
                    Uptime: {data?.metrics?.uptime || '100%'}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Transactions List */}
            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">💳 Real-time Transaction Ledger</span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="pb-4">Transaction ID</th>
                      <th className="pb-4">Product Name</th>
                      <th className="pb-4">Amount</th>
                      <th className="pb-4">Payment Method</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4 text-right">Time Index</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02] text-slate-300 font-medium">
                    {data?.metrics?.recentTransactions?.map((txn: any, i: number) => (
                      <tr key={i} className="hover:bg-white/[0.01]">
                        <td className="py-4 font-mono text-cyan-400">{txn.id}</td>
                        <td className="py-4">{txn.notes}</td>
                        <td className="py-4 text-white font-bold">₹{txn.amount}</td>
                        <td className="py-4 uppercase">{txn.method}</td>
                        <td className="py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                            txn.status === 'captured' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {txn.status}
                          </span>
                        </td>
                        <td className="py-4 text-right text-slate-500">{new Date(txn.createdAt).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                    {(!data?.metrics?.recentTransactions || data?.metrics?.recentTransactions.length === 0) && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">No transactions recorded. System ready.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 30-DAY OPS (Rules Engine) */}
        {active === '30dayops' && (
          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Rules */}
            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">🛡️ Autonomous Decision Matrix</span>
              <div className="space-y-4">
                {DECISION_RULES.map((rule, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                    <span className="text-[10px] text-cyan-400 font-bold block uppercase tracking-wider">⚡ Trigger: {rule.signal}</span>
                    <p className="text-xs text-slate-300 font-semibold leading-relaxed">{rule.action}</p>
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/5 text-[9px] text-slate-500 font-bold uppercase">
                      <span>Owner Wing: {rule.owner}</span>
                      <span>Resilient ✅</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Health Logs */}
            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">🚀 System Health Ingestor</span>
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold leading-relaxed">
                ✓ SAM Brain Core Status: {data?.samBrain?.status === 'online' ? 'Online · Edge Active' : 'Offline · Offline Memory Engaged'}
              </div>
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Current System State:</span>
                <p className="text-xs text-slate-300 font-semibold leading-relaxed">{data?.capsule || 'No system state loaded.'}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DEPARTMENTS */}
        {active === 'departments' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {DEPTS.map((dept, i) => (
              <div key={i} className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-black text-white">{dept.name}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold">
                      {dept.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold mb-3">{dept.mission}</p>
                  <span className="text-[10px] text-cyan-400 font-bold block uppercase tracking-wider">🤖 Active Swarm Agents:</span>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">{dept.agents}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: APPROVALS QUEUE */}
        {active === 'approvals' && (
          <div className="max-w-3xl mx-auto w-full p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">✅ Pending Approvals Queue</span>
              <span className="px-3 py-1 rounded-full bg-cyan-500 text-black text-[10px] font-black">{pendingCount} Active</span>
            </div>
            
            <div className="space-y-4">
              {approvals.map((app, i) => {
                const isPending = app.status === 'pending';
                const isApproved = app.status === 'approved';
                return (
                  <div key={i} className="p-6 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-white">{app.title}</span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">{app.dept}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{app.desc}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => handleApproval(app.id, 'approve')}
                            className="px-4 py-2 bg-cyan-500 text-black font-black uppercase text-[10px] rounded-lg hover:scale-105 transition-transform cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproval(app.id, 'reject')}
                            className="px-4 py-2 bg-white/5 text-slate-300 font-black uppercase text-[10px] rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase ${
                          isApproved ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {app.status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: CHAT WITH SAM */}
        {active === 'sam' && (
          <div className="max-w-3xl mx-auto w-full flex flex-col h-[65vh] bg-black/40 border border-white/5 rounded-[2.5rem] overflow-hidden">
            
            {/* Chat Messages Panel */}
            <div className="flex-1 p-8 overflow-y-auto space-y-6">
              {messages.map((msg, i) => {
                const isSam = msg.role === 'sam';
                return (
                  <div key={i} className={`flex gap-4 ${isSam ? '' : 'flex-row-reverse'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      isSam ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400' : 'bg-gradient-to-tr from-cyan-500 to-blue-500 text-black'
                    }`}>
                      {isSam ? 'S' : 'U'}
                    </div>
                    <div className={`max-w-[70%] p-5 rounded-2xl space-y-1.5 ${
                      isSam ? 'bg-white/[0.02] border border-white/5 text-slate-300' : 'bg-cyan-500/5 border border-cyan-500/10 text-slate-200'
                    }`}>
                      <p className="text-xs font-semibold leading-relaxed break-words">{msg.text}</p>
                      <span className="text-[9px] text-slate-600 block text-right">{msg.time}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendMessage} className="p-6 border-t border-white/5 bg-black/20 flex gap-3">
              <input
                required
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={chatLoading ? 'Synapse loading...' : 'Ask Sam CEO for decisions...'}
                disabled={chatLoading}
                className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white outline-none focus:border-cyan-500 transition-colors"
              />
              <button
                type="submit"
                disabled={chatLoading}
                className="px-6 bg-cyan-500 text-black font-black uppercase text-xs rounded-xl hover:scale-105 transition-transform cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: AI JOBS QUEUE */}
        {active === 'jobs' && (
          <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">🤖 Google AI Suite & local model jobs queue</span>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 font-bold uppercase tracking-wider text-[10px] pb-4">
                    <th className="pb-4">Job ID</th>
                    <th className="pb-4">Tool</th>
                    <th className="pb-4">Model Used</th>
                    <th className="pb-4">Output File</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4 text-right">Time Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02] text-slate-300 font-medium">
                  {aiJobs.map((job: any, i: number) => (
                    <tr key={i} className="hover:bg-white/[0.01]">
                      <td className="py-4 font-mono text-cyan-400">{job.id}</td>
                      <td className="py-4 text-white font-bold">{job.tool}</td>
                      <td className="py-4 font-mono text-slate-400">{job.model || 'unknown'}</td>
                      <td className="py-4 font-mono text-slate-300">{job.outputName}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                          job.status === 'completed' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : job.status === 'rendering' 
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="py-4 text-right text-slate-500">{new Date(job.createdAt).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                  {aiJobs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">No active AI jobs queued.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: RESOURCE INVENTORY */}
        {active === 'resources' && (
          <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">⚙️ System Resource Mappings</span>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 font-bold uppercase tracking-wider text-[10px] pb-4">
                    <th className="pb-4">Resource</th>
                    <th className="pb-4">Provider</th>
                    <th className="pb-4">Type</th>
                    <th className="pb-4">Usage State</th>
                    <th className="pb-4">Price Band</th>
                    <th className="pb-4 text-right">Uptime Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02] text-slate-300 font-medium">
                  {RESOURCES.map((r, i) => (
                    <tr key={i}>
                      <td className="py-4 text-white font-bold">{r[0]}</td>
                      <td className="py-4">{r[1]}</td>
                      <td className="py-4">{r[2]}</td>
                      <td className="py-4">{r[3]}</td>
                      <td className="py-4 text-emerald-400 font-bold">{r[4]}</td>
                      <td className="py-4 text-right">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: CHANGE LOG */}
        {active === 'changelog' && (
          <div className="max-w-2xl mx-auto w-full p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">📜 Engineering Version Changelog & system logs</span>
            
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">System Execution Logs (Google Sheets / Local Ledger)</span>
              <div className="space-y-3 font-semibold text-xs leading-relaxed text-slate-300">
                {(data?.systemLogs || []).map((log: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                      <span>{log.department}</span>
                      <span className="text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-300 font-medium">{log.message}</p>
                  </div>
                ))}
                {(!data?.systemLogs || data.systemLogs.length === 0) && (
                  <p className="text-slate-500 text-center py-4">No system logs loaded.</p>
                )}
              </div>
            </div>

            <div className="border-t border-white/5 pt-6 space-y-6">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Version Releases</span>
              <div className="space-y-6 font-semibold text-xs leading-relaxed text-slate-300">
                <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                    <span>Version 2.2 Release</span>
                    <span>30-May-2026</span>
                  </div>
                  <p>Restructured Next.js layouts, added secure cookie-based JWT edge authentication middleware, and implemented real-time analytics aggregation api endpoints.</p>
                </div>

                <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <span>Version 2.1 Release</span>
                    <span>28-May-2026</span>
                  </div>
                  <p>Wired sheetsDb backend to Google Apps Script webhook api, added payment capture webhook hooks, and connected Google Merchant feeds.</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
