'use client';

import React from 'react';
import { AIInstructions } from '../../components/Dashboard/AIInstructions';
import { DepartmentMatrix } from '../../components/Dashboard/DepartmentMatrix';
import { SamCEO } from '../../components/Dashboard/SamCEO';
import { RevenueVault } from '../../components/Dashboard/RevenueVault';
import { AlertsPanel } from '../../components/Dashboard/AlertsPanel';
import { TrafficMonitor } from '../../components/Dashboard/TrafficMonitor';
import { GoogleMerchant } from '../../components/Dashboard/GoogleMerchant';
import { 
  Zap, 
  Activity, 
  ShieldCheck, 
  BarChart3, 
  Clock,
  LayoutDashboard
} from 'lucide-react';

export default function UnifiedDashboard() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-8 space-y-8 animate-in fade-in duration-1000">
      {/* Top Navigation / Quick Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              <LayoutDashboard className="w-8 h-8 text-cyan-400" />
            </div>
            COMMAND_CENTER
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-2 ml-1">
            Akshara World Autonomous Hub v2.0
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="px-6 py-3 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-xl">
             <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">System Uptime</div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xl font-black text-white">100.00%</span>
             </div>
          </div>
          <div className="px-6 py-3 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-xl">
             <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Active Visitors</div>
             <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-xl font-black text-white">1,248</span>
             </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left & Middle Column (8 cols) */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Revenue Vault Section */}
          <section>
            <RevenueVault />
          </section>

          {/* Department Matrix Section */}
          <section>
            <DepartmentMatrix />
          </section>

          {/* Mid Section - Instructions & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <section>
                <AIInstructions />
             </section>
             <section>
                <AlertsPanel />
             </section>
          </div>

          {/* Bottom Section - Traffic & Merchant */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <section>
                <TrafficMonitor />
             </section>
             <section>
                <GoogleMerchant />
             </section>
          </div>

        </div>

        {/* Right Column (4 cols) - Sam CEO Interface */}
        <div className="xl:col-span-4 h-[calc(100vh-200px)] sticky top-8">
          <SamCEO />
        </div>

      </div>

      {/* Footer Info */}
      <footer className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            End-to-End Encryption Active
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Blueprint v2025.1.15</span>
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Server: Mumbai_Edge_01</span>
          </div>
      </footer>
    </div>
  );
}
