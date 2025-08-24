import { type User, type InsertUser, type Lead, type InsertLead, type UpdateLead, type SampleBooklet, type InsertSampleBooklet, type UpdateSampleBooklet } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getLeads(): Promise<Lead[]>;
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
    // Create default users
    const defaultUsers = [
      { username: "kim", password: "password", role: "admin" },
      { username: "patrick", password: "password", role: "sales_rep" },
      { username: "lina", password: "password", role: "sales_rep" }
    ];

    defaultUsers.forEach(userData => {
      const id = randomUUID();
      const user: User = { ...userData, id, role: userData.role };
      this.users.set(id, user);
    });

    // Create sample leads for demonstration
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
        assigned_installer: leadData.assigned_installer || null
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values()).sort((a, b) => 
      new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
    );
  }

  async getLead(id: string): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = randomUUID();
    const lead: Lead = { 
      ...insertLead, 
      id,
      date_created: new Date()
    };
    this.leads.set(id, lead);
    return lead;
  }

  async updateLead(id: string, updates: UpdateLead): Promise<Lead | undefined> {
    const existingLead = this.leads.get(id);
    if (!existingLead) return undefined;

    const updatedLead: Lead = { ...existingLead, ...updates };
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
      date_ordered: new Date(),
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
}

export const storage = new MemStorage();
