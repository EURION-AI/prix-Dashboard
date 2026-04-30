import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getMockData, TimeRange } from '@/lib/mock-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') || '24H') as TimeRange;
    const mockTechnical = getMockData(timeRange).technical;

    const { rows } = await pool.query(`
      SELECT 
        AVG((metadata->>'lcp')::numeric) AS avg_lcp,
        AVG((metadata->>'ttfb')::numeric) AS avg_ttfb
      FROM user_events 
      WHERE event_type = 'web_vitals'
    `);

    const avgLcp = Number(rows[0]?.avg_lcp || 0);
    const avgTtfb = Number(rows[0]?.avg_ttfb || 0);

    const data = {
      ...mockTechnical,
      ttfb: avgTtfb > 0 ? avgTtfb : mockTechnical.ttfb,
      coreWebVitals: {
        ...mockTechnical.coreWebVitals,
        lcp: avgLcp > 0 ? avgLcp : mockTechnical.coreWebVitals.lcp,
      }
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Performance API Error:", error);
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') || '24H') as TimeRange;
    return NextResponse.json(getMockData(timeRange).technical);
  }
}
