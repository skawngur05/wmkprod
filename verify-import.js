import mysql from 'mysql2/promise';

async function verifyImport() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'wmk_crm'
    });

    // Count total leads
    const [countRows] = await connection.execute('SELECT COUNT(*) as total FROM leads');
    console.log('Total leads in database:', countRows[0].total);

    // Get sample data
    const [sampleRows] = await connection.execute(`
      SELECT name, phone, email, lead_origin, remarks, assigned_to 
      FROM leads 
      ORDER BY date_created DESC
      LIMIT 10
    `);
    
    console.log('\nSample leads (latest 10):');
    console.table(sampleRows);

    // Check lead origins distribution
    const [originRows] = await connection.execute(`
      SELECT lead_origin, COUNT(*) as count 
      FROM leads 
      GROUP BY lead_origin 
      ORDER BY count DESC
    `);
    
    console.log('\nLead origins distribution:');
    console.table(originRows);

    // Check status distribution (remarks field)
    const [statusRows] = await connection.execute(`
      SELECT remarks, COUNT(*) as count 
      FROM leads 
      GROUP BY remarks 
      ORDER BY count DESC
    `);
    
    console.log('\nStatus distribution (remarks field):');
    console.table(statusRows);

    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyImport();
