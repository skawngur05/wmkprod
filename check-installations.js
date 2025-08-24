import mysql from 'mysql2/promise';

async function checkInstallations() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'wmk_crm'
    });

    // Check leads with installation dates
    const [rows] = await connection.execute(`
      SELECT 
        name,
        phone,
        email,
        remarks as status,
        project_amount,
        installation_date,
        assigned_installer,
        deposit_paid,
        balance_paid
      FROM leads 
      WHERE installation_date IS NOT NULL 
      ORDER BY installation_date
    `);
    
    console.log(`Found ${rows.length} leads with scheduled installations:`);
    if (rows.length > 0) {
      console.table(rows);
    }

    // Check installer assignments
    const [installerCounts] = await connection.execute(`
      SELECT 
        assigned_installer,
        COUNT(*) as count
      FROM leads 
      WHERE assigned_installer IS NOT NULL 
      GROUP BY assigned_installer
    `);
    
    console.log('\nInstaller assignments:');
    if (installerCounts.length > 0) {
      console.table(installerCounts);
    }

    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkInstallations();
