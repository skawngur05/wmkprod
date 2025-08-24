import { mysqlTable, varchar, text, int, boolean, datetime, decimal, mysqlEnum, date, timestamp } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("sales_rep"), // admin, sales_rep
});

export const leads = mysqlTable("leads", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }),
  lead_origin: varchar("lead_origin", { length: 100 }).notNull(), // facebook, google, instagram, etc.
  date_created: datetime("date_created").notNull().default(sql`NOW()`),
  next_followup_date: datetime("next_followup_date"),
  remarks: varchar("remarks", { length: 255 }).notNull().default("new"), // status field
  assigned_to: varchar("assigned_to", { length: 255 }),
  project_amount: decimal("project_amount", { precision: 10, scale: 2 }),
  notes: text("notes"),
  additional_notes: text("additional_notes"),
  deposit_paid: boolean("deposit_paid").notNull().default(false),
  balance_paid: boolean("balance_paid").notNull().default(false),
  installation_date: datetime("installation_date"),
  assigned_installer: varchar("assigned_installer", { length: 255 }), // angel, brian, luis
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

// Sample Booklets schema
export const sampleBooklets = mysqlTable("sample_booklets", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  order_number: varchar("order_number", { length: 100 }),
  customer_name: varchar("customer_name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  product_type: varchar("product_type", { length: 100 }).notNull(),
  tracking_number: varchar("tracking_number", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  date_ordered: datetime("date_ordered").notNull().default(sql`NOW()`),
  date_shipped: datetime("date_shipped"),
  notes: text("notes"),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const installers = mysqlTable("installers", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 100 }).unique(),
  status: mysqlEnum("status", ["active", "inactive", "on_leave", "terminated"]).notNull().default("active"),
  hire_date: date("hire_date"),
  hourly_rate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  specialty: varchar("specialty", { length: 255 }),
  notes: text("notes"),
  created_at: datetime("created_at").notNull().default(sql`NOW()`),
  updated_at: datetime("updated_at").notNull().default(sql`NOW() ON UPDATE NOW()`),
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
  "delivered"
] as const;

// Installers enums
export const INSTALLER_STATUSES = [
  "active",
  "inactive", 
  "on_leave",
  "terminated"
] as const;
