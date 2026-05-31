'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  sender: 'akshara' | 'user';
  text: string;
  timestamp: Date;
  modelUsed?: 'Flash' | 'Pro' | 'Omni';
}

export default function AksharaChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'akshara',
      text: 'Namaste! 🙏 I am Akshara, your AI Customer Support Coordinator. We are a universal digital solutions hub—leveraging 100% of our premium software systems to deliver high-quality career and creative services in just a few minutes (such as automated ATS resume building)! We hold immediate, automated solutions for all technical, creative, and digital queries instantly. How can I help you today?',
      timestamp: new Date(),
      modelUsed: 'Flash',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [activeBrainModel, setActiveBrainModel] = useState<'Flash' | 'Pro' | 'Omni'>('Flash');
  const [isTyping, setIsTyping] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [isCoordinating, setIsCoordinating] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isCoordinating]);

  // Hide initial tooltip after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response based on query
    setTimeout(() => {
      let responseText = '';
      let model: 'Flash' | 'Pro' | 'Omni' = 'Flash';
      const cleanText = text.toLowerCase();

      if (cleanText.includes('service') || cleanText.includes('offer') || cleanText.includes('pricing') || cleanText.includes('price')) {
        responseText = 'Akshara World provides premium digital services backed by zero-cost frameworks. Because we utilize pre-configured assets, executing your requested creative or career task takes only a few minutes! Offerings include:\n1. Resume ATS Optimization (₹999) - Outlining and restructuring outlines in Docs for immediate ATS clearance.\n2. Resume Revamp Suite (₹1,499) - Complete modern redesign of your digital portfolio.\n3. AI Avatar & 3D Character Design (₹2,499) - High-fidelity Pixar-style 3D illustrations.\n4. Short-Form Video Production (₹4,999) - Programmatic advertising video assets.\n\nYou can book any service directly on the storefront!';
        model = 'Pro';
      } else if (cleanText.includes('resume') || cleanText.includes('ats') || cleanText.includes('restruct')) {
        responseText = 'Our Resume Building & Restructuring wings rewrite, optimize, and format your career outline inside Google Docs. Because we operate advanced automation templates linked to our Lovable Pro assets, building your custom-tailored layout takes only a few minutes! Work begins immediately upon booking and guarantees ATS compliance.';
        model = 'Pro';
      } else if (cleanText.includes('sam') || cleanText.includes('ceo') || cleanText.includes('brain')) {
        responseText = 'Sam is our Autonomous AI CEO. He manages operations across all 8 specialized swarm wings (Content_Forge, Tech_Core, Revenue_Vault, etc.). Sam runs on local-Gemma cognitive logic and Google Gemini Spark cloud servers, coordinating files and database syncs natively. I coordinate directly with Sam, uploading support scorecards and queuing tickets for his approval!';
        model = 'Flash';
      } else if (cleanText.includes('zero') || cleanText.includes('free') || cleanText.includes('cost') || cleanText.includes('model')) {
        responseText = 'Akshara World runs on a ₹0 recurring infrastructure cost model. We utilize free-tier developer resources: Google Sheets as a transaction and logs database, Brevo SMTP for newsletters/webhooks, Google drawings for design assets, and Cloudflare Pages for secure, high-uptime edge hosting.';
        model = 'Flash';
      } else if (cleanText.includes('refund') || cleanText.includes('track') || cleanText.includes('order') || cleanText.includes('transaction')) {
        setIsCoordinating(true);
        setIsTyping(false);
        
        // Simulating coordinate delay
        setTimeout(() => {
          setIsCoordinating(false);
          setIsTyping(true);
          
          setTimeout(() => {
            const mockOrderId = `SRV-${Math.floor(100000 + Math.random() * 900000)}`;
            setMessages((prev) => [
              ...prev,
              {
                id: `akshara-resp-${Date.now()}`,
                sender: 'akshara',
                text: `[Coordinating with Sam CEO & Revenue_Vault completed successfully ✅] 
I have scanned our Google Sheets database ledger. If you have just booked a service (Resume Revamp or AI Avatar Design), Brevo has dispatched your confirmation email. For active service status modifications, I have logged high-priority ticket ${mockOrderId} in Sam's approvals dashboard. Sam (local-Gemma model) will review and sync via webhooks!`,
                timestamp: new Date(),
                modelUsed: 'Omni',
              }
            ]);
            setActiveBrainModel('Omni');
            setIsTyping(false);
          }, 1500);
        }, 1800);
        return;
      } else if (cleanText.includes('lovable') || cleanText.includes('helium') || cleanText.includes('resource')) {
        responseText = 'Akshara World holds premium enterprise resources, including Lovable Pro stacked active subscriptions (valid to May 27, 2027), Helium AI credits ($500 balance), and multiple active domains (aksharaworld.in, aksharaworld.com) fully secured inside our Cloudflare Nameservers and Shopify zone mappings.';
        model = 'Pro';
      } else {
        responseText = 'I have analyzed your query through my Google cognitive layers. As Akshara World\'s customer coordinator, I can confirm we hold complete, immediate solutions for all technical, career, creative, and digital queries instantly! Please ask me any question, and my advanced triple-layer Google AI brain will resolve it immediately in real time.';
        model = 'Flash';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `akshara-resp-${Date.now()}`,
          sender: 'akshara',
          text: responseText,
          timestamp: new Date(),
          modelUsed: model,
        }
      ]);
      setActiveBrainModel(model);
      setIsTyping(false);
    }, 1200);
  };

  const presetQuestions = [
    'What is Akshara World?',
    'What digital services do you offer?',
    'How does the ₹0 cost model work?',
    'Tell me about Sam CEO\'s brain',
    'Track my service order',
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* 🟢 Floating Chat Point Bubble Tooltip */}
      {showTooltip && !isOpen && (
        <div 
          onClick={() => { setIsOpen(true); setShowTooltip(false); }}
          className="absolute bottom-20 right-2 bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-extrabold text-xs py-3 px-5 rounded-2xl shadow-[0_10px_30px_rgba(236,72,153,0.3)] border border-pink-400/20 whitespace-nowrap cursor-pointer hover:scale-105 transition-all duration-300 animate-bounce flex items-center gap-2"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>
          How can I help you?
        </div>
      )}

      {/* 🔴 Floating Button */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setShowTooltip(false); }}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 via-indigo-600 to-cyan-500 p-[2px] shadow-[0_8px_32px_rgba(99,102,241,0.4)] hover:shadow-[0_12px_40px_rgba(236,72,153,0.6)] active:scale-95 hover:scale-105 transition-all duration-300 cursor-pointer group relative overflow-hidden"
          id="akshara-floating-chat-btn"
          aria-label="Open Akshara AI Customer Support"
        >
          <div className="w-full h-full rounded-full bg-[#0d0e15] overflow-hidden flex items-center justify-center relative">
            {/* Mascot Avatar Image */}
            <img 
              src="/akshara_avatar.png" 
              alt="Akshara AI Mascot" 
              className="w-[105%] h-[105%] object-cover object-center group-hover:scale-110 transition-transform duration-300"
            />
            {/* Glowing ring */}
            <div className="absolute inset-0 border border-white/10 rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0d0e15] rounded-full animate-pulse" />
          </div>
        </button>
      )}

      {/* 📑 Glassmorphic Expanded Chat Interface */}
      {isOpen && (
        <div 
          className="w-[92vw] sm:w-[420px] h-[580px] rounded-[2.5rem] bg-[#0c0e1a]/85 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl flex flex-col overflow-hidden animate-fade-in relative"
          style={{ 
            fontFamily: 'var(--font-inter, sans-serif)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255,255,255,0.1)'
          }}
        >
          {/* Subtle Decorative Glows */}
          <div className="absolute top-[-50px] right-[-50px] w-48 h-48 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="p-5 border-b border-white/5 bg-[#090b14]/90 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 to-cyan-400">
                  <div className="w-full h-full rounded-full bg-[#0d0e15] overflow-hidden">
                    <img src="/akshara_avatar.png" alt="Akshara Avatar" className="w-[105%] h-[105%] object-cover" />
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#090b14] rounded-full" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white tracking-wide" style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>
                  Akshara
                </h3>
                <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider block">
                  AI Support Specialist
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition-colors cursor-pointer"
              aria-label="Close Chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 🧠 3 Google Models Brain Panel */}
          <div className="bg-[#05060d]/90 px-4 py-2 border-b border-white/5 flex items-center justify-between gap-1 relative z-10">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">
              Google Brain Layer:
            </span>
            <div className="flex bg-white/[0.03] p-[2px] rounded-lg border border-white/5">
              {(['Flash', 'Pro', 'Omni'] as const).map((model) => (
                <button
                  key={model}
                  onClick={() => setActiveBrainModel(model)}
                  className={`text-[9px] font-black px-2.5 py-1 rounded-md tracking-wider transition-all duration-300 cursor-pointer ${
                    activeBrainModel === model 
                      ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-lg' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title={`${model} cognitive model layer`}
                >
                  {model}
                </button>
              ))}
            </div>
          </div>

          {/* Mini description of selected model layer */}
          <div className="bg-[#0c0e1a] px-5 py-1.5 border-b border-white/5 text-[9px] text-slate-500 font-semibold italic">
            {activeBrainModel === 'Flash' && '⚡ Gemini Flash Layer: Direct real-time client chat & instant helpdesk answers.'}
            {activeBrainModel === 'Pro' && '🧠 Gemini Pro Layer: Detailed system lookup, product catalogs, & ledger queries.'}
            {activeBrainModel === 'Omni' && '🔮 Gemini Omni Layer: Rich-media onboarding asset assembly & custom invoice mapping.'}
          </div>

          {/* Message Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 relative z-10 scrollbar-thin scrollbar-thumb-white/10">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-[1.5rem] px-4.5 py-3 text-xs leading-relaxed font-medium shadow-md ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-tr-none' 
                      : 'bg-white/[0.03] border border-white/5 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.sender === 'akshara' && (
                    <div className="text-[8px] font-black text-pink-400 uppercase tracking-widest mb-1 select-none">
                      🤖 Gemini {msg.modelUsed || 'Flash'} Active
                    </div>
                  )}
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
                <span className="text-[8px] text-slate-600 font-semibold uppercase tracking-widest mt-1.5 px-2">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {/* Coordinating with Sam CEO Indicator */}
            {isCoordinating && (
              <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-2xl p-3.5 text-xs animate-pulse">
                <svg className="animate-spin h-4.5 w-4.5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div className="font-extrabold uppercase tracking-widest text-[9px]">
                  Coordinating with Sam CEO via Brevo Webhooks...
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-3 w-16">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick-Reply Preset Questions */}
          <div className="px-5 py-2 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2 relative z-10 border-t border-white/5 bg-[#080911]/60">
            {presetQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="inline-block px-3.5 py-1.5 rounded-full bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 text-slate-400 hover:text-white font-extrabold text-[10px] tracking-wide cursor-pointer transition-all duration-300"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Text Input Panel */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="p-4 border-t border-white/5 bg-[#06070c]/90 flex gap-2 relative z-10"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Akshara anything..."
              className="flex-1 bg-white/[0.02] border border-white/10 rounded-2xl px-4.5 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.04] transition-all duration-300 font-medium"
            />
            <button
              type="submit"
              className="px-4.5 bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-black text-[10px] uppercase tracking-wider rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer shadow-lg shadow-pink-500/20 flex items-center justify-center"
              aria-label="Send Message"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
