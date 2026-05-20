import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getMockData, TimeRange } from '@/lib/mock-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') || '24H') as TimeRange;

    const [
      { rows: execStats },
      { rows: activityTimeline },
    ] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)::int AS total_executions,
          COALESCE(AVG(execution_duration_ms), 0)::float AS avg_duration,
          COALESCE(MIN(execution_duration_ms), 0)::float AS min_duration,
          COALESCE(MAX(execution_duration_ms), 0)::float AS max_duration,
          COALESCE(AVG(files_retrieved), 0)::float AS avg_files,
          COALESCE(AVG(token_estimate), 0)::float AS avg_tokens
        FROM issue_plan_logs
      `),
      pool.query(`
        SELECT DATE(created_at)::text AS date, COUNT(*)::int AS count
        FROM audit_logs
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date
      `),
    ]);

    return NextResponse.json({
      executionStats: execStats[0],
      activityTimeline,
    });
  } catch (error) {
    console.error("Performance API Error:", error);
    return NextResponse.json(getMockData('24H').technical);
  }
}
