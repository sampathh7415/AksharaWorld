'use client';

import { useState, useEffect } from 'react';

interface MerchantProduct {
  id: string;
  title: string;
  price: string;
  status: 'approved' | 'pending' | 'disapproved';
  clicks?: number;
  impressions?: number;
}

interface MerchantData {
  merchantId: string;
  businessName: string;
  products: MerchantProduct[];
  totalProducts: number;
  approvedProducts: number;
  pendingProducts: number;
  disapprovedProducts: number;
  connected: boolean;
}

const MOCK_DATA: MerchantData = {
  merchantId:          '5782853246',
  businessName:        'Akshara World',
  totalProducts:       1,
  approvedProducts:    0,
  pendingProducts:     1,
  disapprovedProducts: 0,
  connected:           false,
  products: [
    {
      id:          'ai-blueprint-v1',
      title:       'AI Productivity Blueprint v1.0',
      price:       '₹499',
      status:      'pending',
      clicks:      0,
      impressions: 0,
    },
  ],
};

export function MerchantCenterPanel() {
  const [data, setData] = useState<MerchantData>(MOCK_DATA);

  useEffect(() => {
    fetch('/api/merchant').then(r => r.json()).then(d => {
      if (d.success && d.data) setData(d.data);
    }).catch(() => {});
  }, []);

  const statusColor = {
    approved:    'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    pending:     'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    disapproved: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  return (
    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            🛒 GOOGLE MERCHANT CENTER
          </h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">
            Merchant ID: {data.merchantId} — {data.businessName}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase border bg-yellow-500/10 border-yellow-500/20 text-yellow-400">
            ⏳ Awaiting Product Approval
          </span>
          <a
            href="https://merchants.google.com/mc/overview?a=5782853246"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase hover:bg-blue-500/20 transition-all"
          >
            Open Merchant ↗
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Products', value: data.totalProducts, color: 'text-white' },
          { label: 'Approved',       value: data.approvedProducts, color: 'text-emerald-400' },
          { label: 'Pending Review', value: data.pendingProducts, color: 'text-yellow-400' },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-2xl bg-black/30 border border-white/5 text-center">
            <div className={`text-3xl font-black ${s.color}`} style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>
              {s.value}
            </div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/5">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              {['Product', 'Price', 'Status', 'Clicks', 'Impressions', 'Action'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.products.map(p => (
              <tr key={p.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 font-bold text-white max-w-[200px] truncate">{p.title}</td>
                <td className="px-4 py-3 text-emerald-400 font-black">{p.price}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${statusColor[p.status]}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-cyan-400 font-bold">{p.clicks ?? 0}</td>
                <td className="px-4 py-3 text-gray-400">{p.impressions ?? 0}</td>
                <td className="px-4 py-3">
                  <a
                    href="https://merchants.google.com/mc/products?a=5782853246"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline text-[10px] font-bold"
                  >
                    View ↗
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Next steps */}
      <div className="p-5 rounded-2xl bg-black/30 border border-white/5 space-y-3">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Next Steps in Merchant Center</div>
        {[
          { done: true,  text: 'Business verified ✅' },
          { done: false, text: 'Link to Google Ads → Marketing → Ad campaigns → Link' },
          { done: false, text: 'Add products → Products & store → Add product' },
          { done: false, text: 'Add billing details for Shopping ads' },
        ].map((step, i) => (
          <div key={i} className={`flex items-center gap-3 text-xs ${step.done ? 'text-emerald-400' : 'text-gray-400'}`}>
            <span>{step.done ? '✅' : '○'}</span>
            <span>{step.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
