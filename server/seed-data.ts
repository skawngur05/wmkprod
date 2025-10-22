import { db } from './db';
import { 
  users, 
  leads, 
  installers, 
  calendarEvents, 
  sampleBooklets,
  completedProjects,
  repairRequests
} from '@shared/schema';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    console.log('Creating default users...');
    await db.insert(users).values([
      {
        username: 'admin',
        password: 'admin123',
        full_name: 'Admin User',
        email: 'admin@wrapmykitchen.com',
        role: 'admin',
        is_active: true,
      },
      {
        username: 'patrick',
        password: 'patrick123',
        full_name: 'Patrick Johnson',
        email: 'patrick@wrapmykitchen.com',
        role: 'sales_rep',
        is_active: true,
      },
      {
        username: 'kim',
        password: 'kim123',
        full_name: 'Kim Martinez',
        email: 'kim@wrapmykitchen.com',
        role: 'sales_rep',
        is_active: true,
      },
      {
        username: 'lina',
        password: 'lina123',
        full_name: 'Lina Rodriguez',
        email: 'lina@wrapmykitchen.com',
        role: 'commercial_sales',
        is_active: true,
      },
      {
        username: 'manager',
        password: 'manager123',
        full_name: 'Sarah Manager',
        email: 'manager@wrapmykitchen.com',
        role: 'manager',
        is_active: true,
      },
    ]).onConflictDoNothing();
    console.log('✅ Users created');

    console.log('Creating installers...');
    await db.insert(installers).values([
      {
        name: 'Angel',
        phone: '555-0101',
        email: 'angel@wrapmykitchen.com',
        status: 'active',
        hire_date: '2023-01-15',
        hourly_rate: '35.00',
        specialty: 'Residential kitchens, cabinet wrapping',
        notes: 'Excellent attention to detail',
      },
      {
        name: 'Brian',
        phone: '555-0102',
        email: 'brian@wrapmykitchen.com',
        status: 'active',
        hire_date: '2023-03-20',
        hourly_rate: '38.00',
        specialty: 'Commercial installations, large projects',
        notes: 'Great with commercial clients',
      },
      {
        name: 'Luis',
        phone: '555-0103',
        email: 'luis@wrapmykitchen.com',
        status: 'active',
        hire_date: '2023-06-10',
        hourly_rate: '32.00',
        specialty: 'Residential and commercial',
        notes: 'Fast and reliable',
      },
    ]).onConflictDoNothing();
    console.log('✅ Installers created');

    console.log('Creating sample leads...');
    const today = new Date();
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const addDays = (date: Date, days: number) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    await db.insert(leads).values([
      {
        name: 'John Smith',
        phone: '555-1001',
        email: 'john.smith@email.com',
        lead_origin: 'Facebook',
        project_type: 'Residential',
        date_created: formatDate(addDays(today, -15)),
        next_followup_date: formatDate(addDays(today, 2)),
        remarks: 'New',
        assigned_to: 'Patrick',
        notes: 'Interested in kitchen cabinet wrapping',
        project_amount: '3500.00',
        address: '123 Main St, Miami, FL 33101',
      },
      {
        name: 'Maria Garcia',
        phone: '555-1002',
        email: 'maria.garcia@email.com',
        lead_origin: 'Google Text',
        project_type: 'Residential',
        date_created: formatDate(addDays(today, -10)),
        next_followup_date: formatDate(addDays(today, 1)),
        remarks: 'In Progress',
        assigned_to: 'Kim',
        notes: 'Wants modern matte finish. Scheduled measurement for next week.',
        project_amount: '4200.00',
        deposit_paid: true,
        address: '456 Oak Ave, Miami, FL 33102',
        selected_colors: '["Matte Black", "White Oak"]',
      },
      {
        name: 'Robert Johnson',
        phone: '555-1003',
        email: 'robert.j@email.com',
        lead_origin: 'Referral',
        project_type: 'Residential',
        date_created: formatDate(addDays(today, -20)),
        next_followup_date: null,
        remarks: 'Sold',
        assigned_to: 'Patrick',
        notes: 'Full kitchen wrap completed',
        project_amount: '5800.00',
        deposit_paid: true,
        balance_paid: true,
        installation_date: formatDate(addDays(today, -5)),
        assigned_installer: 'Angel',
        address: '789 Pine St, Miami, FL 33103',
        selected_colors: '["Wood Grain Oak", "Glossy White"]',
      },
      {
        name: 'Lisa Anderson',
        phone: '555-1004',
        email: 'lisa.anderson@email.com',
        lead_origin: 'Instagram',
        project_type: 'Residential',
        date_created: formatDate(addDays(today, -5)),
        next_followup_date: formatDate(today),
        remarks: 'New',
        assigned_to: 'Kim',
        notes: 'Saw our Instagram post. Wants quote for bathroom vanity wrap.',
        project_amount: '1200.00',
        address: '321 Elm Dr, Miami, FL 33104',
      },
      {
        name: 'Sunshine Cafe',
        phone: '555-2001',
        email: 'manager@sunshinecafe.com',
        lead_origin: 'Commercial',
        project_type: 'Commercial',
        commercial_subcategory: 'Furnitures',
        market: 'Hospitality',
        date_created: formatDate(addDays(today, -12)),
        next_followup_date: formatDate(addDays(today, 3)),
        remarks: 'In Progress',
        assigned_to: 'Lina',
        notes: 'Restaurant wants to wrap all counters and furniture',
        project_amount: '12500.00',
        deposit_paid: true,
        address: '555 Beach Blvd, Miami Beach, FL 33139',
      },
      {
        name: 'Miami Medical Center',
        phone: '555-2002',
        email: 'facilities@miamimedical.com',
        lead_origin: 'Commercial',
        project_type: 'Commercial',
        commercial_subcategory: 'Walls',
        market: 'Healthcare',
        date_created: formatDate(addDays(today, -30)),
        next_followup_date: null,
        remarks: 'Sold',
        assigned_to: 'Lina',
        notes: 'Wall wrapping for 3 exam rooms completed',
        project_amount: '18000.00',
        deposit_paid: true,
        balance_paid: true,
        installation_date: formatDate(addDays(today, -10)),
        installation_end_date: formatDate(addDays(today, -8)),
        assigned_installer: 'Brian',
        address: '1000 Hospital Dr, Miami, FL 33125',
      },
      {
        name: 'David Wilson',
        phone: '555-1005',
        email: 'dwilson@email.com',
        lead_origin: 'Website',
        project_type: 'Residential',
        date_created: formatDate(addDays(today, -3)),
        next_followup_date: formatDate(addDays(today, 5)),
        remarks: 'New',
        assigned_to: 'Patrick',
        notes: 'Filled out contact form. Interested in sample booklet.',
        address: '987 Maple Ln, Miami, FL 33106',
      },
      {
        name: 'Jennifer Lee',
        phone: '555-1006',
        email: 'jlee@email.com',
        lead_origin: 'Trade Show',
        project_type: 'Residential',
        date_created: formatDate(addDays(today, -7)),
        next_followup_date: null,
        remarks: 'Not Interested',
        assigned_to: 'Kim',
        notes: 'Met at trade show. Budget too low at this time.',
        address: '654 Cedar St, Miami, FL 33107',
      },
      {
        name: 'Tech Office Solutions',
        phone: '555-2003',
        email: 'info@techoffice.com',
        lead_origin: 'Commercial',
        project_type: 'Commercial',
        commercial_subcategory: 'Furnitures',
        market: 'Office Space',
        date_created: formatDate(addDays(today, -8)),
        next_followup_date: formatDate(addDays(today, 7)),
        remarks: 'In Progress',
        assigned_to: 'Lina',
        notes: 'Office furniture wrap for new location. Sending proposal this week.',
        project_amount: '8500.00',
        address: '2000 Corporate Blvd, Miami, FL 33126',
      },
      {
        name: 'Michael Brown',
        phone: '555-1007',
        email: 'mbrown@email.com',
        lead_origin: 'Referral',
        project_type: 'Residential',
        date_created: formatDate(addDays(today, -25)),
        next_followup_date: null,
        remarks: 'Sold',
        assigned_to: 'Patrick',
        notes: 'Referred by Robert Johnson. Kitchen + bathroom wraps.',
        project_amount: '6200.00',
        deposit_paid: true,
        balance_paid: true,
        installation_date: formatDate(addDays(today, -15)),
        assigned_installer: 'Luis',
        address: '147 Birch Ave, Miami, FL 33108',
        selected_colors: '["Modern Grey", "Marble White"]',
      },
    ]).onConflictDoNothing();
    console.log('✅ Leads created');

    console.log('Creating calendar events...');
    const createTimestamp = (daysFromNow: number, hour: number = 9) => {
      const date = addDays(today, daysFromNow);
      date.setHours(hour, 0, 0, 0);
      return date;
    };

    await db.insert(calendarEvents).values([
      {
        title: 'Installation - Robert Johnson',
        type: 'installation',
        start_date: createTimestamp(-5, 9),
        end_date: createTimestamp(-5, 16),
        all_day: false,
        description: 'Full kitchen wrap installation',
        location: '789 Pine St, Miami, FL 33103',
        assigned_to: 'Angel',
        related_lead_id: 3,
      },
      {
        title: 'Installation - Miami Medical Center',
        type: 'installation',
        start_date: createTimestamp(-10, 8),
        end_date: createTimestamp(-8, 17),
        all_day: false,
        description: 'Wall wrapping for 3 exam rooms',
        location: '1000 Hospital Dr, Miami, FL 33125',
        assigned_to: 'Brian',
        related_lead_id: 6,
      },
      {
        title: 'Thanksgiving Holiday',
        type: 'holiday',
        start_date: createTimestamp(30, 0),
        end_date: createTimestamp(30, 23),
        all_day: true,
        description: 'Office closed for Thanksgiving',
      },
      {
        title: 'Trade Show - Home Improvement Expo',
        type: 'trade-show',
        start_date: createTimestamp(14, 9),
        end_date: createTimestamp(16, 18),
        all_day: false,
        description: 'Annual home improvement trade show',
        location: 'Miami Convention Center',
      },
      {
        title: "Patrick's Vacation",
        type: 'leave',
        start_date: createTimestamp(20, 0),
        end_date: createTimestamp(25, 23),
        all_day: true,
        assigned_to: 'Patrick',
        description: 'Planned vacation',
      },
      {
        title: 'Installation - Michael Brown',
        type: 'installation',
        start_date: createTimestamp(5, 9),
        end_date: createTimestamp(5, 15),
        all_day: false,
        description: 'Kitchen and bathroom wrap',
        location: '147 Birch Ave, Miami, FL 33108',
        assigned_to: 'Luis',
      },
    ]).onConflictDoNothing();
    console.log('✅ Calendar events created');

    console.log('Creating sample booklets...');
    await db.insert(sampleBooklets).values([
      {
        order_number: 'WMK-2024-001',
        customer_name: 'Sarah Thompson',
        address: '111 Sample St, Miami, FL 33110',
        email: 'sarah.t@email.com',
        phone: '555-3001',
        product_type: 'Demo Kit & Sample Booklet',
        tracking_number: '1Z999AA10123456784',
        status: 'Delivered',
        date_ordered: formatDate(addDays(today, -20)),
        date_shipped: formatDate(addDays(today, -18)),
        notes: 'Customer requested overnight shipping',
      },
      {
        order_number: 'WMK-2024-002',
        customer_name: 'Tom Rodriguez',
        address: '222 Demo Ave, Miami, FL 33111',
        email: 'tom.r@email.com',
        phone: '555-3002',
        product_type: 'Sample Booklet Only',
        tracking_number: '1Z999AA10123456785',
        status: 'Shipped',
        date_ordered: formatDate(addDays(today, -5)),
        date_shipped: formatDate(addDays(today, -3)),
        notes: 'Standard shipping',
      },
      {
        order_number: 'WMK-2024-003',
        customer_name: 'Emily Parker',
        address: '333 Trial Rd, Miami, FL 33112',
        email: 'emily.p@email.com',
        phone: '555-3003',
        product_type: 'Trial Kit',
        status: 'Pending',
        date_ordered: formatDate(addDays(today, -1)),
        notes: 'Awaiting payment confirmation',
      },
      {
        order_number: 'WMK-2024-004',
        customer_name: 'Office Interiors LLC',
        address: '444 Business Pkwy, Miami, FL 33113',
        email: 'orders@officeinteriors.com',
        phone: '555-3004',
        product_type: 'Demo Kit Only',
        tracking_number: '1Z999AA10123456786',
        status: 'Delivered',
        date_ordered: formatDate(addDays(today, -15)),
        date_shipped: formatDate(addDays(today, -13)),
        notes: 'Commercial client sample',
      },
    ]).onConflictDoNothing();
    console.log('✅ Sample booklets created');

    console.log('Creating completed projects...');
    await db.insert(completedProjects).values([
      {
        lead_id: 3,
        customer_name: 'Robert Johnson',
        phone: '555-1003',
        email: 'robert.j@email.com',
        address: '789 Pine St, Miami, FL 33103',
        project_amount: '5800.00',
        deposit_paid: true,
        balance_paid: true,
        installation_date: formatDate(addDays(today, -5)),
        completion_date: formatDate(addDays(today, -5)),
        assigned_installer: 'Angel',
        notes: 'Customer very satisfied. Referred neighbor.',
        original_lead_origin: 'Referral',
        original_date_created: formatDate(addDays(today, -20)),
        original_assigned_to: 'Patrick',
      },
      {
        lead_id: 6,
        customer_name: 'Miami Medical Center',
        phone: '555-2002',
        email: 'facilities@miamimedical.com',
        address: '1000 Hospital Dr, Miami, FL 33125',
        project_amount: '18000.00',
        deposit_paid: true,
        balance_paid: true,
        installation_date: formatDate(addDays(today, -10)),
        completion_date: formatDate(addDays(today, -8)),
        assigned_installer: 'Brian',
        notes: 'Large commercial project. Client interested in more rooms.',
        original_lead_origin: 'Commercial',
        original_date_created: formatDate(addDays(today, -30)),
        original_assigned_to: 'Lina',
      },
    ]).onConflictDoNothing();
    console.log('✅ Completed projects created');

    console.log('Creating repair requests...');
    await db.insert(repairRequests).values([
      {
        project_id: 1,
        customer_name: 'Robert Johnson',
        phone: '555-1003',
        email: 'robert.j@email.com',
        address: '789 Pine St, Miami, FL 33103',
        issue_description: 'Small corner lifting on cabinet door. Needs re-adhesion.',
        priority: 'Low',
        status: 'Completed',
        date_reported: formatDate(addDays(today, -3)),
        completion_date: formatDate(addDays(today, -1)),
        notes: 'Angel fixed during warranty visit. No charge.',
      },
      {
        customer_name: 'Susan Martinez',
        phone: '555-4001',
        email: 'susan.m@email.com',
        address: '999 Repair St, Miami, FL 33115',
        issue_description: 'Scratch on wrap surface. Customer wants replacement.',
        priority: 'Medium',
        status: 'In Progress',
        date_reported: formatDate(addDays(today, -2)),
        notes: 'Ordered replacement material. Will schedule once arrived.',
      },
    ]).onConflictDoNothing();
    console.log('✅ Repair requests created');

    console.log('');
    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📋 Default Login Credentials:');
    console.log('─────────────────────────────');
    console.log('Admin Account:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('');
    console.log('Sales Representatives:');
    console.log('  Username: patrick | Password: patrick123');
    console.log('  Username: kim     | Password: kim123');
    console.log('');
    console.log('Commercial Sales:');
    console.log('  Username: lina    | Password: lina123');
    console.log('');
    console.log('Manager Account:');
    console.log('  Username: manager | Password: manager123');
    console.log('─────────────────────────────');
    console.log('');
    console.log('📊 Mockup Data Created:');
    console.log('  • 5 Users (various roles)');
    console.log('  • 3 Installers (Angel, Brian, Luis)');
    console.log('  • 10 Leads (residential & commercial)');
    console.log('  • 6 Calendar Events');
    console.log('  • 4 Sample Booklets');
    console.log('  • 2 Completed Projects');
    console.log('  • 2 Repair Requests');
    console.log('');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

seedDatabase()
  .then(() => {
    console.log('✨ Seeding process finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed database:', error);
    process.exit(1);
  });
