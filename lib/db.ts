import { Pool } from 'pg';

// Using a connection pooler URL from Supabase is recommended for Vercel.
// Ensure your DATABASE_URL on Vercel is set to the Transaction mode pooler URL.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase/Vercel often require SSL. rejectUnauthorized: false is typically needed
  // for Supabase connections unless you provide the certificate.
  ssl: {
    rejectUnauthorized: false
  },
  // Since Vercel functions are serverless, we want to limit the pool size 
  // per function instance to avoid exhausting connections.
  max: 1
});

export default pool;
