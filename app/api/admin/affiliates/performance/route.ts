import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getMockData, TimeRange } from '@/lib/mock-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') || '24H') as TimeRange;

    const [
      { rows: affiliateData },
      { rows: referralStats },
    ] = await Promise.all([
      pool.query(`
        SELECT
          a.username, a.affiliate_code, a.tier,
          a.referral_count::int, a.paid_referral_count::int,
          COALESCE(COUNT(e.id) FILTER (WHERE e.event_type = 'click'), 0)::int AS total_clicks,
          COALESCE(COUNT(e.id) FILTER (WHERE e.event_type = 'conversion'), 0)::int AS total_conversions,
          COALESCE(SUM(e.commission_amount)/100.0, 0)::float AS total_commission
        FROM affiliate_users a
        LEFT JOIN affiliate_events e ON a.affiliate_code = e.affiliate_code
        GROUP BY a.id, a.username, a.affiliate_code, a.tier, a.referral_count, a.paid_referral_count
        ORDER BY total_conversions DESC
      `),
      pool.query(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE has_purchased = true)::int AS converted,
          COALESCE(SUM(purchased_amount)/100.0, 0)::float AS total_revenue
        FROM referrals
      `),
    ]);

    const affiliates = affiliateData.map((row: any) => ({
      name: row.username || 'Unknown',
      affiliateCode: row.affiliate_code,
      tier: row.tier || 'standard',
      referralCount: row.referral_count,
      paidReferralCount: row.paid_referral_count,
      clicks: row.total_clicks,
      conversions: row.total_conversions,
      commission: row.total_commission,
      conversionRate: row.total_clicks > 0 ? (row.total_conversions / row.total_clicks) * 100 : 0,
    }));

    const totalClicks = affiliates.reduce((s: number, a: any) => s + a.clicks, 0);
    const totalConversions = affiliates.reduce((s: number, a: any) => s + a.conversions, 0);
    const totalCommission = affiliates.reduce((s: number, a: any) => s + a.commission, 0);

    return NextResponse.json({
      affiliates,
      totalClicks,
      totalConversions,
      conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
      totalCommission,
      revenuePerAffiliate: affiliates.length > 0 ? totalCommission / affiliates.length : 0,
      ...referralStats[0],
    });
  } catch (error) {
    console.error("Affiliates API Error:", error);
    return NextResponse.json(getMockData('24H').affiliates);
  }
}
