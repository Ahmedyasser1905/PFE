
import dotenv from 'dotenv';
dotenv.config();

import postgres from 'postgres';

async function checkStatus() {
  const sql = postgres(process.env.SUPABASE_DB_URL);
  try {
    const users = await sql`SELECT email, status FROM users`;
    console.log(users);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

checkStatus();
