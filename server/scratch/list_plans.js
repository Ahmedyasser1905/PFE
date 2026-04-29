
import dotenv from 'dotenv';
dotenv.config();

import postgres from 'postgres';

async function listPlans() {
  const sql = postgres(process.env.SUPABASE_DB_URL);
  try {
    const plans = await sql`SELECT * FROM plans`;
    console.log('Plans:', plans);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

listPlans();
