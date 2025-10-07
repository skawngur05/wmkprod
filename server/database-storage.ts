// @ts-nocheck
import { type User, type InsertUser, type Lead, type InsertLead, type UpdateLead, type SampleBooklet, type InsertSampleBooklet, type UpdateSampleBooklet, type Installer, type InsertInstaller, type UpdateInstaller, type CompletedProject, type InsertCompletedProject, type UpdateCompletedProject, type CalendarEvent, type InsertCalendarEvent, type UpdateCalendarEvent, type ActivityLog, type InsertActivityLog } from "@shared/schema";
import { db } from "./db";
import { users, leads, sampleBooklets, installers, completedProjects, calendarEvents, activityLogs } from "@shared/schema";
import { eq, desc, gte, lte, and, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // Expose the db connection for direct queries
  get db() {
    return db;
  }

  // Helper functions to handle selected_colors JSON parsing
  private parseSelectedColors(selectedColors: string | null): string[] {
    if (!selectedColors) return [];
    try {
      return JSON.parse(selectedColors);
    } catch (error) {
      console.error('Error parsing selected_colors:', error);
      return [];
    }
  }

  private stringifySelectedColors(selectedColors: string[]): string | null {
    if (!selectedColors || selectedColors.length === 0) return null;
    try {
      return JSON.stringify(selectedColors);
    } catch (error) {
      console.error('Error stringifying selected_colors:', error);
      return null;
    }
  }

  private processLeadForResponse(lead: Lead): Lead {
    if (lead && (lead as any).selected_colors) {
      (lead as any).selected_colors = this.parseSelectedColors((lead as any).selected_colors);
    }
    
    // Fix null/undefined values being converted to strings
    if (lead) {
      // Handle assigned_to specifically
      if (lead.assigned_to === null || lead.assigned_to === undefined || lead.assigned_to === 'null' || lead.assigned_to === 'undefined') {
        (lead as any).assigned_to = null;
      }
      
      // Handle other nullable fields
      ['email', 'notes', 'next_followup_date', 'installation_date', 'assigned_installer', 'commercial_subcategory'].forEach(field => {
        if ((lead as any)[field] === null || (lead as any)[field] === undefined || (lead as any)[field] === 'null' || (lead as any)[field] === 'undefined') {
          (lead as any)[field] = null;
        }
      });
    }
    
    return lead;
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
    const leadsData = await db.select().from(leads).orderBy(desc(leads.date_created));
    return leadsData.map(lead => this.processLeadForResponse(lead));
  }

  async getLeadsPaginated(page: number = 1, limit: number = 20, filters?: {
    search?: string;
    status?: string;
    origin?: string;
    assigned_to?: string;
    project_type?: string;
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
    
    if (filters?.project_type) {
      whereConditions.push(eq(leads.project_type, filters.project_type as any));
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
      leads: paginatedLeads.map(lead => this.processLeadForResponse(lead)),
      total,
      page,
      limit,
      totalPages
    };
  }

  async getLead(id: string): Promise<Lead | undefined> {
    const result = await db.select().from(leads).where(eq(leads.id, parseInt(id))).limit(1);
    return result[0] ? this.processLeadForResponse(result[0]) : undefined;
  }

  async getLeadByEmail(email: string): Promise<Lead | undefined> {
    const result = await db.select().from(leads).where(eq(leads.email, email)).limit(1);
    return result[0] ? this.processLeadForResponse(result[0]) : undefined;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    // Ensure date_created is set if not provided, format as YYYY-MM-DD string
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const leadData: any = {
      ...insertLead,
      date_created: insertLead.date_created || todayString
    };
    
    // Handle selected_colors array to JSON string conversion
    if (leadData.selected_colors) {
      leadData.selected_colors = this.stringifySelectedColors(leadData.selected_colors);
    }
    
    const [result] = await db.insert(leads).values(leadData);
    const insertId = result.insertId;
    
    const newLead = await db.select().from(leads).where(eq(leads.id, insertId)).limit(1);
    return this.processLeadForResponse(newLead[0]);
  }

  async updateLead(id: string, updates: UpdateLead): Promise<Lead | undefined> {
    // PRODUCTION BULLETPROOF: Force all dates to remain as strings
    const processedUpdates: any = { ...updates };
    
    // AGGRESSIVE DATE PROTECTION - Convert any Date objects to strings
    ['next_followup_date', 'pickup_date', 'installation_date', 'installation_end_date'].forEach(field => {
      if (processedUpdates[field] !== undefined && processedUpdates[field] !== null) {
        if (processedUpdates[field] instanceof Date) {
          const date = processedUpdates[field] as Date;
          processedUpdates[field] = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        }
      }
    });
    
    // Handle selected_colors array to JSON string conversion
    if (processedUpdates.selected_colors) {
      processedUpdates.selected_colors = this.stringifySelectedColors(processedUpdates.selected_colors);
    }
    
    await db.update(leads).set(processedUpdates).where(eq(leads.id, parseInt(id)));
    
    const result = await db.select().from(leads).where(eq(leads.id, parseInt(id))).limit(1);
    return result[0] ? this.processLeadForResponse(result[0]) : undefined;
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
    const leadsData = await db.select().from(leads).where(eq(leads.assigned_to, assignee as any));
    return leadsData.map(lead => this.processLeadForResponse(lead));
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
    // Insert without specifying id (it's auto-increment)
    const result = await db.insert(sampleBooklets).values(insertBooklet);
    
    // Get the inserted record using the insertId
    const insertId = result[0].insertId;
    const createdBooklet = await db.select().from(sampleBooklets).where(eq(sampleBooklets.id, insertId)).limit(1);
    return createdBooklet[0];
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
    if (updateData.permissions !== undefined) {
      // If permissions is empty string or empty array, set to null, otherwise stringify
      if (updateData.permissions === '' || (Array.isArray(updateData.permissions) && updateData.permissions.length === 0)) {
        updateData.permissions = null as any;
      } else {
        updateData.permissions = JSON.stringify(updateData.permissions) as any;
      }
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

  // Calendar methods
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    return await db.select().from(calendarEvents).orderBy(calendarEvents.start_date);
  }

  async getCalendarEvent(id: string): Promise<CalendarEvent | undefined> {
    const result = await db.select().from(calendarEvents).where(eq(calendarEvents.id, parseInt(id)));
    return result[0];
  }

  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const result = await db.insert(calendarEvents).values(event);
    
    // Get the inserted ID - might be in different location depending on Drizzle version
    let eventId;
    if (Array.isArray(result) && result[0]?.insertId) {
      eventId = result[0].insertId;
    } else if (result.insertId) {
      eventId = result.insertId;
    } else {
      console.error('❌ Could not get insertId from result:', result);
      throw new Error('Failed to get insert ID');
    }
    
    const createdEvent = await this.getCalendarEvent(eventId.toString());
    return createdEvent!;
  }

  async updateCalendarEvent(id: string, updates: UpdateCalendarEvent): Promise<CalendarEvent | undefined> {
    try {
      await db.update(calendarEvents)
        .set(updates)
        .where(eq(calendarEvents.id, parseInt(id)));
      
      return await this.getCalendarEvent(id);
    } catch (error) {
      console.error("Error updating calendar event:", error);
      return undefined;
    }
  }

  async deleteCalendarEvent(id: string): Promise<boolean> {
    try {
      const result = await db.delete(calendarEvents)
        .where(eq(calendarEvents.id, parseInt(id)));
      
      console.log("Delete result:", result);
      
      // The result is an array, get the first element which contains the ResultSetHeader
      const resultHeader = Array.isArray(result) ? result[0] : result;
      const affectedRows = resultHeader?.affectedRows || 0;
      console.log("Affected rows:", affectedRows);
      
      return affectedRows > 0;
    } catch (error) {
      console.error("Error deleting calendar event:", error);
      return false;
    }
  }

  async getCalendarEventByGoogleId(googleEventId: string): Promise<CalendarEvent | undefined> {
    const result = await db.select().from(calendarEvents).where(eq(calendarEvents.google_event_id, googleEventId));
    return result[0];
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
    const result = await db.execute(sql`SELECT id, name, template_type as type, subject, body, is_active, created_at, updated_at FROM email_templates ORDER BY created_at DESC`);
    return result.rows || [];
  }

  async getEmailTemplate(id: string): Promise<any | undefined> {
    const result = await db.execute(sql`SELECT id, name, template_type as type, subject, body, is_active, created_at, updated_at FROM email_templates WHERE id = ${parseInt(id)}`);
    return result.rows?.[0];
  }

  async createEmailTemplate(template: any): Promise<any> {
    const result = await db.execute(sql`
      INSERT INTO email_templates (name, template_type, subject, body, is_active)
      VALUES (${template.name}, ${template.type}, ${template.subject}, 
              ${template.body}, ${template.is_active})
    `);
    
    // Get the inserted record using the auto-increment ID
    const insertId = (result as any).insertId;
    const newTemplate = await db.execute(sql`SELECT id, name, template_type as type, subject, body, is_active, created_at, updated_at FROM email_templates WHERE id = ${insertId}`);
    return newTemplate.rows?.[0];
  }

  async updateEmailTemplate(id: string, updates: any): Promise<any | undefined> {
    const { name, type, subject, body, variables, is_active } = updates;
    
    await db.execute(sql`
      UPDATE email_templates 
      SET name = COALESCE(${name}, name),
          template_type = COALESCE(${type}, template_type),
          subject = COALESCE(${subject}, subject),
          body = COALESCE(${body}, body),
          is_active = COALESCE(${is_active}, is_active),
          updated_at = NOW()
      WHERE id = ${parseInt(id)}
    `);
    
    const result = await db.execute(sql`SELECT id, name, template_type as type, subject, body, is_active, created_at, updated_at FROM email_templates WHERE id = ${parseInt(id)}`);
    return result.rows?.[0];
  }

  async deleteEmailTemplate(id: string): Promise<boolean> {
    const result = await db.execute(sql`DELETE FROM email_templates WHERE id = ${parseInt(id)}`);
    return (result as any).rowsAffected > 0;
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

  // Activity log operations using Drizzle ORM
  async getActivityLogs(filters: {
    search?: string;
    entity_type?: string;
    action?: string;
    days?: number;
    limit?: number;
    offset?: number;
  }): Promise<ActivityLog[]> {
    const { search, entity_type, action, days, limit = 50, offset = 0 } = filters;
    
    let whereConditions: any[] = [];
    
    if (search) {
      whereConditions.push(
        sql`(${activityLogs.action} LIKE ${`%${search}%`} OR ${activityLogs.details} LIKE ${`%${search}%`})`
      );
    }
    
    if (entity_type && entity_type !== 'all') {
      whereConditions.push(eq(activityLogs.entity_type, entity_type));
    }
    
    if (action && action !== 'all') {
      whereConditions.push(sql`${activityLogs.action} LIKE ${`%${action}%`}`);
    }
    
    if (days && days !== -1) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - days);
      whereConditions.push(gte(activityLogs.created_at, daysAgo));
    }
    
    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
    
    const query = db
      .select({
        id: activityLogs.id,
        user_id: activityLogs.user_id,
        action: activityLogs.action,
        entity_type: activityLogs.entity_type,
        entity_id: activityLogs.entity_id,
        details: activityLogs.details,
        ip_address: activityLogs.ip_address,
        user_agent: activityLogs.user_agent,
        created_at: activityLogs.created_at,
        user_name: users.username,
      })
      .from(activityLogs)
      .leftJoin(users, eq(activityLogs.user_id, users.id))
      .orderBy(desc(activityLogs.created_at))
      .limit(limit)
      .offset(offset);
    
    if (whereClause) {
      return await query.where(whereClause);
    } else {
      return await query;
    }
  }

  async logActivity(userId: string, action: string, entityType?: string, entityId?: string, details?: string): Promise<void> {
    const activityLog: InsertActivityLog = {
      user_id: parseInt(userId),
      action,
      entity_type: entityType || null,
      entity_id: entityId || null,
      details: details || null,
    };
    
    await db.insert(activityLogs).values(activityLog);
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