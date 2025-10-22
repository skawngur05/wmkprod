# Default Login Credentials

Use these credentials to access the Wrap My Kitchen CRM system after seeding the database.

## 📋 User Accounts

### Administrator Account
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Admin
- **Permissions:** Full system access

### Sales Representatives
- **Username:** `patrick`
  - **Password:** `patrick123`
  - **Role:** Sales Rep
  - **Email:** patrick@wrapmykitchen.com

- **Username:** `kim`
  - **Password:** `kim123`
  - **Role:** Sales Rep
  - **Email:** kim@wrapmykitchen.com

### Commercial Sales
- **Username:** `lina`
  - **Password:** `lina123`
  - **Role:** Commercial Sales
  - **Email:** lina@wrapmykitchen.com

### Manager Account
- **Username:** `manager`
  - **Password:** `manager123`
  - **Role:** Manager
  - **Email:** manager@wrapmykitchen.com

---

## 📊 Mockup Data Included

The seeded database includes:

- ✅ **5 Users** (various roles and permissions)
- ✅ **3 Installers** (Angel, Brian, Luis)
- ✅ **10 Leads** (mix of residential and commercial)
- ✅ **6 Calendar Events** (installations, holidays, trade shows, leave)
- ✅ **4 Sample Booklets** (various product types and statuses)
- ✅ **2 Completed Projects** (with full project details)
- ✅ **2 Repair Requests** (active and completed)

---

## 🔄 Re-seeding the Database

To re-seed the database with fresh data:

```bash
npm run db:seed
```

**Note:** The seed script uses `.onConflictDoNothing()` to avoid duplicate entries if run multiple times.

---

## 🔒 Security Note

⚠️ **Important:** These are default development credentials. For production deployment:
1. Change all passwords immediately
2. Create secure, unique credentials for each user
3. Enable additional security measures (2FA, password policies, etc.)
4. Never commit actual production credentials to version control
