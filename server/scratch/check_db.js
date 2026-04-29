
import dotenv from 'dotenv';
dotenv.config(); // This will look for .env in the CWD (server/)

import postgres from 'postgres';

async function checkSub() {
  const connectionString = process.env.SUPABASE_DB_URL;
  console.log('Connecting to:', connectionString ? 'URL present' : 'MISSING');
  
  const sql = postgres(connectionString);

  try {
    const users = await sql`SELECT id, email FROM users LIMIT 10`;
    console.log('Users found:', users.length);
    
    for (const user of users) {
      const subs = await sql`SELECT * FROM subscriptions WHERE user_id = ${user.id} AND status = 'ACTIVE'`;
      console.log(`User: ${user.email} | Active Subs: ${subs.length}`);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

checkSub();
