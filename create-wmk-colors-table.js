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
    
    // Create the table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS wmk_colors (
        id int AUTO_INCREMENT NOT NULL,
        code varchar(20) NOT NULL UNIQUE,
        name varchar(100) NULL,
        description text NULL,
        is_active boolean DEFAULT true,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT wmk_colors_id PRIMARY KEY(id)
      )
    `);
    
    console.log('✅ wmk_colors table created successfully');
    
    // Insert the WMK color codes
    const wmkCodes = [
      'WMK-005', 'WMK-006', 'WMK-008', 'WMK-009', 'WMK-013', 'WMK-014', 'WMK-015',
      'WMK-019', 'WMK-020', 'WMK-021', 'WMK-022', 'WMK-023', 'WMK-024', 'WMK-025',
      'WMK-026', 'WMK-027', 'WMK-041', 'WMK-042', 'WMK-043', 'WMK-044', 'WMK-045-B',
      'WMK-049', 'WMK-050', 'WMK-051', 'WMK-056', 'WMK-057', 'WMK-058', 'WMK-059',
      'WMK-060', 'WMK-061', 'WMK-065', 'WMK-071', 'WMK-080', 'WMK-083', 'WMK-089',
      'WMK-095'
    ];
    
    console.log('Inserting WMK color codes...');
    
    for (const code of wmkCodes) {
      try {
        await connection.execute(
          'INSERT IGNORE INTO wmk_colors (code, is_active) VALUES (?, true)',
          [code]
        );
      } catch (error) {
        console.log(`Skipping ${code} - already exists`);
      }
    }
    
    console.log('✅ WMK color codes inserted successfully');
    
    // Verify the data
    const [colors] = await connection.execute('SELECT * FROM wmk_colors ORDER BY code');
    console.log(`\n📊 Total colors in database: ${colors.length}`);
    console.table(colors);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

createWmkColorsTable();
