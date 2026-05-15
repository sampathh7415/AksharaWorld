'use client'

import React, { useState, useEffect } from 'react'
import { 
  Activity, 
  DollarSign, 
  Users, 
  FileText, 
  ShieldCheck, 
  Zap, 
  MessageSquare,
  ArrowUpRight,
  RefreshCcw,
  BarChart3
} from 'lucide-react'

export default function UnifiedDashboard() {
  const [samMessage, setSamMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([
    { role: 'sam', text: 'Guardian_Ops activated. System is 100% operational. How shall we proceed, Owner?' }
  ])
  
  const departments = [
    { name: 'Tech_Core', status: 'Optimal', icon: Zap, color: 'text-cyan-400' },
    { name: 'Innovation_Scout', status: 'Scanning', icon: BarChart3, color: 'text-purple-400' },
    { name: 'Revenue_Vault', status: 'Live', icon: DollarSign, color: 'text-green-400' },
    { name: 'Growth_Engine', status: 'Active', icon: Users, color: 'text-blue-400' },
    { name: 'Content_Forge', status: 'Publishing', icon: FileText, color: 'text-orange-400' },
    { name: 'Media_Studio', status: 'Ready', icon: Activity, color: 'text-pink-400' },
    { name: 'Guardian_Ops', status: 'Secured', icon: ShieldCheck, color: 'text-red-400' },
    { name: 'Insight_Lab', status: 'Analyzing', icon: Activity, color: 'text-yellow-400' },
  ]

  const [metrics, setMetrics] = useState({
    revenue: 0,
    visitors: 0,
    subscribers: 0,
    published: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/data')
        const data = await res.json()
        if (data.metrics) setMetrics(data.metrics)
        setLoading(false)
      } catch (err) {
        console.error('Fetch error:', err)
      }
    }
    fetchData()
  }, [])

  const handleSamChat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!samMessage.trim()) return
    const userMsg = { role: 'owner', text: samMessage }
    setChatHistory([...chatHistory, userMsg])
    setSamMessage('')

    try {
      const res = await fetch('/api/sam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: samMessage })
      })
      const data = await res.json()
      setChatHistory(prev => [...prev, { role: 'sam', text: data.reply || data.text }])
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'sam', text: 'Sam encountered a synapse error. Checking brain connectivity.' }])
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `₹${metrics.revenue}`, change: '+100%', icon: DollarSign, color: 'cyan' },
          { label: 'Site Visitors', value: metrics.visitors, change: '+12%', icon: Users, color: 'blue' },
          { label: 'Subscribers', value: metrics.subscribers, change: '+5%', icon: MessageSquare, color: 'purple' },
          { label: 'Content Published', value: metrics.published, change: '+3', icon: FileText, color: 'orange' },
        ].map((item, i) => (
          <div key={i} className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-${item.color}-500/10`}>
                <item.icon className={`w-6 h-6 text-${item.color}-400`} />
              </div>
              <span className="text-xs font-bold text-green-400 flex items-center gap-1">
                {item.change} <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
            <div className="text-3xl font-black">{item.value}</div>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Department Status Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <ShieldCheck className="text-cyan-400" /> DEPARTMENT_MATRIX
              </h2>
              <button className="p-2 hover:bg-white/5 rounded-full transition-all">
                <RefreshCcw className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {departments.map((dept) => (
                <div key={dept.name} className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-white/20 transition-all group">
                  <dept.icon className={`w-5 h-5 ${dept.color} mb-3 group-hover:scale-110 transition-transform`} />
                  <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">{dept.name}</div>
                  <div className="text-xs font-bold text-white">{dept.status}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log / Recent Transactions */}
          <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
            <h2 className="text-xl font-bold mb-6">REVENUE_STREAM</h2>
            <div className="space-y-4">
              {[
                { id: 'TXN_001', amount: '₹499', status: 'Success', date: 'Just now' },
                { id: 'TXN_002', amount: '₹1', status: 'Verified', date: '12m ago' },
              ].map((txn) => (
                <div key={txn.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">{txn.id}</div>
                      <div className="text-[10px] text-gray-500">{txn.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{txn.amount}</div>
                    <div className="text-[10px] text-green-400 uppercase font-bold tracking-widest">{txn.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sam AI CEO Chat Interface */}
        <div className="lg:col-span-1 h-full">
          <div className="h-full flex flex-col p-8 rounded-[2.5rem] bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-white/10 backdrop-blur-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
              <h2 className="text-xl font-bold">SAM_CEO_V2</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6 mb-8 scrollbar-hide">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'sam' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                    msg.role === 'sam' 
                      ? 'bg-white/5 border border-white/10 text-gray-300' 
                      : 'bg-cyan-500 text-black font-bold'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSamChat} className="relative">
              <input 
                type="text" 
                value={samMessage}
                onChange={(e) => setSamMessage(e.target.value)}
                placeholder="Send directive to Sam..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-cyan-500 outline-none transition-all pr-12"
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-white transition-colors">
                <ArrowUpRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
