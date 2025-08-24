import { type User, type InsertUser, type Lead, type InsertLead, type UpdateLead } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private leads: Map<string, Lead>;

  constructor() {
    this.users = new Map();
    this.leads = new Map();
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
      const user: User = { ...userData, id };
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
      const lead: Lead = { ...leadData, id };
      this.leads.set(id, lead);
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
}

export const storage = new MemStorage();
