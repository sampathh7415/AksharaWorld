'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Sparkles, Terminal, ArrowUpRight } from 'lucide-react';

export const SamCEO = () => {
  const [messages, setMessages] = useState([
    { role: 'sam', text: 'Good evening, Sampathkumar. Today\'s revenue is ₹1.00. Innovation_Scout has 2 new proposals for the AI Niche. How shall we proceed?', time: '16:45' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'owner', text: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages([...messages, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/sam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        role: 'sam', 
        text: data.reply || data.text, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } catch {
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'sam', text: 'I encountered a synapse error. Please check my Cloudflare Worker logs.', time: 'Error' }]);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 rounded-[2.5rem] bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-white/10 backdrop-blur-2xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          <h2 className="text-xl font-bold tracking-tight text-white uppercase">SAM_CEO_V2</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-gray-400">
            <Terminal className="w-3 h-3" />
            BRAIN: GEMINI_1.5_PRO
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 mb-8 pr-2 scrollbar-hide">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'sam' ? 'justify-start' : 'justify-end'}`}>
            <div className={`flex gap-3 max-w-[90%] ${msg.role === 'sam' ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                msg.role === 'sam' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
              }`}>
                {msg.role === 'sam' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'sam' 
                    ? 'bg-white/5 border border-white/10 text-gray-300' 
                    : 'bg-cyan-500 text-black font-bold shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                }`}>
                  {msg.text}
                </div>
                <div className={`text-[9px] font-bold mt-1.5 uppercase tracking-widest text-gray-600 ${msg.role === 'sam' ? 'text-left' : 'text-right'}`}>
                    {msg.time} • {msg.role === 'sam' ? 'Sam (CEO)' : 'Sampath (Owner)'}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
             </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="relative">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Give Sam a directive..."
          className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-sm focus:border-cyan-500 outline-none transition-all pr-14 text-white placeholder:text-gray-600"
        />
        <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center text-black hover:scale-105 transition-transform">
          <ArrowUpRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
