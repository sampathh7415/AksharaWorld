'use client';

import { useState, useEffect } from 'react';

interface FirebaseService {
  name: string;
  icon: string;
  status: 'active' | 'pending' | 'inactive';
  description: string;
  docsUrl: string;
  consoleUrl: string;
  value?: string;
}

interface FirestoreDoc {
  id: string;
  collection: string;
  data: Record<string, any>;
  timestamp: string;
}

export function FirebasePanel() {
  const [recentDocs, setRecentDocs] = useState<FirestoreDoc[]>([]);
  const [activeTab, setActiveTab]   = useState<'overview' | 'firestore' | 'storage' | 'auth'>('overview');
  const [testResult, setTestResult] = useState('');
  const [testing, setTesting]       = useState(false);

  const services: FirebaseService[] = [
    {
      name: 'Firebase Analytics',
      icon: '📊',
      status: 'active',
      description: 'App analytics — linked to GA4 G-VJ7GHMKHFM',
      docsUrl: 'https://firebase.google.com/docs/analytics',
      consoleUrl: 'https://console.firebase.google.com/project/aksharaworld-481e8/analytics',
      value: 'G-VJ7GHMKHFM',
    },
    {
      name: 'Firestore Database',
      icon: '🗄️',
      status: 'pending',
      description: 'Real-time NoSQL — orders, leads, subscribers',
      docsUrl: 'https://firebase.google.com/docs/firestore',
      consoleUrl: 'https://console.firebase.google.com/project/aksharaworld-481e8/firestore',
    },
    {
      name: 'Firebase Storage',
      icon: '📁',
      status: 'pending',
      description: 'File uploads — product images, documents',
      docsUrl: 'https://firebase.google.com/docs/storage',
      consoleUrl: 'https://console.firebase.google.com/project/aksharaworld-481e8/storage',
    },
    {
      name: 'Firebase Auth',
      icon: '🔐',
      status: 'pending',
      description: 'Social login — complements Clerk Auth',
      docsUrl: 'https://firebase.google.com/docs/auth',
      consoleUrl: 'https://console.firebase.google.com/project/aksharaworld-481e8/authentication',
    },
    {
      name: 'Firebase Hosting',
      icon: '🌐',
      status: 'inactive',
      description: 'Backup hosting at aksharaworld-481e8.web.app',
      docsUrl: 'https://firebase.google.com/docs/hosting',
      consoleUrl: 'https://console.firebase.google.com/project/aksharaworld-481e8/hosting',
      value: 'aksharaworld-481e8.web.app',
    },
    {
      name: 'Cloud Functions',
      icon: '⚡',
      status: 'inactive',
      description: 'Serverless backend — triggers on Firestore events',
      docsUrl: 'https://firebase.google.com/docs/functions',
      consoleUrl: 'https://console.firebase.google.com/project/aksharaworld-481e8/functions',
    },
  ];

  const statusStyle = {
    active:   'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    pending:  'bg-yellow-500/10  border-yellow-500/20  text-yellow-400',
    inactive: 'bg-gray-500/10   border-gray-500/20    text-gray-500',
  };

  const testFirestore = async () => {
    setTesting(true);
    setTestResult('');
    try {
      const res = await fetch('/api/firebase/test', { method: 'POST' });
      const d   = await res.json();
      if (d.success) {
        setTestResult('✅ Firestore connected! Test document written successfully.');
        setRecentDocs(d.docs || []);
      } else {
        setTestResult(`⚠️ ${d.message || 'Need to enable Firestore in Firebase Console first'}`);
      }
    } catch {
      setTestResult('⚠️ Enable Firestore Database in Firebase Console to connect.');
    } finally { setTesting(false); }
  };

  return (
    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg shadow-orange-500/20">
            🔥
          </div>
          <div>
            <h2 className="text-xl font-black text-white">GOOGLE FIREBASE</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">
              aksharaworld-481e8 — Spark Plan (Free) — 6 Services
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
            ✅ Connected
          </span>
          <a
            href="https://console.firebase.google.com/project/aksharaworld-481e8/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-black uppercase hover:bg-orange-500/20 transition-all"
          >
            Firebase Console ↗
          </a>
        </div>
      </div>

      {/* Project config */}
      <div className="p-5 rounded-2xl bg-black/40 border border-white/5 font-mono text-[10px] text-gray-400 space-y-1">
        <div className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-3">🔥 Firebase Config — aksharaworld-481e8</div>
        <div><span className="text-gray-600">projectId:</span>         <span className="text-emerald-400">aksharaworld-481e8</span></div>
        <div><span className="text-gray-600">authDomain:</span>        <span className="text-blue-400">aksharaworld-481e8.firebaseapp.com</span></div>
        <div><span className="text-gray-600">storageBucket:</span>     <span className="text-purple-400">aksharaworld-481e8.firebasestorage.app</span></div>
        <div><span className="text-gray-600">messagingSenderId:</span> <span className="text-yellow-400">633321287038</span></div>
        <div><span className="text-gray-600">measurementId:</span>     <span className="text-cyan-400">G-VJ7GHMKHFM</span></div>
        <div><span className="text-gray-600">hosting:</span>           <span className="text-white">aksharaworld-481e8.web.app</span></div>
      </div>

      {/* Services grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(s => (
          <a
            key={s.name}
            href={s.consoleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-2xl bg-black/30 border border-white/5 hover:border-orange-500/20 transition-all group space-y-3"
          >
            <div className="flex justify-between items-start">
              <span className="text-2xl">{s.icon}</span>
              <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${statusStyle[s.status]}`}>
                {s.status}
              </span>
            </div>
            <div>
              <div className="text-xs font-black text-white group-hover:text-orange-300 transition-colors">{s.name}</div>
              <div className="text-[10px] text-gray-500 mt-1">{s.description}</div>
              {s.value && <div className="text-[9px] font-mono text-cyan-400 mt-1">{s.value}</div>}
            </div>
          </a>
        ))}
      </div>

      {/* Firestore test */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-900/20 to-red-900/10 border border-orange-500/10 space-y-3">
        <div className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">🗄️ Enable Firestore — Real-time Database</div>
        <p className="text-xs text-gray-500">
          Go to Firebase Console → Firestore Database → Create database → Start in test mode → Then click Test below.
        </p>
        <div className="flex gap-3 flex-wrap">
          <a
            href="https://console.firebase.google.com/project/aksharaworld-481e8/firestore"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-black uppercase hover:bg-orange-500 transition-all"
          >
            1. Enable Firestore ↗
          </a>
          <button
            onClick={testFirestore}
            disabled={testing}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-bold uppercase hover:text-white transition-all disabled:opacity-40"
          >
            {testing ? '⏳ Testing...' : '2. Test Connection'}
          </button>
        </div>
        {testResult && (
          <p className={`text-xs font-bold ${testResult.startsWith('✅') ? 'text-emerald-400' : 'text-yellow-400'}`}>
            {testResult}
          </p>
        )}
      </div>

      {/* Recent Firestore docs */}
      {recentDocs.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Recent Firestore Documents</div>
          {recentDocs.map((d, i) => (
            <div key={i} className="p-3 rounded-xl bg-black/30 border border-white/5 text-xs">
              <span className="text-orange-400 font-mono">{d.collection}/{d.id}</span>
              <span className="text-gray-500 ml-2">{d.timestamp}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
