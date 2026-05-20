import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getMockData, TimeRange } from '@/lib/mock-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') || '24H') as TimeRange;

    const [
      { rows: planDistribution },
      { rows: mrrRow },
      { rows: revenueByTier },
      { rows: razorpayPlans },
    ] = await Promise.all([
      pool.query(`SELECT plan, COUNT(*)::int AS count FROM users GROUP BY plan ORDER BY count DESC`),
      pool.query(`SELECT COALESCE(SUM(amount)/100.0, 0)::float AS mrr FROM revenue_events WHERE event_type = 'subscription' AND created_at >= NOW() - INTERVAL '1 month'`),
      pool.query(`SELECT subscription_tier, SUM(amount)/100.0::float AS revenue FROM revenue_events GROUP BY subscription_tier ORDER BY revenue DESC`),
      pool.query(`SELECT internal_plan_id, amount, currency FROM razorpay_plans ORDER BY amount`),
    ]);

    const mrr = mrrRow[0]?.mrr || 0;
    const freeCount = planDistribution.find((r: any) => r.plan === 'free')?.count || 0;
    const totalUsers = planDistribution.reduce((sum: number, r: any) => sum + r.count, 0);
    const payingUsers = totalUsers - freeCount;

    return NextResponse.json({
      planDistribution,
      mrr,
      arr: mrr * 12,
      revenueByTier,
      razorpayPlans,
      totalUsers,
      payingUsers,
      freeUsers: freeCount,
    });
  } catch (error) {
    console.error("Subscriptions API Error:", error);
    return NextResponse.json(getMockData('24H').saas);
  }
}
