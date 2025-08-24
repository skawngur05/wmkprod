import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

async function createInstallersTable() {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // XAMPP default has no password
      database: 'wmk_crm'
    });

    console.log('Connected to MySQL database');

    // Create the installers table
    const createTableSQL = `
      CREATE TABLE installers (
          id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(20),
          email VARCHAR(100) UNIQUE,
          status ENUM('active', 'inactive', 'on_leave', 'terminated') DEFAULT 'active',
          hire_date DATE,
          hourly_rate DECIMAL(10, 2),
          specialty VARCHAR(255),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          INDEX idx_installers_status (status),
          INDEX idx_installers_hire_date (hire_date),
          INDEX idx_installers_email (email),
          INDEX idx_installers_name (name)
      )
    `;

    try {
      await connection.execute(createTableSQL);
      console.log('✅ Installers table created successfully!');
    } catch (error) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('ℹ️  Table already exists, skipping creation...');
      } else {
        throw error;
      }
    }

    // Insert sample data
    const insertSQL = `
      INSERT INTO installers (id, name, phone, email, status, hire_date, hourly_rate, specialty, notes) VALUES
      (UUID(), 'Angel Rodriguez', '(555) 123-4567', 'angel@wmk-kitchen.com', 'active', '2023-01-15', 28.50, 'Cabinet Installation, Countertops', 'Senior installer with 8 years experience. Excellent with custom work.'),
      (UUID(), 'Brian Thompson', '(555) 234-5678', 'brian@wmk-kitchen.com', 'active', '2023-06-01', 25.00, 'Tile Work, Backsplashes', 'Specialized in tile and backsplash installation. Very detail-oriented.'),
      (UUID(), 'Luis Martinez', '(555) 345-6789', 'luis@wmk-kitchen.com', 'active', '2024-02-10', 24.00, 'General Installation, Plumbing', 'Newest team member, quick learner with plumbing background.')
    `;

    try {
      await connection.execute(insertSQL);
      console.log('✅ Sample installer data inserted successfully!');
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('ℹ️  Sample data already exists, skipping insertion...');
      } else {
        console.error('Error inserting sample data:', error.message);
      }
    }

    // Verify the table was created by selecting from it
    console.log('\n📋 Verifying installers table...');
    const [installers] = await connection.execute('SELECT * FROM installers');
    console.log(`Found ${installers.length} installers in the table:`);
    
    if (installers.length > 0) {
      installers.forEach((installer, index) => {
        console.log(`\n${index + 1}. ${installer.name}`);
        console.log(`   📞 Phone: ${installer.phone}`);
        console.log(`   📧 Email: ${installer.email}`);
        console.log(`   📊 Status: ${installer.status}`);
        console.log(`   💰 Rate: $${installer.hourly_rate}/hour`);
        console.log(`   🔧 Specialty: ${installer.specialty}`);
        console.log(`   📅 Hired: ${installer.hire_date}`);
      });
    }

    await connection.end();
    console.log('\n🎉 Installers table setup completed successfully!');

  } catch (error) {
    console.error('❌ Error creating installers table:', error);
    process.exit(1);
  }
}

createInstallersTable();
