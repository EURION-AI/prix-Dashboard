import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getMockData, TimeRange } from '@/lib/mock-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') || '24H') as TimeRange;
    const mockSaas = getMockData(timeRange).saas;

    const [
      { rows: planRows },
      { rows: newSubsRow },
    ] = await Promise.all([
      pool.query(`SELECT plan, COUNT(*) AS count FROM users GROUP BY plan`),
      pool.query(`SELECT COUNT(*) as new_subs FROM revenue_events WHERE event_type = 'subscription' AND created_at >= NOW() - INTERVAL '1 month'`)
    ]);

    const customerSegments = planRows.map(row => ({
      name: row.plan || 'Unknown',
      value: Number(row.count)
    }));

    const activeSubs = customerSegments.filter(c => c.name !== 'free').reduce((acc, curr) => acc + curr.value, 0);
    const freeUsers = customerSegments.find(c => c.name === 'free')?.value || 0;

    const data = {
      ...mockSaas,
      customerSegments: customerSegments.length > 0 ? customerSegments : mockSaas.customerSegments,
      activeSubs: activeSubs > 0 ? activeSubs : mockSaas.activeSubs,
      freeUsers: freeUsers > 0 ? freeUsers : mockSaas.freeUsers,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Subscriptions API Error:", error);
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') || '24H') as TimeRange;
    return NextResponse.json(getMockData(timeRange).saas);
  }
}
