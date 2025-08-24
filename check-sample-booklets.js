import mysql from 'mysql2/promise';

async function checkSampleBooklets() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'wmk_crm'
    });

    // Check if sample_booklets table exists and count records
    const [countRows] = await connection.execute('SELECT COUNT(*) as total FROM sample_booklets');
    console.log('Total sample booklets in database:', countRows[0].total);

    // Get all sample booklets
    const [rows] = await connection.execute('SELECT * FROM sample_booklets');
    
    if (rows.length > 0) {
      console.log('\nSample booklets:');
      console.table(rows);
    } else {
      console.log('\nNo sample booklets found - table is empty');
    }

    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSampleBooklets();
