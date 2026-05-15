import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { message } = await req.json()
    const brainUrl = process.env.NEXT_PUBLIC_SAM_BRAIN_URL || 'https://sam-ceo-brain.akshara-sam.workers.dev'

    const response = await fetch(brainUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Sam API Error:', error)
    return NextResponse.json({ reply: 'Sam is currently recalibrating. Please stand by.' }, { status: 500 })
  }
}
