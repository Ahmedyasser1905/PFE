
import sql from './server/config/database.js';

async function checkSub() {
  try {
    const users = await sql`SELECT id, email FROM users LIMIT 10`;
    console.log('Users:', users);
    
    if (users.length > 0) {
      const user = users[0];
      const subs = await sql`SELECT * FROM subscriptions WHERE user_id = ${user.id}`;
      console.log(`Subscriptions for ${user.email}:`, subs);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

checkSub();
