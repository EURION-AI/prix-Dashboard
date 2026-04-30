import { Pool } from 'pg';

// Using a connection pooler URL from Supabase is recommended for Vercel.
// Ensure your DATABASE_URL on Vercel is set to the Transaction mode pooler URL.
if (!process.env.DATABASE_URL) {
  console.warn("WARNING: DATABASE_URL is not set. Dashboard will fallback to mock data.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 1
});

export default pool;
