import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, updateLeadSchema, insertSampleBookletSchema, updateSampleBookletSchema } from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth endpoints
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(username.toLowerCase());
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Simple session - in production use proper session management
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          role: user.role 
        } 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const allLeads = await storage.getLeads();
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const totalLeads = allLeads.length;
      const soldLeads = allLeads.filter(lead => lead.remarks === "sold").length;
      const todayFollowups = (await storage.getLeadsWithFollowupsDue(today)).length;
      const newToday = (await storage.getLeadsCreatedAfter(weekAgo)).length;

      res.json({
        totalLeads,
        soldLeads,
        todayFollowups,
        newToday
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Lead endpoints
  app.get("/api/leads", async (req, res) => {
    try {
      const { status, origin, assigned_to, search } = req.query;
      let leads = await storage.getLeads();

      // Apply filters
      if (status) {
        leads = leads.filter(lead => lead.remarks === status);
      }
      if (origin) {
        leads = leads.filter(lead => lead.lead_origin === origin);
      }
      if (assigned_to) {
        leads = leads.filter(lead => lead.assigned_to === assigned_to);
      }
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        leads = leads.filter(lead => 
          lead.name.toLowerCase().includes(searchTerm) ||
          lead.phone.includes(searchTerm) ||
          (lead.email && lead.email.toLowerCase().includes(searchTerm))
        );
      }

      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.get("/api/leads/:id", async (req, res) => {
    try {
      const lead = await storage.getLead(req.params.id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lead" });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(leadData);
      res.status(201).json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lead data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  app.put("/api/leads/:id", async (req, res) => {
    try {
      const updates = updateLeadSchema.parse(req.body);
      const lead = await storage.updateLead(req.params.id, updates);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lead data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  app.delete("/api/leads/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteLead(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  // Follow-up endpoints
  app.get("/api/followups", async (req, res) => {
    try {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      
      const allLeads = await storage.getLeads();
      const overdue = allLeads.filter(lead => {
        if (!lead.next_followup_date) return false;
        return new Date(lead.next_followup_date) < yesterday;
      });

      const dueToday = await storage.getLeadsWithFollowupsDue(today);
      
      const upcoming = allLeads.filter(lead => {
        if (!lead.next_followup_date) return false;
        return new Date(lead.next_followup_date) > today;
      }).slice(0, 10); // Limit to next 10

      res.json({
        overdue,
        dueToday,
        upcoming
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch follow-ups" });
    }
  });

  // Installation endpoints
  app.get("/api/installations", async (req, res) => {
    try {
      const allLeads = await storage.getLeads();
      const installations = allLeads.filter(lead => 
        lead.remarks === "sold" && lead.installation_date
      );

      res.json(installations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch installations" });
    }
  });

  // Sample Booklets endpoints
  app.get("/api/sample-booklets", async (req, res) => {
    try {
      const { status } = req.query;
      let booklets = await storage.getSampleBooklets();

      if (status) {
        booklets = await storage.getSampleBookletsByStatus(status as string);
      }

      res.json(booklets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sample booklets" });
    }
  });

  app.get("/api/sample-booklets/:id", async (req, res) => {
    try {
      const booklet = await storage.getSampleBooklet(req.params.id);
      if (!booklet) {
        return res.status(404).json({ message: "Sample booklet not found" });
      }
      res.json(booklet);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sample booklet" });
    }
  });

  app.post("/api/sample-booklets", async (req, res) => {
    try {
      const bookletData = insertSampleBookletSchema.parse(req.body);
      const booklet = await storage.createSampleBooklet(bookletData);
      res.status(201).json(booklet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booklet data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create sample booklet" });
    }
  });

  app.put("/api/sample-booklets/:id", async (req, res) => {
    try {
      const updates = updateSampleBookletSchema.parse(req.body);
      const booklet = await storage.updateSampleBooklet(req.params.id, updates);
      
      if (!booklet) {
        return res.status(404).json({ message: "Sample booklet not found" });
      }
      
      res.json(booklet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booklet data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update sample booklet" });
    }
  });

  app.delete("/api/sample-booklets/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSampleBooklet(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Sample booklet not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete sample booklet" });
    }
  });

  // Sample Booklets dashboard stats
  app.get("/api/sample-booklets/stats/dashboard", async (req, res) => {
    try {
      const allBooklets = await storage.getSampleBooklets();
      const pending = allBooklets.filter(b => b.status === "pending").length;
      const shipped = allBooklets.filter(b => b.status === "shipped").length;
      const delivered = allBooklets.filter(b => b.status === "delivered").length;
      const thisWeek = allBooklets.filter(b => {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return new Date(b.date_ordered) > weekAgo;
      }).length;

      res.json({
        totalOrders: allBooklets.length,
        pendingOrders: pending,
        shippedOrders: shipped,
        deliveredOrders: delivered,
        thisWeekOrders: thisWeek
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch booklet stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
