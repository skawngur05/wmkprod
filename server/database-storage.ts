import { type User, type InsertUser, type Lead, type InsertLead, type UpdateLead, type SampleBooklet, type InsertSampleBooklet, type UpdateSampleBooklet, type Installer, type InsertInstaller, type UpdateInstaller } from "@shared/schema";
import { db } from "./db";
import { users, leads, sampleBooklets, installers } from "@shared/schema";
import { eq, desc, gte, lte, and, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const userWithId = { ...insertUser, id };
    await db.insert(users).values(userWithId);
    
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getLeads(): Promise<Lead[]> {
    return await db.select().from(leads).orderBy(desc(leads.date_created));
  }

  async getLeadsPaginated(page: number = 1, limit: number = 20, filters?: {
    search?: string;
    status?: string;
    origin?: string;
    assigned_to?: string;
  }): Promise<{ leads: Lead[], total: number, page: number, limit: number, totalPages: number }> {
    const offset = (page - 1) * limit;
    
    // Build where conditions based on filters
    let whereConditions: any[] = [];
    
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      whereConditions.push(
        // Using OR conditions for search across multiple fields
        sql`(${leads.name} LIKE ${searchTerm} OR ${leads.email} LIKE ${searchTerm} OR ${leads.phone} LIKE ${searchTerm})`
      );
    }
    
    if (filters?.status && filters.status !== 'all') {
      whereConditions.push(eq(leads.remarks, filters.status));
    }
    
    if (filters?.origin && filters.origin !== 'all') {
      whereConditions.push(eq(leads.lead_origin, filters.origin));
    }
    
    if (filters?.assigned_to && filters.assigned_to !== 'all') {
      whereConditions.push(eq(leads.assigned_to, filters.assigned_to));
    }

    // Combine all where conditions
    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get total count for pagination
    const countQuery = whereClause 
      ? db.select({ count: sql<number>`count(*)` }).from(leads).where(whereClause)
      : db.select({ count: sql<number>`count(*)` }).from(leads);
    
    const [{ count: total }] = await countQuery;

    // Get paginated results
    const leadsQuery = db.select().from(leads)
      .orderBy(desc(leads.date_created))
      .limit(limit)
      .offset(offset);

    const paginatedLeads = whereClause 
      ? await leadsQuery.where(whereClause)
      : await leadsQuery;

    const totalPages = Math.ceil(total / limit);

    return {
      leads: paginatedLeads,
      total,
      page,
      limit,
      totalPages
    };
  }

  async getLead(id: string): Promise<Lead | undefined> {
    const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
    return result[0];
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = randomUUID();
    const leadWithId = { ...insertLead, id };
    await db.insert(leads).values(leadWithId);
    
    const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
    return result[0];
  }

  async updateLead(id: string, updates: UpdateLead): Promise<Lead | undefined> {
    // Convert string dates to Date objects if needed
    const processedUpdates: any = { ...updates };
    if (typeof processedUpdates.next_followup_date === 'string') {
      processedUpdates.next_followup_date = new Date(processedUpdates.next_followup_date);
    }
    if (typeof processedUpdates.installation_date === 'string') {
      processedUpdates.installation_date = new Date(processedUpdates.installation_date);
    }
    
    await db.update(leads).set(processedUpdates).where(eq(leads.id, id));
    
    const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
    return result[0];
  }

  async deleteLead(id: string): Promise<boolean> {
    try {
      const result = await db.delete(leads).where(eq(leads.id, id));
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error('Error deleting lead:', error);
      return false;
    }
  }

  async getLeadsByAssignee(assignee: string): Promise<Lead[]> {
    return await db.select().from(leads).where(eq(leads.assigned_to, assignee));
  }

  async getLeadsWithFollowupsDue(date: Date): Promise<Lead[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db.select().from(leads).where(
      and(
        gte(leads.next_followup_date, startOfDay),
        lte(leads.next_followup_date, endOfDay)
      )
    );
  }

  async getLeadsCreatedAfter(date: Date): Promise<Lead[]> {
    return await db.select().from(leads).where(gte(leads.date_created, date));
  }

  // Sample Booklets methods
  async getSampleBooklets(): Promise<SampleBooklet[]> {
    return await db.select().from(sampleBooklets).orderBy(desc(sampleBooklets.date_ordered));
  }

  async getSampleBooklet(id: string): Promise<SampleBooklet | undefined> {
    const result = await db.select().from(sampleBooklets).where(eq(sampleBooklets.id, id)).limit(1);
    return result[0];
  }

  async createSampleBooklet(insertBooklet: InsertSampleBooklet): Promise<SampleBooklet> {
    const id = randomUUID();
    const bookletWithId = { ...insertBooklet, id };
    await db.insert(sampleBooklets).values(bookletWithId);
    
    const result = await db.select().from(sampleBooklets).where(eq(sampleBooklets.id, id)).limit(1);
    return result[0];
  }

  async updateSampleBooklet(id: string, updates: UpdateSampleBooklet): Promise<SampleBooklet | undefined> {
    await db.update(sampleBooklets).set(updates).where(eq(sampleBooklets.id, id));
    
    const result = await db.select().from(sampleBooklets).where(eq(sampleBooklets.id, id)).limit(1);
    return result[0];
  }

  async deleteSampleBooklet(id: string): Promise<boolean> {
    const result = await db.delete(sampleBooklets).where(eq(sampleBooklets.id, id));
    return (result as any).affectedRows > 0;
  }

  async getSampleBookletsByStatus(status: string): Promise<SampleBooklet[]> {
    return await db.select().from(sampleBooklets).where(eq(sampleBooklets.status, status));
  }

  // User management methods
  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.username));
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    await db.update(users).set(updates).where(eq(users.id, id));
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result as any).rowCount > 0;
  }

  // Installer management methods
  async getInstallers(): Promise<Installer[]> {
    return await db.select().from(installers).orderBy(desc(installers.name));
  }

  async getInstaller(id: string): Promise<Installer | undefined> {
    const result = await db.select().from(installers).where(eq(installers.id, id)).limit(1);
    return result[0];
  }

  async createInstaller(insertInstaller: InsertInstaller): Promise<Installer> {
    const id = randomUUID();
    const installerWithId = { ...insertInstaller, id };
    await db.insert(installers).values(installerWithId);
    
    const result = await db.select().from(installers).where(eq(installers.id, id)).limit(1);
    return result[0];
  }

  async updateInstaller(id: string, updates: UpdateInstaller): Promise<Installer | undefined> {
    await db.update(installers).set(updates).where(eq(installers.id, id));
    const result = await db.select().from(installers).where(eq(installers.id, id)).limit(1);
    return result[0];
  }

  async deleteInstaller(id: string): Promise<boolean> {
    const result = await db.delete(installers).where(eq(installers.id, id));
    return (result as any).rowCount > 0;
  }

  // Admin settings methods
  async getAdminSettings(): Promise<any[]> {
    // Return empty array for now - admin_settings table doesn't exist yet
    return [];
  }

  async getAdminSetting(key: string): Promise<any | undefined> {
    const result = await db.execute(sql`SELECT * FROM admin_settings WHERE setting_key = ${key} LIMIT 1`);
    return result[0];
  }

  async updateAdminSetting(key: string, value: string): Promise<any | undefined> {
    await db.execute(sql`UPDATE admin_settings SET setting_value = ${value}, updated_at = NOW() WHERE setting_key = ${key}`);
    const result = await db.execute(sql`SELECT * FROM admin_settings WHERE setting_key = ${key} LIMIT 1`);
    return result[0];
  }

  // Email template methods
  async getEmailTemplates(): Promise<any[]> {
    // Return empty array for now - email_templates table doesn't exist yet
    return [];
  }

  async getEmailTemplate(id: string): Promise<any | undefined> {
    const result = await db.execute(sql`SELECT * FROM email_templates WHERE id = ${id} LIMIT 1`);
    return result[0];
  }

  async createEmailTemplate(template: any): Promise<any> {
    const id = randomUUID();
    const { template_name, subject, body_content, template_type, is_active = true } = template;
    await db.execute(sql`
      INSERT INTO email_templates (id, template_name, subject, body_content, template_type, is_active) 
      VALUES (${id}, ${template_name}, ${subject}, ${body_content}, ${template_type}, ${is_active})
    `);
    const result = await db.execute(sql`SELECT * FROM email_templates WHERE id = ${id} LIMIT 1`);
    return result[0];
  }

  async updateEmailTemplate(id: string, updates: any): Promise<any | undefined> {
    const { template_name, subject, body_content, template_type, is_active } = updates;
    await db.execute(sql`
      UPDATE email_templates 
      SET template_name = COALESCE(${template_name}, template_name),
          subject = COALESCE(${subject}, subject),
          body_content = COALESCE(${body_content}, body_content),
          template_type = COALESCE(${template_type}, template_type),
          is_active = COALESCE(${is_active}, is_active),
          updated_at = NOW()
      WHERE id = ${id}
    `);
    const result = await db.execute(sql`SELECT * FROM email_templates WHERE id = ${id} LIMIT 1`);
    return result[0];
  }

  async deleteEmailTemplate(id: string): Promise<boolean> {
    const result = await db.execute(sql`DELETE FROM email_templates WHERE id = ${id}`);
    return (result as any).rowCount > 0;
  }

  // Lead origins methods
  async getLeadOrigins(): Promise<any[]> {
    // Return empty array for now - lead_origins_custom table doesn't exist yet
    return [];
  }

  async getLeadOrigin(id: string): Promise<any | undefined> {
    const result = await db.execute(sql`SELECT * FROM lead_origins_custom WHERE id = ${id} LIMIT 1`);
    return result[0];
  }

  async createLeadOrigin(originName: string): Promise<any> {
    const id = randomUUID();
    await db.execute(sql`
      INSERT INTO lead_origins_custom (id, origin_name, is_active) 
      VALUES (${id}, ${originName}, true)
    `);
    const result = await db.execute(sql`SELECT * FROM lead_origins_custom WHERE id = ${id} LIMIT 1`);
    return result[0];
  }

  async updateLeadOrigin(id: string, updates: any): Promise<any | undefined> {
    const { origin_name, is_active } = updates;
    await db.execute(sql`
      UPDATE lead_origins_custom 
      SET origin_name = COALESCE(${origin_name}, origin_name),
          is_active = COALESCE(${is_active}, is_active)
      WHERE id = ${id}
    `);
    const result = await db.execute(sql`SELECT * FROM lead_origins_custom WHERE id = ${id} LIMIT 1`);
    return result[0];
  }

  async deleteLeadOrigin(id: string): Promise<boolean> {
    const result = await db.execute(sql`DELETE FROM lead_origins_custom WHERE id = ${id}`);
    return (result as any).rowCount > 0;
  }

  // Activity log methods
  async getActivityLog(limit: number = 50, offset: number = 0): Promise<any[]> {
    // Return empty array for now - system_activity_log table doesn't exist yet
    return [];
  }

  async logActivity(userId: string, action: string, entityType?: string, entityId?: string, description?: string): Promise<void> {
    const id = randomUUID();
    await db.execute(sql`
      INSERT INTO system_activity_log (id, user_id, action, entity_type, entity_id, description) 
      VALUES (${id}, ${userId}, ${action}, ${entityType || null}, ${entityId || null}, ${description || null})
    `);
  }
}