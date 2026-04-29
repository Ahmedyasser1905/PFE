
import dotenv from 'dotenv';
dotenv.config();

import postgres from 'postgres';

async function checkSchema() {
  const sql = postgres(process.env.SUPABASE_DB_URL);
  try {
    const projects = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'projects'`;
    console.log('Projects Columns:', projects.map(c => c.column_name));
    
    const subs = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'subscriptions'`;
    console.log('Subscriptions Columns:', subs.map(c => c.column_name));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

checkSchema();
