import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("sales_rep"), // admin, sales_rep
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  lead_origin: text("lead_origin").notNull(), // facebook, google, instagram, etc.
  date_created: timestamp("date_created").notNull().defaultNow(),
  next_followup_date: timestamp("next_followup_date"),
  remarks: text("remarks").notNull().default("new"), // status field
  assigned_to: text("assigned_to").notNull(),
  project_amount: decimal("project_amount", { precision: 10, scale: 2 }),
  notes: text("notes"),
  additional_notes: text("additional_notes"),
  deposit_paid: boolean("deposit_paid").default(false),
  balance_paid: boolean("balance_paid").default(false),
  installation_date: timestamp("installation_date"),
  assigned_installer: text("assigned_installer"), // angel, brian, luis
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  date_created: true,
});

export const updateLeadSchema = insertLeadSchema.partial();

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
