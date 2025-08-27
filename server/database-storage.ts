// @ts-nocheck
import { type User, type InsertUser, type Lead, type InsertLead, type UpdateLead, type SampleBooklet, type InsertSampleBooklet, type UpdateSampleBooklet, type Installer, type InsertInstaller, type UpdateInstaller, type CompletedProject, type InsertCompletedProject, type UpdateCompletedProject } from "@shared/schema";
import { db } from "./db";
import { users, leads, sampleBooklets, installers, completedProjects } from "@shared/schema";
import { eq, desc, gte, lte, and, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // Expose the db connection for direct queries
  get db() {
    return db;
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, parseInt(id))).limit(1);
    const user = result[0];
    
    // Parse permissions back to array for response
    if (user && user.permissions) {
      try {
        (user as any).permissions = JSON.parse(user.permissions as string);
      } catch (error) {
        console.error('Error parsing user permissions:', error);
        (user as any).permissions = [];
      }
    } else if (user) {
      (user as any).permissions = [];
    }
    
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    const user = result[0];
    
    // Parse permissions back to array for response
    if (user && user.permissions) {
      try {
        (user as any).permissions = JSON.parse(user.permissions as string);
      } catch (error) {
        console.error('Error parsing user permissions:', error);
        (user as any).permissions = [];
      }
    } else if (user) {
      (user as any).permissions = [];
    }
    
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Handle permissions array to JSON string conversion
    const userData = {
      ...insertUser,
      permissions: insertUser.permissions ? JSON.stringify(insertUser.permissions) : null
    };
    
    const [result] = await db.insert(users).values(userData);
    const insertId = result.insertId;
    
    const newUser = await db.select().from(users).where(eq(users.id, insertId)).limit(1);
    
    // Parse permissions back to array for response
    const user = newUser[0];
    if (user && user.permissions) {
      try {
        (user as any).permissions = JSON.parse(user.permissions as string);
      } catch (error) {
        console.error('Error parsing user permissions:', error);
        (user as any).permissions = [];
      }
    } else if (user) {
      (user as any).permissions = [];
    }
    
    return user;
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
      whereConditions.push(eq(leads.remarks, filters.status as any));
    }
    
    if (filters?.origin && filters.origin !== 'all') {
      whereConditions.push(eq(leads.lead_origin, filters.origin as any));
    }
    
    if (filters?.assigned_to && filters.assigned_to !== 'all') {
      whereConditions.push(eq(leads.assigned_to, filters.assigned_to as any));
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
    const result = await db.select().from(leads).where(eq(leads.id, parseInt(id))).limit(1);
    return result[0];
  }

  async getLeadByEmail(email: string): Promise<Lead | undefined> {
    const result = await db.select().from(leads).where(eq(leads.email, email)).limit(1);
    return result[0];
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    // Ensure date_created is set if not provided
    const leadData = {
      ...insertLead,
      date_created: insertLead.date_created || new Date()
    };
    
    const [result] = await db.insert(leads).values(leadData);
    const insertId = result.insertId;
    
    const newLead = await db.select().from(leads).where(eq(leads.id, insertId)).limit(1);
    return newLead[0];
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
    
    await db.update(leads).set(processedUpdates).where(eq(leads.id, parseInt(id)));
    
    const result = await db.select().from(leads).where(eq(leads.id, parseInt(id))).limit(1);
    return result[0];
  }

  async deleteLead(id: string): Promise<boolean> {
    try {
      const result = await db.delete(leads).where(eq(leads.id, parseInt(id)));
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error('Error deleting lead:', error);
      return false;
    }
  }

  async getLeadsByAssignee(assignee: string): Promise<Lead[]> {
    return await db.select().from(leads).where(eq(leads.assigned_to, assignee as any));
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
    const result = await db.select().from(sampleBooklets).where(eq(sampleBooklets.id, parseInt(id) as any)).limit(1);
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
    return await db.select().from(sampleBooklets).where(eq(sampleBooklets.status, status as any));
  }

  // User management methods
  async getUsers(): Promise<User[]> {
    const userList = await db.select().from(users).orderBy(desc(users.username));
    
    // Parse permissions JSON strings back to arrays
    return userList.map(user => ({
      ...user,
      permissions: user.permissions ? (() => {
        try {
          return JSON.parse(user.permissions as string);
        } catch (error) {
          console.error('Error parsing user permissions:', error);
          return [];
        }
      })() : []
    }));
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    // Handle permissions array to JSON string conversion
    const updateData = { ...updates };
    if (updateData.permissions) {
      updateData.permissions = JSON.stringify(updateData.permissions) as any;
    }
    
    await db.update(users).set(updateData).where(eq(users.id, parseInt(id)));
    const result = await db.select().from(users).where(eq(users.id, parseInt(id))).limit(1);
    
    const user = result[0];
    if (user && user.permissions) {
      try {
        (user as any).permissions = JSON.parse(user.permissions as string);
      } catch (error) {
        console.error('Error parsing user permissions:', error);
        (user as any).permissions = [];
      }
    } else if (user) {
      (user as any).permissions = [];
    }
    
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, parseInt(id)));
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

  // Calendar methods (placeholder implementations)
  async getCalendarEvents(): Promise<any[]> {
    // Return empty array for now - calendar functionality not implemented yet
    return [];
  }

  async getCalendarEvent(id: string): Promise<any | undefined> {
    // Return undefined for now - calendar functionality not implemented yet
    return undefined;
  }

  async createCalendarEvent(event: any): Promise<any> {
    // Return mock event for now - calendar functionality not implemented yet
    return { id: randomUUID(), ...event };
  }

  async updateCalendarEvent(id: string, updates: any): Promise<any | undefined> {
    // Return undefined for now - calendar functionality not implemented yet
    return undefined;
  }

  async deleteCalendarEvent(id: string): Promise<boolean> {
    // Return false for now - calendar functionality not implemented yet
    return false;
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

  // Email template operations using direct SQL
  async getEmailTemplates(): Promise<any[]> {
    const result = await db.execute(sql`SELECT * FROM email_templates ORDER BY created_at DESC`);
    return result;
  }

  async getEmailTemplate(id: string): Promise<any | undefined> {
    const result = await db.execute(sql`SELECT * FROM email_templates WHERE id = ${id}`);
    return result[0];
  }

  async createEmailTemplate(template: any): Promise<any> {
    const id = randomUUID();
    
    await db.execute(sql`
      INSERT INTO email_templates (id, name, type, subject, body, variables, is_active)
      VALUES (${id}, ${template.name}, ${template.type}, ${template.subject}, 
              ${template.body}, ${template.variables}, ${template.is_active})
    `);
    
    const result = await db.execute(sql`SELECT * FROM email_templates WHERE id = ${id}`);
    return result[0];
  }

  async updateEmailTemplate(id: string, updates: any): Promise<any | undefined> {
    const { name, type, subject, body, variables, is_active } = updates;
    
    await db.execute(sql`
      UPDATE email_templates 
      SET name = COALESCE(${name}, name),
          type = COALESCE(${type}, type),
          subject = COALESCE(${subject}, subject),
          body = COALESCE(${body}, body),
          variables = COALESCE(${variables}, variables),
          is_active = COALESCE(${is_active}, is_active),
          updated_at = NOW()
      WHERE id = ${id}
    `);
    
    const result = await db.execute(sql`SELECT * FROM email_templates WHERE id = ${id}`);
    return result[0];
  }

  async deleteEmailTemplate(id: string): Promise<boolean> {
    const result = await db.execute(sql`DELETE FROM email_templates WHERE id = ${id}`);
    return (result as any).rowCount > 0;
  }

  // SMTP settings operations using direct SQL
  async getSMTPSettings(): Promise<any[]> {
    const result = await db.execute(sql`SELECT * FROM smtp_settings ORDER BY created_at DESC`);
    return result;
  }

  async getSMTPSetting(id: string): Promise<any | undefined> {
    const result = await db.execute(sql`SELECT * FROM smtp_settings WHERE id = ${id}`);
    return result[0];
  }

  async createSMTPSettings(settings: any): Promise<any> {
    const id = randomUUID();
    
    await db.execute(sql`
      INSERT INTO smtp_settings (id, host, port, username, password, from_email, from_name, use_tls, is_active, test_email)
      VALUES (${id}, ${settings.host}, ${settings.port}, ${settings.username}, 
              ${settings.password}, ${settings.from_email}, ${settings.from_name},
              ${settings.use_tls}, ${settings.is_active}, ${settings.test_email || null})
    `);
    
    const result = await db.execute(sql`SELECT * FROM smtp_settings WHERE id = ${id}`);
    return result[0];
  }

  async updateSMTPSettings(id: string, updates: any): Promise<any | undefined> {
    const { host, port, username, password, from_email, from_name, use_tls, is_active, test_email } = updates;
    
    await db.execute(sql`
      UPDATE smtp_settings 
      SET host = COALESCE(${host}, host),
          port = COALESCE(${port}, port),
          username = COALESCE(${username}, username),
          password = COALESCE(${password}, password),
          from_email = COALESCE(${from_email}, from_email),
          from_name = COALESCE(${from_name}, from_name),
          use_tls = COALESCE(${use_tls}, use_tls),
          is_active = COALESCE(${is_active}, is_active),
          test_email = COALESCE(${test_email}, test_email),
          updated_at = NOW()
      WHERE id = ${id}
    `);
    
    const result = await db.execute(sql`SELECT * FROM smtp_settings WHERE id = ${id}`);
    return result[0];
  }

  async deleteSMTPSettings(id: string): Promise<boolean> {
    const result = await db.execute(sql`DELETE FROM smtp_settings WHERE id = ${id}`);
    return (result as any).rowCount > 0;
  }

  // Activity log operations using direct SQL
  async getActivityLogs(filters: {
    search?: string;
    entity_type?: string;
    action?: string;
    days?: number;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const { search, entity_type, action, days, limit = 50, offset = 0 } = filters;
    
    let whereConditions = [];
    
    if (search) {
      whereConditions.push(sql`(action LIKE ${`%${search}%`} OR details LIKE ${`%${search}%`})`);
    }
    
    if (entity_type && entity_type !== 'all') {
      whereConditions.push(sql`entity_type = ${entity_type}`);
    }
    
    if (action && action !== 'all') {
      whereConditions.push(sql`action LIKE ${`%${action}%`}`);
    }
    
    if (days && days !== -1) {
      whereConditions.push(sql`created_at >= NOW() - INTERVAL '${days} days'`);
    }
    
    let query = sql`
      SELECT al.*, u.username as user_name 
      FROM activity_logs al 
      LEFT JOIN users u ON al.user_id = u.id
    `;
    
    if (whereConditions.length > 0) {
      query = sql`${query} WHERE ${sql.join(whereConditions, sql` AND `)}`;
    }
    
    query = sql`${query} ORDER BY al.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    
    const result = await db.execute(query);
    return result;
  }

  async logActivity(userId: string, action: string, entityType?: string, entityId?: string, description?: string): Promise<void> {
    const id = randomUUID();
    
    await db.execute(sql`
      INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, details)
      VALUES (${id}, ${userId}, ${action}, ${entityType || null}, ${entityId || null}, ${description || null})
    `);
  }

  // Completed Projects operations
  async getCompletedProjects(): Promise<CompletedProject[]> {
    return await db.select().from(completedProjects).orderBy(desc(completedProjects.completion_date));
  }

  async getCompletedProject(id: string): Promise<CompletedProject | undefined> {
    const result = await db.select().from(completedProjects).where(eq(completedProjects.id, parseInt(id))).limit(1);
    return result[0];
  }

  async createCompletedProject(insertProject: InsertCompletedProject): Promise<CompletedProject> {
    const [result] = await db.insert(completedProjects).values(insertProject);
    const insertId = result.insertId;
    
    const newProject = await db.select().from(completedProjects).where(eq(completedProjects.id, insertId)).limit(1);
    return newProject[0];
  }

  async updateCompletedProject(id: string, updates: UpdateCompletedProject): Promise<CompletedProject | undefined> {
    await db.update(completedProjects).set(updates).where(eq(completedProjects.id, parseInt(id)));
    
    const result = await db.select().from(completedProjects).where(eq(completedProjects.id, parseInt(id))).limit(1);
    return result[0];
  }

  async deleteCompletedProject(id: string): Promise<boolean> {
    const result = await db.delete(completedProjects).where(eq(completedProjects.id, parseInt(id)));
    return result.affectedRows > 0;
  }
}