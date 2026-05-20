import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getMockData, TimeRange } from '@/lib/mock-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') || '24H') as TimeRange;

    const [
      { rows: totalUsersRow },
      { rows: planDistributionRow },
      { rows: totalPrsRow },
      { rows: mrrRow },
      { rows: affiliateUsersRow },
      { rows: affiliateEventsRow },
      { rows: referralsRow },
      { rows: dailyAggRow },
    ] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS count FROM users`),
      pool.query(`SELECT plan, COUNT(*)::int AS count FROM users GROUP BY plan`),
      pool.query(`SELECT COALESCE(SUM(prs_reviewed), 0)::int AS total FROM users`),
      pool.query(`SELECT COALESCE(SUM(amount)/100.0, 0)::float AS mrr FROM revenue_events WHERE event_type = 'subscription' AND created_at >= NOW() - INTERVAL '1 month'`),
      pool.query(`SELECT COUNT(*)::int AS count FROM affiliate_users`),
      pool.query(`SELECT COALESCE(SUM(commission_amount)/100.0, 0)::float AS revenue FROM affiliate_events WHERE event_type = 'commission_paid'`),
      pool.query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE has_purchased = true)::int AS converted FROM referrals`),
      pool.query(`SELECT date::text, total_value::float FROM daily_aggregates WHERE metric_category = 'overview' ORDER BY date`),
    ]);

    const totalUsers = totalUsersRow[0]?.count || 0;
    const totalPrsReviewed = totalPrsRow[0]?.total || 0;
    const mrr = mrrRow[0]?.mrr || 0;
    const activeAffiliates = affiliateUsersRow[0]?.count || 0;
    const affiliateRevenue = affiliateEventsRow[0]?.revenue || 0;
    const referrals = referralsRow[0]?.total || 0;
    const convertedReferrals = referralsRow[0]?.converted || 0;

    const planDistribution = planDistributionRow.map((r: any) => ({
      plan: r.plan || 'free',
      count: r.count,
    }));

    const chartData = dailyAggRow.map((r: any) => ({
      date: r.date,
      value: r.total_value,
    }));

    return NextResponse.json({
      totalUsers,
      planDistribution,
      totalPrsReviewed,
      mrr,
      arr: mrr * 12,
      activeAffiliates,
      affiliateRevenue,
      referrals,
      convertedReferrals,
      referralConversionRate: referrals > 0 ? (convertedReferrals / referrals) * 100 : 0,
      chartData,
    });
  } catch (error) {
    console.error("Overview API Error:", error);
    return NextResponse.json(getMockData('24H').globalOverview);
  }
}
