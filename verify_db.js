import sql from './server/config/database.js';

async function verifySchema() {
  try {
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'projects'
    `;
    console.log('--- Projects Table Columns ---');
    columns.forEach(col => console.log(`${col.column_name}: ${col.data_type}`));
    
    if (columns.some(c => c.column_name === 'image_url')) {
      console.log('\n✅ image_url column exists!');
    } else {
      console.log('\n❌ image_url column MISSING!');
    }
  } catch (err) {
    console.error('Error verifying schema:', err);
  } finally {
    process.exit();
  }
}

verifySchema();
