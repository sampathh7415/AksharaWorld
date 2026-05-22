'use client';

import { useState } from 'react';

interface ChatMessage {
  text: string;
  sentAt: string;
  status: 'sent' | 'failed';
  type: 'alert' | 'report' | 'order' | 'lead' | 'custom';
}

const WEBHOOK_CONFIGURED = !!process.env.NEXT_PUBLIC_GCHAT_WEBHOOK_URL;

const QUICK_ALERTS = [
  { label: '🚨 Site Down Alert',    type: 'alert'  as const, text: '🚨 *ALERT* — aksharaworld.in is experiencing issues. Investigating now.' },
  { label: '📊 Daily Report',       type: 'report' as const, text: '📊 *Daily Report* — Dashboard update from Akshara World AI CEO.' },
  { label: '🛒 Test Order Alert',   type: 'order'  as const, text: '🛒 *New Order* — Test order received from dashboard.' },
  { label: '📬 Test Lead Alert',    type: 'lead'   as const, text: '📬 *New Lead* — Test lead notification from contact form.' },
  { label: '✅ Deploy Success',     type: 'alert'  as const, text: '✅ *Deployment Successful* — aksharaworld.in updated successfully.' },
  { label: '🔥 Firebase Connected', type: 'report' as const, text: '🔥 *Firebase* — aksharaworld-481e8 is now connected to the dashboard.' },
];

export function GoogleChatPanel() {
  const [customMsg, setCustomMsg]     = useState('');
  const [messages, setMessages]       = useState<ChatMessage[]>([]);
  const [webhookUrl, setWebhookUrl]   = useState('');
  const [saving, setSaving]           = useState(false);
  const [sending, setSending]         = useState(false);

  const sendMessage = async (text: string, type: ChatMessage['type'] = 'custom') => {
    setSending(true);
    try {
      const res = await fetch('/api/gchat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text, webhookUrl: webhookUrl || undefined }),
      });
      const d = await res.json();
      const msg: ChatMessage = {
        text,
        type,
        sentAt: new Date().toLocaleTimeString('en-IN'),
        status: d.success ? 'sent' : 'failed',
      };
      setMessages(prev => [msg, ...prev.slice(0, 9)]);
      if (type === 'custom') setCustomMsg('');
    } finally { setSending(false); }
  };

  return (
    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            💬 GOOGLE CHAT
          </h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">
            Webhook notifications — Business alerts direct to your Chat space
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="https://chat.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase hover:bg-blue-500/20 transition-all"
          >
            Open Chat ↗
          </a>
        </div>
      </div>

      {/* Webhook setup */}
      <div className="p-5 rounded-2xl bg-black/30 border border-white/5 space-y-3">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">⚙️ Webhook URL</div>
        <div className="flex gap-3">
          <input
            type="url"
            value={webhookUrl}
            onChange={e => setWebhookUrl(e.target.value)}
            placeholder="https://chat.googleapis.com/v1/spaces/.../messages?key=..."
            className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/5 text-white text-xs font-mono focus:outline-none focus:border-blue-500/30 placeholder:text-gray-600"
          />
          <button
            onClick={() => sendMessage('✅ Webhook test from Akshara World dashboard!', 'alert')}
            disabled={!webhookUrl || sending}
            className="px-4 py-3 rounded-xl bg-blue-600 text-white text-xs font-black uppercase hover:bg-blue-500 transition-all disabled:opacity-40 whitespace-nowrap"
          >
            Test →
          </button>
        </div>

        {/* Setup guide (shown when no webhook) */}
        {!webhookUrl && (
          <div className="space-y-2 pt-2">
            <div className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">How to get webhook URL:</div>
            {[
              { n: '1', t: 'Open Google Chat → click "+" next to Spaces → "Create space"' },
              { n: '2', t: 'Open the space → click ⚙️ Settings → "Apps & integrations"' },
              { n: '3', t: 'Click "Add webhooks" → Name it "Akshara World" → Copy URL' },
              { n: '4', t: 'Paste URL above and click Test →' },
            ].map(s => (
              <div key={s.n} className="flex items-start gap-2 text-[10px] text-gray-500">
                <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 text-[9px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">{s.n}</span>
                <span>{s.t}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick alert buttons */}
      <div className="space-y-3">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Quick Alerts</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {QUICK_ALERTS.map(a => (
            <button
              key={a.label}
              onClick={() => sendMessage(a.text, a.type)}
              disabled={sending || !webhookUrl}
              className="px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] text-gray-400 text-left hover:text-white hover:border-white/10 hover:bg-white/[0.05] transition-all disabled:opacity-30 font-bold"
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom message */}
      <div className="flex gap-3">
        <input
          type="text"
          value={customMsg}
          onChange={e => setCustomMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && customMsg && sendMessage(customMsg)}
          placeholder="Type a custom message to send to Google Chat..."
          disabled={!webhookUrl}
          className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/5 text-white text-sm focus:outline-none focus:border-blue-500/30 placeholder:text-gray-600 disabled:opacity-40"
        />
        <button
          onClick={() => sendMessage(customMsg)}
          disabled={sending || !customMsg || !webhookUrl}
          className="px-5 py-3 rounded-xl bg-blue-600 text-white text-xs font-black uppercase hover:bg-blue-500 transition-all disabled:opacity-40"
        >
          {sending ? '⏳' : '📤 Send'}
        </button>
      </div>

      {/* Message history */}
      {messages.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sent Messages</div>
          {messages.map((m, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-black/30 border border-white/[0.03]">
              <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${m.status === 'sent' ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-300 truncate">{m.text}</p>
              </div>
              <span className="text-[10px] text-gray-600 flex-shrink-0">{m.sentAt}</span>
              <span className={`text-[9px] font-black uppercase flex-shrink-0 ${m.status === 'sent' ? 'text-emerald-400' : 'text-red-400'}`}>
                {m.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
