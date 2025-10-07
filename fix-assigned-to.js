import mysql from 'mysql2/promise';

async function updateDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'wmk_crm'
    });

    console.log('Connected to database');

    // Check current structure
    console.log('Current structure:');
    const [rows] = await connection.execute('DESCRIBE leads');
    console.table(rows);

    // Update the assigned_to column
    console.log('Updating assigned_to column...');
    await connection.execute('ALTER TABLE leads MODIFY COLUMN assigned_to VARCHAR(255) NOT NULL');
    
    console.log('Column updated successfully');

    // Check updated structure
    console.log('Updated structure:');
    const [updatedRows] = await connection.execute('DESCRIBE leads');
    console.table(updatedRows);

    await connection.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
  }
}

updateDatabase();
