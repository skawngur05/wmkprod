import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

// Default to XAMPP MySQL if no DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "mysql://root@localhost:3306/wmk_crm";
}

export const pool = mysql.createPool(process.env.DATABASE_URL);
export const db = drizzle(pool, { schema, mode: "default" });
