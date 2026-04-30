import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getMockData, TimeRange } from '@/lib/mock-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') || '24H') as TimeRange;
    const mockOverview = getMockData(timeRange).globalOverview;

    const [
      { rows: visitorsRow },
      { rows: sessionsRow },
      { rows: pageViewsRow },
      { rows: signupsRow },
      { rows: mrrRow },
      { rows: payingCustomersRow },
      { rows: affiliatesRow },
      { rows: affiliateRevRow },
    ] = await Promise.all([
      pool.query(`SELECT COUNT(DISTINCT ip_hash) AS unique_visitors FROM user_events`),
      pool.query(`SELECT COUNT(DISTINCT session_id) AS total_sessions FROM user_events`),
      pool.query(`SELECT COUNT(*) AS page_views FROM user_events WHERE event_type = 'page_view'`),
      pool.query(`SELECT COUNT(*) AS total_signups FROM users`),
      pool.query(`SELECT SUM(amount) / 100 AS mrr FROM revenue_events WHERE event_type = 'subscription' AND created_at >= NOW() - INTERVAL '1 month'`),
      pool.query(`SELECT COUNT(*) AS paying_customers FROM users WHERE plan != 'free'`),
      pool.query(`SELECT COUNT(*) AS active_affiliates FROM affiliate_users`),
      pool.query(`SELECT SUM(commission_amount) / 100 AS affiliate_revenue FROM affiliate_events WHERE event_type = 'commission_paid'`),
    ]);

    const mrr = Number(mrrRow[0]?.mrr || 0);

    const data = {
      ...mockOverview, // Use mock data for charts and missing fields
      visitors: Number(visitorsRow[0]?.unique_visitors || 0),
      sessions: Number(sessionsRow[0]?.total_sessions || 0),
      pageViews: Number(pageViewsRow[0]?.page_views || 0),
      signups: Number(signupsRow[0]?.total_signups || 0),
      payingCustomers: Number(payingCustomersRow[0]?.paying_customers || 0),
      mrr: mrr,
      arr: mrr * 12,
      activeAffiliates: Number(affiliatesRow[0]?.active_affiliates || 0),
      affiliateRevenue: Number(affiliateRevRow[0]?.affiliate_revenue || 0),
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Overview API Error:", error);
    // If DB fails, fallback entirely to mock data
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') || '24H') as TimeRange;
    return NextResponse.json(getMockData(timeRange).globalOverview);
  }
}
