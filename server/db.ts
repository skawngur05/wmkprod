import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from "@shared/schema";
import dotenv from 'dotenv';

// Load environment variables - try production first, then fallback
dotenv.config({ path: '.env.production' });
dotenv.config(); // fallback to .env

console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Parse the DATABASE_URL to create proper pool config
const dbUrl = new URL(process.env.DATABASE_URL);

// Create connection pool with timeout settings for shared hosting
const connection = mysql.createPool({
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port) || 3306,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.substring(1), // Remove leading slash
  connectionLimit: 5,
  timeout: 60000,
  reconnect: true,
  idleTimeout: 300000,
  queueLimit: 0,
  ssl: false // Usually false for shared hosting
});

export const db = drizzle(connection, { schema, mode: 'default' });
