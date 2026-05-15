import React from 'react'

export default function AIProductPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <div className="p-1 rounded-3xl bg-gradient-to-r from-cyan-500 to-purple-600 mb-12">
        <div className="bg-[#050505] rounded-[1.4rem] p-12 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            AI PRODUCTIVITY <br />
            <span className="text-cyan-400">BLUEPRINT</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10">
            Master the autonomous workflows used by Akshara World to run a 24/7 digital business with zero human labor.
          </p>
          <div className="text-5xl font-bold mb-10">
            ₹499 <span className="text-sm text-gray-500 line-through">₹2,999</span>
          </div>
          <a 
            href="https://rzp.io/rzp/9O1zMeI" 
            className="inline-block px-12 py-5 rounded-full bg-cyan-500 text-black font-black text-xl hover:bg-cyan-400 transition-all shadow-[0_0_40px_rgba(34,211,238,0.4)]"
          >
            GET INSTANT ACCESS
          </a>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mt-20">
        <div>
          <h2 className="text-2xl font-bold mb-6">What's Inside?</h2>
          <ul className="space-y-4 text-gray-400">
            <li className="flex gap-3">✅ <span><strong>The Sam Engine:</strong> How to build your own AI CEO.</span></li>
            <li className="flex gap-3">✅ <span><strong>Autonomous Depts:</strong> Setting up self-healing workflows.</span></li>
            <li className="flex gap-3">✅ <span><strong>Zero-Cost Stack:</strong> The exact tools we use for ₹0 overhead.</span></li>
            <li className="flex gap-3">✅ <span><strong>The Antigravity Loop:</strong> Continuous revenue scaling.</span></li>
          </ul>
        </div>
        <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold mb-6">Guaranteed Results</h2>
          <p className="text-gray-400 leading-relaxed">
            This isn't just a course. It's the blueprint we used to launch Akshara World. If you can't automate at least 50% of your work within 7 days, we'll refund your ₹499 immediately.
          </p>
        </div>
      </div>
    </div>
  )
}
