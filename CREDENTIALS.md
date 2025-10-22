# Default Login Credentials

This file contains all default login credentials for development and testing.

## User Accounts

### Admin Account
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Administrator
- **Access:** Full system access

### Sales Representatives

#### Patrick Johnson
- **Username:** `patrick`
- **Password:** `patrick123`
- **Role:** Sales Representative
- **Email:** patrick@wrapmykitchen.com

#### Kim Martinez
- **Username:** `kim`
- **Password:** `kim123`
- **Role:** Sales Representative
- **Email:** kim@wrapmykitchen.com

### Commercial Sales

#### Lina Rodriguez
- **Username:** `lina`
- **Password:** `lina123`
- **Role:** Commercial Sales
- **Email:** lina@wrapmykitchen.com

### Manager

#### Sarah Manager
- **Username:** `manager`
- **Password:** `manager123`
- **Role:** Manager
- **Email:** manager@wrapmykitchen.com

---

## Mockup Data Summary

The database has been populated with the following sample data:

### Users
- 5 users with different roles (admin, sales reps, commercial sales, manager)

### Installers
- **Angel** - Residential kitchens, cabinet wrapping specialist
- **Brian** - Commercial installations, large projects
- **Luis** - Residential and commercial projects

### Leads
- **10 sample leads** including:
  - 4 Residential leads (various statuses: New, In Progress, Sold)
  - 3 Commercial leads (restaurants, medical centers, offices)
  - Mix of different lead origins: Facebook, Google, Instagram, Referral, Commercial, Website, Trade Show
  - Various project statuses and stages

### Calendar Events
- 6 events including:
  - Installation appointments
  - Trade shows
  - Holidays
  - Staff leave/vacation

### Sample Booklets
- 4 sample booklet orders with various statuses (Pending, Shipped, Delivered)

### Completed Projects
- 2 completed projects with full payment history

### Repair Requests
- 2 repair requests (one completed, one in progress)

---

## Quick Start

1. Navigate to the application login page
2. Use any of the credentials above to log in
3. Explore the CRM features with realistic mockup data

## Security Note

⚠️ **IMPORTANT:** These credentials are for development/testing purposes only. All passwords are stored in plain text. Do not use these credentials in production environments.

---

## Seed Data Script

To reset or re-populate the database with mockup data, run:

```bash
npm run db:seed
```

This will create all default users and sample data (using `onConflictDoNothing` to avoid duplicates).
