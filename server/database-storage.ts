import { type User, type InsertUser, type Lead, type InsertLead, type UpdateLead, type SampleBooklet, type InsertSampleBooklet, type UpdateSampleBooklet } from "@shared/schema";
import { db } from "./db";
import { users, leads, sampleBooklets } from "@shared/schema";
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
}