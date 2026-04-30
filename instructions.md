# Analysis Dashboard API & Query Specifications

This document outlines the database queries required to power the separate Analysis Dashboard. Since the Analysis Dashboard is hosted separately on Vercel, it will connect directly to the shared Supabase database using the provided credentials.

---

## 🤖 Instructions for the Dashboard Generation AI
If you are an AI agent reading this to build the Analysis Dashboard, adhere to these strict rules:
1. **Architecture**: You are building a standalone Next.js application hosted on Vercel. 
2. **Database Access**: Connect directly to the PostgreSQL database using the `DATABASE_URL`. **DO NOT run any migrations or `CREATE/ALTER TABLE` scripts.** The database is managed by the main application; treat your connection as **READ-ONLY**.
3. **Data Types**: The schema uses `BIGINT` (int8) for `github_id` columns. Ensure your ORM or SQL client (e.g., `postgres` or `pg`) handles `BigInt` parsing correctly to avoid JSON serialization errors.
4. **Queries**: All the SQL queries below are **exactly mapped** to the live database schema (which includes tables like `users`, `user_events`, `revenue_events`, `affiliate_users`, and `affiliate_events`). Use these precise queries to fetch data.
5. **Visualization**: Implement modern, dark-themed charts (using Recharts or similar) for the "Charts & Visualizations" requirements in each section.

---

## 🔐 Required Environment Variables
The new Analysis Dashboard will need the following environment variables configured in its Vercel project:

```env
# Required: The direct connection string to the shared Supabase PostgreSQL database.
# Must be identical to the main application's DATABASE_URL.
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]

# Optional: The URL of the main site, useful for creating links back to the primary platform.
NEXT_PUBLIC_MAIN_SITE_URL=https://www.prixai.xyz
```

---

## 1. Global Overview (`/dashboard`)

**API Endpoint**: `GET /api/admin/overview`

**Queries:**
*   **Traffic & Engagement (from `user_events`)**:
    ```sql
    -- Total Visitors (Unique IPs or Session IDs)
    SELECT COUNT(DISTINCT ip_hash) AS unique_visitors FROM user_events;
    
    -- Total Sessions
    SELECT COUNT(DISTINCT session_id) AS total_sessions FROM user_events;
    
    -- Page Views
    SELECT COUNT(*) AS page_views FROM user_events WHERE event_type = 'page_view';
    ```
*   **Signups (from `users`)**:
    ```sql
    SELECT COUNT(*) AS total_signups FROM users;
    ```
*   **Revenue KPIs (from `revenue_events` and `users`)**:
    ```sql
    -- MRR (Monthly Recurring Revenue)
    SELECT SUM(amount) / 100 AS mrr FROM revenue_events WHERE event_type = 'subscription' AND created_at >= NOW() - INTERVAL '1 month';
    
    -- Paying Customers
    SELECT COUNT(*) AS paying_customers FROM users WHERE plan != 'free';
    ```
*   **Affiliate KPIs (from `affiliate_users` and `affiliate_events`)**:
    ```sql
    SELECT COUNT(*) AS active_affiliates FROM affiliate_users;
    SELECT SUM(commission_amount) / 100 AS affiliate_revenue FROM affiliate_events WHERE event_type = 'commission_paid';
    ```

## 2. Websites (`/dashboard/websites`)

**API Endpoint**: `GET /api/admin/websites/traffic`

**Queries (from `user_events`)**:
*   **Traffic Sources / Top Referrers**:
    ```sql
    SELECT referrer, COUNT(*) AS count 
    FROM user_events 
    WHERE event_type = 'page_view' AND referrer IS NOT NULL 
    GROUP BY referrer 
    ORDER BY count DESC LIMIT 10;
    ```
*   **Pages per Session**:
    ```sql
    WITH session_counts AS (
      SELECT session_id, COUNT(*) as pages FROM user_events WHERE event_type = 'page_view' GROUP BY session_id
    )
    SELECT AVG(pages) AS avg_pages_per_session FROM session_counts;
    ```
*   *Note: Metrics like Avg Duration, Bounce Rate, and Scroll Depth require the frontend tracker to send specific `session_end` or `scroll` events with metadata to the `/api/track` endpoint.*

---

## 3. Subscriptions (`/dashboard/subscriptions`)

**API Endpoint**: `GET /api/admin/subscriptions`

**Queries**:
*   **Paid Tier Breakdown**:
    ```sql
    SELECT plan, COUNT(*) AS count FROM users GROUP BY plan;
    ```
*   **Churn vs New Subscriptions**:
    ```sql
    -- New Subscriptions this month
    SELECT COUNT(*) FROM revenue_events WHERE event_type = 'subscription' AND created_at >= NOW() - INTERVAL '1 month';
    -- Churn requires tracking 'cancellation' events in `revenue_events` or a dedicated subscriptions table.
    ```

---

## 4. Product Usage (`/dashboard/product-usage`)

**API Endpoint**: `GET /api/admin/product/usage`

**Queries**:
*   **Active Users (DAU / WAU / MAU)**:
    ```sql
    -- DAU
    SELECT COUNT(DISTINCT user_id) AS dau FROM user_events WHERE created_at >= NOW() - INTERVAL '1 day' AND user_id IS NOT NULL;
    -- MAU
    SELECT COUNT(DISTINCT user_id) AS mau FROM user_events WHERE created_at >= NOW() - INTERVAL '1 month' AND user_id IS NOT NULL;
    ```
*   **Action-Specific Metrics (Tokens, PRs, Issues)**:
    *   *Requirement*: The main application needs to log these specific actions. Update `/api/track` calls to include `eventType: 'pr_reviewed'`, `eventType: 'issue_fixed'`, etc.
    ```sql
    SELECT event_type, COUNT(*) FROM user_events 
    WHERE event_type IN ('pr_reviewed', 'issue_fixed', 'token_usage') 
    GROUP BY event_type;
    ```

---

## 5. Security (`/dashboard/security`)

**API Endpoint**: `GET /api/admin/security`

**Queries**:
*   **Suspicious Signups / Multiple Accounts per IP**:
    ```sql
    -- Find IPs with multiple signups
    SELECT ip_hash, COUNT(DISTINCT user_id) as accounts 
    FROM user_events 
    WHERE event_type = 'signup' 
    GROUP BY ip_hash 
    HAVING COUNT(DISTINCT user_id) > 2;
    ```
*   **Affiliate Click Spikes (Fraud Detection)**:
    ```sql
    -- Identify affiliates with high clicks but zero conversions
    SELECT affiliate_code, COUNT(*) as clicks 
    FROM affiliate_events 
    WHERE event_type = 'click' 
    GROUP BY affiliate_code 
    ORDER BY clicks DESC;
    ```

---

## 6. Technical Performance (`/dashboard/technical`)

**API Endpoint**: `GET /api/admin/performance`

*Requirement*: To track Core Web Vitals (LCP, FID, CLS) and Page Load Time, integrate a library like `web-vitals` on your main site and send the data to a new endpoint (e.g., `/api/metrics`), saving it into a `performance_metrics` table or as metadata in `user_events`.

**Example Query (assuming data is in `user_events` metadata)**:
```sql
SELECT 
  AVG((metadata->>'lcp')::numeric) AS avg_lcp,
  AVG((metadata->>'ttfb')::numeric) AS avg_ttfb
FROM user_events 
WHERE event_type = 'web_vitals';
```

---

## 7. Conversion Funnel (`/dashboard/conversion-funnel`)

**API Endpoint**: `GET /api/admin/funnel`

**Queries**:
*   **Dropoff Analysis**:
    ```sql
    -- Track progression from Page View -> Signup -> Purchase
    SELECT 
      (SELECT COUNT(DISTINCT session_id) FROM user_events WHERE event_type = 'page_view') AS step1_visitors,
      (SELECT COUNT(DISTINCT user_id) FROM user_events WHERE event_type = 'signup') AS step2_signups,
      (SELECT COUNT(DISTINCT customer_id) FROM revenue_events WHERE event_type = 'purchase') AS step3_purchases;
    ```

---

## 8. Affiliates (`/dashboard/affiliates`)

**API Endpoint**: `GET /api/admin/affiliates/performance`

**Queries**:
*   **Affiliate Leaderboard & Metrics**:
    ```sql
    SELECT 
      a.username,
      a.affiliate_code,
      COUNT(e.id) FILTER (WHERE e.event_type = 'click') AS total_clicks,
      COUNT(e.id) FILTER (WHERE e.event_type = 'conversion') AS total_conversions,
      SUM(e.commission_amount) / 100 AS total_commission_owed
    FROM affiliate_users a
    LEFT JOIN affiliate_events e ON a.affiliate_code = e.affiliate_code
    GROUP BY a.id, a.username, a.affiliate_code
    ORDER BY total_conversions DESC;
    ```
