import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [
      { rows: prsByRepo },
      { rows: activityTimeline },
      { rows: issueExecutions },
      { rows: execStats },
    ] = await Promise.all([
      pool.query(`
        SELECT repo_name, COUNT(*)::int AS count
        FROM audit_logs
        GROUP BY repo_name
        ORDER BY count DESC
        LIMIT 20
      `),
      pool.query(`
        SELECT DATE(created_at)::text AS date, COUNT(*)::int AS count
        FROM audit_logs
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date
      `),
      pool.query(`
        SELECT repo_name, COUNT(*)::int AS count, COALESCE(AVG(execution_duration_ms), 0)::float AS avg_duration
        FROM issue_plan_logs
        GROUP BY repo_name
        ORDER BY count DESC
        LIMIT 20
      `),
      pool.query(`
        SELECT
          COUNT(*)::int AS total_prs,
          (SELECT COUNT(*)::int FROM issue_plan_logs) AS total_issues,
          COALESCE(AVG(execution_duration_ms), 0)::float AS avg_exec_duration
        FROM audit_logs
      `),
    ]);

    return NextResponse.json({
      prsByRepo,
      activityTimeline,
      issueExecutions,
      totalPrs: execStats[0]?.total_prs || 0,
      totalIssues: execStats[0]?.total_issues || 0,
      avgExecutionDuration: execStats[0]?.avg_exec_duration || 0,
    });
  } catch (error) {
    console.error("Activity API Error:", error);
    return NextResponse.json({
      prsByRepo: [],
      activityTimeline: [],
      issueExecutions: [],
      totalPrs: 0,
      totalIssues: 0,
      avgExecutionDuration: 0,
    });
  }
}
