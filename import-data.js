import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

// Sample data transformation - I'll import a few key leads first to test
const sampleLeads = [
  {
    name: 'NA',
    phone: '(786) 301-8300',
    email: 'Ksazanovich@gmail.com',
    lead_origin: 'google',
    date_created: '2025-08-22',
    next_followup_date: '2025-08-25',
    remarks: 'in-progress', 
    assigned_to: 'patrick',
    notes: '',
    additional_notes: '',
    project_amount: 4995.00,
    deposit_paid: false,
    balance_paid: false,
    installation_date: null,
    assigned_installer: null
  },
  {
    name: 'Mareena Win',
    phone: '(813) 528-1250', 
    email: 'mareenawin@gmail.com',
    lead_origin: 'website',
    date_created: '2025-08-22',
    next_followup_date: '2025-08-25',
    remarks: 'not-service-area',
    assigned_to: 'kim',
    notes: '',
    additional_notes: '',
    project_amount: 0.00,
    deposit_paid: false,
    balance_paid: false,
    installation_date: null,
    assigned_installer: null
  },
  {
    name: 'Missy - New Project',
    phone: '(786) 255-0686',
    email: 'Missygueits@gmail.com', 
    lead_origin: 'google',
    date_created: '2025-08-21',
    next_followup_date: null,
    remarks: 'sold',
    assigned_to: null,
    notes: 'New Project - WMK-009 most likely. Need a confirmation of the color - HOUSE no COI\nNEED TO CONNECT WITH HER HUBSBAND FOR CHASE renovation - Instead of replacing, reface!2',
    additional_notes: '',
    project_amount: 2295.00,
    deposit_paid: false,
    balance_paid: false,
    installation_date: null,
    assigned_installer: null
  },
  {
    name: 'Carolina',
    phone: '(305) 613-8464',
    email: 'Bookcaropozo@gmail.com',
    lead_origin: 'google', 
    date_created: '2025-08-14',
    next_followup_date: '2025-09-04',
    remarks: 'sold',
    assigned_to: 'patrick',
    notes: 'Installation on 09/04. SENT sample booklet today by USPS',
    additional_notes: '',
    project_amount: 2895.00,
    deposit_paid: true,
    balance_paid: false,
    installation_date: '2025-08-30',
    assigned_installer: 'brian'
  }
];

// Sample booklets data
const sampleBooklets = [
  {
    order_number: '21507',
    customer_name: 'Joanne Post',
    address: '9 Marquis Ct\nEdgewater, NJ 07020\nUnited States (US)',
    email: 'joannepost54@gmail.com',
    phone: '(917) 881-8414',
    product_type: 'sample_booklet_only',
    tracking_number: '9505514509015206843796',
    status: 'delivered',
    date_ordered: '2025-07-18',
    date_shipped: '2025-07-25',
    notes: ''
  },
  {
    order_number: '21524', 
    customer_name: 'Alma de la Rosa',
    address: '1519 39th Avenue\nSan Francisco, CA 94122\nUnited States (US)',
    email: 'Xtsonnytx@gmail.com',
    phone: '(415) 992-2274',
    product_type: 'sample_booklet_only',
    tracking_number: null,
    status: 'pending',
    date_ordered: '2025-08-23',
    date_shipped: null,
    notes: ''
  }
];

async function importData() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    const client = await pool.connect();

    // Import sample leads
    console.log('Importing sample leads...');
    for (const lead of sampleLeads) {
      await client.query(`
        INSERT INTO leads (
          name, phone, email, lead_origin, date_created, 
          next_followup_date, remarks, assigned_to, project_amount,
          notes, additional_notes, deposit_paid, balance_paid,
          installation_date, assigned_installer
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `, [
        lead.name, lead.phone, lead.email, lead.lead_origin, lead.date_created,
        lead.next_followup_date, lead.remarks, lead.assigned_to, lead.project_amount,
        lead.notes, lead.additional_notes, lead.deposit_paid, lead.balance_paid,
        lead.installation_date, lead.assigned_installer
      ]);
    }

    // Import sample booklets  
    console.log('Importing sample booklets...');
    for (const booklet of sampleBooklets) {
      await client.query(`
        INSERT INTO sample_booklets (
          order_number, customer_name, address, email, phone,
          product_type, tracking_number, status, date_ordered, 
          date_shipped, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        booklet.order_number, booklet.customer_name, booklet.address, 
        booklet.email, booklet.phone, booklet.product_type, booklet.tracking_number,
        booklet.status, booklet.date_ordered, booklet.date_shipped, booklet.notes
      ]);
    }

    client.release();
    console.log('Sample data imported successfully!');
    
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await pool.end();
  }
}

importData();