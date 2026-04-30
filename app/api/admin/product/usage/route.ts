import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getMockData, TimeRange } from '@/lib/mock-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') || '24H') as TimeRange;
    const mockProduct = getMockData(timeRange).productUsage;

    const [
      { rows: dauRow },
      { rows: mauRow },
      { rows: eventsRow },
    ] = await Promise.all([
      pool.query(`SELECT COUNT(DISTINCT user_id) AS dau FROM user_events WHERE created_at >= NOW() - INTERVAL '1 day' AND user_id IS NOT NULL`),
      pool.query(`SELECT COUNT(DISTINCT user_id) AS mau FROM user_events WHERE created_at >= NOW() - INTERVAL '1 month' AND user_id IS NOT NULL`),
      pool.query(`SELECT event_type, COUNT(*) as count FROM user_events WHERE event_type IN ('pr_reviewed', 'issue_fixed', 'token_usage') GROUP BY event_type`)
    ]);

    const dau = Number(dauRow[0]?.dau || 0);
    const mau = Number(mauRow[0]?.mau || 0);

    // Map db events to features array
    const dbFeatures = eventsRow.map(row => ({
      name: row.event_type,
      users: Number(row.count),
      timeSpent: 0
    }));

    const data = {
      ...mockProduct,
      dau: dau > 0 ? dau : mockProduct.dau,
      mau: mau > 0 ? mau : mockProduct.mau,
      features: dbFeatures.length > 0 ? [...dbFeatures, ...mockProduct.features.filter(f => !dbFeatures.find(df => df.name === f.name))] : mockProduct.features,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Product Usage API Error:", error);
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') || '24H') as TimeRange;
    return NextResponse.json(getMockData(timeRange).productUsage);
  }
}
