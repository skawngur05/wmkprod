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
        console.error("Lead update validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid lead data", errors: error.errors });
      }
      console.error("Lead update error:", error);
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

  // Advanced Reports Analytics API
  app.get("/api/reports/analytics", async (req, res) => {
    try {
      const { year, month } = req.query;
      const allLeads = await storage.getLeads();
      
      // Filter leads by year and optionally by month
      let filteredLeads = allLeads.filter(lead => {
        const createdDate = new Date(lead.date_created);
        const leadYear = createdDate.getFullYear();
        
        if (year && leadYear !== parseInt(year as string)) {
          return false;
        }
        
        if (month) {
          const leadMonth = createdDate.getMonth() + 1; // JS months are 0-indexed
          if (leadMonth !== parseInt(month as string)) {
            return false;
          }
        }
        
        return true;
      });
      
      // Executive Dashboard Metrics
      const totalLeads = filteredLeads.length;
      const soldLeads = filteredLeads.filter(lead => lead.remarks === 'sold');
      const soldCount = soldLeads.length;
      const conversionRate = totalLeads > 0 ? ((soldCount / totalLeads) * 100) : 0;
      
      const totalRevenue = soldLeads.reduce((sum, lead) => {
        return sum + (parseFloat(lead.project_amount || '0'));
      }, 0);
      
      const averageDealSize = soldCount > 0 ? (totalRevenue / soldCount) : 0;
      
      // Lead Origin Performance
      const originStats = filteredLeads.reduce((acc, lead) => {
        const origin = lead.lead_origin;
        if (!acc[origin]) {
          acc[origin] = { total: 0, sold: 0, revenue: 0 };
        }
        acc[origin].total += 1;
        if (lead.remarks === 'sold') {
          acc[origin].sold += 1;
          acc[origin].revenue += parseFloat(lead.project_amount || '0');
        }
        return acc;
      }, {} as Record<string, { total: number; sold: number; revenue: number }>);
      
      const leadOriginPerformance = Object.entries(originStats).map(([origin, stats]) => ({
        origin,
        totalLeads: stats.total,
        soldLeads: stats.sold,
        conversionRate: stats.total > 0 ? ((stats.sold / stats.total) * 100) : 0,
        totalRevenue: stats.revenue,
        averageDealSize: stats.sold > 0 ? (stats.revenue / stats.sold) : 0
      })).sort((a, b) => b.totalRevenue - a.totalRevenue);
      
      // Team Performance Metrics
      const teamStats = filteredLeads.reduce((acc, lead) => {
        const member = lead.assigned_to;
        if (!acc[member]) {
          acc[member] = { total: 0, sold: 0, revenue: 0 };
        }
        acc[member].total += 1;
        if (lead.remarks === 'sold') {
          acc[member].sold += 1;
          acc[member].revenue += parseFloat(lead.project_amount || '0');
        }
        return acc;
      }, {} as Record<string, { total: number; sold: number; revenue: number }>);
      
      const teamPerformance = Object.entries(teamStats).map(([member, stats]) => ({
        member,
        totalLeads: stats.total,
        soldLeads: stats.sold,
        conversionRate: stats.total > 0 ? ((stats.sold / stats.total) * 100) : 0,
        totalRevenue: stats.revenue,
        averageDealSize: stats.sold > 0 ? (stats.revenue / stats.sold) : 0
      })).sort((a, b) => b.totalRevenue - a.totalRevenue);
      
      // Monthly Breakdown (only if no month filter is applied)
      let monthlyBreakdown: Array<{
        month: number;
        monthName: string;
        totalLeads: number;
        soldLeads: number;
        conversionRate: number;
        totalRevenue: number;
        averageDealSize: number;
      }> = [];
      if (!month && year) {
        const yearLeads = allLeads.filter(lead => {
          const leadYear = new Date(lead.date_created).getFullYear();
          return leadYear === parseInt(year as string);
        });
        
        monthlyBreakdown = Array.from({ length: 12 }, (_, monthIndex) => {
          const monthLeads = yearLeads.filter(lead => {
            const leadMonth = new Date(lead.date_created).getMonth();
            return leadMonth === monthIndex;
          });
          
          const monthSoldLeads = monthLeads.filter(lead => lead.remarks === 'sold');
          const monthRevenue = monthSoldLeads.reduce((sum, lead) => {
            return sum + (parseFloat(lead.project_amount || '0'));
          }, 0);
          
          return {
            month: monthIndex + 1,
            monthName: new Date(2024, monthIndex, 1).toLocaleString('default', { month: 'long' }),
            totalLeads: monthLeads.length,
            soldLeads: monthSoldLeads.length,
            conversionRate: monthLeads.length > 0 ? ((monthSoldLeads.length / monthLeads.length) * 100) : 0,
            totalRevenue: monthRevenue,
            averageDealSize: monthSoldLeads.length > 0 ? (monthRevenue / monthSoldLeads.length) : 0
          };
        });
      }
      
      res.json({
        executiveDashboard: {
          totalLeads,
          soldLeads: soldCount,
          conversionRate,
          totalRevenue,
          averageDealSize
        },
        leadOriginPerformance,
        teamPerformance,
        monthlyBreakdown,
        filterInfo: {
          year: year ? parseInt(year as string) : null,
          month: month ? parseInt(month as string) : null,
          period: year ? (month ? `${year}-${String(month).padStart(2, '0')}` : year) : 'all-time'
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });
  
  // Available years for filtering
  app.get("/api/reports/years", async (req, res) => {
    try {
      const allLeads = await storage.getLeads();
      const yearSet = new Set(allLeads.map(lead => new Date(lead.date_created).getFullYear()));
      const years = Array.from(yearSet).sort((a, b) => b - a); // Most recent first
      
      res.json({ availableYears: years });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch available years" });
    }
  });
  
  // Installation Email Notification API
  app.post("/api/installations/email", async (req, res) => {
    try {
      const { installationId, type, customMessage } = req.body;
      
      if (!installationId || !type) {
        return res.status(400).json({ message: "Installation ID and email type are required" });
      }
      
      if (!['client', 'installer'].includes(type)) {
        return res.status(400).json({ message: "Email type must be 'client' or 'installer'" });
      }
      
      const installation = await storage.getLead(installationId);
      if (!installation) {
        return res.status(404).json({ message: "Installation not found" });
      }
      
      if (!installation.installation_date) {
        return res.status(400).json({ message: "Installation date not set" });
      }
      
      // Format installation date
      const installDate = new Date(installation.installation_date);
      const formattedDate = installDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      let emailContent = '';
      let subject = '';
      let recipient = '';
      
      if (type === 'client') {
        if (!installation.email) {
          return res.status(400).json({ message: "Client email not available" });
        }
        
        recipient = installation.email;
        subject = `Installation Confirmation - ${formattedDate}`;
        emailContent = `
Dear ${installation.name},

Your kitchen installation is scheduled for ${formattedDate} at 9:00 AM.

Installation Details:
- Customer: ${installation.name}
- Phone: ${installation.phone}
- Project Value: ${installation.project_amount ? `$${installation.project_amount}` : 'N/A'}
- Installer: ${installation.assigned_installer || 'TBD'}

What to expect:
- Our team will arrive promptly at 9:00 AM
- Installation typically takes 4-6 hours
- Please ensure the work area is clear and accessible
- Someone should be present during the installation

If you have any questions or need to reschedule, please contact us immediately.

${customMessage ? `\nAdditional Notes:\n${customMessage}` : ''}

Thank you for choosing us for your kitchen project!

Best regards,
Installation Team
        `.trim();
        
      } else if (type === 'installer') {
        if (!installation.assigned_installer) {
          return res.status(400).json({ message: "No installer assigned" });
        }
        
        // For demo purposes, using a generic installer email
        // In production, you'd have installer email addresses in your system
        const installerEmails: Record<string, string> = {
          'angel': 'angel@company.com',
          'brian': 'brian@company.com', 
          'luis': 'luis@company.com'
        };
        
        recipient = installerEmails[installation.assigned_installer] || 'installer@company.com';
        subject = `Installation Assignment - ${formattedDate}`;
        emailContent = `
Hi ${installation.assigned_installer?.charAt(0).toUpperCase()}${installation.assigned_installer?.slice(1)},

You have been assigned an installation for ${formattedDate} at 9:00 AM.

Job Details:
- Customer: ${installation.name}
- Phone: ${installation.phone}
- Email: ${installation.email || 'N/A'}
- Project Value: ${installation.project_amount ? `$${installation.project_amount}` : 'N/A'}
- Installation Date: ${formattedDate} at 9:00 AM

Payment Status:
- Deposit: ${installation.deposit_paid ? 'Paid ✓' : 'Pending'}
- Balance: ${installation.balance_paid ? 'Paid ✓' : 'Pending'}

${installation.additional_notes ? `Installation Notes:\n${installation.additional_notes}\n` : ''}
${customMessage ? `\nAdditional Instructions:\n${customMessage}` : ''}

Please contact the customer 24 hours before installation to confirm timing.

Questions? Contact the office.

Thanks!
Installation Management
        `.trim();
      }
      
      // In a real application, you would integrate with an email service like:
      // - SendGrid
      // - AWS SES 
      // - Nodemailer with SMTP
      // - Mailgun
      // etc.
      
      // For now, we'll simulate sending the email
      console.log('=== EMAIL NOTIFICATION ===');
      console.log('To:', recipient);
      console.log('Subject:', subject);
      console.log('Content:', emailContent);
      console.log('========================');
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      res.json({ 
        message: "Email sent successfully", 
        recipient,
        subject,
        type
      });
    } catch (error) {
      console.error('Email sending error:', error);
      res.status(500).json({ message: "Failed to send email notification" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
