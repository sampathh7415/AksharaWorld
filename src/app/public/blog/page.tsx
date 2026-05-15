import React from 'react'

const posts = [
  {
    slug: 'autonomous-ceo',
    title: 'The Rise of the Autonomous CEO',
    date: 'May 15, 2026',
    excerpt: 'How AI CEO Sam manages 11 departments and 24/7 operations without human intervention.'
  },
  {
    slug: 'zero-cost-infra',
    title: 'Zero-Cost Infrastructure',
    date: 'May 16, 2026',
    excerpt: 'The secret tech stack behind a revenue-generating business with ₹0 monthly overhead.'
  },
  {
    slug: 'digital-gravity',
    title: 'Digital Gravity & Business Failure',
    date: 'May 17, 2026',
    excerpt: 'Why traditional business models are collapsing under the weight of AI-driven competition.'
  }
]

export default function BlogHub() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <h1 className="text-5xl font-black mb-16 tracking-tighter">INSIGHT_LAB <span className="text-gray-600">BLOG</span></h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
        {posts.map((post) => (
          <a href={`/blog/${post.slug}`} key={post.slug} className="group p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-cyan-500/50 transition-all backdrop-blur-3xl">
            <div className="text-xs text-cyan-400 font-bold uppercase tracking-widest mb-4">{post.date}</div>
            <h2 className="text-2xl font-bold mb-4 group-hover:text-cyan-400 transition-colors leading-tight">{post.title}</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">{post.excerpt}</p>
            <div className="text-sm font-bold border-b border-white/10 pb-1 inline-block">Read Full Post →</div>
          </a>
        ))}
      </div>
    </div>
  )
}
