import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function createWmkColorsTable() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'root', 
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'wmk_crm'
  });

  try {
    console.log('Creating wmk_colors table...');
    
    // Create the wmk_colors table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS wmk_colors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(100),
        description TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ wmk_colors table created successfully');
    
    // WMK color codes to insert
    const wmkCodes = [
      'WMK-005', 'WMK-006', 'WMK-008', 'WMK-009', 'WMK-013', 'WMK-014', 'WMK-015',
      'WMK-019', 'WMK-020', 'WMK-021', 'WMK-022', 'WMK-023', 'WMK-024', 'WMK-025',
      'WMK-026', 'WMK-027', 'WMK-025', 'WMK-041', 'WMK-042', 'WMK-043', 'WMK-044',
      'WMK-045-B', 'WMK-049', 'WMK-050', 'WMK-051', 'WMK-056', 'WMK-057', 'WMK-058',
      'WMK-059', 'WMK-060', 'WMK-061', 'WMK-065', 'WMK-071', 'WMK-080', 'WMK-083',
      'WMK-089', 'WMK-095'
    ];
    
    console.log('Inserting WMK color codes...');
    
    // Insert color codes (use INSERT IGNORE to avoid duplicates)
    for (const code of wmkCodes) {
      await connection.execute(`
        INSERT IGNORE INTO wmk_colors (code, name, is_active) 
        VALUES (?, ?, true)
      `, [code, code]); // Using code as name for now, can be updated later
    }
    
    console.log(`✅ Inserted ${wmkCodes.length} WMK color codes`);
    
    // Verify the insertion
    const [rows] = await connection.execute('SELECT * FROM wmk_colors ORDER BY code');
    console.log('\n📋 WMK Colors in database:');
    console.table(rows);
    
  } catch (error) {
    console.error('❌ Error creating wmk_colors table:', error);
  } finally {
    await connection.end();
  }
}

createWmkColorsTable();
