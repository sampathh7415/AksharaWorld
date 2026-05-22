'use client';

import { useState } from 'react';

const LANGUAGES = [
  { code: 'hi', name: 'Hindi',      flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil',      flag: '🇮🇳' },
  { code: 'te', name: 'Telugu',     flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada',    flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam',  flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi',    flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali',    flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati',   flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi',    flag: '🇮🇳' },
  { code: 'en', name: 'English',    flag: '🇬🇧' },
  { code: 'ar', name: 'Arabic',     flag: '🇸🇦' },
  { code: 'zh', name: 'Chinese',    flag: '🇨🇳' },
  { code: 'fr', name: 'French',     flag: '🇫🇷' },
  { code: 'de', name: 'German',     flag: '🇩🇪' },
  { code: 'es', name: 'Spanish',    flag: '🇪🇸' },
  { code: 'ja', name: 'Japanese',   flag: '🇯🇵' },
  { code: 'ko', name: 'Korean',     flag: '🇰🇷' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian',    flag: '🇷🇺' },
];

export function TranslatePanel() {
  const [source, setSource]   = useState('');
  const [result, setResult]   = useState('');
  const [targetLang, setTargetLang] = useState('hi');
  const [loading, setLoading] = useState(false);
  const [detectedLang, setDetectedLang] = useState('');

  const translate = async () => {
    if (!source.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/translate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text: source, targetLang }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.translated);
        setDetectedLang(data.detectedLang || '');
      } else {
        setResult('Translation failed. Try again.');
      }
    } catch {
      setResult('Network error. Please try again.');
    } finally { setLoading(false); }
  };

  const copyResult = () => {
    if (result) navigator.clipboard.writeText(result);
  };

  const targetInfo = LANGUAGES.find(l => l.code === targetLang);

  return (
    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            🌐 GOOGLE TRANSLATE
          </h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">
            Auto-detect → Translate → 19 languages including all Indian languages
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase border bg-blue-500/10 border-blue-500/20 text-blue-400">
          ✅ Free API — No Key Needed
        </span>
      </div>

      {/* Language selector */}
      <div className="flex flex-wrap gap-2">
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            onClick={() => setTargetLang(lang.code)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all ${
              targetLang === lang.code
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'bg-white/[0.03] text-gray-500 border border-white/5 hover:text-gray-300 hover:border-white/10'
            }`}
          >
            {lang.flag} {lang.name}
          </button>
        ))}
      </div>

      {/* Translation area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex justify-between">
            <span>Source Text {detectedLang && `(detected: ${detectedLang})`}</span>
            <button onClick={() => { setSource(''); setResult(''); }} className="text-gray-600 hover:text-gray-400">Clear</button>
          </div>
          <textarea
            value={source}
            onChange={e => setSource(e.target.value)}
            placeholder="Type or paste text here to translate..."
            rows={6}
            className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500/30 resize-none"
          />
        </div>
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex justify-between">
            <span>{targetInfo?.flag} {targetInfo?.name} Translation</span>
            {result && (
              <button onClick={copyResult} className="text-blue-400 hover:text-blue-300 text-[10px]">Copy ✂️</button>
            )}
          </div>
          <div className="w-full h-[152px] px-4 py-3 rounded-2xl bg-black/40 border border-white/5 text-sm text-white overflow-auto">
            {loading ? (
              <div className="flex items-center gap-2 text-gray-500 h-full">
                <span className="animate-spin">⏳</span> Translating...
              </div>
            ) : result ? (
              <p className="leading-relaxed">{result}</p>
            ) : (
              <p className="text-gray-600">Translation will appear here...</p>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={translate}
        disabled={loading || !source.trim()}
        className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-widest text-sm hover:opacity-90 transition-all disabled:opacity-40"
      >
        {loading ? '⏳ Translating...' : `🌐 Translate to ${targetInfo?.name}`}
      </button>

      {/* Quick phrases */}
      <div className="space-y-2">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Quick Business Phrases</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            'Welcome to Akshara World',
            'Buy now — Limited offer',
            'Contact us for support',
            'Free digital business guide',
            'AI CEO manages your business',
            'Zero cost startup toolkit',
          ].map(phrase => (
            <button
              key={phrase}
              onClick={() => setSource(phrase)}
              className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] text-gray-400 text-left hover:text-white hover:border-white/10 transition-all"
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
