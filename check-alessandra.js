import mysql from 'mysql2/promise';

async function checkAlessandra() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'wmk_crm'
    });

    // Search for Alessandra Carvalho
    const [rows] = await connection.execute(`
      SELECT * FROM leads 
      WHERE name LIKE '%Alessandra%' OR name LIKE '%Carvalho%'
      OR email LIKE '%alessandra%' OR phone LIKE '%305%851%1881%'
    `);
    
    console.log('Search results for Alessandra Carvalho:');
    if (rows.length > 0) {
      console.table(rows);
    } else {
      console.log('No leads found matching Alessandra Carvalho');
      
      // Let's also check for similar emails or phone numbers
      const [emailRows] = await connection.execute(`
        SELECT * FROM leads 
        WHERE email LIKE '%oaksdg%' OR phone LIKE '%305%851%'
      `);
      
      console.log('\nSearching for similar email domain or phone:');
      if (emailRows.length > 0) {
        console.table(emailRows);
      } else {
        console.log('No similar records found');
      }
    }

    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAlessandra();
