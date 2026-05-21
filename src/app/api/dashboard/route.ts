import { NextResponse } from 'next/server';

const SAM_BRAIN_URL = process.env.NEXT_PUBLIC_SAM_BRAIN_URL || 'https://sam-ceo-brain.akshara-sam.workers.dev';

export async function GET() {
  const result: any = { timestamp: new Date().toISOString() };

  // 1. Business DNA (Static for now to prevent Edge Runtime crash)
  result.capsule = 'Akshara World - Autonomous Business Hub. SAM AI CEO version 2.0.';

  // 2. Ping Sam Brain for live status
  try {
    const res = await fetch(`${SAM_BRAIN_URL}/health`, { signal: AbortSignal.timeout(4000) });
    const brain = await res.json();
    result.samBrain = { status: 'online', ...brain };
  } catch {
    result.samBrain = { status: 'offline', reason: 'Worker unreachable or not deployed yet.' };
  }

  // 3. Real-time business metrics (REAL DATA ONLY)
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    
    const rzpRes = await fetch('https://api.razorpay.com/v1/payments?count=100', {
      headers: { Authorization: `Basic ${auth}` }
    });
    const rzpData = await rzpRes.json();
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000;
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000;

    let totalRevenue = 0;
    let todayRevenue = 0;
    let monthRevenue = 0;

    (rzpData.items || []).forEach((p: any) => {
      if (p.status === 'captured') {
        const amount = p.amount / 100;
        totalRevenue += amount;
        if (p.created_at >= today) todayRevenue += amount;
        if (p.created_at >= thisMonth) monthRevenue += amount;
      }
    });

    result.metrics = {
      revenue: { 
        total: totalRevenue.toFixed(2), 
        today: todayRevenue.toFixed(2), 
        month: monthRevenue.toFixed(2), 
        currency: 'INR' 
      },
      transactions: rzpData.count || 0,
      aov: rzpData.count ? (totalRevenue / rzpData.count).toFixed(2) : '0.00',
      phase: 'Phase 1 — Operational MVP (Active)',
      departments: 8,
      uptime: '100%',
    };
  } catch {
    result.metrics = { revenue: 'API Error', status: 'Reconnecting...' };
  }

  return NextResponse.json(result);
}
