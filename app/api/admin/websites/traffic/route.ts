import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getMockData, TimeRange } from '@/lib/mock-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') || '24H') as TimeRange;
    const mockWebsites = getMockData(timeRange).websiteAnalytics;

    const [
      { rows: referrersRow },
      { rows: pagesPerSessionRow },
    ] = await Promise.all([
      pool.query(`
        SELECT referrer, COUNT(*) AS count 
        FROM user_events 
        WHERE event_type = 'page_view' AND referrer IS NOT NULL 
        GROUP BY referrer 
        ORDER BY count DESC LIMIT 10
      `),
      pool.query(`
        WITH session_counts AS (
          SELECT session_id, COUNT(*) as pages FROM user_events WHERE event_type = 'page_view' GROUP BY session_id
        )
        SELECT AVG(pages) AS avg_pages_per_session FROM session_counts
      `)
    ]);

    // Map db top referrers
    const topReferrers = referrersRow.map(row => ({
      domain: row.referrer,
      visitors: Number(row.count)
    }));

    const avgPagesPerSession = Number(pagesPerSessionRow[0]?.avg_pages_per_session || 0);

    // Update the first mock website with db data
    const data = {
      websites: mockWebsites.websites.map((site, index) => {
        if (index === 0) {
          return {
            ...site,
            topReferrers: topReferrers.length > 0 ? topReferrers : site.topReferrers,
            pagesPerSession: avgPagesPerSession > 0 ? avgPagesPerSession : site.pagesPerSession,
          };
        }
        return site;
      })
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Websites API Error:", error);
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') || '24H') as TimeRange;
    return NextResponse.json(getMockData(timeRange).websiteAnalytics);
  }
}
