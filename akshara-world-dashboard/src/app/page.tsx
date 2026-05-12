import { 
  LayoutDashboard, 
  CheckCircle, 
  Activity, 
  Target, 
  MessageSquare, 
  Settings, 
  CreditCard, 
  Cpu, 
  ShieldCheck, 
  Zap 
} from "lucide-react";

export default function Home() {
  const sections = [
    { name: "Business Overview", icon: LayoutDashboard },
    { name: "Approvals Queue", icon: CheckCircle, alert: 3 },
    { name: "Live Activity", icon: Activity },
    { name: "Project Tracker", icon: Target },
    { name: "Chat with Sam", icon: MessageSquare },
    { name: "Revenue Vault", icon: CreditCard },
    { name: "Tech Core", icon: Cpu },
    { name: "Security", icon: ShieldCheck },
    { name: "Innovation", icon: Zap },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold">A</div>
          <h1 className="font-bold text-xl tracking-tight">Akshara</h1>
        </div>
        
        <nav className="flex-1 space-y-1">
          {sections.map((item) => (
            <a 
              key={item.name} 
              href="#" 
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} className="text-slate-400 group-hover:text-blue-400" />
                <span className="text-sm font-medium text-slate-300 group-hover:text-white">{item.name}</span>
              </div>
              {item.alert && (
                <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{item.alert}</span>
              )}
            </a>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
            <div className="text-xs">
              <p className="font-medium text-slate-200">Owner Account</p>
              <p className="text-slate-500">Authenticated</p>
            </div>
          </div>
          <Settings size={18} className="text-slate-500 cursor-pointer hover:text-white" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-950 p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold">Live Command Dashboard</h2>
            <p className="text-slate-400">Welcome back, Owner. Sam is monitoring the systems.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Sam Brain: Online</span>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Revenue Card */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-slate-400">Revenue (Monthly)</h3>
              <CreditCard size={20} className="text-blue-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">₹0.00</span>
              <span className="text-green-400 text-sm font-medium">+0%</span>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between text-xs text-slate-500">
              <span>Goal: ₹10,000</span>
              <span>Next settlement: N/A</span>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="col-span-1 lg:col-span-2 bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-3xl h-64 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-400 flex items-center gap-2">
                <Activity size={18} /> Live Activity Feed
              </h3>
              <button className="text-xs text-blue-400 hover:underline">View All</button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-blue-400">S</div>
                <div>
                  <p className="text-slate-200"><span className="font-bold text-blue-400">Sam</span> initialized Tech_Core audit.</p>
                  <p className="text-[10px] text-slate-500">2 minutes ago • System</p>
                </div>
              </div>
              <div className="flex gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-purple-400">I</div>
                <div>
                  <p className="text-slate-200"><span className="font-bold text-purple-400">Innovation_Scout</span> proposed niche update.</p>
                  <p className="text-[10px] text-slate-500">1 hour ago • Dept</p>
                </div>
              </div>
            </div>
          </div>

          {/* Approvals Section */}
          <div className="col-span-1 lg:col-span-3 bg-blue-600/10 border border-blue-500/20 p-8 rounded-3xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle className="text-blue-400" /> Pending Approvals
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Approval Item */}
              <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
                <div className="flex justify-between mb-3">
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Tech_Core</span>
                  <span className="text-[10px] text-slate-500">ID: APR-003</span>
                </div>
                <h4 className="font-bold mb-1">Finalize Resource Matrix</h4>
                <p className="text-xs text-slate-400 mb-6">Authorize Sam to lock resources.json and begin API integrations.</p>
                <div className="flex gap-3">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl text-xs font-bold transition-all">Approve</button>
                  <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-xl text-xs font-bold transition-all">Reject</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
