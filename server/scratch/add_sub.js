
import dotenv from 'dotenv';
dotenv.config();
import postgres from 'postgres';

async function addSub() {
  const sql = postgres(process.env.SUPABASE_DB_URL);
  try {
    const user = await sql`SELECT id FROM users WHERE email = 'seosolutions172@gmail.com' LIMIT 1`;
    if (user.length === 0) {
      console.log('User not found');
      return;
    }
    const userId = user[0].id;
    const planId = 'c81c4d1b-8fd1-42f6-b155-3cd606b91435'; // Normal
    
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + 30);
    
    const features = {
      projects_limit: 10,
      estimation_limit: 50,
      leaf_calculations_limit: 100,
      ai_usage_limit: 20
    };

    await sql`
      INSERT INTO subscriptions (user_id, plan_id, start_date, end_date, status, features_snapshot)
      VALUES (${userId}, ${planId}, ${start}, ${end}, 'ACTIVE', ${features})
    `;
    console.log('Subscription added successfully');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

addSub();
