import 'dotenv/config';
import sql from '../config/database.js';

try {
  // Test the exact fixed query from repository.js
  const firstFormula = await sql`SELECT formula_id FROM formulas WHERE formula_type = 'NON_MATERIAL' LIMIT 1`;
  
  if (!firstFormula.length) {
    console.log('No formulas found in DB to test');
    process.exit(0);
  }
  
  const formula_id = firstFormula[0].formula_id;
  console.log('Testing with formula_id:', formula_id);

  const outputs = await sql`
    SELECT
      output_id,
      formula_id,
      output_key,
      COALESCE(output_label_en, output_key) AS output_label,
      output_label_ar,
      output_unit_id
    FROM formula_output
    WHERE formula_id = ${formula_id}
    ORDER BY output_id
  `;

  console.log('✅ Query succeeded! Results:');
  console.log(JSON.stringify(outputs, null, 2));
  process.exit(0);
} catch(e) {
  console.error('❌ Query failed:', e.message);
  process.exit(1);
}
