'use client';
import React, { useState, useEffect } from 'react';
import { Globe, Users, MousePointer2, Clock, MapPin, Share2 } from 'lucide-react';

export const TrafficMonitor = () => {
  return (
    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold flex items-center gap-3 text-white uppercase">
          <Globe className="text-blue-400" /> LIVE_TRAFFIC_GA4
        </h2>
        <div className="px-3 py-1 rounded-full bg-blue-500/10 text-[10px] font-black text-blue-400 border border-blue-500/20">
            SYNCING_LIVE
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Session Duration</div>
            <div className="text-xl font-black text-white">4m 12s</div>
            <div className="text-[9px] text-emerald-400 font-bold mt-1">+12% vs LY</div>
        </div>
        <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Bounce Rate</div>
            <div className="text-xl font-black text-white">32.4%</div>
            <div className="text-[9px] text-emerald-400 font-bold mt-1">OPTIMAL</div>
        </div>
        <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Conversion</div>
            <div className="text-xl font-black text-white">2.8%</div>
            <div className="text-[9px] text-blue-400 font-bold mt-1">GROWING</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5">
            <div className="flex items-center gap-3">
                <Share2 className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-bold text-gray-300">Organic Search</span>
            </div>
            <span className="text-xs font-black text-white">64%</span>
        </div>
        <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5">
            <div className="flex items-center gap-3">
                <Share2 className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-bold text-gray-300">Social (IG/YT)</span>
            </div>
            <span className="text-xs font-black text-white">28%</span>
        </div>
        <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5">
            <div className="flex items-center gap-3">
                <Share2 className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-bold text-gray-300">Direct Access</span>
            </div>
            <span className="text-xs font-black text-white">8%</span>
        </div>
      </div>
    </div>
  );
};
