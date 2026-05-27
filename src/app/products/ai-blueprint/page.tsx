import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AI Productivity Blueprint — Akshara World',
  description: 'Master AI tools and boost your productivity by 10x. The ultimate blueprint for entrepreneurs and creators.',
}

export default function AIBlueprintPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      fontFamily: "'Inter', -apple-system, sans-serif",
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0 20px',
    }}>
      {/* Nav */}
      <nav style={{
        width: '100%', maxWidth: '1100px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '24px 0', borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Link href="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '1.3rem' }}>
          🌟 Akshara World
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>AI Tools & Education</span>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '800px', textAlign: 'center', padding: '80px 0 60px' }}>
        <div style={{
          display: 'inline-block',
          background: 'linear-gradient(90deg, #f093fb, #f5576c)',
          borderRadius: '50px', padding: '8px 20px',
          fontSize: '0.85rem', fontWeight: 600, marginBottom: '28px', letterSpacing: '1px'
        }}>
          🔥 BESTSELLER — LIMITED TIME OFFER
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
          fontWeight: 800, lineHeight: 1.15,
          background: 'linear-gradient(90deg, #fff, #a78bfa)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '24px'
        }}>
          AI Productivity Blueprint
        </h1>

        <p style={{
          fontSize: '1.2rem', color: 'rgba(255,255,255,0.75)',
          lineHeight: 1.7, marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px'
        }}>
          Master the exact AI tools and workflows used by top entrepreneurs to 10x their productivity.
          Stop wasting time — start building smarter, faster.
        </p>

        {/* Price Card */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '24px', padding: '48px 40px',
          backdropFilter: 'blur(20px)', marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>₹999</span>
            <span style={{ fontSize: '3.5rem', fontWeight: 900, color: '#f5576c' }}>₹499</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '36px', fontSize: '0.9rem' }}>One-time payment • Lifetime access • Instant download</p>

          {/* What you get */}
          <div style={{ textAlign: 'left', marginBottom: '40px' }}>
            {[
              '📘 Complete AI Productivity Blueprint (PDF + Videos)',
              '🤖 50+ Tested AI Prompts for Entrepreneurs',
              '⚡ Automation Templates for Daily Work',
              '📊 Business Growth Frameworks',
              '🎯 90-Day Action Plan',
              '💬 Private Community Access',
              '🔄 Lifetime Free Updates',
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}>
                <span style={{ fontSize: '1rem' }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Buy Button */}
          <a
            href="https://rzp.io/rzp/9O1zMeI"
            style={{
              display: 'block', width: '100%',
              background: 'linear-gradient(90deg, #f093fb, #f5576c)',
              color: '#fff', textDecoration: 'none',
              padding: '20px', borderRadius: '14px',
              fontSize: '1.25rem', fontWeight: 800, textAlign: 'center',
              boxShadow: '0 8px 32px rgba(245,87,108,0.4)',
              transition: 'transform 0.2s',
              letterSpacing: '0.5px'
            }}
          >
            💳 Buy Now for ₹499 →
          </a>

          <p style={{ marginTop: '16px', color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>
            🔒 100% Secure Payment via Razorpay &nbsp;|&nbsp; ✅ Instant Access After Payment
          </p>
        </div>

        {/* Trust badges */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap',
          color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem'
        }}>
          <span>⭐ 4.9/5 Rating</span>
          <span>👥 500+ Students</span>
          <span>🛡️ Money-back Guarantee</span>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto', padding: '32px 0',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        textAlign: 'center', color: 'rgba(255,255,255,0.3)',
        fontSize: '0.82rem', width: '100%', maxWidth: '1100px'
      }}>
        © 2026 Akshara World | <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Home</Link>
        &nbsp;| Questions? Email: sampathh7415@gmail.com
      </footer>
    </main>
  )
}
