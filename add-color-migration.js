// Migration: Add color column to calendar_events table
import { db } from "./server/db.ts";

async function addColorColumn() {
  try {
    console.log('Adding color column to calendar_events table...');
    
    // Check if column exists
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'calendar_events' 
      AND TABLE_SCHEMA = 'wmk_crm' 
      AND COLUMN_NAME = 'color'
    `);
    
    if (columns.length === 0) {
      // Add the color column
      await db.execute(`
        ALTER TABLE calendar_events 
        ADD COLUMN color VARCHAR(7) DEFAULT '#6B7280'
      `);
      console.log('✅ Color column added successfully');
    } else {
      console.log('✅ Color column already exists');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to add color column:', error);
    process.exit(1);
  }
}

addColorColumn();
