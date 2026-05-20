import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getMockData, TimeRange } from '@/lib/mock-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') || '24H') as TimeRange;

    const [
      { rows: monthlyUsage },
      { rows: totalUsage },
      { rows: execStats },
      { rows: dailyAgg },
    ] = await Promise.all([
      pool.query(`
        SELECT
          COALESCE(SUM(prs_reviewed_monthly), 0)::int AS prs_reviewed,
          COALESCE(SUM(auto_prs_monthly), 0)::int AS auto_prs,
          COALESCE(SUM(issues_planned_monthly), 0)::int AS issues_planned,
          COALESCE(SUM(monthly_grand_total), 0)::int AS grand_total
        FROM user_consumption
      `),
      pool.query(`
        SELECT
          COALESCE(SUM(prs_reviewed_total), 0)::int AS prs_reviewed,
          COALESCE(SUM(auto_prs_total), 0)::int AS auto_prs,
          COALESCE(SUM(issues_planned_total), 0)::int AS issues_planned
        FROM user_consumption
      `),
      pool.query(`
        SELECT
          COUNT(*)::int AS total_executions,
          COALESCE(AVG(execution_duration_ms), 0)::float AS avg_duration,
          COALESCE(AVG(files_retrieved), 0)::float AS avg_files,
          COALESCE(AVG(token_estimate), 0)::float AS avg_tokens
        FROM issue_plan_logs
      `),
      pool.query(`
        SELECT date::text, total_value::float
        FROM daily_aggregates
        WHERE metric_category = 'product_usage'
        ORDER BY date
      `),
    ]);

    return NextResponse.json({
      monthlyUsage: monthlyUsage[0],
      totalUsage: totalUsage[0],
      executionStats: execStats[0],
      chartData: dailyAgg.map((r: any) => ({ date: r.date, value: r.total_value })),
    });
  } catch (error) {
    console.error("Product Usage API Error:", error);
    return NextResponse.json(getMockData('24H').productUsage);
  }
}
