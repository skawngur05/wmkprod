import { pgTable, varchar, text, integer, boolean, timestamp, decimal, pgEnum, date } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("sales_rep"), // admin, owner, manager, sales_rep, installer
  permissions: text("permissions").array().default([]), // array of permission strings
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").notNull().default(sql`NOW()`),
  last_login: timestamp("last_login"),
});

export const leads = pgTable("leads", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }),
  lead_origin: varchar("lead_origin", { length: 100 }).notNull(), // facebook, google, instagram, etc.
  date_created: timestamp("date_created").notNull().default(sql`NOW()`),
  next_followup_date: timestamp("next_followup_date"),
  remarks: varchar("remarks", { length: 255 }).notNull().default("new"), // status field
  assigned_to: varchar("assigned_to", { length: 255 }),
  project_amount: decimal("project_amount", { precision: 10, scale: 2 }),
  notes: text("notes"),
  additional_notes: text("additional_notes"),
  deposit_paid: boolean("deposit_paid").notNull().default(false),
  balance_paid: boolean("balance_paid").notNull().default(false),
  installation_date: timestamp("installation_date"),
  assigned_installer: text("assigned_installer").array(), // array of installer names: angel, brian, luis
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
});

export const updateLeadSchema = insertLeadSchema.partial().extend({
  next_followup_date: z.union([z.date(), z.string().datetime(), z.string().transform((val) => val ? new Date(val) : null), z.null()]).optional(),
  installation_date: z.union([z.date(), z.string().datetime(), z.string().transform((val) => val ? new Date(val) : null), z.null()]).optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type UpdateLead = z.infer<typeof updateLeadSchema>;
export type Lead = typeof leads.$inferSelect;

// Enums for dropdowns
export const LEAD_ORIGINS = [
  "facebook",
  "google",
  "instagram", 
  "trade-show",
  "whatsapp",
  "commercial",
  "referral",
  "website",
  "phone",
  "email",
  "walk-in",
  "tiktok",
  "youtube",
  "linkedin",
  "twitter"
] as const;

export const LEAD_STATUSES = [
  "new",
  "in-progress", 
  "quoted",
  "sold",
  "not-interested",
  "not-service-area",
  "not-compatible"
] as const;

export const ASSIGNEES = ["kim", "patrick", "lina"] as const;
export const INSTALLERS = ["angel", "brian", "luis"] as const;

// Calendar Events schema
export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // installation, leave, trade-show, showroom-visit, holiday
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date"),
  all_day: boolean("all_day").notNull().default(false),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  assigned_to: varchar("assigned_to", { length: 255 }), // for leave events
  related_lead_id: varchar("related_lead_id", { length: 36 }), // for installation events
  created_at: timestamp("created_at").notNull().default(sql`NOW()`),
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({
  id: true,
  created_at: true,
});

export const updateCalendarEventSchema = insertCalendarEventSchema.partial();

export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type UpdateCalendarEvent = z.infer<typeof updateCalendarEventSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;

export const EVENT_TYPES = [
  "installation",
  "leave", 
  "trade-show",
  "showroom-visit",
  "holiday"
] as const;

// Sample Booklets schema
export const sampleBooklets = pgTable("sample_booklets", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  order_number: varchar("order_number", { length: 100 }),
  customer_name: varchar("customer_name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  product_type: varchar("product_type", { length: 100 }).notNull(),
  tracking_number: varchar("tracking_number", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  date_ordered: timestamp("date_ordered").notNull().default(sql`NOW()`),
  date_shipped: timestamp("date_shipped"),
  notes: text("notes"),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const installers = pgTable("installers", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 100 }).unique(),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  hire_date: date("hire_date"),
  hourly_rate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  specialty: varchar("specialty", { length: 255 }),
  notes: text("notes"),
  created_at: timestamp("created_at").notNull().default(sql`NOW()`),
  updated_at: timestamp("updated_at").notNull().default(sql`NOW()`),
});

export const insertSampleBookletSchema = createInsertSchema(sampleBooklets).omit({
  id: true,
  created_at: true,
  updated_at: true,
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
});

export const updateInstallerSchema = insertInstallerSchema.partial();

export type InsertInstaller = z.infer<typeof insertInstallerSchema>;
export type UpdateInstaller = z.infer<typeof updateInstallerSchema>;
export type Installer = typeof installers.$inferSelect;

// Sample Booklets enums
export const PRODUCT_TYPES = [
  "demo_kit_and_sample_booklet",
  "sample_booklet_only", 
  "trial_kit",
  "demo_kit_only"
] as const;

export const BOOKLET_STATUSES = [
  "pending",
  "shipped", 
  "in-transit",
  "out-for-delivery",
  "delivered",
  "unknown"
] as const;

// Installers enums
export const INSTALLER_STATUSES = [
  "active",
  "inactive", 
  "on_leave",
  "terminated"
] as const;
