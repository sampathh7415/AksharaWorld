'use client';
import React, { useState, useEffect } from 'react';
import { Table, ShieldCheck, Database, RefreshCw } from 'lucide-react';

export const GoogleSheets = () => {
  return (
    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold flex items-center gap-3 text-white uppercase">
          <Database className="text-emerald-400" /> ZERO_COST_DB
        </h2>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-[9px] font-black text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3" /> ACTIVE
        </span>
      </div>

      <div className="space-y-4">
         <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5">
            <div className="flex items-center gap-3">
                <Table className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-gray-300">DailyLogs (System State)</span>
            </div>
            <span className="text-[10px] text-gray-500 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> synced 10m ago</span>
        </div>
         <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5">
            <div className="flex items-center gap-3">
                <Table className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-gray-300">Products (Merchant Feed)</span>
            </div>
            <span className="text-[10px] text-gray-500 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> synced 2h ago</span>
        </div>
      </div>
    </div>
  );
};
