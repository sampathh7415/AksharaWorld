import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Thank You! — Akshara World',
  description: 'Your purchase was successful. Welcome to AI Productivity Blueprint!',
}

export default function ThankYouPage({
  searchParams,
}: {
  searchParams: { payment_id?: string; status?: string }
}) {
  const paymentId = searchParams.payment_id || ''
  const status = searchParams.status || 'paid'

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      fontFamily: "'Inter', -apple-system, sans-serif",
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
    }}>
      {/* Success Icon */}
      <div style={{
        width: '100px', height: '100px',
        background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '3rem', marginBottom: '32px',
        boxShadow: '0 0 60px rgba(67,233,123,0.4)',
        animation: 'pulse 2s infinite'
      }}>
        ✅
      </div>

      <h1 style={{
        fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800,
        background: 'linear-gradient(90deg, #43e97b, #38f9d7)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        marginBottom: '16px'
      }}>
        Payment Successful! 🎉
      </h1>

      <p style={{
        fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)',
        marginBottom: '12px', maxWidth: '500px', lineHeight: 1.6
      }}>
        Welcome to the <strong style={{ color: '#fff' }}>AI Productivity Blueprint</strong>!<br />
        You&apos;re about to transform how you work with AI.
      </p>

      {paymentId && (
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px', padding: '16px 24px',
          marginBottom: '40px', fontSize: '0.85rem',
          color: 'rgba(255,255,255,0.5)'
        }}>
          Payment ID: <code style={{ color: '#43e97b', fontFamily: 'monospace' }}>{paymentId}</code>
          <br />Status: <span style={{ color: '#43e97b', fontWeight: 600 }}>{status.toUpperCase()}</span>
        </div>
      )}

      {/* Next Steps */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px', padding: '40px',
        maxWidth: '560px', width: '100%',
        marginBottom: '32px', textAlign: 'left'
      }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>
          📦 What Happens Next
        </h2>
        {[
          { icon: '📧', title: 'Check your email', desc: 'Your purchase confirmation and download link will arrive within 5 minutes' },
          { icon: '📱', title: 'Join our community', desc: 'You\'ll receive an invite to our private AI Productivity group' },
          { icon: '🚀', title: 'Start your journey', desc: 'Open the blueprint and begin your 90-day AI transformation' },
        ].map((step, i) => (
          <div key={i} style={{
            display: 'flex', gap: '16px', alignItems: 'flex-start',
            padding: '16px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none'
          }}>
            <span style={{ fontSize: '1.8rem', minWidth: '40px' }}>{step.icon}</span>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>{step.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>{step.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" style={{
          background: 'linear-gradient(90deg, #f093fb, #f5576c)',
          color: '#fff', textDecoration: 'none',
          padding: '14px 32px', borderRadius: '12px',
          fontWeight: 700, fontSize: '1rem'
        }}>
          🏠 Go to Dashboard
        </Link>
        <Link href="/products/ai-blueprint" style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#fff', textDecoration: 'none',
          padding: '14px 32px', borderRadius: '12px',
          fontWeight: 600, fontSize: '1rem'
        }}>
          ← Back to Product
        </Link>
      </div>

      <p style={{ marginTop: '32px', color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem' }}>
        Questions? Email: sampathh7415@gmail.com
      </p>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 60px rgba(67,233,123,0.4); }
          50% { box-shadow: 0 0 80px rgba(67,233,123,0.7); }
        }
      `}</style>
    </main>
  )
}
