export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsConsole } from '../../../../lib/google/analyticsConsole';

export async function GET(req: NextRequest) {
  try {
    const [keywords, speed, channels, visitor] = await Promise.all([
      AnalyticsConsole.getSEOKeywords(),
      AnalyticsConsole.getPageSpeedMetrics(),
      AnalyticsConsole.getAcquisitionChannels(),
      AnalyticsConsole.getVisitorTelemetry()
    ]);

    return NextResponse.json({
      success: true,
      data: {
        keywords,
        speed,
        channels,
        visitor
      }
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
