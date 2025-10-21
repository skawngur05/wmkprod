import { db } from './db';
import { users, leads, installers, sampleBooklets } from '@shared/schema';
import { sql } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // Check if users already exist
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log('⚠️  Database already contains data. Skipping seed.');
      console.log('💡 To reseed, first clear the database tables manually.');
      return;
    }

    console.log('👤 Creating default users...');
    
    // Create default users
    const defaultUsers = [
      {
        username: 'admin',
        password: 'admin123',
        full_name: 'System Administrator',
        email: 'admin@wmk.com',
        role: 'administrator' as const,
        permissions: JSON.stringify(['dashboard', 'leads', 'followups', 'installations', 'sample_booklets', 'reports', 'admin_panel', 'user_management', 'system_settings']),
        is_active: true,
      },
      {
        username: 'kim',
        password: 'password',
        full_name: 'Kim (Owner)',
        email: 'kim@wmk.com',
        role: 'owner' as const,
        permissions: JSON.stringify(['dashboard', 'leads', 'followups', 'installations', 'sample_booklets', 'reports', 'admin_panel', 'user_management']),
        is_active: true,
      },
      {
        username: 'patrick',
        password: 'password',
        full_name: 'Patrick (Sales Rep)',
        email: 'patrick@wmk.com',
        role: 'sales_rep' as const,
        permissions: JSON.stringify(['dashboard', 'leads', 'followups', 'sample_booklets']),
        is_active: true,
      },
      {
        username: 'lina',
        password: 'password',
        full_name: 'Lina (Sales Rep)',
        email: 'lina@wmk.com',
        role: 'sales_rep' as const,
        permissions: JSON.stringify(['dashboard', 'leads', 'followups', 'sample_booklets']),
        is_active: true,
      },
      {
        username: 'manager',
        password: 'manager123',
        full_name: 'Manager',
        email: 'manager@wmk.com',
        role: 'manager' as const,
        permissions: JSON.stringify(['dashboard', 'leads', 'followups', 'installations', 'sample_booklets', 'reports']),
        is_active: true,
      },
      {
        username: 'installer',
        password: 'installer123',
        full_name: 'Installer User',
        email: 'installer@wmk.com',
        role: 'installer' as const,
        permissions: JSON.stringify(['dashboard', 'installations']),
        is_active: true,
      },
      {
        username: 'commercial',
        password: 'commercial123',
        full_name: 'Commercial Sales',
        email: 'commercial@wmk.com',
        role: 'commercial_sales' as const,
        permissions: JSON.stringify(['dashboard', 'leads', 'followups', 'installations', 'sample_booklets', 'reports']),
        is_active: true,
      },
    ];

    await db.insert(users).values(defaultUsers);
    console.log(`✅ Created ${defaultUsers.length} users`);

    console.log('📋 Creating mockup leads...');

    // Helper function to get date string
    const getDateString = (daysOffset: number = 0) => {
      const date = new Date();
      date.setDate(date.getDate() + daysOffset);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const mockLeads = [
      {
        name: 'John Smith',
        phone: '555-0101',
        email: 'john.smith@email.com',
        lead_origin: 'Facebook' as const,
        project_type: 'Residential' as const,
        date_created: getDateString(-30),
        next_followup_date: getDateString(2),
        remarks: 'New' as const,
        assigned_to: 'Patrick',
        notes: 'Interested in kitchen renovation',
        project_amount: '5000.00',
        address: '123 Main St, Miami, FL 33101',
      },
      {
        name: 'Sarah Johnson',
        phone: '555-0102',
        email: 'sarah.j@email.com',
        lead_origin: 'Google Text' as const,
        project_type: 'Residential' as const,
        date_created: getDateString(-25),
        next_followup_date: getDateString(5),
        remarks: 'In Progress' as const,
        assigned_to: 'Lina',
        notes: 'Looking for bathroom wall installation. Follow up needed.',
        project_amount: '3500.00',
        deposit_paid: true,
        address: '456 Oak Ave, Miami, FL 33102',
      },
      {
        name: 'Miami Office Center',
        phone: '555-0103',
        email: 'facilities@miamicenter.com',
        lead_origin: 'Commercial' as const,
        project_type: 'Commercial' as const,
        commercial_subcategory: 'Walls',
        market: 'Office Space',
        date_created: getDateString(-20),
        next_followup_date: getDateString(7),
        remarks: 'In Progress' as const,
        assigned_to: 'Kim',
        notes: 'Large commercial project - office renovation. Needs quote for 2000 sq ft.',
        project_amount: '25000.00',
        deposit_paid: true,
        address: '789 Business Blvd, Miami, FL 33103',
      },
      {
        name: 'Robert Martinez',
        phone: '555-0104',
        email: 'r.martinez@email.com',
        lead_origin: 'Instagram' as const,
        project_type: 'Residential' as const,
        date_created: getDateString(-18),
        remarks: 'Sold' as const,
        assigned_to: 'Patrick',
        notes: 'Completed installation last week. Very satisfied customer.',
        project_amount: '7500.00',
        deposit_paid: true,
        balance_paid: true,
        installation_date: getDateString(-7),
        installation_end_date: getDateString(-5),
        assigned_installer: 'Angel',
        address: '321 Palm Dr, Miami, FL 33104',
      },
      {
        name: 'Lisa Chen',
        phone: '555-0105',
        email: 'lisa.chen@email.com',
        lead_origin: 'Referral' as const,
        project_type: 'Residential' as const,
        date_created: getDateString(-15),
        next_followup_date: getDateString(1),
        remarks: 'New' as const,
        assigned_to: 'Lina',
        notes: 'Referred by Robert Martinez. Interested in similar project.',
        project_amount: '6000.00',
        address: '654 Beach St, Miami, FL 33105',
      },
      {
        name: 'Tech Startup LLC',
        phone: '555-0106',
        email: 'admin@techstartup.com',
        lead_origin: 'Website' as const,
        project_type: 'Commercial' as const,
        commercial_subcategory: 'Walls',
        market: 'Office Space',
        date_created: getDateString(-12),
        next_followup_date: getDateString(3),
        remarks: 'In Progress' as const,
        assigned_to: 'Kim',
        notes: 'New office space setup. Interested in modern wall designs.',
        project_amount: '15000.00',
        deposit_paid: true,
        pickup_date: getDateString(10),
        address: '987 Innovation Way, Miami, FL 33106',
      },
      {
        name: 'Michael Brown',
        phone: '555-0107',
        email: 'mbrown@email.com',
        lead_origin: 'Trade Show' as const,
        project_type: 'Residential' as const,
        date_created: getDateString(-10),
        remarks: 'Not Interested' as const,
        assigned_to: 'Patrick',
        notes: 'Met at trade show. Budget constraints, not moving forward.',
        project_amount: '0.00',
        address: '111 Sunset Blvd, Miami, FL 33107',
      },
      {
        name: 'Grand Hotel Miami',
        phone: '555-0108',
        email: 'purchasing@grandhotel.com',
        lead_origin: 'Commercial' as const,
        project_type: 'Commercial' as const,
        commercial_subcategory: 'Walls',
        market: 'Hospitality',
        date_created: getDateString(-8),
        next_followup_date: getDateString(14),
        remarks: 'In Progress' as const,
        assigned_to: 'Kim',
        notes: 'Hotel lobby renovation. Large project, multiple areas.',
        project_amount: '45000.00',
        address: '222 Luxury Lane, Miami, FL 33108',
      },
      {
        name: 'Jennifer Williams',
        phone: '555-0109',
        email: 'jen.w@email.com',
        lead_origin: 'WhatsApp' as const,
        project_type: 'Residential' as const,
        date_created: getDateString(-7),
        next_followup_date: getDateString(0),
        remarks: 'New' as const,
        assigned_to: 'Lina',
        notes: 'Quick inquiry via WhatsApp. Needs follow up today.',
        project_amount: '4000.00',
        address: '333 Garden View, Miami, FL 33109',
      },
      {
        name: 'David Lee',
        phone: '555-0110',
        email: 'david.lee@email.com',
        lead_origin: 'Cold Call' as const,
        project_type: 'Residential' as const,
        date_created: getDateString(-5),
        remarks: 'Sold' as const,
        assigned_to: 'Patrick',
        notes: 'Installation scheduled for next week.',
        project_amount: '5500.00',
        deposit_paid: true,
        installation_date: getDateString(7),
        assigned_installer: 'Brian',
        address: '444 River Rd, Miami, FL 33110',
      },
      {
        name: 'Retail Store Chain',
        phone: '555-0111',
        email: 'properties@retailchain.com',
        lead_origin: 'Commercial' as const,
        project_type: 'Commercial' as const,
        commercial_subcategory: 'Walls',
        market: 'Retail',
        date_created: getDateString(-4),
        next_followup_date: getDateString(10),
        remarks: 'In Progress' as const,
        assigned_to: 'Kim',
        notes: 'Multiple locations potential. Starting with flagship store.',
        project_amount: '35000.00',
        address: '555 Shopping Plaza, Miami, FL 33111',
      },
      {
        name: 'Amanda Garcia',
        phone: '555-0112',
        email: 'agarcia@email.com',
        lead_origin: 'Facebook' as const,
        project_type: 'Residential' as const,
        date_created: getDateString(-3),
        remarks: 'Not Service Area' as const,
        assigned_to: 'Lina',
        notes: 'Outside our service area. Provided referral to partner.',
        project_amount: '0.00',
        address: '666 Far Away St, Orlando, FL 32801',
      },
      {
        name: 'Dr. James Wilson',
        phone: '555-0113',
        email: 'dr.wilson@clinic.com',
        lead_origin: 'Google Text' as const,
        project_type: 'Commercial' as const,
        commercial_subcategory: 'Walls',
        market: 'Healthcare',
        date_created: getDateString(-2),
        next_followup_date: getDateString(5),
        remarks: 'New' as const,
        assigned_to: 'Kim',
        notes: 'Medical clinic renovation. Health code compliance required.',
        project_amount: '18000.00',
        address: '777 Medical Center Dr, Miami, FL 33112',
      },
      {
        name: 'Maria Rodriguez',
        phone: '555-0114',
        email: 'maria.r@email.com',
        lead_origin: 'Instagram' as const,
        project_type: 'Residential' as const,
        date_created: getDateString(-1),
        next_followup_date: getDateString(4),
        remarks: 'In Progress' as const,
        assigned_to: 'Patrick',
        notes: 'Saw our Instagram posts. Very interested in modern designs.',
        project_amount: '6500.00',
        address: '888 Coral Way, Miami, FL 33113',
      },
      {
        name: 'Thomas Anderson',
        phone: '555-0115',
        email: 't.anderson@email.com',
        lead_origin: 'Referral' as const,
        project_type: 'Residential' as const,
        date_created: getDateString(0),
        next_followup_date: getDateString(2),
        remarks: 'New' as const,
        assigned_to: 'Lina',
        notes: 'Just received today. First contact pending.',
        project_amount: '4500.00',
        address: '999 Sunset Ct, Miami, FL 33114',
      },
    ];

    await db.insert(leads).values(mockLeads);
    console.log(`✅ Created ${mockLeads.length} leads`);

    console.log('👷 Creating installer records...');
    
    const mockInstallers = [
      {
        name: 'Angel',
        phone: '555-1001',
        email: 'angel@wmk.com',
        status: 'active' as const,
        hire_date: '2023-01-15',
        hourly_rate: '35.00',
        specialty: 'Residential installations, flooring',
        notes: 'Experienced with complex residential projects',
      },
      {
        name: 'Brian',
        phone: '555-1002',
        email: 'brian@wmk.com',
        status: 'active' as const,
        hire_date: '2023-03-20',
        hourly_rate: '32.00',
        specialty: 'Commercial installations, walls',
        notes: 'Specializes in commercial office spaces',
      },
      {
        name: 'Luis',
        phone: '555-1003',
        email: 'luis@wmk.com',
        status: 'active' as const,
        hire_date: '2023-06-10',
        hourly_rate: '30.00',
        specialty: 'General installations',
        notes: 'Versatile installer, quick learner',
      },
    ];

    await db.insert(installers).values(mockInstallers);
    console.log(`✅ Created ${mockInstallers.length} installers`);

    console.log('📦 Creating sample booklet records...');
    
    const mockBooklets = [
      {
        order_number: 'WMK-2024-001',
        customer_name: 'Emily Wilson',
        address: '123 Sample St, Miami, FL 33101',
        email: 'emily.w@email.com',
        phone: '555-2001',
        product_type: 'Sample Booklet Only' as const,
        tracking_number: 'USPS1234567890',
        status: 'Delivered' as const,
        date_ordered: getDateString(-15),
        date_shipped: getDateString(-13),
        notes: 'Delivered successfully',
      },
      {
        order_number: 'WMK-2024-002',
        customer_name: 'Carlos Martinez',
        address: '456 Demo Ave, Miami, FL 33102',
        email: 'carlos.m@email.com',
        phone: '555-2002',
        product_type: 'Demo Kit & Sample Booklet' as const,
        tracking_number: 'USPS0987654321',
        status: 'Shipped' as const,
        date_ordered: getDateString(-10),
        date_shipped: getDateString(-8),
        notes: 'In transit',
      },
      {
        order_number: 'WMK-2024-003',
        customer_name: 'Rachel Green',
        address: '789 Trial Rd, Miami, FL 33103',
        email: 'rachel.g@email.com',
        phone: '555-2003',
        product_type: 'Trial Kit' as const,
        status: 'Pending' as const,
        date_ordered: getDateString(-5),
        notes: 'Awaiting shipment',
      },
    ];

    await db.insert(sampleBooklets).values(mockBooklets);
    console.log(`✅ Created ${mockBooklets.length} sample booklets`);

    console.log('');
    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📝 Default Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Administrator:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('');
    console.log('Owner:');
    console.log('  Username: kim');
    console.log('  Password: password');
    console.log('');
    console.log('Sales Representatives:');
    console.log('  Username: patrick  | Password: password');
    console.log('  Username: lina     | Password: password');
    console.log('');
    console.log('Manager:');
    console.log('  Username: manager');
    console.log('  Password: manager123');
    console.log('');
    console.log('Installer:');
    console.log('  Username: installer');
    console.log('  Password: installer123');
    console.log('');
    console.log('Commercial Sales:');
    console.log('  Username: commercial');
    console.log('  Password: commercial123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log('✅ Seed script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  });
