import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getMockData, TimeRange } from '@/lib/mock-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') || '24H') as TimeRange;

    const { rows: suspiciousAffiliates } = await pool.query(`
      SELECT
        e.affiliate_code,
        COALESCE(a.username, 'Unknown') AS username,
        COUNT(*) FILTER (WHERE e.event_type = 'click')::int AS clicks,
        COUNT(*) FILTER (WHERE e.event_type = 'conversion')::int AS conversions
      FROM affiliate_events e
      LEFT JOIN affiliate_users a ON e.affiliate_code = a.affiliate_code
      GROUP BY e.affiliate_code, a.username
      ORDER BY clicks DESC
    `);

    const affiliateData = suspiciousAffiliates.map((row: any) => ({
      affiliateCode: row.affiliate_code,
      username: row.username,
      clicks: row.clicks,
      conversions: row.conversions,
      ratio: row.conversions > 0 ? row.clicks / row.conversions : row.clicks,
      suspicious: row.clicks > 0 && row.conversions === 0,
    }));

    const suspicious = affiliateData.filter((a: any) => a.suspicious);

    return NextResponse.json({
      affiliateData,
      suspiciousAffiliates: suspicious,
      totalSuspicious: suspicious.length,
      totalAffiliates: affiliateData.length,
      totalClicks: affiliateData.reduce((s: number, a: any) => s + a.clicks, 0),
    });
  } catch (error) {
    console.error("Security API Error:", error);
    return NextResponse.json(getMockData('24H').security);
  }
}
