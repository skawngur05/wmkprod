// run-migration.js - Script to run a SQL migration file
const fs = require('fs');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

async function runMigration() {
  // Get filename from command line argument
  const filename = process.argv[2];
  if (!filename) {
    console.error('Please provide a SQL file to execute');
    console.error('Usage: node run-migration.js <path-to-sql-file>');
    process.exit(1);
  }

  // Read SQL file
  let sql;
  try {
    sql = fs.readFileSync(filename, 'utf8');
  } catch (err) {
    console.error(`Error reading file: ${err.message}`);
    process.exit(1);
  }

  // Create database connection
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'wmk_crm'
  });

  console.log('Connected to database');
  console.log(`Executing SQL from file: ${filename}`);

  // Split SQL statements and execute them
  const statements = sql.split(';').filter(stmt => stmt.trim());
  
  try {
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement}`);
        await connection.query(statement);
        console.log('Statement executed successfully');
      }
    }
    
    console.log('Migration completed successfully');
  } catch (err) {
    console.error(`Error executing SQL: ${err.message}`);
  } finally {
    await connection.end();
  }
}

runMigration().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
