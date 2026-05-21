import { NextResponse } from 'next/server'
import { sendTelegramAlert } from '../../../lib/telegram'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay keys missing' }, { status: 500 })
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
    
    // 1. Fetch Real Razorpay Data
    const [paymentsRes, paymentLinksRes] = await Promise.all([
      fetch('https://api.razorpay.com/v1/payments?count=10', {
        headers: { Authorization: `Basic ${auth}` }
      }),
      fetch('https://api.razorpay.com/v1/payment_links?count=10', {
        headers: { Authorization: `Basic ${auth}` }
      })
    ])

    const payments = await paymentsRes.json()
    const links = await paymentLinksRes.json()

    // 2. Real Aggregation
    const totalRevenue = (payments.items || []).reduce((acc: number, p: any) => {
      return p.status === 'captured' ? acc + (p.amount / 100) : acc
    }, 0)

    const metrics = {
      revenue: totalRevenue,
      transactions: payments.count || 0,
      activeLinks: (links.items || []).filter((l: any) => l.status === 'active').length,
      status: 'Live'
    }

    return NextResponse.json({
      metrics,
      recentPayments: (payments.items || []).slice(0, 5),
      recentLinks: (links.items || []).slice(0, 5),
      systemHealth: 'Optimal',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Data API Error:', error)
    await sendTelegramAlert(`🚨 <b>Guardian_Ops Alert</b>\nData API Failure: ${error.message}`)
    return NextResponse.json({ error: 'Failed to aggregate live data' }, { status: 500 })
  }
}
