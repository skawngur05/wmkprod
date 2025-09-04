// @ts-nocheck
import { type User, type InsertUser, type Lead, type InsertLead, type UpdateLead, type SampleBooklet, type InsertSampleBooklet, type UpdateSampleBooklet, type Installer, type InsertInstaller, type UpdateInstaller, type CalendarEvent, type InsertCalendarEvent, type UpdateCalendarEvent, smtpSettings, emailTemplates } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from './db';
import { eq } from 'drizzle-orm';

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  
  // Lead operations
  getLeads(): Promise<Lead[]>;
  getLeadsPaginated(page?: number, limit?: number, filters?: {
    search?: string;
    status?: string;
    origin?: string;
    assigned_to?: string;
  }): Promise<{ leads: Lead[], total: number, page: number, limit: number, totalPages: number }>;
  getLead(id: string): Promise<Lead | undefined>;
  getLeadByEmail(email: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, updates: UpdateLead): Promise<Lead | undefined>;
  deleteLead(id: string): Promise<boolean>;
  getLeadsByAssignee(assignee: string): Promise<Lead[]>;
  getLeadsWithFollowupsDue(date: Date): Promise<Lead[]>;
  getLeadsCreatedAfter(date: Date): Promise<Lead[]>;

  // Sample Booklets operations
  getSampleBooklets(): Promise<SampleBooklet[]>;
  getSampleBooklet(id: string): Promise<SampleBooklet | undefined>;
  createSampleBooklet(booklet: InsertSampleBooklet): Promise<SampleBooklet>;
  updateSampleBooklet(id: string, updates: UpdateSampleBooklet): Promise<SampleBooklet | undefined>;
  deleteSampleBooklet(id: string): Promise<boolean>;
  getSampleBookletsByStatus(status: string): Promise<SampleBooklet[]>;

  // Installer operations
  getInstallers(): Promise<Installer[]>;
  getInstaller(id: string): Promise<Installer | undefined>;
  createInstaller(installer: InsertInstaller): Promise<Installer>;
  updateInstaller(id: string, updates: UpdateInstaller): Promise<Installer | undefined>;
  deleteInstaller(id: string): Promise<boolean>;

  // Admin settings operations
  getAdminSettings(): Promise<any[]>;
  getAdminSetting(key: string): Promise<any | undefined>;
  updateAdminSetting(key: string, value: string): Promise<any | undefined>;

  // Email template operations
  getEmailTemplates(): Promise<any[]>;
  getEmailTemplate(id: string): Promise<any | undefined>;
  createEmailTemplate(template: any): Promise<any>;
  updateEmailTemplate(id: string, updates: any): Promise<any | undefined>;
  deleteEmailTemplate(id: string): Promise<boolean>;

  // Lead origins operations
  getLeadOrigins(): Promise<any[]>;
  getLeadOrigin(id: string): Promise<any | undefined>;
  createLeadOrigin(originName: string): Promise<any>;
  updateLeadOrigin(id: string, updates: any): Promise<any | undefined>;
  deleteLeadOrigin(id: string): Promise<boolean>;

  // SMTP settings operations
  getSMTPSettings(): Promise<any[]>;
  getSMTPSetting(id: string): Promise<any | undefined>;
  createSMTPSettings(settings: any): Promise<any>;
  updateSMTPSettings(id: string, updates: any): Promise<any | undefined>;
  deleteSMTPSettings(id: string): Promise<boolean>;

  // Calendar Event operations
  getCalendarEvents(): Promise<CalendarEvent[]>;
  getCalendarEvent(id: string): Promise<CalendarEvent | undefined>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: string, updates: UpdateCalendarEvent): Promise<CalendarEvent | undefined>;
  deleteCalendarEvent(id: string): Promise<boolean>;

  // Completed Projects operations
  getCompletedProjects(): Promise<any[]>;
  getCompletedProject(id: string): Promise<any | undefined>;
  createCompletedProject(project: any): Promise<any>;
  updateCompletedProject(id: string, updates: any): Promise<any | undefined>;
  deleteCompletedProject(id: string): Promise<boolean>;

  // Activity log operations
  getActivityLogs(filters: {
    search?: string;
    entity_type?: string;
    action?: string;
    days?: number;
    limit?: number;
    offset?: number;
  }): Promise<any[]>;
  logActivity(userId: string, action: string, entityType?: string, entityId?: string, description?: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private leads: Map<string, Lead>;
  private sampleBooklets: Map<string, SampleBooklet>;
  private calendarEvents: Map<string, CalendarEvent>;

  constructor() {
    this.users = new Map();
    this.leads = new Map();
    this.sampleBooklets = new Map();
    this.calendarEvents = new Map();
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default users with comprehensive mock data
    const defaultUsers = [
      { 
        username: "admin", 
        password: "admin123", 
        role: "administrator",
        permissions: ["dashboard", "leads", "followups", "installations", "sample_booklets", "reports", "admin_panel", "user_management", "system_settings"],
        is_active: true,
        created_at: new Date("2024-01-01"),
        last_login: new Date()
      },
      { 
        username: "kim", 
        password: "password", 
        role: "owner",
        permissions: ["dashboard", "leads", "followups", "installations", "sample_booklets", "reports", "admin_panel", "user_management"],
        is_active: true,
        created_at: new Date("2024-01-01"),
        last_login: new Date("2024-01-15")
      },
      { 
        username: "patrick", 
        password: "password", 
        role: "sales_rep",
        permissions: ["dashboard", "leads", "followups", "sample_booklets"],
        is_active: true,
        created_at: new Date("2024-01-01"),
        last_login: new Date("2024-01-14")
      },
      { 
        username: "lina", 
        password: "password", 
        role: "sales_rep",
        permissions: ["dashboard", "leads", "followups", "sample_booklets"],
        is_active: true,
        created_at: new Date("2024-01-01"),
        last_login: new Date("2024-01-13")
      },
      { 
        username: "manager", 
        password: "manager123", 
        role: "manager",
        permissions: ["dashboard", "leads", "followups", "installations", "sample_booklets", "reports"],
        is_active: true,
        created_at: new Date("2024-01-01"),
        last_login: new Date("2024-01-12")
      },
      { 
        username: "installer", 
        password: "installer123", 
        role: "installer",
        permissions: ["dashboard", "installations"],
        is_active: true,
        created_at: new Date("2024-01-01"),
        last_login: new Date("2024-01-11")
      }
    ];

    defaultUsers.forEach(userData => {
      const id = randomUUID();
      const user: User = { 
        ...userData, 
        id,
        permissions: userData.permissions,
        last_login: userData.last_login || null
      };
      this.users.set(id, user);
    });

    // Note: All mockup leads and sample booklets data has been removed.
    // Only user accounts are retained for authentication purposes.
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "sales_rep",
      permissions: insertUser.permissions || [],
      is_active: insertUser.is_active ?? true,
      created_at: insertUser.created_at || new Date(),
      last_login: insertUser.last_login || null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;

    const updatedUser: User = { ...existingUser, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async getLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values()).sort((a, b) => 
      new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
    );
  }

  async getLeadsPaginated(page: number = 1, limit: number = 20, filters?: {
    search?: string;
    status?: string;
    origin?: string;
    assigned_to?: string;
  }): Promise<{ leads: Lead[], total: number, page: number, limit: number, totalPages: number }> {
    let filteredLeads = Array.from(this.leads.values());

    // Apply filters
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredLeads = filteredLeads.filter(lead => 
        lead.name.toLowerCase().includes(searchTerm) ||
        lead.phone.includes(searchTerm) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm))
      );
    }

    if (filters?.status && filters.status !== 'all') {
      filteredLeads = filteredLeads.filter(lead => lead.remarks === filters.status);
    }

    if (filters?.origin && filters.origin !== 'all') {
      filteredLeads = filteredLeads.filter(lead => lead.lead_origin === filters.origin);
    }

    if (filters?.assigned_to && filters.assigned_to !== 'all') {
      filteredLeads = filteredLeads.filter(lead => lead.assigned_to === filters.assigned_to);
    }

    // Sort by date created
    filteredLeads.sort((a, b) => 
      new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
    );

    // Calculate pagination
    const total = filteredLeads.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedLeads = filteredLeads.slice(offset, offset + limit);

    return {
      leads: paginatedLeads,
      total,
      page,
      limit,
      totalPages
    };
  }

  async getLead(id: string): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async getLeadByEmail(email: string): Promise<Lead | undefined> {
    // Find the first lead with the matching email
    for (const lead of this.leads.values()) {
      if (lead.email && lead.email.toLowerCase() === email.toLowerCase()) {
        return lead;
      }
    }
    return undefined;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = randomUUID();
    const lead: Lead = { 
      ...insertLead, 
      id,
      email: insertLead.email || null,
      next_followup_date: insertLead.next_followup_date || null,
      assigned_to: insertLead.assigned_to || null,
      notes: insertLead.notes || null,
      additional_notes: insertLead.additional_notes || null,
      installation_date: insertLead.installation_date || null,
      assigned_installer: insertLead.assigned_installer || null,
      date_created: insertLead.date_created || new Date()
    };
    this.leads.set(id, lead);
    return lead;
  }

  async updateLead(id: string, updates: UpdateLead): Promise<Lead | undefined> {
    const existingLead = this.leads.get(id);
    if (!existingLead) return undefined;

    // Debug dates being stored
    console.log('Date Debug - Storage updateLead input:', {
      next_followup_date: updates.next_followup_date,
      pickup_date: (updates as any).pickup_date,
      installation_date: updates.installation_date,
      installation_end_date: (updates as any).installation_end_date,
      types: {
        next_followup_date: typeof updates.next_followup_date,
        pickup_date: typeof (updates as any).pickup_date,
        installation_date: typeof updates.installation_date,
        installation_end_date: typeof (updates as any).installation_end_date
      }
    });

    // Store date fields as strings directly - no Date conversion
    // Database now uses VARCHAR(10) columns for timezone-free storage
    const processedUpdates: any = { ...updates };
    
    const updatedLead: Lead = { ...existingLead, ...processedUpdates };
    
    // Debug final lead object
    console.log('Date Debug - Final updated lead dates:', {
      next_followup_date: updatedLead.next_followup_date,
      pickup_date: (updatedLead as any).pickup_date,
      installation_date: updatedLead.installation_date,
      installation_end_date: (updatedLead as any).installation_end_date
    });
    
    this.leads.set(id, updatedLead);
    return updatedLead;
  }

  async deleteLead(id: string): Promise<boolean> {
    return this.leads.delete(id);
  }

  async getLeadsByAssignee(assignee: string): Promise<Lead[]> {
    return Array.from(this.leads.values()).filter(
      lead => lead.assigned_to === assignee
    );
  }

  async getLeadsWithFollowupsDue(date: Date): Promise<Lead[]> {
    // Convert input date to YYYY-MM-DD string for comparison
    const targetDateString = date.toISOString().split('T')[0];
    
    console.log('Date Debug - getLeadsWithFollowupsDue comparing against:', targetDateString);

    return Array.from(this.leads.values()).filter(lead => {
      if (!lead.next_followup_date) return false;
      
      // Since dates are now stored as strings (YYYY-MM-DD), compare strings directly
      const followupDateString = typeof lead.next_followup_date === 'string' 
        ? lead.next_followup_date 
        : lead.next_followup_date.toISOString().split('T')[0];
        
      console.log(`Date Debug - Comparing followup ${followupDateString} with target ${targetDateString}`);
      return followupDateString === targetDateString;
    });
  }

  async getLeadsCreatedAfter(date: Date): Promise<Lead[]> {
    return Array.from(this.leads.values()).filter(lead => 
      new Date(lead.date_created) > date
    );
  }

  // Sample Booklets methods
  async getSampleBooklets(): Promise<SampleBooklet[]> {
    return Array.from(this.sampleBooklets.values()).sort((a, b) => 
      new Date(b.date_ordered).getTime() - new Date(a.date_ordered).getTime()
    );
  }

  async getSampleBooklet(id: string): Promise<SampleBooklet | undefined> {
    return this.sampleBooklets.get(id);
  }

  async createSampleBooklet(insertBooklet: InsertSampleBooklet): Promise<SampleBooklet> {
    const id = randomUUID();
    const booklet: SampleBooklet = { 
      ...insertBooklet, 
      id,
      order_number: insertBooklet.order_number || null,
      phone: insertBooklet.phone || null,
      tracking_number: insertBooklet.tracking_number || null,
      date_shipped: insertBooklet.date_shipped || null,
      notes: insertBooklet.notes || null,
      date_ordered: insertBooklet.date_ordered || new Date(),
      created_at: new Date(),
      updated_at: new Date()
    };
    this.sampleBooklets.set(id, booklet);
    return booklet;
  }

  async updateSampleBooklet(id: string, updates: UpdateSampleBooklet): Promise<SampleBooklet | undefined> {
    const existingBooklet = this.sampleBooklets.get(id);
    if (!existingBooklet) return undefined;

    const updatedBooklet: SampleBooklet = { 
      ...existingBooklet, 
      ...updates,
      updated_at: new Date()
    };
    this.sampleBooklets.set(id, updatedBooklet);
    return updatedBooklet;
  }

  async deleteSampleBooklet(id: string): Promise<boolean> {
    return this.sampleBooklets.delete(id);
  }

  async getSampleBookletsByStatus(status: string): Promise<SampleBooklet[]> {
    return Array.from(this.sampleBooklets.values()).filter(
      booklet => booklet.status === status
    );
  }

  // Installer operations (stub implementations for memory storage)
  async getInstallers(): Promise<Installer[]> {
    return Promise.resolve([]);
  }

  async getInstaller(id: string): Promise<Installer | undefined> {
    return Promise.resolve(undefined);
  }

  async createInstaller(installer: InsertInstaller): Promise<Installer> {
    const id = randomUUID();
    return Promise.resolve({ ...installer, id } as Installer);
  }

  async updateInstaller(id: string, updates: UpdateInstaller): Promise<Installer | undefined> {
    return Promise.resolve(undefined);
  }

  async deleteInstaller(id: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  // Admin settings operations (stub implementations for memory storage)
  async getAdminSettings(): Promise<any[]> {
    return Promise.resolve([]);
  }

  async getAdminSetting(key: string): Promise<any | undefined> {
    return Promise.resolve(undefined);
  }

  async updateAdminSetting(key: string, value: string): Promise<any | undefined> {
    return Promise.resolve(undefined);
  }

  // Email template operations
  async getEmailTemplates(): Promise<any[]> {
    try {
      return await db.select().from(emailTemplates);
    } catch (error) {
      console.error('Error fetching email templates:', error);
      throw error;
    }
  }

  async getEmailTemplate(id: string): Promise<any | undefined> {
    try {
      const results = await db.select().from(emailTemplates).where(eq(emailTemplates.id, parseInt(id)));
      return results[0];
    } catch (error) {
      console.error('Error fetching email template:', error);
      throw error;
    }
  }

  async createEmailTemplate(template: any): Promise<any> {
    try {
      const result = await db.insert(emailTemplates).values(template);
      return { ...template, id: result.insertId };
    } catch (error) {
      console.error('Error creating email template:', error);
      throw error;
    }
  }

  async updateEmailTemplate(id: string, updates: any): Promise<any | undefined> {
    try {
      await db.update(emailTemplates).set(updates).where(eq(emailTemplates.id, parseInt(id)));
      return await this.getEmailTemplate(id);
    } catch (error) {
      console.error('Error updating email template:', error);
      throw error;
    }
  }

  async deleteEmailTemplate(id: string): Promise<boolean> {
    try {
      await db.delete(emailTemplates).where(eq(emailTemplates.id, parseInt(id)));
      return true;
    } catch (error) {
      console.error('Error deleting email template:', error);
      return false;
    }
  }

  // Lead origins operations (stub implementations for memory storage)
  async getLeadOrigins(): Promise<any[]> {
    return Promise.resolve([]);
  }

  async getLeadOrigin(id: string): Promise<any | undefined> {
    return Promise.resolve(undefined);
  }

  async createLeadOrigin(originName: string): Promise<any> {
    const id = randomUUID();
    return Promise.resolve({ id, name: originName });
  }

  async updateLeadOrigin(id: string, updates: any): Promise<any | undefined> {
    return Promise.resolve(undefined);
  }

  async deleteLeadOrigin(id: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  // SMTP settings operations (stub implementations for memory storage)
  // SMTP Settings operations
  async getSMTPSettings(): Promise<any[]> {
    try {
      return await db.select().from(smtpSettings);
    } catch (error) {
      console.error('Error fetching SMTP settings:', error);
      throw error;
    }
  }

  async getSMTPSetting(id: string): Promise<any | undefined> {
    try {
      const results = await db.select().from(smtpSettings).where(eq(smtpSettings.id, parseInt(id)));
      return results[0];
    } catch (error) {
      console.error('Error fetching SMTP setting:', error);
      throw error;
    }
  }

  async createSMTPSettings(settings: any): Promise<any> {
    try {
      const result = await db.insert(smtpSettings).values(settings);
      return { ...settings, id: result.insertId };
    } catch (error) {
      console.error('Error creating SMTP settings:', error);
      throw error;
    }
  }

  async updateSMTPSettings(id: string, updates: any): Promise<any | undefined> {
    try {
      await db.update(smtpSettings).set(updates).where(eq(smtpSettings.id, parseInt(id)));
      return await this.getSMTPSetting(id);
    } catch (error) {
      console.error('Error updating SMTP settings:', error);
      throw error;
    }
  }

  async deleteSMTPSettings(id: string): Promise<boolean> {
    try {
      await db.delete(smtpSettings).where(eq(smtpSettings.id, parseInt(id)));
      return true;
    } catch (error) {
      console.error('Error deleting SMTP settings:', error);
      return false;
    }
  }

  // Activity log operations (stub implementations for memory storage)
  async getActivityLogs(filters: {
    search?: string;
    entity_type?: string;
    action?: string;
    days?: number;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    return Promise.resolve([]);
  }

  async logActivity(userId: string, action: string, entityType?: string, entityId?: string, description?: string): Promise<void> {
    console.log(`Activity: ${action} by ${userId} on ${entityType}:${entityId} - ${description}`);
    return Promise.resolve();
  }

  // Calendar Event operations
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    return Array.from(this.calendarEvents.values());
  }

  async getCalendarEvent(id: string): Promise<CalendarEvent | undefined> {
    return this.calendarEvents.get(id);
  }

  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const id = randomUUID();
    const newEvent: CalendarEvent = {
      id,
      ...event,
      created_at: new Date(),
    };
    this.calendarEvents.set(id, newEvent);
    return newEvent;
  }

  async updateCalendarEvent(id: string, updates: UpdateCalendarEvent): Promise<CalendarEvent | undefined> {
    const event = this.calendarEvents.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...updates };
    this.calendarEvents.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteCalendarEvent(id: string): Promise<boolean> {
    return this.calendarEvents.delete(id);
  }
}

import { DatabaseStorage } from "./database-storage";

// Use DatabaseStorage for production with real database
// Switch to MemStorage for development with mock data
export const storage = new DatabaseStorage();
