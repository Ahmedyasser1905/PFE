import 'dotenv/config';
import sql from '../config/database.js';

try {
  const cols = await sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'formula_output' 
    ORDER BY ordinal_position
  `;
  console.log('formula_output columns:', cols.map(r => r.column_name).join(', '));
  
  // Also check a sample row
  const sample = await sql`SELECT * FROM formula_output LIMIT 1`;
  console.log('Sample row keys:', sample.length > 0 ? Object.keys(sample[0]).join(', ') : 'No rows found');
  
  process.exit(0);
} catch(e) {
  console.error('Error:', e.message);
  process.exit(1);
}
