import React from 'react';
import { 
  Zap, 
  BarChart3, 
  DollarSign, 
  Users, 
  FileText, 
  Activity, 
  ShieldCheck, 
  Search,
  ChevronRight,
  Clock
} from 'lucide-react';

const depts = [
  { name: 'Tech_Core', mission: 'Infra, code, and 24/7 cloud deployment.', status: 'LIVE', progress: 100, icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { name: 'Innovation_Scout', mission: 'Daily R&D, trend hunter, and risk forecaster.', status: 'ACTIVE', progress: 85, icon: Search, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { name: 'Revenue_Vault', mission: 'Monetization, Razorpay, and bookkeeper.', status: 'LIVE', progress: 90, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
  { name: 'Growth_Engine', mission: 'Social distribution (IG, YT, FB) and email.', status: 'ACTIVE', progress: 65, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { name: 'Content_Forge', mission: 'Research and write SEO blog content.', status: 'ACTIVE', progress: 70, icon: FileText, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { name: 'Media_Studio', mission: 'Images, video, audio, and YT Shorts.', status: 'PENDING', progress: 30, icon: Activity, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { name: 'Guardian_Ops', mission: 'Self-healing, compliance, and backups.', status: 'LIVE', progress: 95, icon: ShieldCheck, color: 'text-red-400', bg: 'bg-red-500/10' },
  { name: 'Insight_Lab', mission: 'Analytics, GA4, and A/B testing.', status: 'ACTIVE', progress: 50, icon: Activity, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
];

export const DepartmentMatrix = () => {
  return (
    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold flex items-center gap-3">
          <Activity className="text-cyan-400" /> DEPARTMENT_COMMAND_CENTER
        </h2>
        <div className="flex gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                SYSTEM_STABLE
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {depts.map((dept) => (
          <div key={dept.name} className="p-5 rounded-3xl bg-black/40 border border-white/5 hover:border-white/20 transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${dept.bg}`}>
                <dept.icon className={`w-5 h-5 ${dept.color}`} />
              </div>
              <div className="text-right">
                <div className={`text-[9px] font-black uppercase tracking-tighter ${
                    dept.status === 'LIVE' ? 'text-emerald-400' : 
                    dept.status === 'ACTIVE' ? 'text-cyan-400' : 'text-gray-500'
                }`}>{dept.status}</div>
                <div className="text-lg font-black text-white">{dept.progress}%</div>
              </div>
            </div>
            
            <div className="mb-4">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{dept.name}</div>
                <p className="text-[11px] text-gray-500 leading-tight line-clamp-2">{dept.mission}</p>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[9px] text-gray-600 font-bold uppercase">
                    <Clock className="w-3 h-3" />
                    2m ago
                </div>
                <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-cyan-400 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
