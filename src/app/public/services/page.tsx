export const runtime = 'edge';
import React from 'react'

export default function ServicesPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-24">
      <h1 className="text-5xl font-black mb-16 tracking-tighter">OUR <span className="text-gray-600">SERVICES</span></h1>
      <div className="grid md:grid-cols-2 gap-8">
        {[
          { title: "Autonomous CEO Architecture", desc: "Building self-operating business engines powered by custom AI CEO brains." },
          { title: "Departmental Agent Integration", desc: "Deploying 8+ specialized departments (Tech, Revenue, Content) as code." },
          { title: "Digital Gravity Scaling", desc: "Algorithmic business scaling using zero-cost infrastructure and AI leverage." },
          { title: "Business DNA Capsule", desc: "Codifying your business vision into a persistent, AI-readable solid-state memory." }
        ].map((s) => (
          <div key={s.title} className="p-10 rounded-[3rem] bg-white/[0.03] border border-white/10">
            <h2 className="text-2xl font-bold mb-4">{s.title}</h2>
            <p className="text-gray-500 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
