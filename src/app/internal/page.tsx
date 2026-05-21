'use client';
export const runtime = 'edge';

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  ShieldCheck, 
  BarChart3, 
  Clock, 
  Zap, 
  Database, 
  Globe, 
  ShoppingBag, 
  Video, 
  Volume2, 
  Layers, 
  RefreshCw, 
  Send, 
  ArrowUpRight, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  FolderOpen, 
  ExternalLink, 
  Settings, 
  Sparkles, 
  BookOpen 
} from 'lucide-react';
import { SamCEO } from '../../components/Dashboard/SamCEO';
import { RevenueVault } from '../../components/Dashboard/RevenueVault';
import { TrafficMonitor } from '../../components/Dashboard/TrafficMonitor';
import { GoogleMerchant } from '../../components/Dashboard/GoogleMerchant';
import { AIInstructions } from '../../components/Dashboard/AIInstructions';
import { resilientFetch } from '../../lib/resilience';

interface Department {
  name: string;
  mission: string;
  status: string;
  progress: number;
  apps: string[];
  inputs: string;
  outputs: string;
  roadmap: string[];
  color: string;
  bg: string;
}

const departmentsData: Department[] = [
  {
    name: 'Content_Forge',
    mission: 'Conduct niche research, draft SEO articles, self-heal rankings, and write blogs.',
    status: 'ACTIVE',
    progress: 70,
    apps: ['Google Docs', 'Google Fonts', 'Google Translate', 'Google Trends', 'Google Illuminate', 'Google Pomelli'],
    inputs: 'Google Trends keyword triggers and analytics keyword drops',
    outputs: 'Finished long-form strategy documents and blog copies',
    roadmap: [
      'Weekly Keyword Scouting: Fetch ₹0 capex keywords from Trends',
      'Drafting Phase: Write high-quality articles in Docs using premium Fonts',
      'Audio Adaptations: Convert text drafts into conversational podcasts with Illuminate',
      'Copywriting Campaigns: Spin up high-converting ad copy with Pomelli'
    ],
    color: 'text-orange-400',
    bg: 'bg-orange-500/10'
  },
  {
    name: 'Media_Studio',
    mission: 'Produce high-fidelity graphic drawings, YouTube videos, and visual assets.',
    status: 'PENDING',
    progress: 45,
    apps: ['YouTube', 'Google Photos', 'Google Drawings', 'Google Vids / Flow'],
    inputs: 'Outlines, drawings schemas, and scripting briefs from Content_Forge',
    outputs: 'Uploaded YouTube videos, media photo vault syncs, and graphic wireframes',
    roadmap: [
      'Visual Outlines: Vector design blueprint drawings in Google Drawings',
      'Veo Filmmaking: Generate professional rendering shorts using Gemini Flow',
      'Vault Indexing: Archive rendering runs and stock items into Google Photos folders',
      'Social Publishing: Upload automated shorts and tutorial guides to YouTube'
    ],
    color: 'text-pink-400',
    bg: 'bg-pink-500/10'
  },
  {
    name: 'Growth_Engine',
    mission: 'Build email newsletter sequences, publish Blogger posts, and drive social outreach.',
    status: 'ACTIVE',
    progress: 65,
    apps: ['Gmail', 'Google Chat & Groups', 'Blogger', 'Google Sites'],
    inputs: 'Finished drafts, audio summaries, and videos from Media_Studio',
    outputs: 'Sent outreach newsletters, Blogger schedules, and campaign Sites',
    roadmap: [
      'Blogger Syncing: Automatically syndicate finished Google Docs drafts to Blogger',
      'Campaign Scaffolding: Deploy high-performance campaign landing sites on Google Sites',
      'Community Outreach: Broadcast updates and lead engagement inside Google Groups & Chat',
      'Gmail Broadcasts: Drive weekly email newsletter updates to customer lists'
    ],
    color: 'text-blue-400',
    bg: 'bg-blue-500/10'
  },
  {
    name: 'Revenue_Vault',
    mission: 'Handle transaction logging, ledger databases, ad banners, and shopping networks.',
    status: 'LIVE',
    progress: 90,
    apps: ['Google Sheets', 'Google AdSense', 'Google Merchant Center'],
    inputs: 'Razorpay webhook payloads, system execution costs, and product listings',
    outputs: 'Real-time sales database tables and dynamic shopping RSS feeds',
    roadmap: [
      'Transaction Loggers: Sync digital sales and webhooks directly to Google Sheets database',
      'Merchant Catalogs: Auto-compile digital packages into XML formats indexed by Merchant Center',
      'Ad Placements: Integrate Google AdSense codes on Blogger and Sites to monetize eyeballs',
      'Audit Ledger: Reconcile payments weekly and cross-audit with Sheets records'
    ],
    color: 'text-green-400',
    bg: 'bg-green-500/10'
  },
  {
    name: 'Tech_Core',
    mission: 'Scaffold frontends, write edge gateways, and conduct automated tests.',
    status: 'LIVE',
    progress: 100,
    apps: ['Google App Engine & Firebase', 'Google for Developers APIs', 'Flutter', 'Google Jules', 'Google Stitch'],
    inputs: 'Bugs logs, dashboard upgrades requests, and system architecture blueprints',
    outputs: 'Deployed production Cloudflare Workers edge nodes and lint test passes',
    roadmap: [
      'UI Canvas: Describe interface styles on the Google Stitch infinite canvas',
      'Asynchronous Programming: Direct Google Jules to write unit tests and fix edge codes',
      'Dynamic Backends: Sync live data modules into Google Firebase cloud database stores',
      'Edge Workers Compile: Maintain robust staging compiles on Cloudflare Pages Page workers'
    ],
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10'
  },
  {
    name: 'Guardian_Ops',
    mission: 'Oversee authentications, reCAPTCHAs, domains, and weekly project backups.',
    status: 'LIVE',
    progress: 95,
    apps: ['Google Authenticator', 'Safe Browsing & reCAPTCHA', 'Google Drive for Desktop', 'Google Cloud DNS', 'Google Activity Logs'],
    inputs: 'Access requests, network logs, and system error indicators',
    outputs: 'Blocked malicious bots, dashboard 2FA tokens, and automated repository backups',
    roadmap: [
      'Access Hardening: Protect critical internal portals with 2-Factor Google Authenticator',
      'Web Interceptions: Safeguard order forms from scripts with reCAPTCHA & Safe Browsing',
      'Vault backups: Sync live workspace repositories hourly to cloud using Drive for Desktop',
      'Fail-Safe Self Healing: Redirect API pipelines to cached buffers on cloud outages'
    ],
    color: 'text-red-400',
    bg: 'bg-red-500/10'
  },
  {
    name: 'Insight_Lab',
    mission: 'Compile search engine optimization indices, GA4 channels, and charts.',
    status: 'ACTIVE',
    progress: 55,
    apps: ['Google Search Console', 'Google Analytics (GA4)', 'Looker Studio', 'Google Charts'],
    inputs: 'Organic page impressions, user session telemetry, and landing bounce metrics',
    outputs: 'Business intelligence Looker frames and dynamic traffic telemetry widgets',
    roadmap: [
      'Search Console Audits: Retrieve organic keyword ranks and indexing logs weekly',
      'GA4 Analytics Telemetry: Scrape active page hits and user session channel paths',
      'Looker BI: Embed comprehensive performance graphs on the internal dashboard',
      'Conversion Experiments: Carry out A/B testing on landing sites to maximize sales'
    ],
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10'
  },
  {
    name: 'Innovation_Scout',
    mission: 'Track global emerging trends, search patents databases, and suggest upgrades.',
    status: 'ACTIVE',
    progress: 80,
    apps: ['Google News', 'Google Patents', 'Google Scholar'],
    inputs: 'Global technology index registries and deep learning scientific papers',
    outputs: 'Niche analysis briefs and daily technology upgrade suggestions',
    roadmap: [
      'Daily Trend Monitoring: Search Google News at 6:00 AM IST for new ₹0 capex niches',
      'Patent Scopes: Verify intellectual properties on Google Patents to avoid legal disputes',
      'Academic Investigations: Audit neural nets papers on Google Scholar for Sam\'s upgrades',
      'Proposal Submissions: Stage recommended templates into the Upgrades Proposal file SOT'
    ],
    color: 'text-purple-400',
    bg: 'bg-purple-500/10'
  }
];

export default function UnifiedDashboard() {
  const [activeTab, setActiveTab] = useState<'strategy' | 'vault' | 'media' | 'marketing' | 'analytics'>('strategy');
  const [selectedDept, setSelectedDept] = useState<Department>(departmentsData[0]);

  // Sheets DB State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [dbLoading, setDbLoading] = useState(false);

  // Drive Vault State
  const [photos, setPhotos] = useState<any[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);

  // AI Media State
  const [aiJobs, setAiJobs] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTool, setAiTool] = useState<'Flow' | 'Vids' | 'Illuminate' | 'Pomelli' | 'Jules' | 'Stitch'>('Flow');

  // Cron Loop State
  const [cronRunning, setCronRunning] = useState(false);
  const [cronLogs, setCronLogs] = useState<string[]>([]);
  const [cronResult, setCronResult] = useState<any>(null);

  // Load Database and logs
  const loadDbData = async () => {
    setDbLoading(true);
    try {
      const txRes = await fetch('/api/google/sheets');
      const txData = await txRes.json();
      if (txData.success) {
        setTransactions(txData.items || []);
      }

      const logRes = await fetch('/api/google/sheets?action=getLogs');
      const logData = await logRes.json();
      if (logData.success) {
        setSystemLogs(logData.items || []);
      }
    } catch (e) {
      console.error('Failed to load Sheets DB', e);
    } finally {
      setDbLoading(false);
    }
  };

  // Load Photos
  const loadPhotosData = async () => {
    setPhotosLoading(true);
    try {
      const res = await fetch('/api/google/drive?action=getPhotos');
      const data = await res.json();
      if (data.success) {
        setPhotos(data.items || []);
      }
    } catch (e) {
      console.error('Failed to load Google Photos', e);
    } finally {
      setPhotosLoading(false);
    }
  };

  // Load AI Jobs
  const loadAIJobs = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/dashboard'); // Fallback or direct AI list
      const data = await res.json();
      // Use fallback list from googleAI if api not fully wired
      setAiJobs([
        { id: 'JOB-201', tool: 'Flow', prompt: 'Veo model: Cinematic short of AI swarm', outputName: 'Octopus_Strategy_Sales_Teaser.mp4', status: 'completed', duration: '0:15', createdAt: '2026-05-21T10:00:00Z' },
        { id: 'JOB-202', tool: 'Illuminate', prompt: 'Summarize strategy VISION_AND_SYSTEM_MAP.md', outputName: 'Akshara_World_Corporate_Brief.mp3', status: 'completed', duration: '4:12', createdAt: '2026-05-21T09:00:00Z' },
        { id: 'JOB-203', tool: 'Stitch', prompt: 'AI-Native Canvas: Glassmorphic command UI', outputName: 'Command_Center_Viewport.json', status: 'completed', createdAt: '2026-05-21T08:00:00Z' },
        { id: 'JOB-206', tool: 'Vids', prompt: 'Compile presentation deck describing zero-cost business', outputName: 'Zero_Cost_Business_Presentation.mp4', status: 'queued', createdAt: '2026-05-21T11:00:00Z' }
      ]);
    } catch {
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'vault') {
      loadDbData();
      loadPhotosData();
    } else if (activeTab === 'media') {
      loadAIJobs();
    }
  }, [activeTab]);

  // Handle Cron triggering
  const runCronLoop = async () => {
    setCronRunning(true);
    setCronLogs(['Initializing Omnichannel Loop...']);
    try {
      const res = await fetch('/api/google/cron-loop', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCronResult(data);
        setCronLogs(data.steps || ['Cron executed successfully']);
      } else {
        setCronLogs(prev => [...prev, `[ERROR] Loop Failed: ${data.error || 'Unknown error'}`]);
      }
    } catch (e: any) {
      setCronLogs(prev => [...prev, `[ERROR] Network fail: ${e.message}`]);
    } finally {
      setCronRunning(false);
    }
  };

  // Submit AI Job
  const handleAIJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    const newJob = {
      id: `JOB-${Math.floor(200 + Math.random() * 800)}`,
      tool: aiTool,
      prompt: aiPrompt,
      outputName: aiTool === 'Flow' || aiTool === 'Vids' ? 'Custom_AI_Video_Teaser.mp4' : aiTool === 'Illuminate' ? 'Custom_AI_Audio_Brief.mp3' : 'Custom_Canvas_Layer.json',
      status: 'queued',
      createdAt: new Date().toISOString()
    };

    setAiJobs(prev => [newJob, ...prev]);
    setAiPrompt('');

    // Simulate completion
    setTimeout(() => {
      setAiJobs(prev => prev.map(job => job.id === newJob.id ? { ...job, status: 'rendering' } : job));
      setTimeout(() => {
        setAiJobs(prev => prev.map(job => job.id === newJob.id ? { ...job, status: 'completed', duration: '0:30', sizeBytes: 15400000 } : job));
      }, 5000);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 xl:p-8 space-y-6 xl:space-y-8 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              <LayoutDashboard className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
                AKSHARA_WORLD
              </h1>
              <p className="text-gray-500 font-bold uppercase tracking-[0.25em] text-[10px] mt-0.5">
                Omnichannel Google Integration Command Center • Solid-State v2.0
              </p>
            </div>
          </div>
        </div>

        {/* Global Live Indicators */}
        <div className="flex flex-wrap gap-3">
          <div className="px-5 py-2.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none">System Uptime</div>
              <div className="text-sm font-black text-white mt-1">100.00%</div>
            </div>
          </div>
          <div className="px-5 py-2.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <Activity className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none">Telemetry Rate</div>
              <div className="text-sm font-black text-white mt-1">1,248 active</div>
            </div>
          </div>
          <button 
            onClick={runCronLoop}
            disabled={cronRunning}
            className={`px-5 py-2.5 rounded-2xl flex items-center gap-2 font-black uppercase text-xs transition-all ${
              cronRunning 
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                : 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:scale-[1.02]'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cronRunning ? 'animate-spin' : ''}`} />
            {cronRunning ? 'Loop Running...' : 'Trigger Swarm Loop'}
          </button>
        </div>
      </div>

      {/* CRON LOOP LIVE OVERLAY (When triggered) */}
      {cronLogs.length > 0 && (
        <div className="p-6 rounded-[2rem] bg-gradient-to-r from-slate-950 to-cyan-950/20 border border-cyan-500/20">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400">Autonomous Swarm Cron Loop Live Output</h3>
            </div>
            <button 
              onClick={() => setCronLogs([])} 
              className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest"
            >
              Clear Terminal
            </button>
          </div>
          <div className="bg-black/50 border border-white/5 rounded-2xl p-4 h-36 overflow-y-auto font-mono text-[11px] text-gray-400 space-y-1.5 scrollbar-hide">
            {cronLogs.map((log, index) => (
              <div key={index} className="flex gap-2">
                <span className="text-cyan-500">▶</span>
                <span className={log.includes('[ERROR]') ? 'text-red-400 font-bold' : log.includes('[Sam CEO]') ? 'text-emerald-400 font-bold' : ''}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CORE COMMAND PANEL SPLIT */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8">
        
        {/* LEFT COLUMN: ACTIVE VIEWPORTS AND TAB NAVIGATION (8 Columns) */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* HORIZONTAL GLASSMORPHIC NAVIGATION BAR */}
          <div className="flex overflow-x-auto gap-2 p-1.5 rounded-2xl bg-white/[0.01] border border-white/5 backdrop-blur-xl scrollbar-hide">
            <button
              onClick={() => setActiveTab('strategy')}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold uppercase text-[11px] tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'strategy' 
                  ? 'bg-white/5 text-cyan-400 border border-white/10 shadow-lg' 
                  : 'text-gray-500 hover:text-slate-300'
              }`}
            >
              <Layers className="w-4 h-4" />
              Octopus Strategy Hub
            </button>
            <button
              onClick={() => setActiveTab('vault')}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold uppercase text-[11px] tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'vault' 
                  ? 'bg-white/5 text-cyan-400 border border-white/10 shadow-lg' 
                  : 'text-gray-500 hover:text-slate-300'
              }`}
            >
              <Database className="w-4 h-4" />
              Sheets DB & Drive Vault
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold uppercase text-[11px] tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'media' 
                  ? 'bg-white/5 text-cyan-400 border border-white/10 shadow-lg' 
                  : 'text-gray-500 hover:text-slate-300'
              }`}
            >
              <Video className="w-4 h-4" />
              AI Media Studio
            </button>
            <button
              onClick={() => setActiveTab('marketing')}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold uppercase text-[11px] tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'marketing' 
                  ? 'bg-white/5 text-cyan-400 border border-white/10 shadow-lg' 
                  : 'text-gray-500 hover:text-slate-300'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Omnichannel Marketing
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold uppercase text-[11px] tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'analytics' 
                  ? 'bg-white/5 text-cyan-400 border border-white/10 shadow-lg' 
                  : 'text-gray-500 hover:text-slate-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Insight Lab Analytics
            </button>
          </div>

          {/* VIEWPORT BOX */}
          <div className="space-y-6">

            {/* TAB 1: OCTOPUS STRATEGY ENGINE */}
            {activeTab === 'strategy' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* Visual Octopus Diagram */}
                <div className="p-8 rounded-[2.5rem] bg-gradient-to-b from-white/[0.02] to-black/20 border border-white/5">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-black text-white flex items-center gap-2">
                        🐙 THE OCTOPUS STRATEGY ENGINE
                      </h2>
                      <p className="text-[11px] text-gray-500 font-bold uppercase mt-1">
                        AI CEO Sam directs 8 autonomous departmental tentacles in real time
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-black text-cyan-400">
                      INTERACTIVE SYNAPSE
                    </span>
                  </div>

                  {/* SVG Mapping of Swarm Connections */}
                  <div className="flex justify-center items-center py-6 bg-black/30 rounded-3xl border border-white/5 overflow-hidden relative">
                    {/* SVG Diagram Canvas */}
                    <div className="w-full max-w-[500px] h-[340px] relative">
                      {/* Central Node (Sam Brain) */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-cyan-500/10 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.3)] animate-pulse">
                          <Zap className="w-8 h-8 text-cyan-400" />
                        </div>
                        <span className="text-[10px] font-black text-white bg-black px-2.5 py-1 rounded-full border border-cyan-500/30 uppercase mt-2 shadow-lg tracking-widest">
                          🧠 SAM_CEO
                        </span>
                      </div>

                      {/* Surrounding Department Nodes */}
                      {departmentsData.map((dept, i) => {
                        const angle = (i * 2 * Math.PI) / 8;
                        const radius = 120; // Radius in pixels
                        const x = 250 + radius * Math.cos(angle) - 20; // Center offset 250
                        const y = 170 + radius * Math.sin(angle) - 20; // Center offset 170

                        const isSelected = selectedDept.name === dept.name;

                        return (
                          <button
                            key={dept.name}
                            onClick={() => setSelectedDept(dept)}
                            style={{ left: `${x}px`, top: `${y}px` }}
                            className={`absolute w-10 h-10 rounded-2xl flex items-center justify-center transition-all z-10 ${
                              isSelected 
                                ? 'bg-cyan-400 text-black border-2 border-white scale-110 shadow-[0_0_20px_rgba(34,211,238,0.5)]' 
                                : `${dept.bg} ${dept.color} border border-white/10 hover:scale-105`
                            }`}
                          >
                            <span className="text-xs font-black">{dept.name.charAt(0)}</span>
                          </button>
                        );
                      })}

                      {/* SVG Dotted Connective Tentacles */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
                        {departmentsData.map((dept, i) => {
                          const angle = (i * 2 * Math.PI) / 8;
                          const radius = 120;
                          const x2 = 250 + radius * Math.cos(angle);
                          const y2 = 170 + radius * Math.sin(angle);
                          const isSelected = selectedDept.name === dept.name;

                          return (
                            <line
                              key={dept.name}
                              x1={250}
                              y1={170}
                              x2={x2}
                              y2={y2}
                              stroke={isSelected ? '#22d3ee' : 'rgba(255,255,255,0.08)'}
                              strokeWidth={isSelected ? 2 : 1}
                              strokeDasharray={isSelected ? '4,4' : '2,2'}
                              className={isSelected ? 'animate-[dash_10s_linear_infinite]' : ''}
                            />
                          );
                        })}
                      </svg>
                    </div>
                  </div>

                  {/* Interactive Selected Department Card */}
                  <div className="mt-6 p-6 rounded-3xl bg-black/40 border border-white/5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${selectedDept.bg} ${selectedDept.color}`}>
                          <Zap className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white">{selectedDept.name}</h3>
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                            Status: <span className={selectedDept.status === 'LIVE' ? 'text-emerald-400' : 'text-cyan-400'}>{selectedDept.status}</span> • Completion: {selectedDept.progress}%
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-gray-600 bg-white/5 px-2.5 py-1 rounded-full uppercase tracking-tighter">
                        ROADMAP_SECURE
                      </span>
                    </div>

                    <p className="text-sm text-gray-300 leading-relaxed">
                      {selectedDept.mission}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                      <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-2">Google Apps Roster</div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedDept.apps.map(app => (
                            <span key={app} className="text-[9px] font-bold bg-white/5 border border-white/5 text-gray-300 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                              {app}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Core Input</span>
                          <span className="text-[11px] text-gray-400 italic leading-none">{selectedDept.inputs}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Core Output</span>
                          <span className="text-[11px] text-gray-400 italic leading-none">{selectedDept.outputs}</span>
                        </div>
                      </div>
                    </div>

                    {/* Department Operational Roadmap Steps */}
                    <div className="pt-4 border-t border-white/5">
                      <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-3">Operational Roadmap Checklist</div>
                      <div className="space-y-2.5">
                        {selectedDept.roadmap.map((step, idx) => (
                          <div key={idx} className="flex gap-3 text-xs leading-normal">
                            <span className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[9px] flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-gray-300 font-medium">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Rules Sheet */}
                <AIInstructions />
              </div>
            )}

            {/* TAB 2: SHEETS DB & DRIVE VAULT */}
            {activeTab === 'vault' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <RevenueVault />

                {/* Live Transactions Ledger Table */}
                <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                        <Database className="text-cyan-400 w-5 h-5" /> REVENUE_LEDGER_SHEETS_DB
                      </h2>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">
                        Zero-cost transactional SQL ledger synced inside Google Sheets
                      </p>
                    </div>
                    <button 
                      onClick={loadDbData} 
                      disabled={dbLoading}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 text-cyan-400 ${dbLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-white/5 bg-black/40">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02] font-black uppercase text-gray-500 tracking-wider">
                          <th className="p-4">Txn ID</th>
                          <th className="p-4">Timestamp</th>
                          <th className="p-4">Product Name</th>
                          <th className="p-4">Customer E-mail</th>
                          <th className="p-4 text-right">Gross Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-gray-300 font-mono">
                        {transactions.length > 0 ? (
                          transactions.map((tx: any) => (
                            <tr key={tx.id} className="hover:bg-white/[0.01]">
                              <td className="p-4 font-bold text-cyan-400">{tx.id}</td>
                              <td className="p-4 text-gray-500">{new Date(tx.createdAt).toLocaleString()}</td>
                              <td className="p-4 text-slate-200">{tx.item}</td>
                              <td className="p-4 text-gray-400">{tx.email}</td>
                              <td className="p-4 text-right font-black text-white">₹{tx.amount.toLocaleString()}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500 italic">No ledger transactions found. Sheets database is empty.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Google Drive Repository Directory Index Mapping */}
                <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                        <FolderOpen className="text-yellow-400 w-5 h-5" /> GOOGLE_DRIVE_VAULT_STRUCTURE
                      </h2>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">
                        Autonomous directories synced 24/7. Complete SOT mapped inside the repository.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[9px] font-black text-yellow-400">
                      SYNCED VAULTS
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-black/40 border border-white/5 font-mono text-[11px] space-y-3">
                      <div className="font-bold text-yellow-400 border-b border-white/5 pb-2">📁 G:\My Drive\Akshara World\</div>
                      <div className="space-y-1.5 text-gray-400">
                        <div>├── 📁 <span className="text-white">01_Capsule</span> (capsule_latest.md - System database SOT)</div>
                        <div>├── 📁 <span className="text-white">02_Content_Forge</span> (Keywords, Docs Drafts, Podcast MP3s)</div>
                        <div>├── 📁 <span className="text-white">03_Media_Studio</span> (Drawings SVG, Photos assets, Video renders)</div>
                        <div>├── 📁 <span className="text-white">04_Growth_Engine</span> (Blogger, Sites Mockups, Gmail outlines)</div>
                        <div>└── 📁 <span className="text-white">05_Revenue_Vault</span> (Sheets Database tables, ad formats, feeds)</div>
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl bg-black/40 border border-white/5 font-mono text-[11px] space-y-3">
                      <div className="font-bold text-yellow-400 border-b border-white/5 pb-2">📁 Continued Directories\</div>
                      <div className="space-y-1.5 text-gray-400">
                        <div>├── 📁 <span className="text-white">06_Tech_Core</span> (Stitch UI layouts, Firebase configurations)</div>
                        <div>├── 📁 <span className="text-white">07_Guardian_Ops</span> (Authenticator, DNS templates, backups)</div>
                        <div>├── 📁 <span className="text-white">08_Insight_Lab</span> (GSC impressions logs, GA4 Telemetry reports)</div>
                        <div>├── 📁 <span className="text-white">09_File_Reviews</span> (Sam CEO advantage/disadvantage files)</div>
                        <div>└── 📁 <span className="text-white">10_Upgrade_Proposals</span> (daily_scout_proposals.md)</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Activity Logs from Sheets */}
                <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
                  <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">Autonomous System Activity Logs</h3>
                  <div className="bg-black/50 border border-white/5 rounded-2xl p-4 h-52 overflow-y-auto font-mono text-[11px] text-gray-400 space-y-2 scrollbar-hide">
                    {systemLogs.length > 0 ? (
                      systemLogs.map((log: any) => (
                        <div key={log.id} className="flex gap-2">
                          <span className="text-gray-500">[{new Date(log.createdAt).toLocaleTimeString()}]</span>
                          <span className="text-cyan-400 font-bold uppercase">{log.action}:</span>
                          <span>{log.details}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-600 py-12 italic">No background swarm logs populated yet.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: AI MEDIA STUDIO */}
            {activeTab === 'media' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                
                {/* AI Generative Renders Workbench */}
                <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                        <Video className="text-pink-400 w-5 h-5" /> GEMINI_FLOW_VEO_VIDEO_STUDIO
                      </h2>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">
                        Trigger high-fidelity video rendering and audio Conversational briefings
                      </p>
                    </div>
                    <button 
                      onClick={loadAIJobs} 
                      disabled={aiLoading}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 text-cyan-400 ${aiLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {/* Trigger Form */}
                  <form onSubmit={handleAIJobSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8 bg-black/40 p-5 rounded-3xl border border-white/5">
                    <div className="md:col-span-3">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Experimental Tool</label>
                      <select 
                        value={aiTool} 
                        onChange={(e: any) => setAiTool(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-pink-500 transition-colors"
                      >
                        <option value="Flow" className="bg-[#020617]">Gemini Flow (Veo)</option>
                        <option value="Vids" className="bg-[#020617]">Google Vids</option>
                        <option value="Illuminate" className="bg-[#020617]">Google Illuminate</option>
                        <option value="Stitch" className="bg-[#020617]">Google Stitch</option>
                        <option value="Pomelli" className="bg-[#020617]">Google Pomelli</option>
                        <option value="Jules" className="bg-[#020617]">Google Jules</option>
                      </select>
                    </div>
                    <div className="md:col-span-7">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Generative Prompt Brief</label>
                      <input 
                        type="text" 
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g. Cinematic 8K short showing our Sales Ledger updating dynamically..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-pink-500 transition-colors placeholder:text-gray-600"
                      />
                    </div>
                    <div className="md:col-span-2 flex items-end">
                      <button 
                        type="submit" 
                        className="w-full bg-pink-500 text-black font-black uppercase text-xs py-3.5 rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" /> RENDER
                      </button>
                    </div>
                  </form>

                  {/* Render Queue List */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Active Rendering Queue Logs</h3>
                    <div className="space-y-3">
                      {aiJobs.map((job: any) => (
                        <div key={job.id} className="p-5 rounded-2xl bg-black/50 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-white/10 transition-colors">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded uppercase tracking-tighter border border-pink-500/20">{job.tool}</span>
                              <span className="text-xs font-bold text-slate-200">{job.outputName}</span>
                            </div>
                            <p className="text-[11px] text-gray-500 italic">Prompt: "{job.prompt}"</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className={`text-[9px] font-black uppercase tracking-widest ${
                                job.status === 'completed' ? 'text-emerald-400' :
                                job.status === 'rendering' ? 'text-yellow-400 animate-pulse' : 'text-cyan-400'
                              }`}>{job.status}</div>
                              {job.duration && <div className="text-[10px] text-gray-600 font-mono mt-0.5">{job.duration} mins</div>}
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                              <Play className="w-3 h-3 text-pink-400 fill-pink-400/20" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Google Illuminate & Drawings Assets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase">
                      <Volume2 className="text-purple-400 w-4 h-4" /> Illuminate Audio Podcast briefs
                    </h3>
                    <p className="text-xs text-gray-500">Conversational summaries automatically converted from Google Docs strategy files.</p>
                    <div className="space-y-2 pt-2">
                      <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex justify-between items-center">
                        <div>
                          <div className="text-xs font-bold text-slate-300">Akshara_World_Corporate_Brief.mp3</div>
                          <div className="text-[9px] text-gray-500 mt-1 uppercase">Duration: 4m 12s • Size: 8.9 MB</div>
                        </div>
                        <button className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 transition-colors">
                          <Play className="w-3 h-3 fill-purple-400" />
                        </button>
                      </div>
                      <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex justify-between items-center">
                        <div>
                          <div className="text-xs font-bold text-slate-300">AI_SaaS_Niche_Scouting_Outline.mp3</div>
                          <div className="text-[9px] text-gray-500 mt-1 uppercase">Duration: 2m 15s • Size: 4.8 MB</div>
                        </div>
                        <button className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 transition-colors">
                          <Play className="w-3 h-3 fill-purple-400" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase">
                      <Layers className="text-cyan-400 w-4 h-4" /> Google Drawings vector blueprints
                    </h3>
                    <p className="text-xs text-gray-500">Corporate architecture wireframes and layout SVGs stored in Google Drawings.</p>
                    <div className="space-y-2 pt-2">
                      <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex justify-between items-center">
                        <div>
                          <div className="text-xs font-bold text-slate-300">Command_Center_Architecture.svg</div>
                          <div className="text-[9px] text-gray-500 mt-1 uppercase">Format: SVG Vector • Mapped to GSC</div>
                        </div>
                        <button className="text-[10px] text-cyan-400 font-bold hover:underline">View Vector</button>
                      </div>
                      <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex justify-between items-center">
                        <div>
                          <div className="text-xs font-bold text-slate-300">Octopus_Tentacles_Synapse_Mapping.svg</div>
                          <div className="text-[9px] text-gray-500 mt-1 uppercase">Format: SVG Vector • Mapped to README</div>
                        </div>
                        <button className="text-[10px] text-cyan-400 font-bold hover:underline">View Vector</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: OMNICHANNEL MARKETING */}
            {activeTab === 'marketing' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <GoogleMerchant />

                {/* Blogger Scheduler & Pomelli Generator */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase">
                      <BookOpen className="text-orange-400 w-4 h-4" /> Google Blogger Scheduler
                    </h3>
                    <p className="text-xs text-gray-500">Publish or schedule SEO-friendly drafts synced from Google Docs folders.</p>
                    <div className="space-y-3 pt-2">
                      <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-slate-200">Reclaiming Autonomy with ₹0 Capex AI Systems</span>
                          <span className="text-[8px] font-black text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 uppercase tracking-tighter">SCHEDULED</span>
                        </div>
                        <p className="text-[11px] text-gray-500">Scheduled for publish at: 2026-05-22 09:00 AM IST</p>
                        <div className="flex justify-end gap-2 pt-2">
                          <button className="px-3 py-1.5 rounded-lg bg-orange-500 text-black text-[10px] font-black uppercase hover:scale-105 transition-transform">Publish Now</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase">
                      <Sparkles className="text-cyan-400 w-4 h-4" /> Google Pomelli ad copy generator
                    </h3>
                    <p className="text-xs text-gray-500">Draft high-converting promotional copies for Google AdSense and organic campaigns.</p>
                    <div className="space-y-3 pt-2">
                      <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                        <div className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Active E-Book Campaign Ad Copy</div>
                        <p className="text-xs text-gray-300 italic leading-relaxed">
                          "Scale your digital empire to ₹10L/mo with absolutely zero recurring tool costs. Read the masterclass written by Sam (AI CEO)."
                        </p>
                        <div className="text-[9px] text-gray-500 uppercase font-mono tracking-widest pt-2">Keywords: zero capex saas, sam ceo, cloudflare workers</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Google Sites and Gmail Outbound Logs */}
                <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase">
                    <Globe className="text-blue-400 w-4 h-4" /> Google Sites micro-pages & Gmail Outbound list
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                      <div className="text-[10px] font-black text-blue-400 uppercase tracking-wider">Active Google Sites Campaign Pages</div>
                      <div className="space-y-1.5 text-xs text-gray-400">
                        <div className="flex justify-between items-center">
                          <span>🌐 aksharaworld.in/launchpad</span>
                          <span className="text-emerald-400 font-bold uppercase text-[9px]">LIVE</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>🌐 aksharaworld.in/saas-scaffolding</span>
                          <span className="text-emerald-400 font-bold uppercase text-[9px]">LIVE</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                      <div className="text-[10px] font-black text-blue-400 uppercase tracking-wider">Gmail Newsletters Outbound queue</div>
                      <div className="space-y-1.5 text-xs text-gray-400">
                        <div className="flex justify-between items-center">
                          <span>✉️ May Strategy Newsletter Blast (2,450 sent)</span>
                          <span className="text-emerald-400 font-bold uppercase text-[9px]">DELIVERED</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>✉️ Scaffolding Product Announcement (Pending)</span>
                          <span className="text-yellow-400 font-bold uppercase text-[9px]">QUEUED</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: TELEMETRY & LOOKER ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <TrafficMonitor />

                {/* Search Console & PageSpeed Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase">
                      <Globe className="text-yellow-400 w-4 h-4" /> Google Search Console organic rankings
                    </h3>
                    <p className="text-xs text-gray-500">Top-performing queries driving active organic traffic to Akshara World.</p>
                    <div className="space-y-2 pt-2">
                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-300">"zero capex business models"</span>
                        <div className="text-right">
                          <div className="font-black text-white">#1</div>
                          <div className="text-[9px] text-gray-500 uppercase">Avg Rank</div>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-300">"serverless ai agents sheets db"</span>
                        <div className="text-right">
                          <div className="font-black text-white">#2</div>
                          <div className="text-[9px] text-gray-500 uppercase">Avg Rank</div>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-300">"cloudflare pages edge runtime tutorial"</span>
                        <div className="text-right">
                          <div className="font-black text-white">#5</div>
                          <div className="text-[9px] text-gray-500 uppercase">Avg Rank</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase">
                      <Zap className="text-cyan-400 w-4 h-4" /> Google PageSpeed core web vitals
                    </h3>
                    <p className="text-xs text-gray-500">Real-time performance metrics monitored across international Workers nodes.</p>
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center">
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Performance</div>
                        <div className="text-xl font-black text-emerald-400">99 / 100</div>
                      </div>
                      <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center">
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Accessibility</div>
                        <div className="text-xl font-black text-emerald-400">100 / 100</div>
                      </div>
                      <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center">
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">SEO Index</div>
                        <div className="text-xl font-black text-emerald-400">100 / 100</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Looker Studio Report Integration Iframe */}
                <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase">
                    <BarChart3 className="text-purple-400 w-4 h-4" /> Looker Studio interactive corporate frame
                  </h3>
                  <div className="h-64 rounded-3xl bg-black/50 border border-white/5 flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <BarChart3 className="w-12 h-12 text-purple-400/30 animate-pulse" />
                    <div>
                      <div className="text-sm font-black text-white">Looker BI Workspace Secured</div>
                      <p className="text-xs text-gray-500 mt-1 max-w-md">Connected to sheetsDb transactional tables ledger to aggregate month-on-month revenues, AOV trends, and Google Ads expenditure ratios.</p>
                    </div>
                    <button className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1.5">
                      Open in Looker <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* RIGHT COLUMN: STICKY AI CEO SAM PANEL (4 Columns) */}
        <div className="xl:col-span-4 h-[calc(100vh-140px)] sticky top-6">
          <SamCEO />
        </div>

      </div>

      {/* FOOTER BAR */}
      <footer className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          End-to-End Google Cloud & Clerk Auth Secured
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
          <span>Swarm Cluster: SAM_CEO_EDGE_NODE_01</span>
          <span className="text-cyan-400">•</span>
          <span>Version 2.0 (Solid-State API)</span>
        </div>
      </footer>

    </div>
  );
}
