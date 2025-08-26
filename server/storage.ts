import { type User, type InsertUser, type Lead, type InsertLead, type UpdateLead, type SampleBooklet, type InsertSampleBooklet, type UpdateSampleBooklet, type Installer, type InsertInstaller, type UpdateInstaller } from "@shared/schema";
import { randomUUID } from "crypto";

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

  constructor() {
    this.users = new Map();
    this.leads = new Map();
    this.sampleBooklets = new Map();
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

    // Create comprehensive sample leads for demonstration
    const sampleLeads = [
      {
        name: "Sarah Johnson",
        phone: "(555) 123-4567",
        email: "sarah@email.com",
        lead_origin: "facebook",
        date_created: new Date("2024-01-15"),
        next_followup_date: new Date("2024-01-12"), // overdue
        remarks: "in-progress",
        assigned_to: "kim",
        project_amount: "9200.00",
        notes: "Customer is very interested in white marble finish. Scheduled for home visit next week.",
        additional_notes: "",
        deposit_paid: false,
        balance_paid: false,
        installation_date: null,
        assigned_installer: null,
      },
      {
        name: "Mike Chen",
        phone: "(555) 234-5678",
        email: "mike@email.com",
        lead_origin: "google",
        date_created: new Date("2024-01-14"),
        next_followup_date: new Date(), // due today
        remarks: "quoted",
        assigned_to: "patrick",
        project_amount: "12500.00",
        notes: "Quote sent for kitchen remodel. Waiting for response.",
        additional_notes: "",
        deposit_paid: false,
        balance_paid: false,
        installation_date: null,
        assigned_installer: null,
      },
      {
        name: "Lisa Rodriguez",
        phone: "(555) 345-6789",
        email: "lisa@email.com",
        lead_origin: "referral",
        date_created: new Date("2024-01-13"),
        next_followup_date: new Date("2024-01-18"),
        remarks: "sold",
        assigned_to: "lina",
        project_amount: "15800.00",
        notes: "Project sold! Customer very happy with proposal.",
        additional_notes: "Rush job - needs completion by Feb 1st",
        deposit_paid: true,
        balance_paid: true,
        installation_date: new Date("2024-01-20"),
        assigned_installer: "angel",
      },
      {
        name: "David Wilson",
        phone: "(555) 456-7890",
        email: "david.wilson@email.com",
        lead_origin: "instagram",
        date_created: new Date("2024-01-12"),
        next_followup_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        remarks: "new",
        assigned_to: "patrick",
        project_amount: "8500.00",
        notes: "Interested in bathroom cabinet wrapping. Needs consultation.",
        additional_notes: "Prefers weekend appointments",
        deposit_paid: false,
        balance_paid: false,
        installation_date: null,
        assigned_installer: null,
      },
      {
        name: "Jessica Martinez",
        phone: "(555) 567-8901",
        email: "jessica.martinez@email.com",
        lead_origin: "trade-show",
        date_created: new Date("2024-01-11"),
        next_followup_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
        remarks: "quoted",
        assigned_to: "lina",
        project_amount: "18200.00",
        notes: "Large kitchen project. Quote provided for complete wrap. Very interested.",
        additional_notes: "Budget approved by husband, just needs scheduling",
        deposit_paid: false,
        balance_paid: false,
        installation_date: null,
        assigned_installer: null,
      },
      {
        name: "Robert Taylor",
        phone: "(555) 678-9012",
        email: "robert.taylor@email.com",
        lead_origin: "whatsapp",
        date_created: new Date("2024-01-10"),
        next_followup_date: null,
        remarks: "not-interested",
        assigned_to: "kim",
        project_amount: "0.00",
        notes: "Not interested after learning about pricing. Too expensive for their budget.",
        additional_notes: "May revisit in 6 months",
        deposit_paid: false,
        balance_paid: false,
        installation_date: null,
        assigned_installer: null,
      },
      {
        name: "Amanda Thompson",
        phone: "(555) 789-0123",
        email: "amanda.thompson@email.com",
        lead_origin: "website",
        date_created: new Date("2024-01-09"),
        next_followup_date: new Date("2024-01-19"),
        remarks: "sold",
        assigned_to: "patrick",
        project_amount: "11700.00",
        notes: "Kitchen cabinet wrap project. Customer very satisfied with proposal.",
        additional_notes: "Recommended by previous customer",
        deposit_paid: true,
        balance_paid: false,
        installation_date: new Date("2024-01-22"),
        assigned_installer: "brian",
      },
      {
        name: "Christopher Lee",
        phone: "(555) 890-1234",
        email: null,
        lead_origin: "phone",
        date_created: new Date("2024-01-08"),
        next_followup_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        remarks: "in-progress",
        assigned_to: "lina",
        project_amount: "6800.00",
        notes: "Small bathroom project. Site visit scheduled.",
        additional_notes: "Cash payment preferred",
        deposit_paid: false,
        balance_paid: false,
        installation_date: null,
        assigned_installer: null,
      }
    ];

    sampleLeads.forEach(leadData => {
      const id = randomUUID();
      const lead: Lead = { 
        ...leadData, 
        id,
        email: leadData.email || null,
        next_followup_date: leadData.next_followup_date || null,
        notes: leadData.notes || null,
        additional_notes: leadData.additional_notes || null,
        installation_date: leadData.installation_date || null,
        assigned_installer: leadData.assigned_installer || null,
        assigned_to: leadData.assigned_to || null
      };
      this.leads.set(id, lead);
    });

    // Create sample booklets for demonstration
    const sampleBooklets = [
      {
        order_number: "BK001",
        customer_name: "John Smith",
        address: "123 Main St, Anytown, ST 12345",
        email: "john@email.com",
        phone: "(555) 111-1111",
        product_type: "demo_kit_and_sample_booklet",
        status: "pending",
        notes: "Rush order requested"
      },
      {
        order_number: "BK002", 
        customer_name: "Jane Doe",
        address: "456 Oak Ave, Somewhere, ST 67890",
        email: "jane@email.com",
        phone: "(555) 222-2222",
        product_type: "sample_booklet_only",
        tracking_number: "1Z12345E0291980793",
        status: "shipped",
        date_shipped: new Date("2024-01-16"),
        notes: "Standard shipment"
      },
      {
        order_number: "BK003",
        customer_name: "Bob Johnson", 
        address: "789 Pine Rd, Elsewhere, ST 54321",
        email: "bob@email.com",
        phone: "(555) 333-3333",
        product_type: "trial_kit",
        tracking_number: "1Z12345E0392857735",
        status: "delivered",
        date_shipped: new Date("2024-01-14"),
        notes: "Customer requested expedited delivery"
      }
    ];

    sampleBooklets.forEach(bookletData => {
      const id = randomUUID();
      const booklet: SampleBooklet = { 
        ...bookletData, 
        id,
        order_number: bookletData.order_number || null,
        phone: bookletData.phone || null,
        date_ordered: new Date("2024-01-15"),
        tracking_number: bookletData.tracking_number || null,
        date_shipped: bookletData.date_shipped || null,
        notes: bookletData.notes || null,
        created_at: new Date(),
        updated_at: new Date()
      };
      this.sampleBooklets.set(id, booklet);
    });
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

    // Process date fields properly
    const processedUpdates: any = { ...updates };
    if (typeof processedUpdates.next_followup_date === 'string') {
      processedUpdates.next_followup_date = new Date(processedUpdates.next_followup_date);
    }
    if (typeof processedUpdates.installation_date === 'string') {
      processedUpdates.installation_date = new Date(processedUpdates.installation_date);
    }

    const updatedLead: Lead = { ...existingLead, ...processedUpdates };
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
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return Array.from(this.leads.values()).filter(lead => {
      if (!lead.next_followup_date) return false;
      const followupDate = new Date(lead.next_followup_date);
      return followupDate >= startOfDay && followupDate <= endOfDay;
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

  // Email template operations (stub implementations for memory storage)
  async getEmailTemplates(): Promise<any[]> {
    return Promise.resolve([]);
  }

  async getEmailTemplate(id: string): Promise<any | undefined> {
    return Promise.resolve(undefined);
  }

  async createEmailTemplate(template: any): Promise<any> {
    const id = randomUUID();
    return Promise.resolve({ ...template, id });
  }

  async updateEmailTemplate(id: string, updates: any): Promise<any | undefined> {
    return Promise.resolve(undefined);
  }

  async deleteEmailTemplate(id: string): Promise<boolean> {
    return Promise.resolve(false);
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
  async getSMTPSettings(): Promise<any[]> {
    return Promise.resolve([]);
  }

  async getSMTPSetting(id: string): Promise<any | undefined> {
    return Promise.resolve(undefined);
  }

  async createSMTPSettings(settings: any): Promise<any> {
    const id = randomUUID();
    return Promise.resolve({ ...settings, id });
  }

  async updateSMTPSettings(id: string, updates: any): Promise<any | undefined> {
    return Promise.resolve(undefined);
  }

  async deleteSMTPSettings(id: string): Promise<boolean> {
    return Promise.resolve(false);
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
}

import { DatabaseStorage } from "./database-storage";

// Use MemStorage for development with mock data
// Switch to DatabaseStorage when database is set up
export const storage = new MemStorage();
