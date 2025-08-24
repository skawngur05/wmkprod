import mysql from 'mysql2/promise';

async function checkAlessandraDetails() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'wmk_crm'
    });

    // Search for Alessandra Carvalho
    const [rows] = await connection.execute(`
      SELECT 
        name,
        phone,
        email,
        lead_origin,
        date_created,
        next_followup_date,
        remarks as status,
        assigned_to,
        project_amount,
        notes
      FROM leads 
      WHERE name = 'Alessandra Carvalho'
    `);
    
    if (rows.length > 0) {
      const lead = rows[0];
      
      console.log('=== ALESSANDRA CARVALHO DETAILS ===');
      console.log('Name:', lead.name);
      console.log('Phone:', lead.phone);
      console.log('Email:', lead.email);
      console.log('Lead Origin:', lead.lead_origin);
      console.log('Date Created:', lead.date_created);
      console.log('Next Follow-up:', lead.next_followup_date);
      console.log('Status:', lead.status);
      console.log('Assigned To:', lead.assigned_to);
      console.log('Project Amount:', lead.project_amount);
      console.log('Notes:', lead.notes);
      
      // Check if overdue
      const today = new Date();
      const followupDate = new Date(lead.next_followup_date);
      const diffTime = today - followupDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      console.log('\n=== FOLLOW-UP STATUS ===');
      console.log('Today:', today.toDateString());
      console.log('Follow-up Date:', followupDate.toDateString());
      
      if (diffDays > 0) {
        console.log(`STATUS: OVERDUE by ${diffDays} days`);
      } else if (diffDays === 0) {
        console.log('STATUS: Due today');
      } else {
        console.log(`STATUS: Upcoming in ${Math.abs(diffDays)} days`);
      }
    } else {
      console.log('Alessandra Carvalho not found');
    }

    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAlessandraDetails();
