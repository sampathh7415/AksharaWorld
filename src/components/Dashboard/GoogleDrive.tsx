'use client';
import React, { useState, useEffect } from 'react';
import { HardDrive, FolderOpen, ShieldCheck, ShieldAlert } from 'lucide-react';
import { resilientFetch } from '../../lib/resilience';

export const GoogleDrive = () => {
  const [quota, setQuota] = useState<{ limit: string, usage: string } | null>(null);
  const [status, setStatus] = useState<'nominal' | 'degraded'>('nominal');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app this would fetch from an API route that securely calls getDriveStorageQuota
    // Here we'll simulate the response for the dashboard
    setTimeout(() => {
      setQuota({ limit: '16106127360', usage: '1245600' }); // 15GB limit, ~1.2MB usage
      setStatus('nominal');
      setLoading(false);
    }, 1500);
  }, []);

  const formatBytes = (bytes: string) => {
    const b = parseInt(bytes, 10);
    if (!b) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return parseFloat((b / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const usagePercent = quota ? (parseInt(quota.usage) / parseInt(quota.limit)) * 100 : 0;

  return (
    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold flex items-center gap-3 text-white uppercase">
          <HardDrive className="text-blue-400" /> DRIVE_ASSET_VAULT
        </h2>
        {status === 'nominal' ? (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-[9px] font-black text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3" /> CONNECTED
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-[9px] font-black text-yellow-400 border border-yellow-500/20">
            <ShieldAlert className="w-3 h-3" /> SYNCING
          </span>
        )}
      </div>

      {loading ? (
        <div className="h-24 flex items-center justify-center text-blue-400 font-mono tracking-widest animate-pulse">
          CONNECTING_VAULT...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-black/40 border border-white/5">
            <div className="flex justify-between items-end mb-2">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Storage Used</div>
              <div className="text-sm font-black text-white">{quota ? formatBytes(quota.usage) : '0 B'} / {quota ? formatBytes(quota.limit) : '15 GB'}</div>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${usagePercent}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all cursor-pointer flex items-center gap-3">
               <FolderOpen className="w-5 h-5 text-blue-400" />
               <div>
                  <div className="text-xs font-bold text-white">01_Content_Forge</div>
                  <div className="text-[9px] text-gray-500 uppercase">12 Assets</div>
               </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all cursor-pointer flex items-center gap-3">
               <FolderOpen className="w-5 h-5 text-purple-400" />
               <div>
                  <div className="text-xs font-bold text-white">03_Guardian_Ops</div>
                  <div className="text-[9px] text-gray-500 uppercase">3 Backups</div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
