import React from 'react';
import { ShoppingBag, CheckCircle2, Globe, BarChart3, AlertCircle } from 'lucide-react';

export const GoogleMerchant = () => {
  return (
    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold flex items-center gap-3 text-white uppercase">
          <ShoppingBag className="text-orange-400" /> GOOGLE_MERCHANT
        </h2>
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-[10px] font-black text-emerald-400 border border-emerald-500/20">
            VERIFIED
        </span>
      </div>

      <div className="space-y-6">
        <div className="p-5 rounded-3xl bg-black/40 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                    <div className="text-sm font-black text-white uppercase">AI Productivity Blueprint</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase">Product ID: AK_BLUE_01</div>
                </div>
            </div>
            <div className="text-right">
                <div className="text-sm font-black text-white">₹499.00</div>
                <div className="text-[9px] text-emerald-400 font-bold uppercase">Live in Shopping</div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Shopping Imps</div>
                <div className="text-xl font-black text-white">14.2K</div>
            </div>
            <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Shopping Clicks</div>
                <div className="text-xl font-black text-white">384</div>
            </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 bg-white/5 p-3 rounded-xl border border-white/5">
            <AlertCircle className="w-3 h-3" />
            Merchant Center auto-syncing every 24 hours.
        </div>
      </div>
    </div>
  );
};
