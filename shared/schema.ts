import { mysqlTable, varchar, text, int, boolean, timestamp, decimal, mysqlEnum, date } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  full_name: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).unique(),
  role: mysqlEnum("role", ["installer", "sales_rep", "manager", "owner", "admin", "administrator"]).notNull().default("sales_rep"),
  permissions: text("permissions"), // Changed to text to match MySQL longtext
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").notNull().default(sql`current_timestamp()`),
  last_login: timestamp("last_login"),
});

// User Sessions table
export const userSessions = mysqlTable("user_sessions", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id").notNull(),
  session_id: varchar("session_id", { length: 128 }).notNull(),
  ip_address: varchar("ip_address", { length: 45 }).notNull(),
  user_agent: text("user_agent"),
  login_time: timestamp("login_time").notNull().default(sql`current_timestamp()`),
  last_activity: timestamp("last_activity").notNull().default(sql`current_timestamp()`).onUpdateNow(),
  is_active: boolean("is_active").default(true),
  logout_time: timestamp("logout_time"),
});

export const leads = mysqlTable("leads", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  lead_origin: mysqlEnum("lead_origin", ["Facebook", "Google Text", "Instagram", "Trade Show", "WhatsApp", "Commercial", "Referral", "Website"]).notNull(),
  date_created: varchar("date_created", { length: 10 }).notNull(), // Store as YYYY-MM-DD string
  next_followup_date: varchar("next_followup_date", { length: 10 }), // Store as YYYY-MM-DD string
  remarks: mysqlEnum("remarks", ["Not Interested", "Not Service Area", "Not Compatible", "Sold", "In Progress", "New"]).default("New"),
  assigned_to: mysqlEnum("assigned_to", ["Kim", "Patrick", "Lina"]).notNull(),
  notes: text("notes"),
  additional_notes: text("additional_notes"),
  project_amount: decimal("project_amount", { precision: 10, scale: 2 }).default("0.00"),
  created_at: timestamp("created_at").notNull().default(sql`current_timestamp()`),
  updated_at: timestamp("updated_at").notNull().default(sql`current_timestamp()`).onUpdateNow(),
  deposit_paid: boolean("deposit_paid").default(false),
  balance_paid: boolean("balance_paid").default(false),
  pickup_date: varchar("pickup_date", { length: 10 }), // Store as YYYY-MM-DD string
  installation_date: varchar("installation_date", { length: 10 }), // Store as YYYY-MM-DD string
  installation_end_date: varchar("installation_end_date", { length: 10 }), // Store as YYYY-MM-DD string
  assigned_installer: varchar("assigned_installer", { length: 100 }), // Single installer name
  address: text("address"),
  selected_colors: text("selected_colors"), // JSON string of selected WMK colors
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
});

export const updateLeadSchema = insertLeadSchema.partial().extend({
  assigned_to: z.union([
    z.enum(["Kim", "Patrick", "Lina"]),
    z.string().refine(val => val === "", "Must be empty string or valid assignee").transform(() => "Kim" as const), // Default to Kim for empty strings
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
  "Website"
] as const;

export const LEAD_STATUSES = [
  "New",
  "In Progress", 
  "Sold",
  "Not Interested",
  "Not Service Area",
  "Not Compatible"
] as const;

export const ASSIGNEES = ["Kim", "Patrick", "Lina"] as const;
export const INSTALLERS = ["Angel", "Brian", "Luis"] as const;

// Calendar Events schema
export const calendarEvents = mysqlTable("calendar_events", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // installation, leave, trade-show, showroom-visit, holiday
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date"),
  all_day: boolean("all_day").notNull().default(false),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  assigned_to: varchar("assigned_to", { length: 255 }), // for leave events
  related_lead_id: int("related_lead_id"), // for installation events
  google_event_id: varchar("google_event_id", { length: 255 }), // Google Calendar event ID for sync
  color: varchar("color", { length: 7 }), // Hex color code from Google Calendar (e.g., #FF5722)
  created_at: timestamp("created_at").notNull().default(sql`current_timestamp()`),
});

// Completed Projects table
export const completedProjects = mysqlTable("completed_projects", {
  id: int("id").primaryKey().autoincrement(),
  lead_id: int("lead_id").notNull(),
  customer_name: varchar("customer_name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  address: text("address"),
  project_amount: decimal("project_amount", { precision: 10, scale: 2 }).default("0.00"),
  deposit_paid: boolean("deposit_paid").default(false),
  balance_paid: boolean("balance_paid").default(false),
  installation_date: varchar("installation_date", { length: 10 }), // Store as YYYY-MM-DD string
  completion_date: varchar("completion_date", { length: 10 }).notNull(), // Store as YYYY-MM-DD string
  assigned_installer: varchar("assigned_installer", { length: 100 }),
  notes: text("notes"),
  original_lead_origin: mysqlEnum("original_lead_origin", ["Facebook", "Google Text", "Instagram", "Trade Show", "WhatsApp", "Commercial", "Referral"]),
  original_date_created: varchar("original_date_created", { length: 10 }), // Store as YYYY-MM-DD string
  original_assigned_to: mysqlEnum("original_assigned_to", ["Kim", "Patrick", "Lina"]),
  created_at: timestamp("created_at").notNull().default(sql`current_timestamp()`),
  updated_at: timestamp("updated_at").notNull().default(sql`current_timestamp()`).onUpdateNow(),
});

// Repair Requests table
export const repairRequests = mysqlTable("repair_requests", {
  id: int("id").primaryKey().autoincrement(),
  project_id: int("project_id"),
  customer_name: varchar("customer_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }),
  address: text("address").notNull(),
  issue_description: text("issue_description").notNull(),
  priority: mysqlEnum("priority", ["Low", "Medium", "High", "Urgent"]).default("Medium"),
  status: mysqlEnum("status", ["Pending", "In Progress", "Completed", "Cancelled"]).default("Pending"),
  date_reported: varchar("date_reported", { length: 10 }).notNull(), // Store as YYYY-MM-DD string
  completion_date: varchar("completion_date", { length: 10 }), // Store as YYYY-MM-DD string
  notes: text("notes"),
  created_at: timestamp("created_at").notNull().default(sql`current_timestamp()`),
  updated_at: timestamp("updated_at").notNull().default(sql`current_timestamp()`).onUpdateNow(),
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
export const sampleBooklets = mysqlTable("sample_booklets", {
  id: int("id").primaryKey().autoincrement(),
  order_number: varchar("order_number", { length: 100 }).notNull(),
  customer_name: varchar("customer_name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  product_type: mysqlEnum("product_type", ["Demo Kit & Sample Booklet", "Sample Booklet Only", "Trial Kit", "Demo Kit Only"]).notNull(),
  tracking_number: varchar("tracking_number", { length: 100 }),
  status: mysqlEnum("status", ["Pending", "Shipped", "Delivered", "Refunded"]).default("Pending"),
  date_ordered: varchar("date_ordered", { length: 10 }).notNull(), // Store as YYYY-MM-DD string
  date_shipped: varchar("date_shipped", { length: 10 }), // Store as YYYY-MM-DD string
  notes: text("notes"),
  created_at: timestamp("created_at").notNull().default(sql`current_timestamp()`),
  updated_at: timestamp("updated_at").notNull().default(sql`current_timestamp()`).onUpdateNow(),
});

export const installers = mysqlTable("installers", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  status: mysqlEnum("status", ["active", "inactive"]).default("active"),
  hire_date: varchar("hire_date", { length: 10 }), // Store as YYYY-MM-DD string
  hourly_rate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  specialty: text("specialty"),
  notes: text("notes"),
  created_at: timestamp("created_at").notNull().default(sql`current_timestamp()`),
  updated_at: timestamp("updated_at").notNull().default(sql`current_timestamp()`).onUpdateNow(),
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
export const smtpSettings = mysqlTable("smtp_settings", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  host: varchar("host", { length: 255 }).notNull(),
  port: int("port").notNull(),
  secure: boolean("secure").default(false),
  username: varchar("username", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  from_email: varchar("from_email", { length: 255 }).notNull(),
  from_name: varchar("from_name", { length: 100 }).notNull(),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").notNull().default(sql`current_timestamp()`),
  updated_at: timestamp("updated_at").notNull().default(sql`current_timestamp()`).onUpdateNow(),
});

// Email Templates table
export const emailTemplates = mysqlTable("email_templates", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  body: text("body").notNull(),
  template_type: mysqlEnum("template_type", ["repair_notification", "follow_up", "installation_reminder", "custom"]).notNull(),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").notNull().default(sql`current_timestamp()`),
  updated_at: timestamp("updated_at").notNull().default(sql`current_timestamp()`).onUpdateNow(),
});

// Activity Logs table
export const activityLogs = mysqlTable("activity_logs", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id"),
  action: varchar("action", { length: 255 }).notNull(),
  entity_type: varchar("entity_type", { length: 100 }),
  entity_id: varchar("entity_id", { length: 100 }),
  details: text("details"),
  ip_address: varchar("ip_address", { length: 45 }),
  user_agent: text("user_agent"),
  created_at: timestamp("created_at").notNull().default(sql`current_timestamp()`),
});

// WMK Colors table
export const wmkColors = mysqlTable("wmk_colors", {
  id: int("id").primaryKey().autoincrement(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 100 }),
  description: text("description"),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").notNull().default(sql`current_timestamp()`),
  updated_at: timestamp("updated_at").notNull().default(sql`current_timestamp()`).onUpdateNow(),
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
