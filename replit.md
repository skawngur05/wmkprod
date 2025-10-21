# WrapMyKitchen CRM - Replit Setup

## Project Overview

**WrapMyKitchen CRM** is a comprehensive customer relationship management system designed for a kitchen installation business. This application helps manage leads, track installations, schedule follow-ups, handle customer data, and integrate with Google Calendar.

## Current State

✅ **Fully Configured for Replit Environment**
- Converted from MySQL to PostgreSQL
- Running on port 5000 (Replit-compatible)
- Vite dev server configured for Replit's proxy system
- Database schema successfully migrated and pushed
- Development workflow running successfully

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for build tooling and dev server
- **TailwindCSS** for styling
- **Radix UI** components
- **Wouter** for routing
- **TanStack Query** for data fetching
- **FullCalendar** for calendar views
- **Recharts** for analytics

### Backend
- **Express.js** server
- **PostgreSQL** database (Replit Neon-backed)
- **Drizzle ORM** for database operations
- **Node.js** runtime

## Key Features

1. **Lead Management**
   - Track leads from various origins (Facebook, Instagram, Google, etc.)
   - Manage project types (Residential/Commercial)
   - Assign leads to sales representatives
   - Track project amounts and payment status

2. **Installation Tracking**
   - Schedule installations
   - Assign installers to jobs
   - Track installation dates and completion
   - Manage pickup dates

3. **Calendar Integration**
   - Business calendar for scheduling
   - Google Calendar sync capability (requires credentials)
   - Event management (installations, leave, trade shows, etc.)

4. **Sample Booklets**
   - Track sample booklet orders
   - USPS tracking integration
   - Shipping status management

5. **Reporting & Analytics**
   - Sales performance metrics
   - Lead origin analysis
   - Installer performance tracking
   - Monthly breakdowns

6. **User Management**
   - Role-based access control
   - Multiple user roles: admin, owner, manager, sales rep, installer
   - Activity logging

## Architecture Changes for Replit

### Database Migration (MySQL → PostgreSQL)
- All table schemas converted to PostgreSQL-compatible definitions
- Enums converted from MySQL enums to PostgreSQL enums
- Auto-increment IDs converted to `serial` type
- Timestamp handling updated for PostgreSQL
- `onUpdateNow()` replaced with `$onUpdate(() => new Date())`

### Port Configuration
- Development server: **Port 5000**
- Configured in both `package.json` and `server/index.ts`
- Default fallback to 5000 for Replit compatibility

### Vite Configuration
- Host set to `0.0.0.0` for external access
- HMR configured for Replit's proxy (WSS protocol, client port 443)
- `allowedHosts: true` to support Replit's iframe proxy

### Environment Variables
The application uses these environment variables (already configured in Replit):
- `DATABASE_URL` - PostgreSQL connection string (Replit-provided)
- `PORT` - Server port (5000)
- `NODE_ENV` - Environment mode (development/production)

## Development

### Running the Application
The development server is configured as a workflow and runs automatically:
```bash
npm run dev
```

This starts:
- Express backend server on port 5000
- Vite dev server with HMR
- PostgreSQL database connection
- USPS tracking scheduler (optional)

### Database Management

**Push schema changes:**
```bash
npm run db:push
```

**Push schema changes (force):**
```bash
npm run db:push -- --force
```

### Building for Production
```bash
npm run build
```

This runs:
1. Vite build for the frontend
2. Service worker update script

## Project Structure

```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility libraries
│   │   └── contexts/    # React contexts
│   └── index.html
│
├── server/              # Backend Express server
│   ├── routes/          # API route handlers
│   ├── config/          # Configuration files
│   ├── index.ts         # Server entry point
│   ├── db.ts           # Database connection
│   ├── routes.ts       # Route registration
│   └── vite.ts         # Vite dev server setup
│
├── shared/             # Shared code between frontend/backend
│   └── schema.ts       # Database schema (Drizzle ORM)
│
└── migrations/         # Database migrations
```

## Database Schema

The application uses **12 main tables**:

1. **users** - User accounts and authentication
2. **user_sessions** - Active user sessions
3. **leads** - Customer leads and prospects
4. **calendar_events** - Scheduled events and appointments
5. **completed_projects** - Finished installation projects
6. **repair_requests** - Customer repair requests
7. **sample_booklets** - Sample booklet orders and tracking
8. **installers** - Installer profiles and information
9. **smtp_settings** - Email server configuration
10. **email_templates** - Email template management
11. **activity_logs** - System activity tracking
12. **wmk_colors** - Available product colors

## Optional Integrations

### Google Calendar
To enable Google Calendar sync:
1. Place Google credentials file in project root
2. Set `GOOGLE_CALENDAR_ENABLED=true` in environment
3. Users can connect their Google Calendar from the Calendar page

### Email (SMTP)
Configure SMTP settings through the admin panel or environment variables.

### USPS Tracking
Automatically enabled but uses mock data if no API credentials are provided.
Set `DISABLE_TRACKING=true` to completely disable.

## Deployment

The application is configured for **Autoscale** deployment on Replit:
- **Build**: `npm run build`
- **Run**: `npm run start`

The deployment automatically:
- Builds the frontend with Vite
- Serves static files from the backend
- Connects to PostgreSQL database
- Runs on port 5000

## User Preferences

None currently set. Add any coding style preferences, workflow preferences, or project-specific requirements here.

## Recent Changes

### 2025-10-21: Initial Replit Setup
- Converted database from MySQL to PostgreSQL
- Updated all database configurations for Replit environment
- Configured Vite for Replit's proxy system
- Set up development workflow on port 5000
- Pushed database schema to PostgreSQL
- Configured deployment settings
- Created project documentation

## Notes

- The application requires a PostgreSQL database (provided by Replit)
- Google Calendar integration is optional and requires credentials
- The tracking scheduler runs every 15 minutes (can be disabled)
- All dates are stored as YYYY-MM-DD strings for consistency
- The application uses session-based authentication
