import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getMockData, TimeRange } from '@/lib/mock-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') || '24H') as TimeRange;
    const mockFunnel = getMockData(timeRange).conversionFunnel;

    const { rows } = await pool.query(`
      SELECT 
        (SELECT COUNT(DISTINCT session_id) FROM user_events WHERE event_type = 'page_view') AS step1_visitors,
        (SELECT COUNT(DISTINCT user_id) FROM user_events WHERE event_type = 'signup') AS step2_signups,
        (SELECT COUNT(DISTINCT customer_id) FROM revenue_events WHERE event_type = 'purchase') AS step3_purchases
    `);

    const visitors = Number(rows[0]?.step1_visitors || 0);
    const signups = Number(rows[0]?.step2_signups || 0);
    const purchases = Number(rows[0]?.step3_purchases || 0);

    let stages = mockFunnel.stages;
    if (visitors > 0) {
      stages = [
        { name: "Visitors", count: visitors, conversionRate: 100 },
        { name: "Signups", count: signups, conversionRate: (signups / visitors) * 100 },
        { name: "Purchases", count: purchases, conversionRate: signups > 0 ? (purchases / signups) * 100 : 0 },
      ];
    }

    const data = {
      ...mockFunnel,
      stages,
      overallConversionRate: visitors > 0 ? purchases / visitors : mockFunnel.overallConversionRate
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Funnel API Error:", error);
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') || '24H') as TimeRange;
    return NextResponse.json(getMockData(timeRange).conversionFunnel);
  }
}
