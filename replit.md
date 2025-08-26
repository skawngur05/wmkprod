# Lead Management CRM - React Version

## Overview

A comprehensive lead management system designed for a kitchen wrapping business. The application provides full-featured CRM capabilities including lead tracking, follow-up management, installation scheduling, and performance analytics. Built with a modern React frontend and Express.js backend, the system supports role-based access control and comprehensive business workflow management for sales teams.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing with protected route implementation
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Hybrid approach combining Bootstrap 5 for layout/styling with shadcn/ui components for modern React patterns
- **Styling**: Tailwind CSS with CSS custom properties for theming, integrated with Bootstrap for rapid prototyping
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Framework**: Express.js with TypeScript for API development
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Shared TypeScript schemas between frontend and backend using Zod for validation
- **Storage**: Abstracted storage interface with in-memory implementation for development (easily switchable to database)
- **Session Management**: Simple session handling with localStorage (production-ready session management to be implemented)

### Authentication System
- **Authentication**: Username/password based authentication with hierarchical role-based access control
- **Role Hierarchy**: 5-tier system with automatic permission assignment:
  1. **Installer** (Level 1): Dashboard, Installation access
  2. **Sales Representative** (Level 2): Leads, Follow-ups, Sample Booklets access
  3. **Manager** (Level 3): All Sales Rep permissions + Reports & Analytics
  4. **Owner** (Level 4): All Manager permissions + Admin Panel, User Management
  5. **Administrator** (Level 5): Full system access including System Settings
- **Permission System**: 9 granular page-level permissions with role-based defaults
- **Default Admin**: Username "admin", Password "admin123"
- **Session Persistence**: Client-side session storage with automatic session restoration

### Data Models
- **Users**: ID, username, password, role (admin/sales_rep)
- **Leads**: Comprehensive lead tracking with fields for contact info, lead source, status, assigned team member, project value, follow-up dates, payment tracking, and installation details
- **Lead Origins**: 8 predefined sources: Facebook, Google Text, Instagram, Trade Show, WhatsApp, Website, Commercial, Referral
- **Lead Statuses**: Complete workflow states from "New" to "Sold" with intermediate stages
- **Team Members**: Kim, Patrick, Lina for sales assignment
- **Installers**: Angel, Brian, Luis for installation assignment

### Business Logic Features
- **Dashboard**: Real-time statistics, follow-up alerts, recent activity tracking
- **Lead Management**: Full CRUD operations with inline editing, bulk operations, and advanced filtering
- **Follow-up System**: Calendar-based scheduling with overdue/today/upcoming categorization
- **Installation Tracking**: Payment milestone tracking (deposit/balance) and installation scheduling
- **Sample Booklets**: Comprehensive order management with real-time USPS tracking integration
- **USPS Integration**: Automatic status synchronization every 15 minutes with live package tracking
- **Reporting**: Performance analytics, conversion tracking, revenue reporting by team member
- **Import/Export**: CSV handling for bulk operations and data portability

### Development Tools
- **Build System**: Vite for fast development and optimized production builds
- **Type Safety**: End-to-end TypeScript with shared schema definitions
- **Database Migrations**: Drizzle Kit for schema management and database migrations
- **Development Environment**: Hot reload with Vite, integrated error handling, and Replit-specific tooling

## External Dependencies

### Database & ORM
- **PostgreSQL**: Primary database using Neon serverless PostgreSQL
- **Drizzle ORM**: Type-safe database operations with schema-first approach
- **Connection**: `@neondatabase/serverless` for Neon database connectivity

### External APIs
- **USPS API**: Real-time package tracking integration for sample booklets
- **Credentials**: Stored securely in environment variables (USPS_CONSUMER_KEY, USPS_CONSUMER_SECRET)
- **Features**: Automatic status synchronization every 15 minutes, background tracking scheduler, mock data fallback for development
- **Status Types**: pending, shipped, in-transit, out-for-delivery, delivered, refunded, unknown
- **Business Workflow**: Door compatibility check with refund option for non-compatible flat surface requirements

### UI & Styling
- **Radix UI**: Comprehensive component library for accessible, unstyled components
- **Bootstrap 5**: CSS framework for rapid layout and responsive design
- **Font Awesome**: Icon library for consistent iconography
- **Tailwind CSS**: Utility-first CSS framework for custom styling
- **shadcn/ui**: Modern React component library built on Radix UI

### State Management & API
- **TanStack Query**: Server state management, caching, and synchronization
- **React Hook Form**: Performant form library with built-in validation
- **Zod**: Runtime type validation and schema definition

### Development & Build
- **Vite**: Fast build tool and development server
- **ESBuild**: Fast JavaScript bundler for production builds
- **TypeScript**: Type safety across frontend and backend
- **Replit Integration**: Platform-specific plugins for development environment