import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function addUserStatusColumn() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'root', 
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'wmk_crm'
  });

  try {
    console.log('Adding is_active column to users table...');
    
    // Add the is_active column with default value true
    await connection.execute(
      'ALTER TABLE users ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER full_name'
    );
    
    console.log('✅ Successfully added is_active column');
    
    // Verify the change
    const [columns] = await connection.execute('DESCRIBE users');
    console.log('\nUpdated users table structure:');
    console.table(columns);
    
    // Check all users now have is_active = 1 (true)
    const [users] = await connection.execute(
      'SELECT id, username, full_name, is_active FROM users'
    );
    console.log('\nUsers with status:');
    console.table(users);
    
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('✅ Column is_active already exists');
    } else {
      console.error('Error:', error);
    }
  } finally {
    await connection.end();
  }
}

addUserStatusColumn();
