import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from "@shared/schema";
import dotenv from 'dotenv';

// Load environment variables - prioritize local development
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config(); // Load .env for development
}

console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Parse the DATABASE_URL to create proper pool config
const dbUrl = new URL(process.env.DATABASE_URL);

console.log('Database connection details:');
console.log('Host:', dbUrl.hostname);
console.log('Port:', parseInt(dbUrl.port) || 3306);
console.log('User:', dbUrl.username);
console.log('Database:', dbUrl.pathname.substring(1));
console.log('Password length:', dbUrl.password ? dbUrl.password.length : 0);
console.log('Decoded password length:', dbUrl.password ? decodeURIComponent(dbUrl.password).length : 0);

// Create connection pool (only supported options)
const connection = mysql.createPool({
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port) || 3306,
  user: dbUrl.username,
  password: decodeURIComponent(dbUrl.password), // Properly decode the password
  database: dbUrl.pathname.substring(1), // Remove leading slash
  connectionLimit: 5,
  queueLimit: 0
  // ssl: undefined // Omit or set to undefined if not used
});

// Test the connection
connection.getConnection()
  .then(conn => {
    console.log('✅ Database connection successful');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    console.error('Error details:', {
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      sqlMessage: err.sqlMessage
    });
  });

export const db = drizzle(connection, { schema, mode: 'default' });
