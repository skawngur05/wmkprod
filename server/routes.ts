import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, updateLeadSchema, insertSampleBookletSchema, updateSampleBookletSchema } from "@shared/schema";
import { z } from "zod";
import { emailService } from "./email-service";

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth endpoints
  app.post("/api/auth/login", async (req, res) => {
    try {
      console.log("Login request body:", req.body);
      console.log("Body type:", typeof req.body);
      
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
      console.error("Login validation error:", error);
      if (error instanceof z.ZodError) {
        console.error("Zod validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
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
      const { status, origin, assigned_to, search, page, limit } = req.query;
      
      // Parse pagination parameters
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 20;
      
      // Prepare filters
      const filters = {
        search: search as string,
        status: status as string,
        origin: origin as string,
        assigned_to: assigned_to as string
      };
      
      // Use the new paginated method
      const result = await storage.getLeadsPaginated(pageNum, limitNum, filters);
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching leads:', error);
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
        const member = lead.assigned_to || 'unassigned';
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
        subject = `WMK Kitchen Installation Confirmation - ${formattedDate}`;
        emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WMK Kitchen Solutions - Installation Confirmation</title>
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa;">
    
    <!-- Main Container Table -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e9ecef;">
        
        <!-- Logo Header -->
        <tr>
            <td style="padding: 30px 20px; text-align: center; background-color: #ffffff; border-bottom: 1px solid #e9ecef;">
                <h1 style="margin: 0; font-size: 36px; font-weight: bold; color: #2c3e50;">
                    WMK<span style="color: #007bff; font-weight: bold;">Kitchen</span>
                </h1>
                <div style="margin: 10px 0 0; font-size: 12px; color: #6c757d; text-transform: uppercase; letter-spacing: 1px;">
                    Kitchen Transformation Specialists
                </div>
            </td>
        </tr>
        
        <!-- Blue Banner -->
        <tr>
            <td style="padding: 20px; text-align: center; background-color: #007bff; color: white; font-size: 18px; font-weight: bold;">
                🔧 Installation Confirmed!
            </td>
        </tr>
        
        <!-- Main Content -->
        <tr>
            <td style="padding: 30px 20px;">
                
                <!-- Greeting -->
                <p style="font-size: 16px; color: #495057; margin-bottom: 25px; line-height: 1.7;">
                    Dear <strong>${installation.name}</strong>,<br><br>
                    We are pleased to confirm your kitchen installation appointment with <strong>WMK Kitchen Solutions</strong>. Our professional team is ready to transform your kitchen!
                </p>
                
                <!-- Installation Header -->
                <table width="100%" border="0" cellspacing="0" cellpadding="20" style="background-color: #f8f9fa; border-left: 4px solid #007bff; margin: 20px 0;">
                    <tr>
                        <td>
                            <h3 style="margin: 0 0 5px; color: #2c3e50; font-size: 18px; font-weight: 600;">
                                Installation Appointment
                            </h3>
                            <div style="color: #6c757d; font-size: 14px;">Scheduled for ${formattedDate}</div>
                        </td>
                    </tr>
                </table>
                
                <!-- Installation Details Table -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 25px 0; border: 1px solid #e9ecef;">
                    <thead>
                        <tr style="background-color: #2c3e50; color: white;">
                            <th style="padding: 15px; text-align: left; font-weight: 600; font-size: 14px;">Details</th>
                            <th style="padding: 15px; text-align: right; font-weight: 600; font-size: 14px;">Information</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057;">
                                <strong>📅 Installation Date</strong>
                            </td>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057; text-align: right;">
                                ${formattedDate} at 9:00 AM
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057;">
                                <strong>👤 Customer</strong>
                            </td>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057; text-align: right;">
                                ${installation.name}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057;">
                                <strong>📞 Phone</strong>
                            </td>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057; text-align: right;">
                                ${installation.phone}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057;">
                                <strong>💰 Project Value</strong>
                            </td>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057; text-align: right;">
                                ${installation.project_amount ? `$${parseInt(installation.project_amount).toLocaleString()}` : 'Contact office for details'}
                            </td>
                        </tr>
                        <tr style="background-color: #f8f9fa;">
                            <td style="padding: 15px; color: #2c3e50; font-weight: 600; font-size: 16px;">
                                <strong>🔧 Lead Installer</strong>
                            </td>
                            <td style="padding: 15px; color: #2c3e50; font-weight: 600; font-size: 16px; text-align: right;">
                                <strong>${installation.assigned_installer ? installation.assigned_installer.charAt(0).toUpperCase() + installation.assigned_installer.slice(1) : 'To be assigned'}</strong>
                            </td>
                        </tr>
                    </tbody>
                </table>
                
                <!-- What to Expect Section -->
                <table width="100%" border="0" cellspacing="0" cellpadding="30" style="background-color: #007bff; color: white; margin: 30px 0;">
                    <tr>
                        <td style="text-align: center;">
                            <h3 style="margin: 0 0 15px; font-size: 20px; font-weight: 600;">
                                🏠 What to Expect
                            </h3>
                            <table width="100%" border="0" cellspacing="0" cellpadding="10" style="background-color: rgba(255, 255, 255, 0.1); margin: 20px 0;">
                                <tr>
                                    <td style="text-align: left; padding: 8px; color: white;">✓ Team arrives promptly at 9:00 AM</td>
                                </tr>
                                <tr>
                                    <td style="text-align: left; padding: 8px; color: white;">✓ Installation takes 4-6 hours typically</td>
                                </tr>
                                <tr>
                                    <td style="text-align: left; padding: 8px; color: white;">✓ Final walkthrough and quality inspection</td>
                                </tr>
                                <tr>
                                    <td style="text-align: left; padding: 8px; color: white;">✓ All materials and tools provided</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                
                <!-- Preparation Checklist -->
                <table width="100%" border="0" cellspacing="0" cellpadding="25" style="background-color: #28a745; color: white; margin: 30px 0;">
                    <tr>
                        <td style="text-align: center;">
                            <h3 style="margin: 0 0 15px; font-size: 20px; font-weight: 600;">
                                📋 Preparation Checklist
                            </h3>
                            <table width="100%" border="0" cellspacing="0" cellpadding="8" style="background-color: rgba(255, 255, 255, 0.1); margin: 15px 0;">
                                <tr>
                                    <td style="text-align: left; color: white;">□ Clear work area of personal items</td>
                                </tr>
                                <tr>
                                    <td style="text-align: left; color: white;">□ Ensure easy access to installation space</td>
                                </tr>
                                <tr>
                                    <td style="text-align: left; color: white;">□ Someone present during installation</td>
                                </tr>
                                <tr>
                                    <td style="text-align: left; color: white;">□ Secure pets away from work area</td>
                                </tr>
                                <tr>
                                    <td style="text-align: left; color: white;">□ Have final payment ready if balance due</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                ${customMessage ? `
                <!-- Additional Notes -->
                <table width="100%" border="0" cellspacing="0" cellpadding="20" style="background-color: #f8f9fa; border-left: 4px solid #ffc107; margin: 20px 0;">
                    <tr>
                        <td>
                            <h3 style="margin: 0 0 15px; color: #2c3e50; font-size: 16px; font-weight: 600;">
                                📝 Additional Notes
                            </h3>
                            <p style="margin: 0; color: #495057; line-height: 1.6;">
                                ${customMessage}
                            </p>
                        </td>
                    </tr>
                </table>
                ` : ''}
                
                <!-- Contact Section -->
                <table width="100%" border="0" cellspacing="0" cellpadding="25" style="background-color: #343a40; color: white; margin: 30px 0;">
                    <tr>
                        <td style="text-align: center;">
                            <p style="margin: 0 0 15px; font-weight: bold; font-size: 16px;">
                                💡 Questions or need to reschedule?
                            </p>
                            <p style="margin: 0; font-size: 14px;">
                                Contact us at least 48 hours in advance for any changes.
                            </p>
                        </td>
                    </tr>
                </table>
                
            </td>
        </tr>
        
        <!-- Footer -->
        <tr>
            <td style="background-color: #2c3e50; color: #ecf0f1; text-align: center; padding: 30px 20px;">
                <h4 style="margin: 0 0 15px; color: white; font-size: 18px; font-weight: 600;">
                    WMK Kitchen Solutions
                </h4>
                <p style="margin: 8px 0;">Questions about your installation? We're here to help!</p>
                <p style="margin: 8px 0;"><strong>📞 Phone:</strong> (XXX) XXX-XXXX</p>
                <p style="margin: 8px 0;">
                    <strong>📧 Email:</strong> 
                    <a href="mailto:installations@wmk-kitchen.com" style="color: #007bff; text-decoration: none;">
                        installations@wmk-kitchen.com
                    </a>
                </p>
                <p style="margin: 8px 0;">
                    <strong>🌐 Website:</strong> 
                    <a href="https://wmk-kitchen.com" style="color: #007bff; text-decoration: none;">
                        www.wmk-kitchen.com
                    </a>
                </p>
                <p style="margin-top: 20px; font-size: 13px; color: #bdc3c7;">
                    © 2025 WMK Kitchen Solutions. All rights reserved.<br>
                    Quality • Craftsmanship • Excellence
                </p>
            </td>
        </tr>
        
    </table>
    
</body>
</html>
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
        subject = `WMK Installation Assignment - ${formattedDate} - ${installation.name}`;
        emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WMK Kitchen Solutions - Installation Assignment</title>
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa;">
    
    <!-- Main Container Table -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e9ecef;">
        
        <!-- Logo Header -->
        <tr>
            <td style="padding: 30px 20px; text-align: center; background-color: #ffffff; border-bottom: 1px solid #e9ecef;">
                <h1 style="margin: 0; font-size: 36px; font-weight: bold; color: #2c3e50;">
                    WMK<span style="color: #fd7e14; font-weight: bold;">Kitchen</span>
                </h1>
                <div style="margin: 10px 0 0; font-size: 12px; color: #6c757d; text-transform: uppercase; letter-spacing: 1px;">
                    Professional Installation Team
                </div>
            </td>
        </tr>
        
        <!-- Orange Banner -->
        <tr>
            <td style="padding: 20px; text-align: center; background-color: #fd7e14; color: white; font-size: 18px; font-weight: bold;">
                🔧 New Installation Assignment
            </td>
        </tr>
        
        <!-- Main Content -->
        <tr>
            <td style="padding: 30px 20px;">
                
                <!-- Greeting -->
                <p style="font-size: 16px; color: #495057; margin-bottom: 25px; line-height: 1.7;">
                    Hi <strong>${installation.assigned_installer?.charAt(0).toUpperCase()}${installation.assigned_installer?.slice(1)}</strong>,<br><br>
                    You have been assigned a new kitchen installation for <strong>WMK Kitchen Solutions</strong>. Please review the details below and prepare accordingly.
                </p>
                
                <!-- Assignment Header -->
                <table width="100%" border="0" cellspacing="0" cellpadding="20" style="background-color: #f8f9fa; border-left: 4px solid #fd7e14; margin: 20px 0;">
                    <tr>
                        <td>
                            <h3 style="margin: 0 0 5px; color: #2c3e50; font-size: 18px; font-weight: 600;">
                                Installation Assignment
                            </h3>
                            <div style="color: #6c757d; font-size: 14px;">Scheduled for ${formattedDate}</div>
                        </td>
                    </tr>
                </table>
                
                <!-- Job Details Table -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 25px 0; border: 1px solid #e9ecef;">
                    <thead>
                        <tr style="background-color: #2c3e50; color: white;">
                            <th style="padding: 15px; text-align: left; font-weight: 600; font-size: 14px;">Job Details</th>
                            <th style="padding: 15px; text-align: right; font-weight: 600; font-size: 14px;">Information</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057;">
                                <strong>📅 Installation Date</strong>
                            </td>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057; text-align: right;">
                                ${formattedDate} at 9:00 AM
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057;">
                                <strong>👤 Customer</strong>
                            </td>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057; text-align: right;">
                                ${installation.name}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057;">
                                <strong>📞 Phone</strong>
                            </td>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057; text-align: right;">
                                ${installation.phone}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057;">
                                <strong>📧 Email</strong>
                            </td>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057; text-align: right;">
                                ${installation.email || 'Not provided'}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057;">
                                <strong>💰 Project Value</strong>
                            </td>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057; text-align: right;">
                                ${installation.project_amount ? `$${parseInt(installation.project_amount).toLocaleString()}` : 'Contact office'}
                            </td>
                        </tr>
                    </tbody>
                </table>
                
                <!-- Payment Status -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 25px 0; border: 1px solid #e9ecef;">
                    <thead>
                        <tr style="background-color: #28a745; color: white;">
                            <th style="padding: 15px; text-align: left; font-weight: 600; font-size: 14px;">Payment Item</th>
                            <th style="padding: 15px; text-align: center; font-weight: 600; font-size: 14px;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057;">
                                <strong>Deposit Payment</strong>
                            </td>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; text-align: center;">
                                ${installation.deposit_paid ? '<span style="color: #28a745; font-weight: bold;">✅ PAID</span>' : '<span style="color: #dc3545; font-weight: bold;">⚠️ PENDING</span>'}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057;">
                                <strong>Final Balance</strong>
                            </td>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; text-align: center;">
                                ${installation.balance_paid ? '<span style="color: #28a745; font-weight: bold;">✅ PAID</span>' : '<span style="color: #ffc107; font-weight: bold;">💳 DUE ON COMPLETION</span>'}
                            </td>
                        </tr>
                    </tbody>
                </table>
                
                <!-- Pre-Installation Checklist -->
                <table width="100%" border="0" cellspacing="0" cellpadding="30" style="background-color: #fd7e14; color: white; margin: 30px 0;">
                    <tr>
                        <td style="text-align: center;">
                            <h3 style="margin: 0 0 15px; font-size: 20px; font-weight: 600;">
                                📋 Pre-Installation Checklist
                            </h3>
                            <table width="100%" border="0" cellspacing="0" cellpadding="8" style="background-color: rgba(255, 255, 255, 0.1); margin: 15px 0;">
                                <tr>
                                    <td style="text-align: left; color: white;">□ Review project specifications and materials list</td>
                                </tr>
                                <tr>
                                    <td style="text-align: left; color: white;">□ Confirm all materials are loaded and ready</td>
                                </tr>
                                <tr>
                                    <td style="text-align: left; color: white;">□ Contact customer 24 hours prior to confirm</td>
                                </tr>
                                <tr>
                                    <td style="text-align: left; color: white;">□ Verify access and parking availability</td>
                                </tr>
                                <tr>
                                    <td style="text-align: left; color: white;">□ Ensure all tools and equipment are prepared</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                ${installation.additional_notes ? `
                <!-- Installation Notes -->
                <table width="100%" border="0" cellspacing="0" cellpadding="20" style="background-color: #f8f9fa; border-left: 4px solid #17a2b8; margin: 20px 0;">
                    <tr>
                        <td>
                            <h3 style="margin: 0 0 15px; color: #2c3e50; font-size: 16px; font-weight: 600;">
                                📝 Installation Notes
                            </h3>
                            <p style="margin: 0; color: #495057; line-height: 1.6;">
                                ${installation.additional_notes}
                            </p>
                        </td>
                    </tr>
                </table>
                ` : ''}

                ${customMessage ? `
                <!-- Special Instructions -->
                <table width="100%" border="0" cellspacing="0" cellpadding="20" style="background-color: #f8f9fa; border-left: 4px solid #ffc107; margin: 20px 0;">
                    <tr>
                        <td>
                            <h3 style="margin: 0 0 15px; color: #2c3e50; font-size: 16px; font-weight: 600;">
                                ⚡ Special Instructions
                            </h3>
                            <p style="margin: 0; color: #495057; line-height: 1.6;">
                                ${customMessage}
                            </p>
                        </td>
                    </tr>
                </table>
                ` : ''}
                
                <!-- Important Reminders -->
                <table width="100%" border="0" cellspacing="0" cellpadding="25" style="background-color: #343a40; color: white; margin: 30px 0;">
                    <tr>
                        <td style="text-align: center;">
                            <h3 style="margin: 0 0 15px; font-size: 18px; font-weight: 600;">
                                ⚠️ Important Reminders
                            </h3>
                            <table width="100%" border="0" cellspacing="0" cellpadding="8" style="background-color: rgba(255, 255, 255, 0.1); margin: 15px 0;">
                                <tr>
                                    <td style="text-align: left; color: white; font-size: 14px;">• Call customer 24 hours before installation</td>
                                </tr>
                                <tr>
                                    <td style="text-align: left; color: white; font-size: 14px;">• Arrive promptly at 9:00 AM with all materials</td>
                                </tr>
                                <tr>
                                    <td style="text-align: left; color: white; font-size: 14px;">• Conduct quality inspection before walkthrough</td>
                                </tr>
                                <tr>
                                    <td style="text-align: left; color: white; font-size: 14px;">• Collect final payment if balance is due</td>
                                </tr>
                                <tr>
                                    <td style="text-align: left; color: white; font-size: 14px;">• Report any issues to office immediately</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                
            </td>
        </tr>
        
        <!-- Footer -->
        <tr>
            <td style="background-color: #2c3e50; color: #ecf0f1; text-align: center; padding: 30px 20px;">
                <h4 style="margin: 0 0 15px; color: white; font-size: 18px; font-weight: 600;">
                    WMK Kitchen Solutions - Installation Team
                </h4>
                <p style="margin: 8px 0;">Questions or support needed? Contact the office immediately.</p>
                <p style="margin: 8px 0;"><strong>📞 Office:</strong> (XXX) XXX-XXXX</p>
                <p style="margin: 8px 0;">
                    <strong>📧 Email:</strong> 
                    <a href="mailto:management@wmk-kitchen.com" style="color: #fd7e14; text-decoration: none;">
                        management@wmk-kitchen.com
                    </a>
                </p>
                <p style="margin: 8px 0;">
                    <strong>🌐 Website:</strong> 
                    <a href="https://wmk-kitchen.com" style="color: #fd7e14; text-decoration: none;">
                        www.wmk-kitchen.com
                    </a>
                </p>
                <p style="margin-top: 20px; font-size: 13px; color: #bdc3c7;">
                    © 2025 WMK Kitchen Solutions. All rights reserved.<br>
                    Excellence in Every Installation
                </p>
            </td>
        </tr>
        
    </table>
    
</body>
</html>
        `.trim();
      }
      
      // Send the actual email using our email service
      try {
        await emailService.sendEmail({
          to: recipient,
          subject: subject,
          text: 'This email requires HTML support to view properly. Please use an HTML-enabled email client.',
          html: emailContent
        });
        
        console.log('=== EMAIL SENT SUCCESSFULLY ===');
        console.log('To:', recipient);
        console.log('Subject:', subject);
        console.log('==============================');
        
        res.json({ 
          message: "Email sent successfully", 
          recipient,
          subject,
          type
        });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        res.status(500).json({ message: "Failed to send email notification" });
      }
    } catch (error) {
      console.error('Email sending error:', error);
      res.status(500).json({ message: "Failed to send email notification" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
