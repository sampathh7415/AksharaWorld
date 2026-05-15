'use client';
import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

export const RevenueVault = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://sam-ceo-brain.akshara-sam.workers.dev/api/dashboard');
        const json = await res.json();
        setData(json.metrics);
        setLoading(false);
      } catch (e) {
        console.error('Failed to fetch revenue', e);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="h-64 flex items-center justify-center text-cyan-400">CONNECTING_TO_VAULT...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
             <DollarSign className="w-24 h-24 text-cyan-400" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-4">
                <Activity className="w-3 h-3" />
                Live Revenue Vault
            </div>
            <div className="text-5xl font-black text-white mb-2">₹{data.revenue?.total || '0.00'}</div>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">Total Verified Revenue</div>
            
            <div className="mt-8 flex items-center gap-6">
                <div>
                    <div className="text-xl font-black text-white">₹{data.revenue?.today || '0.00'}</div>
                    <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-tighter">Today</div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                    <div className="text-xl font-black text-white">₹{data.revenue?.month || '0.00'}</div>
                    <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-tighter">This Month</div>
                </div>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
             <h3 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-widest">Performance Metrics</h3>
             <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-2xl font-black text-white">{data.transactions || 0}</div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase">Successful Txns</div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-bold text-emerald-400 flex items-center gap-1 justify-end">
                            100% <TrendingUp className="w-3 h-3" />
                        </div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase">Success Rate</div>
                    </div>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
                <div className="flex justify-between items-center text-[10px] font-black text-gray-500 uppercase tracking-tighter">
                    <span>AOV: ₹{data.aov || '0.00'}</span>
                    <span>Churn: 0%</span>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};
