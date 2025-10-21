import { pgTable, varchar, text, integer, boolean, timestamp, numeric, pgEnum, serial } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define all enums BEFORE table definitions
export const roleEnum = pgEnum("role", ["installer", "sales_rep", "commercial_sales", "manager", "owner", "admin", "administrator"]);
export const leadOriginEnum = pgEnum("lead_origin", ["Facebook", "Google Text", "Instagram", "Trade Show", "WhatsApp", "Commercial", "Referral", "Website", "Cold Call"]);
export const projectTypeEnum = pgEnum("project_type", ["Residential", "Commercial"]);
export const remarksEnum = pgEnum("remarks", ["Not Interested", "Not Service Area", "Not Compatible", "Sold", "In Progress", "New", "Friendly Partner", "Franchise Request"]);
export const originalLeadOriginEnum = pgEnum("original_lead_origin", ["Facebook", "Google Text", "Instagram", "Trade Show", "WhatsApp", "Commercial", "Referral"]);
export const originalAssignedToEnum = pgEnum("original_assigned_to", ["Kim", "Patrick", "Lina"]);
export const priorityEnum = pgEnum("priority", ["Low", "Medium", "High", "Urgent"]);
export const repairStatusEnum = pgEnum("repair_status", ["Pending", "In Progress", "Completed", "Cancelled"]);
export const productTypeEnum = pgEnum("product_type", ["Demo Kit & Sample Booklet", "Sample Booklet Only", "Trial Kit", "Demo Kit Only"]);
export const bookletStatusEnum = pgEnum("booklet_status", ["Pending", "Shipped", "Delivered", "Refunded"]);
export const installerStatusEnum = pgEnum("installer_status", ["active", "inactive"]);
export const templateTypeEnum = pgEnum("template_type", ["repair_notification", "follow_up", "installation_reminder", "custom"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  full_name: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).unique(),
  role: roleEnum("role").notNull().default("sales_rep"),
  permissions: text("permissions"), // Changed to text to match MySQL longtext
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").notNull().defaultNow(),
  last_login: timestamp("last_login"),
});

// User Sessions table
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  session_id: varchar("session_id", { length: 128 }).notNull(),
  ip_address: varchar("ip_address", { length: 45 }).notNull(),
  user_agent: text("user_agent"),
  login_time: timestamp("login_time").notNull().defaultNow(),
  last_activity: timestamp("last_activity").notNull().defaultNow().$onUpdate(() => new Date()),
  is_active: boolean("is_active").default(true),
  logout_time: timestamp("logout_time"),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  lead_origin: leadOriginEnum("lead_origin").notNull(),
  project_type: projectTypeEnum("project_type").notNull(),
  commercial_subcategory: varchar("commercial_subcategory", { length: 50 }),
  date_created: varchar("date_created", { length: 10 }).notNull(), // Store as YYYY-MM-DD string
  next_followup_date: varchar("next_followup_date", { length: 10 }), // Store as YYYY-MM-DD string
  remarks: remarksEnum("remarks").default("New"),
  assigned_to: varchar("assigned_to", { length: 100 }).notNull(),
  notes: text("notes"),
  additional_notes: text("additional_notes"),
  project_amount: numeric("project_amount", { precision: 10, scale: 2 }).default("0.00"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
  deposit_paid: boolean("deposit_paid").default(false),
  balance_paid: boolean("balance_paid").default(false),
  pickup_date: varchar("pickup_date", { length: 10 }), // Store as YYYY-MM-DD string
  installation_date: varchar("installation_date", { length: 10 }), // Store as YYYY-MM-DD string
  installation_end_date: varchar("installation_end_date", { length: 10 }), // Store as YYYY-MM-DD string
  assigned_installer: varchar("assigned_installer", { length: 100 }), // Single installer name
  address: text("address"),
  selected_colors: text("selected_colors"), // JSON string of selected WMK colors
  market: varchar("market", { length: 50 }), // Commercial market type
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
  last_login: true,
}).extend({
  permissions: z.array(z.string()).optional(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
}).extend({
  date_created: z.union([
    z.string(), // Accept date strings directly
    z.date().transform(date => {
      // Convert Date object to YYYY-MM-DD string
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })
  ]).optional(),
  next_followup_date: z.union([
    z.string().refine(val => {
      // Allow empty strings or valid YYYY-MM-DD format
      return val === '' || /^\d{4}-\d{2}-\d{2}$/.test(val);
    }, "Date must be in YYYY-MM-DD format"), 
    z.date().transform(date => {
      // PRODUCTION FIX: Use timezone-safe methods
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const result = `${year}-${month}-${day}`;
      return result;
    }), 
    z.null()
  ]).optional(),
  pickup_date: z.union([
    z.string().refine(val => {
      return val === '' || /^\d{4}-\d{2}-\d{2}$/.test(val);
    }, "Date must be in YYYY-MM-DD format"),
    z.date().transform(date => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const result = `${year}-${month}-${day}`;
      return result;
    }),
    z.null()
  ]).optional(),
  installation_date: z.union([
    z.string().refine(val => {
      return val === '' || /^\d{4}-\d{2}-\d{2}$/.test(val);
    }, "Date must be in YYYY-MM-DD format"),
    z.date().transform(date => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const result = `${year}-${month}-${day}`;
      return result;
    }),
    z.null()
  ]).optional(),
  installation_end_date: z.union([
    z.string().refine(val => {
      return val === '' || /^\d{4}-\d{2}-\d{2}$/.test(val);
    }, "Date must be in YYYY-MM-DD format"),
    z.date().transform(date => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const result = `${year}-${month}-${day}`;
      return result;
    }),
    z.null()
  ]).optional(),
  assigned_installer: z.union([
    z.string(),
    z.array(z.string()).transform(arr => arr.join(', ')),
    z.null()
  ]).optional(),
  selected_colors: z.array(z.string()).optional(),
  commercial_subcategory: z.union([z.string(), z.null()]).optional(),
});

export const updateLeadSchema = insertLeadSchema.partial().extend({
  assigned_to: z.union([
    z.string().min(1, "Assigned to cannot be empty"), // Accept any non-empty string
    z.string().refine(val => val === "", "Must be empty string or valid assignee"), // Allow empty string
  ]).optional(),
  next_followup_date: z.union([
    z.string().transform(str => {
      // If it's an ISO string, extract just the date part
      if (str.includes('T')) {
        return str.split('T')[0];
      }
      // If it's already in YYYY-MM-DD format, return as-is
      return str;
    }),
    z.date().transform(date => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }), 
    z.null()
  ]).optional(),
  pickup_date: z.union([
    z.string().transform(str => {
      // If it's an ISO string, extract just the date part
      if (str.includes('T')) {
        return str.split('T')[0];
      }
      // If it's already in YYYY-MM-DD format, return as-is
      return str;
    }),
    z.date().transform(date => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }), 
    z.null()
  ]).optional(),
  installation_date: z.union([
    z.string().transform(str => {
      // If it's an ISO string, extract just the date part
      if (str.includes('T')) {
        return str.split('T')[0];
      }
      // If it's already in YYYY-MM-DD format, return as-is
      return str;
    }),
    z.date().transform(date => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }), 
    z.null()
  ]).optional(),
  installation_end_date: z.union([
    z.string().transform(str => {
      // If it's an ISO string, extract just the date part
      if (str.includes('T')) {
        return str.split('T')[0];
      }
      // If it's already in YYYY-MM-DD format, return as-is
      return str;
    }),
    z.date().transform(date => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }), 
    z.null()
  ]).optional(),
  project_amount: z.union([z.string(), z.number().transform(val => val.toString()), z.null()]).optional(),
  assigned_installer: z.union([
    z.string(),
    z.array(z.string()).transform(arr => arr.join(', ')),
    z.null()
  ]).optional(),
  selected_colors: z.array(z.string()).optional(),
  commercial_subcategory: z.union([z.string(), z.null()]).optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type UpdateLead = z.infer<typeof updateLeadSchema>;
export type Lead = typeof leads.$inferSelect;

// Enums for dropdowns
export const LEAD_ORIGINS = [
  "Facebook",
  "Google Text", 
  "Instagram",
  "Trade Show",
  "WhatsApp",
  "Commercial",
  "Referral",
  "Website",
  "Cold Call"
] as const;

export const LEAD_STATUSES = [
  "New",
  "In Progress", 
  "Sold",
  "Friendly Partner",
  "Not Interested",
  "Not Service Area",
  "Not Compatible",
  "Franchise Request"
] as const;

export const INSTALLERS = ["Angel", "Brian", "Luis"] as const;
export const PROJECT_TYPES = ["Residential", "Commercial"] as const;
export const COMMERCIAL_SUBCATEGORIES = ["ALL products", "Furnitures", "Walls", "Ceilings", "Flooring", "Signage"] as const;
export const MARKETS = ["Office Space", "Hospitality", "Healthcare", "Retail", "Marine", "Signage"] as const;

// Calendar Events schema
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // installation, leave, trade-show, showroom-visit, holiday
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date"),
  all_day: boolean("all_day").notNull().default(false),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  assigned_to: varchar("assigned_to", { length: 255 }), // for leave events
  related_lead_id: integer("related_lead_id"), // for installation events
  google_event_id: varchar("google_event_id", { length: 255 }), // Google Calendar event ID for sync
  color: varchar("color", { length: 7 }), // Hex color code from Google Calendar (e.g., #FF5722)
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// Completed Projects table
export const completedProjects = pgTable("completed_projects", {
  id: serial("id").primaryKey(),
  lead_id: integer("lead_id").notNull(),
  customer_name: varchar("customer_name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  address: text("address"),
  project_amount: numeric("project_amount", { precision: 10, scale: 2 }).default("0.00"),
  deposit_paid: boolean("deposit_paid").default(false),
  balance_paid: boolean("balance_paid").default(false),
  installation_date: varchar("installation_date", { length: 10 }), // Store as YYYY-MM-DD string
  completion_date: varchar("completion_date", { length: 10 }).notNull(), // Store as YYYY-MM-DD string
  assigned_installer: varchar("assigned_installer", { length: 100 }),
  notes: text("notes"),
  original_lead_origin: originalLeadOriginEnum("original_lead_origin"),
  original_date_created: varchar("original_date_created", { length: 10 }), // Store as YYYY-MM-DD string
  original_assigned_to: originalAssignedToEnum("original_assigned_to"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

// Repair Requests table
export const repairRequests = pgTable("repair_requests", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id"),
  customer_name: varchar("customer_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }),
  address: text("address").notNull(),
  issue_description: text("issue_description").notNull(),
  priority: priorityEnum("priority").default("Medium"),
  status: repairStatusEnum("repair_status").default("Pending"),
  date_reported: varchar("date_reported", { length: 10 }).notNull(), // Store as YYYY-MM-DD string
  completion_date: varchar("completion_date", { length: 10 }), // Store as YYYY-MM-DD string
  notes: text("notes"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCompletedProjectSchema = createInsertSchema(completedProjects).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const updateCompletedProjectSchema = insertCompletedProjectSchema.partial();

export type InsertCompletedProject = z.infer<typeof insertCompletedProjectSchema>;
export type UpdateCompletedProject = z.infer<typeof updateCompletedProjectSchema>;
export type CompletedProject = typeof completedProjects.$inferSelect;

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({
  id: true,
  created_at: true,
}).extend({
  start_date: z.string().or(z.date()).transform((val) => {
    if (typeof val === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        return new Date(val + 'T00:00:00.000Z');
      }
      return new Date(val);
    }
    return val;
  }),
  end_date: z.string().or(z.date()).transform((val) => {
    if (typeof val === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        return new Date(val + 'T00:00:00.000Z');
      }
      return new Date(val);
    }
    return val;
  }).optional(),
});

export const updateCalendarEventSchema = insertCalendarEventSchema.partial();

export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type UpdateCalendarEvent = z.infer<typeof updateCalendarEventSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;

export const EVENT_TYPES = [
  "installation",
  "pickup",
  "leave", 
  "trade-show",
  "showroom-visit",
  "holiday"
] as const;

// Sample Booklets schema
export const sampleBooklets = pgTable("sample_booklets", {
  id: serial("id").primaryKey(),
  order_number: varchar("order_number", { length: 100 }).notNull(),
  customer_name: varchar("customer_name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  product_type: productTypeEnum("product_type").notNull(),
  tracking_number: varchar("tracking_number", { length: 100 }),
  status: bookletStatusEnum("booklet_status").default("Pending"),
  date_ordered: varchar("date_ordered", { length: 10 }).notNull(), // Store as YYYY-MM-DD string
  date_shipped: varchar("date_shipped", { length: 10 }), // Store as YYYY-MM-DD string
  notes: text("notes"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const installers = pgTable("installers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  status: installerStatusEnum("installer_status").default("active"),
  hire_date: varchar("hire_date", { length: 10 }), // Store as YYYY-MM-DD string
  hourly_rate: numeric("hourly_rate", { precision: 10, scale: 2 }),
  specialty: text("specialty"),
  notes: text("notes"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSampleBookletSchema = createInsertSchema(sampleBooklets).omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  date_ordered: z.union([
    z.string().transform(str => {
      // If it's an ISO string, extract just the date part
      if (str.includes('T')) {
        return str.split('T')[0];
      }
      // If it's already in YYYY-MM-DD format, return as-is
      return str;
    }),
    z.date().transform(date => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })
  ]).optional(),
  date_shipped: z.union([
    z.string().transform(str => {
      // If it's an ISO string, extract just the date part
      if (str.includes('T')) {
        return str.split('T')[0];
      }
      // If it's already in YYYY-MM-DD format, return as-is
      return str;
    }),
    z.date().transform(date => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }), 
    z.null()
  ]).optional(),
});

export const updateSampleBookletSchema = insertSampleBookletSchema.partial();

export type InsertSampleBooklet = z.infer<typeof insertSampleBookletSchema>;
export type UpdateSampleBooklet = z.infer<typeof updateSampleBookletSchema>;
export type SampleBooklet = typeof sampleBooklets.$inferSelect;

// Installers Zod schemas
export const insertInstallerSchema = createInsertSchema(installers).omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  hire_date: z.union([
    z.string().transform(str => {
      // If it's an ISO string, extract just the date part
      if (str.includes('T')) {
        return str.split('T')[0];
      }
      // If it's already in YYYY-MM-DD format, return as-is
      return str;
    }),
    z.date().transform(date => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }), 
    z.null()
  ]).optional(),
});

export const updateInstallerSchema = insertInstallerSchema.partial();

export type InsertInstaller = z.infer<typeof insertInstallerSchema>;
export type UpdateInstaller = z.infer<typeof updateInstallerSchema>;
export type Installer = typeof installers.$inferSelect;

// Repair Request Zod schemas
export const insertRepairRequestSchema = createInsertSchema(repairRequests).omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  date_reported: z.union([
    z.string().transform(str => {
      // If it's an ISO string, extract just the date part
      if (str.includes('T')) {
        return str.split('T')[0];
      }
      // If it's already in YYYY-MM-DD format, return as-is
      return str;
    }),
    z.date().transform(date => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })
  ]).optional(),
  completion_date: z.union([
    z.string().transform(str => {
      // If it's an ISO string, extract just the date part
      if (str.includes('T')) {
        return str.split('T')[0];
      }
      // If it's already in YYYY-MM-DD format, return as-is
      return str;
    }),
    z.date().transform(date => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }), 
    z.null()
  ]).optional(),
});

export const updateRepairRequestSchema = insertRepairRequestSchema.partial();

export type InsertRepairRequest = z.infer<typeof insertRepairRequestSchema>;
export type UpdateRepairRequest = z.infer<typeof updateRepairRequestSchema>;
export type RepairRequest = typeof repairRequests.$inferSelect;

// Sample Booklets enums
export const PRODUCT_TYPES = [
  "Demo Kit & Sample Booklet",
  "Sample Booklet Only", 
  "Trial Kit",
  "Demo Kit Only"
] as const;

export const BOOKLET_STATUSES = [
  "Pending",
  "Shipped", 
  "Delivered"
] as const;

// Installers enums
export const INSTALLER_STATUSES = [
  "active",
  "inactive"
] as const;

// SMTP Settings table
export const smtpSettings = pgTable("smtp_settings", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  host: varchar("host", { length: 255 }).notNull(),
  port: integer("port").notNull(),
  secure: boolean("secure").default(false),
  username: varchar("username", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  from_email: varchar("from_email", { length: 255 }).notNull(),
  from_name: varchar("from_name", { length: 100 }).notNull(),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

// Email Templates table
export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  body: text("body").notNull(),
  template_type: templateTypeEnum("template_type").notNull(),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

// Activity Logs table
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id"),
  action: varchar("action", { length: 255 }).notNull(),
  entity_type: varchar("entity_type", { length: 100 }),
  entity_id: varchar("entity_id", { length: 100 }),
  details: text("details"),
  ip_address: varchar("ip_address", { length: 45 }),
  user_agent: text("user_agent"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// WMK Colors table
export const wmkColors = pgTable("wmk_colors", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 100 }),
  description: text("description"),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

// Export schemas for validation
export const insertSMTPSettingsSchema = createInsertSchema(smtpSettings);
export const updateSMTPSettingsSchema = insertSMTPSettingsSchema.partial();

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates);
export const updateEmailTemplateSchema = insertEmailTemplateSchema.partial();

export const insertWmkColorSchema = createInsertSchema(wmkColors);
export const updateWmkColorSchema = insertWmkColorSchema.partial();

export const insertActivityLogSchema = createInsertSchema(activityLogs);
export const updateActivityLogSchema = insertActivityLogSchema.partial();

// Activity Log types
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

// WMK Color types
export type WmkColor = typeof wmkColors.$inferSelect;
export type InsertWmkColor = typeof wmkColors.$inferInsert;
