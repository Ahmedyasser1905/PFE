import sql from '../server/config/database.js';

async function checkUsers() {
  console.log('Starting checkUsers script...');
  try {
    console.log('Attempting to connect to database...');
    const users = await sql`SELECT id, email, name FROM users`;
    console.log('--- Users in Database ---');
    if (users.length === 0) {
      console.log('No users found.');
    } else {
      users.forEach(u => console.log(`ID: ${u.id}, Email: ${u.email}, Name: ${u.name}`));
    }
  } catch (err) {
    console.error('Error checking users:', err);
  } finally {
    console.log('Script finished.');
    process.exit();
  }
}

checkUsers();
