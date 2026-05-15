import React from 'react';
import { Bell, AlertTriangle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';

const alerts = [
  { id: 1, type: 'critical', msg: 'System integrity scan complete. 0 vulnerabilities found.', source: 'Guardian_Ops', time: '5m ago' },
  { id: 2, type: 'info', msg: 'Payment: ₹1.00 received from Test_User.', source: 'Revenue_Vault', time: '12m ago' },
  { id: 3, type: 'warning', msg: 'AdSense review pending for 3 days. Content_Forge needs more posts.', source: 'Insight_Lab', time: '1h ago' },
  { id: 4, type: 'info', msg: 'New subscriber: sampathh002@gmail.com joined Growth_Engine.', source: 'Growth_Engine', time: '2h ago' },
];

export const AlertsPanel = () => {
  return (
    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold flex items-center gap-3 text-white uppercase">
          <Bell className="text-yellow-400" /> SYSTEM_ALERTS
        </h2>
        <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-[10px] font-black text-yellow-500 border border-yellow-500/20">
            {alerts.length} NEW
        </span>
      </div>
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 hover:bg-white/[0.02] transition-all">
            <div className={`mt-1 ${
                alert.type === 'critical' ? 'text-red-400' :
                alert.type === 'warning' ? 'text-yellow-400' : 'text-cyan-400'
            }`}>
                {alert.type === 'critical' ? <ShieldAlert className="w-5 h-5" /> :
                 alert.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{alert.source}</div>
                    <div className="text-[9px] text-gray-600 font-mono">{alert.time}</div>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{alert.msg}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
