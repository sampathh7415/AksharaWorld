import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    // 1. Fetch Razorpay Payments (Last 5)
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
    const rzpResponse = await fetch('https://api.razorpay.com/v1/payments?count=5', {
      headers: { Authorization: `Basic ${auth}` }
    })
    const rzpData = await rzpResponse.json()

    // 2. Aggregate Metrics (Mock for now, will connect to GA4/Sheets later)
    const metrics = {
      revenue: rzpData.items?.reduce((acc: number, p: any) => acc + (p.amount / 100), 0) || 0,
      visitors: 124, // To be replaced by GA4
      subscribers: 12, // To be replaced by Brevo
      published: 3 // To be replaced by Blog logic
    }

    return NextResponse.json({
      metrics,
      recentTransactions: rzpData.items || [],
      systemHealth: 'Optimal',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Data API Error:', error)
    return NextResponse.json({ error: 'Failed to aggregate business data' }, { status: 500 })
  }
}
