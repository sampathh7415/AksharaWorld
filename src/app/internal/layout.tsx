import React from 'react'
import '../../globals.css'
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, UserButton } from '@clerk/nextjs'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <div className="min-h-screen bg-[#020202] text-white">
        {/* Protected Side/Top Bar */}
        <nav className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold tracking-tighter">COMMAND_CENTER</span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold border border-cyan-500/20">SAM_CEO v2.0</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              SYSTEM_LIVE
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </nav>
        
        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 border-r border-white/5 h-[calc(100vh-64px)] sticky top-16 p-6 hidden md:block">
            <div className="space-y-8">
              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Core Ops</div>
                <nav className="space-y-1">
                  <a href="/internal" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 text-sm text-white">Dashboard</a>
                  <a href="/internal/approvals" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">Approvals</a>
                  <a href="/internal/revenue" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">Revenue</a>
                </nav>
              </div>
              
              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Departments</div>
                <nav className="space-y-1">
                  {['Tech_Core', 'Innovation_Scout', 'Growth_Engine', 'Content_Forge', 'Guardian_Ops'].map(dept => (
                    <a key={dept} href={`/internal/dept/${dept}`} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
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
    </ClerkProvider>
  )
}
