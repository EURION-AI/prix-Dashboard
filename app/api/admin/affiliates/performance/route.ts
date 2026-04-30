import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getMockData, TimeRange } from '@/lib/mock-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') || '24H') as TimeRange;
    const mockAffiliate = getMockData(timeRange).affiliates;

    const { rows } = await pool.query(`
      SELECT 
        a.username,
        a.affiliate_code,
        COUNT(e.id) FILTER (WHERE e.event_type = 'click') AS total_clicks,
        COUNT(e.id) FILTER (WHERE e.event_type = 'conversion') AS total_conversions,
        SUM(e.commission_amount) / 100 AS total_commission_owed
      FROM affiliate_users a
      LEFT JOIN affiliate_events e ON a.affiliate_code = e.affiliate_code
      GROUP BY a.id, a.username, a.affiliate_code
      ORDER BY total_conversions DESC
    `);

    const affiliates = rows.map(row => ({
      name: row.username,
      clicks: Number(row.total_clicks) || 0,
      conversions: Number(row.total_conversions) || 0,
      revenue: Number(row.total_conversions) * 100, // mock revenue calculation as real revenue isn't in query
      commission: Number(row.total_commission_owed) || 0,
      conversionRate: Number(row.total_clicks) > 0 ? (Number(row.total_conversions) / Number(row.total_clicks)) * 100 : 0
    }));

    const totalClicks = affiliates.reduce((sum, a) => sum + a.clicks, 0);
    const totalConversions = affiliates.reduce((sum, a) => sum + a.conversions, 0);
    const totalCommission = affiliates.reduce((sum, a) => sum + a.commission, 0);

    const data = {
      ...mockAffiliate,
      clicks: totalClicks > 0 ? totalClicks : mockAffiliate.clicks,
      signups: totalConversions > 0 ? totalConversions : mockAffiliate.signups,
      commissionOwed: totalCommission > 0 ? totalCommission : mockAffiliate.commissionOwed,
      affiliates: affiliates.length > 0 ? affiliates : mockAffiliate.affiliates,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Affiliates API Error:", error);
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') || '24H') as TimeRange;
    return NextResponse.json(getMockData(timeRange).affiliates);
  }
}
