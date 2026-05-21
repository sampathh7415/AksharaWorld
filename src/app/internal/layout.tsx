export const runtime = 'edge';
import React from 'react'
import '../globals.css'
import { UserButton } from '@clerk/nextjs'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Protected Side/Top Bar */}
      <nav className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <span className="text-xl font-black tracking-tight text-slate-900">COMMAND_CENTER</span>
          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100">SAM_CEO v2.0</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            SYSTEM_LIVE
          </div>
          <UserButton />
        </div>
      </nav>
      
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-200 h-[calc(100vh-64px)] sticky top-16 p-6 hidden md:block bg-white">
          <div className="space-y-8">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Core Ops</div>
              <nav className="space-y-1">
                <a href="/internal" className="flex items-center gap-3 px-3 py-2 rounded-xl bg-blue-50 text-sm font-bold text-blue-600">Dashboard</a>
                <a href="/internal/approvals" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">Approvals</a>
                <a href="/internal/revenue" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">Revenue</a>
              </nav>
            </div>
            
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Departments</div>
              <nav className="space-y-1">
                {['Tech_Core', 'Innovation_Scout', 'Growth_Engine', 'Content_Forge', 'Guardian_Ops'].map(dept => (
                  <a key={dept} href={`/internal/dept/${dept}`} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                    {dept}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </aside>
        
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
