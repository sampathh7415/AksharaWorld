import { NextResponse } from 'next/server'
import { sendTelegramAlert } from '../../../../lib/telegram'
import { runInnovationScan } from '../../../../lib/scout'

export async function POST(req: Request) {
  try {
    const { action } = await req.json()
    
    if (action === 'test-telegram') {
      const res = await sendTelegramAlert("✅ <b>Guardian_Ops Activated</b>\nTelegram alerts are now LIVE for @Sampathh7.")
      return NextResponse.json({ success: res.success })
    }

    if (action === 'run-scout') {
      const res = await runInnovationScan()
      return NextResponse.json({ success: res.success, findings: res.findings })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
