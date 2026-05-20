import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getMockData, TimeRange } from '@/lib/mock-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') || '24H') as TimeRange;

    const { rows } = await pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM users) AS total_users,
        (SELECT COUNT(*)::int FROM users WHERE plan != 'free') AS paying_users,
        (SELECT COUNT(*)::int FROM referrals) AS total_referrals,
        (SELECT COUNT(*)::int FROM referrals WHERE has_purchased = true) AS converted_referrals
    `);

    const totalUsers = Number(rows[0]?.total_users || 0);
    const payingUsers = Number(rows[0]?.paying_users || 0);
    const totalReferrals = Number(rows[0]?.total_referrals || 0);
    const convertedReferrals = Number(rows[0]?.converted_referrals || 0);

    const stages = [
      { name: "Total Users", count: totalUsers, conversionRate: 100 },
      { name: "Paying Users", count: payingUsers, conversionRate: totalUsers > 0 ? (payingUsers / totalUsers) * 100 : 0 },
      { name: "Total Referrals", count: totalReferrals, conversionRate: payingUsers > 0 ? (totalReferrals / payingUsers) * 100 : 0 },
      { name: "Converted Referrals", count: convertedReferrals, conversionRate: totalReferrals > 0 ? (convertedReferrals / totalReferrals) * 100 : 0 },
    ];

    const referralChart = [
      { name: "Referred", value: totalReferrals },
      { name: "Purchased", value: convertedReferrals },
    ];

    return NextResponse.json({
      stages,
      overallConversionRate: totalUsers > 0 ? convertedReferrals / totalUsers : 0,
      referralChart,
    });
  } catch (error) {
    console.error("Funnel API Error:", error);
    return NextResponse.json(getMockData('24H').conversionFunnel);
  }
}
