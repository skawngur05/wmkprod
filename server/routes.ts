import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, updateLeadSchema, insertSampleBookletSchema, updateSampleBookletSchema, insertCalendarEventSchema, updateCalendarEventSchema, insertRepairRequestSchema, repairRequests, leads as leadsTable, wmkColors, completedProjects } from "@shared/schema";
import { uspsService } from "./usps-service";
import { trackingScheduler } from "./tracking-scheduler";
import { z } from "zod";
import { emailService } from "./email-service";
import { GoogleCalendarService } from "./google-calendar-working";

// Create instance
const googleCalendarService = new GoogleCalendarService();
import { eq, like, or, desc, and, sql } from 'drizzle-orm';
import { db } from './db';
import path from "path";
import fs from "fs";

// Rate limiting for login attempts
const loginAttempts = new Map<string, number[]>(); // Store login attempts by IP/username
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes lockout

// Production API protection middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (process.env.NODE_ENV === 'production') {
    // In production, API should only be accessible from the same origin
    const referer = req.get('Referer');
    const host = req.get('Host');
    
    if (!referer || !host) {
      return res.status(403).json({ message: "Direct API access not allowed in production" });
    }
    
    // Check if request is coming from the same origin
    try {
      const refererHost = new URL(referer).host;
      if (refererHost !== host) {
        return res.status(403).json({ message: "Cross-origin API access not allowed" });
      }
    } catch (error) {
      return res.status(403).json({ message: "Invalid referer header" });
    }
  }
  
  next();
};

function getRateLimitKey(ip: string, username: string): string {
  return `${ip}:${username}`;
}

function isRateLimited(key: string): { limited: boolean; attempts?: number; timeUntilReset?: number; shouldContactAdmin?: boolean } {
  const attempts = loginAttempts.get(key);
  if (!attempts) return { limited: false };
  
  const now = Date.now();
  
  // Clean old attempts
  const recentAttempts = attempts.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  if (recentAttempts.length === 0) {
    loginAttempts.delete(key);
    return { limited: false };
  }
  
  // Update with cleaned attempts
  loginAttempts.set(key, recentAttempts);
  
  if (recentAttempts.length >= MAX_LOGIN_ATTEMPTS) {
    const oldestAttempt = Math.min(...recentAttempts);
    const timeUntilReset = LOCKOUT_DURATION - (now - oldestAttempt);
    
    return {
      limited: true,
      attempts: recentAttempts.length,
      timeUntilReset: Math.max(0, timeUntilReset),
      shouldContactAdmin: recentAttempts.length >= 10
    };
  }
  
  return { limited: false, attempts: recentAttempts.length };
}

function recordFailedAttempt(key: string): void {
  const attempts = loginAttempts.get(key) || [];
  attempts.push(Date.now());
  loginAttempts.set(key, attempts);
}

function clearAttempts(key: string): void {
  loginAttempts.delete(key);
}

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// Helper function to get sold date from activity logs
async function getSoldDateFromActivityLogs(leadId: string): Promise<string | null> {
  try {
    console.log(`🔍 [SOLD DATE] Checking lead ${leadId} for sold date`);
    
    const activities = await storage.getActivityLogs({
      entity_type: 'Lead',
      limit: 1000
    });
    
    // Filter activities for this specific lead and sort by date (newest first)
    const leadActivities = activities
      .filter((activity: any) => activity.entity_id.toString() === leadId.toString())
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    console.log(`🔍 [SOLD DATE] Found ${leadActivities.length} activities for lead ${leadId}`);
    
    // Since we know this lead is currently marked as "Sold", 
    // the most recent activity that changed "remarks" should be when it was marked as sold
    const remarksChangeActivity = leadActivities.find((activity: any) => 
      activity.action === 'UPDATE_LEAD' && 
      activity.details && 
      activity.details.includes('remarks')
    );
    
    if (remarksChangeActivity) {
      const soldDate = remarksChangeActivity.created_at.toISOString().split('T')[0];
      console.log(`✅ [SOLD DATE] Using remarks change date for lead ${leadId}: ${soldDate}`);
      return soldDate;
    }
    
    console.log(`❌ [SOLD DATE] No remarks change activity found for lead ${leadId}`);
    return null;
  } catch (error) {
    console.error(`❌ [SOLD DATE] Error getting sold date for lead ${leadId}:`, error);
    return null;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Apply API protection middleware to all /api routes in production
  app.use('/api', requireAuth);
  
  // API Test page route (serve the test HTML)
  app.get("/api-test.html", (req, res) => {
    const testPagePath = path.resolve(process.cwd(), "api-test.html");
    if (fs.existsSync(testPagePath)) {
      res.sendFile(testPagePath);
    } else {
      res.status(404).send("API test page not found");
    }
  });

  // Health check endpoint for debugging
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      port: process.env.PORT 
    });
  });

  // Database health check
  app.get("/api/health/db", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json({ 
        status: "ok", 
        database: "connected",
        userCount: users.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Database health check failed:", error);
      res.status(500).json({ 
        status: "error", 
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Auth endpoints
  app.post("/api/auth/rate-limit-status", async (req, res) => {
    try {
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ message: "Username required" });
      }
      
      const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';
      const rateLimitKey = getRateLimitKey(clientIp, username.toLowerCase());
      const rateLimitStatus = isRateLimited(rateLimitKey);
      
      res.json({
        rateLimited: rateLimitStatus.limited,
        timeUntilReset: rateLimitStatus.timeUntilReset || 0,
        shouldContactAdmin: rateLimitStatus.shouldContactAdmin || false,
        attempts: rateLimitStatus.attempts || 0
      });
    } catch (error) {
      console.error("Rate limit status check error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      console.log("=== LOGIN REQUEST START ===");
      console.log("Request headers:", req.headers);
      console.log("Request body:", req.body);
      console.log("Body type:", typeof req.body);
      console.log("Content-Type:", req.get('Content-Type'));
      
      // Validate request body exists
      if (!req.body) {
        console.log("❌ No request body found");
        return res.status(400).json({ message: "Request body is required" });
      }

      // Parse and validate using Zod
      const parseResult = loginSchema.safeParse(req.body);
      if (!parseResult.success) {
        console.log("❌ Zod validation failed:", parseResult.error);
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: parseResult.error.errors 
        });
      }

      const { username, password } = parseResult.data;
      const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';
      const rateLimitKey = getRateLimitKey(clientIp, username.toLowerCase());
      
      // Check rate limiting
      const rateLimitStatus = isRateLimited(rateLimitKey);
      if (rateLimitStatus.limited) {
        console.log(`🚫 Rate limited: ${rateLimitKey}, attempts: ${rateLimitStatus.attempts}`);
        
        const minutes = Math.ceil((rateLimitStatus.timeUntilReset || 0) / (60 * 1000));
        let message = `Too many failed login attempts. Please try again in ${minutes} minute(s).`;
        
        if (rateLimitStatus.shouldContactAdmin) {
          message = "Multiple failed login attempts detected. Please contact your system administrator for assistance.";
        }
        
        return res.status(429).json({ 
          message,
          rateLimited: true,
          timeUntilReset: rateLimitStatus.timeUntilReset,
          shouldContactAdmin: rateLimitStatus.shouldContactAdmin
        });
      }
      
      console.log(`🔍 Looking up user: "${username}"`);
      
      // Test database connection first
      try {
        const user = await storage.getUserByUsername(username.toLowerCase());
        console.log("✅ Database query successful");
        console.log("Retrieved user:", user ? { id: user.id, username: user.username, role: user.role } : null);
        
        if (!user) {
          console.log("❌ User not found in database");
          recordFailedAttempt(rateLimitKey);
          return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log(`🔐 Testing password for user: ${user.username}`);
        console.log(`Expected password: "${password}"`);
        console.log(`Stored password: "${user.password}"`);
        
        if (user.password !== password) {
          console.log("❌ Password mismatch");
          recordFailedAttempt(rateLimitKey);
          return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log("✅ Password matches");
        
      } catch (dbError) {
        console.error("❌ Database error during user lookup:", dbError);
        return res.status(500).json({ message: "Database connection error" });
      }

      const user = await storage.getUserByUsername(username.toLowerCase());
      console.log("User permissions type:", typeof user?.permissions);
      console.log("User permissions value:", user?.permissions);
      
      if (!user || user.password !== password) {
        recordFailedAttempt(rateLimitKey);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if user account is active
      if (!user.is_active) {
        console.log("❌ User account is inactive");
        recordFailedAttempt(rateLimitKey);
        return res.status(401).json({ message: "Account is disabled. Please contact administrator." });
      }

      // Clear failed attempts on successful login
      clearAttempts(rateLimitKey);

      // Ensure permissions is always an array
      let permissions = [];
      if (user.permissions) {
        if (Array.isArray(user.permissions)) {
          permissions = user.permissions;
        } else if (typeof user.permissions === 'string') {
          try {
            permissions = JSON.parse(user.permissions);
            if (!Array.isArray(permissions)) {
              permissions = [];
            }
          } catch (error) {
            console.error('Error parsing permissions string:', error);
            permissions = [];
          }
        }
      }

      console.log("Final permissions array:", permissions);

      // Log successful login activity
      await storage.logActivity(
        user.id.toString(),
        'LOGIN',
        'AUTH',
        user.id.toString(),
        `User ${user.username} logged in successfully`
      );

      // Simple session - in production use proper session management
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          role: user.role,
          permissions: permissions
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

  // User status validation endpoint
  app.post("/api/auth/validate", async (req, res) => {
    try {
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({ message: "Username required" });
      }

      const user = await storage.getUserByUsername(username.toLowerCase());
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (!user.is_active) {
        return res.status(401).json({ message: "Account is disabled. Please contact administrator." });
      }

      res.json({ valid: true });
    } catch (error) {
      console.error("User validation error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const { username } = req.query;
      console.log(`[DEBUG] Dashboard Stats API received username: '${username}'`);

      let allLeads = await storage.getLeads();

      // Apply role-based filtering if username is provided
      if (username) {
        const user = await storage.getUserByUsername(username as string);
        console.log(`[DEBUG] Dashboard Stats - Found user:`, user ? { username: user.username, role: user.role } : 'null');

        if (user && user.role === 'commercial_sales') {
          console.log(`[DEBUG] Dashboard Stats - Applied Commercial filter for commercial_sales user`);
          allLeads = allLeads.filter(lead => lead.project_type === 'Commercial');
        }
      }

      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // Start of today
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1); // Start of tomorrow
      
      // Format today's date as YYYY-MM-DD for string comparison
      const todayString = today.toISOString().split('T')[0];
      
      // Define today's date components for comparison
      const todayYear = today.getFullYear();
      const todayMonth = today.getMonth();
      const todayDate = today.getDate();
      
      const totalLeads = allLeads.length;
      const soldLeads = allLeads.filter(lead => lead.remarks === "Sold").length;
      
      // IMPROVED: Prevent counting already-sold leads that just had follow-up dates updated
      // Only count leads that were actually marked as "Sold" today, not just updated today
      let soldToday = 0;
      
      try {
        // Get all UPDATE_LEAD activities from today
        const todayUpdateActivities = await storage.getActivityLogs({
          action: 'UPDATE_LEAD',
          days: 0, // Only today
          limit: 1000
        });
        
        // Filter for activities that actually changed the status to "Sold"
        const leadsSoldToday = todayUpdateActivities.filter(activity => {
          const details = activity.details || '';
          return details.includes('remarks') && 
                 activity.created_at && 
                 new Date(activity.created_at).toISOString().split('T')[0] === todayString;
        });
        
        // Get the lead IDs that had status changes today
        const soldTodayLeadIds = leadsSoldToday.map(activity => activity.entity_id);
        
        // Count leads that are currently "Sold" AND had their status updated today
        soldToday = allLeads.filter(lead => {
          return lead.remarks === 'Sold' && soldTodayLeadIds.includes(lead.id.toString());
        }).length;
        
      } catch (error) {
        // CONSERVATIVE FALLBACK: Only count leads created today AND marked as sold
        // This avoids counting any existing sold leads that were just updated
        soldToday = allLeads.filter(lead => {
          return lead.remarks === 'Sold' && lead.date_created === todayString;
        }).length;
      }
      
      const soldLeadsCreatedToday = allLeads.filter(lead => {
        return lead.remarks === 'Sold' && lead.date_created === todayString;
      });
      
      if (soldLeadsCreatedToday.length > 0) {
        console.log(`[DEBUG] Leads created and sold today:`, soldLeadsCreatedToday.map(lead => ({
          id: lead.id,
          name: lead.name,
          date_created: lead.date_created,
          updated_at: lead.updated_at
        })));
      }
      
      // Filter leads that have overdue or today's followup dates (excluding inactive statuses)
      // This matches what the dashboard displays: overdue + due today
      const todayFollowups = allLeads.filter(lead => {
        if (!lead.next_followup_date) return false;
        // Exclude inactive/closed lead statuses
        if (lead.remarks === 'Not Interested' || 
            lead.remarks === 'Not Service Area' || 
            lead.remarks === 'Not Compatible' ||
            lead.remarks === 'Friendly Partner') {
          return false;
        }
        
        // Parse the follow-up date and compare with today
        const [year, month, day] = lead.next_followup_date.split('-').map(Number);
        
        // Include both overdue (before today) and due today
        return year < todayYear || 
               (year === todayYear && month - 1 < todayMonth) ||
               (year === todayYear && month - 1 === todayMonth && day <= todayDate);
      }).length;
      
      // Fix: Get leads created TODAY only, not last week
      const newToday = allLeads.filter(lead => {
        if (!lead.date_created) return false;
        return lead.date_created === todayString;
      }).length;

      res.json({
        totalLeads,
        soldLeads,
        soldToday,
        todayFollowups,
        newToday
      });
      
      // Debug logging
      console.log(`[DEBUG] Dashboard Stats for ${todayString}:`, {
        totalLeads,
        soldLeads,
        soldToday,
        todayFollowups,
        newToday,
        todayString
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Lead endpoints
  app.get("/api/leads", async (req, res) => {
    try {
      const { status, origin, assigned_to, search, page, limit, username } = req.query;
      
      console.log('🔍 Received filters in API:', { status, origin, assigned_to, search, page, limit, username });
      
      // Debug: Check if we have any Friendly Partner leads when that filter is requested
      if (status === 'Friendly Partner') {
        const allLeads = await storage.getLeads();
        const friendlyPartnerLeads = allLeads.filter(lead => lead.remarks === 'Friendly Partner');
        console.log(`🔍 Total leads in database: ${allLeads.length}`);
        console.log(`🔍 Friendly Partner leads found: ${friendlyPartnerLeads.length}`);
        if (friendlyPartnerLeads.length > 0) {
          console.log('🔍 Sample Friendly Partner leads:', friendlyPartnerLeads.slice(0, 3).map(l => ({ id: l.id, name: l.name, remarks: l.remarks })));
        }
      }
      
      // Parse pagination parameters
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 20;
      
      // Check user role and apply commercial-only filter if needed
      let projectTypeFilter: string | undefined;
      if (username) {
        try {
          const user = await storage.getUserByUsername(username as string);
          console.log(`🔍 User lookup for ${username}:`, user ? { username: user.username, role: user.role } : 'USER NOT FOUND');
          
          if (user && user.role === 'commercial_sales') {
            // Commercial sales users can only see Commercial projects
            projectTypeFilter = 'Commercial';
            console.log(`🔍 Commercial sales user ${username} - filtering to Commercial projects only`);
          } else if (user) {
            console.log(`🔍 User ${username} has role '${user.role}' - no project type filtering applied`);
          }
        } catch (error) {
          console.error('Error checking user role:', error);
          // Continue without filtering if user lookup fails
        }
      }
      
      // Prepare filters
      const filters = {
        search: search as string,
        status: status as string,
        origin: origin as string,
        assigned_to: assigned_to as string,
        project_type: projectTypeFilter
      };
      
      // Use the new paginated method
      const result = await storage.getLeadsPaginated(pageNum, limitNum, filters);
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching leads:', error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  // Internal enrichment endpoint - find existing lead by email (MUST be before /:id route)
  app.get("/api/leads/enrich", async (req, res) => {
    try {
      const { email } = req.query;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: "Email parameter is required" });
      }

      // Search for existing lead with this email
      const existingLead = await storage.getLeadByEmail(email);
      
      if (existingLead) {
        res.json({
          found: true,
          name: existingLead.name,
          phone: existingLead.phone,
          email: existingLead.email
        });
      } else {
        res.json({
          found: false,
          name: '',
          phone: '',
          email
        });
      }
    } catch (error) {
      console.error('Error in internal enrichment:', error);
      res.status(500).json({ message: "Failed to enrich lead data" });
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
    console.log("POST /api/leads - Request received");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    
    try {
      console.log("Validating lead data with schema...");
      const leadData = insertLeadSchema.parse(req.body);
      console.log("Lead data validated successfully:", leadData);
      console.log("🔍 Date created value:", leadData.date_created, "Type:", typeof leadData.date_created);
      
      console.log("Creating lead in database...");
      const lead = await storage.createLead(leadData);
      console.log("Lead created successfully:", lead);
      console.log("🔍 Final lead date_created:", lead.date_created, "Type:", typeof lead.date_created);

      // Log activity
      await storage.logActivity(
        '1', // TODO: Get actual user ID from session/auth
        'CREATE_LEAD',
        'LEAD',
        lead.id.toString(),
        `Created lead: ${lead.name} - ${lead.phone}`
      );
      
      res.status(201).json(lead);
    } catch (error) {
      console.error("Error creating lead:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid lead data", errors: error.errors });
      }
      console.error("General error:", error);
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  app.put("/api/leads/:id", async (req, res) => {
    try {
      // PRODUCTION FIX: Pre-process dates to ensure they remain as strings
      const preprocessedBody = { ...req.body };
      ['next_followup_date', 'pickup_date', 'installation_date', 'installation_end_date'].forEach(field => {
        if (preprocessedBody[field] && typeof preprocessedBody[field] === 'object' && preprocessedBody[field] instanceof Date) {
          const dateObj = preprocessedBody[field] as Date;
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          preprocessedBody[field] = `${year}-${month}-${day}`;
        }
      });
      
      const updates = updateLeadSchema.parse(preprocessedBody);
      console.log('==============================');
      
      // Get the original lead to compare what actually changed
      const originalLead = await storage.getLead(req.params.id);
      if (!originalLead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      const lead = await storage.updateLead(req.params.id, updates);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      // Only log fields that actually changed values
      const actualChanges = Object.keys(updates).filter(key => {
        const oldValue = originalLead[key as keyof typeof originalLead];
        const newValue = updates[key as keyof typeof updates];
        
        // Handle null/undefined comparisons
        if (oldValue == null && newValue == null) return false;
        if (oldValue == null || newValue == null) return true;
        
        return String(oldValue) !== String(newValue);
      });

      // Log activity with only actual changes
      await storage.logActivity(
        '1', // TODO: Get actual user ID from session/auth
        'UPDATE_LEAD',
        'LEAD',
        req.params.id,
        `Updated lead: ${lead.name} - Changes: ${actualChanges.join(', ')}`
      );
      
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
      // Get lead info before deletion for logging
      const lead = await storage.getLead(req.params.id);
      const deleted = await storage.deleteLead(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Lead not found" });
      }

      // Log activity
      await storage.logActivity(
        '1', // TODO: Get actual user ID from session/auth
        'DELETE_LEAD',
        'LEAD',
        req.params.id,
        `Deleted lead: ${lead?.name || 'unknown'}`
      );
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  // Follow-up endpoints
  app.get("/api/followups", async (req, res) => {
    try {
      const username = req.query.username as string;
      console.log(`[DEBUG] Followups API received username: '${username}'`);
      
      let projectTypeFilter: string | null = null;
      
      // Apply role-based filtering
      if (username) {
        const user = await storage.getUserByUsername(username);
        console.log(`[DEBUG] Found user:`, user ? { username: user.username, role: user.role } : 'null');
        if (user && user.role === 'commercial_sales') {
          projectTypeFilter = 'Commercial';
          console.log(`[DEBUG] Applied Commercial filter for commercial_sales user`);
        }
      }
      
      const now = new Date();
      const todayYear = now.getFullYear();
      const todayMonth = now.getMonth();
      const todayDate = now.getDate();
      
      // Also get today as string for consistent date comparison
      const todayString = now.toISOString().split('T')[0]; // Format: "2025-09-21"
      
      const allLeads = await storage.getLeads();
      
      // Apply project type filtering if needed
      const filteredLeads = projectTypeFilter 
        ? allLeads.filter(lead => lead.project_type === projectTypeFilter)
        : allLeads;
      
      // Filter out leads with inactive/closed statuses from follow-ups
      const activeLeads = filteredLeads.filter(lead => 
        lead.remarks !== 'Not Interested' && 
        lead.remarks !== 'Not Service Area' && 
        lead.remarks !== 'Not Compatible' &&
        lead.remarks !== 'Friendly Partner'
      );
      
      const overdue = activeLeads.filter(lead => {
        if (!lead.next_followup_date) return false;
        // Parse date string and compare date components only
        const [year, month, day] = lead.next_followup_date.split('-').map(Number);
        return year < todayYear || 
               (year === todayYear && month - 1 < todayMonth) ||
               (year === todayYear && month - 1 === todayMonth && day < todayDate);
      });

      const dueToday = activeLeads.filter(lead => {
        if (!lead.next_followup_date) return false;
        // Parse date string and compare date components only
        const [year, month, day] = lead.next_followup_date.split('-').map(Number);
        return year === todayYear && month - 1 === todayMonth && day === todayDate;
      });
      
      const allUpcoming = activeLeads.filter(lead => {
        if (!lead.next_followup_date) return false;
        // Parse date string and compare date components only
        const [year, month, day] = lead.next_followup_date.split('-').map(Number);
        return year > todayYear || 
               (year === todayYear && month - 1 > todayMonth) ||
               (year === todayYear && month - 1 === todayMonth && day > todayDate);
      }).sort((a, b) => {
        // Sort by follow-up date ascending (earliest first)
        return a.next_followup_date.localeCompare(b.next_followup_date);
      });

      // Return all upcoming leads so frontend can properly calculate weekly stats
      // Frontend will handle table display limiting
      
      // Calculate new leads added today - using same logic as dashboard stats
      const newLeadsToday = filteredLeads.filter(lead => {
        if (!lead.date_created) return false;
        return lead.date_created === todayString;
      });
      
      // Calculate leads sold today using the same improved logic as dashboard
      let soldToday;
      
      try {
        // Use activity logs to detect actual status changes to "Sold" today
        const todayUpdateActivities = await storage.getActivityLogs({
          action: 'UPDATE_LEAD',
          days: 0,
          limit: 1000
        });
        
        const leadsSoldToday = todayUpdateActivities.filter(activity => {
          const details = activity.details || '';
          return details.includes('remarks') && 
                 activity.created_at && 
                 new Date(activity.created_at).toISOString().split('T')[0] === todayString;
        });
        
        const soldTodayLeadIds = leadsSoldToday.map(activity => activity.entity_id);
        soldToday = filteredLeads.filter(lead => {
          return lead.remarks === 'Sold' && soldTodayLeadIds.includes(lead.id.toString());
        });
        
      } catch (error) {
        // CONSERVATIVE FALLBACK: Only count leads created today AND sold
        // This prevents counting existing sold leads that were just updated
        soldToday = filteredLeads.filter(lead => {
          return lead.remarks === 'Sold' && lead.date_created === todayString;
        });
      }

      // Auto-update leads that are still "New" but created before today to "In Progress"
      const leadsToUpdate = filteredLeads.filter(lead => {
        if (!lead.date_created || lead.remarks !== 'New') return false;
        // Parse date string and compare date components only
        const [year, month, day] = lead.date_created.split('-').map(Number);
        // If created before today and still "New", should be updated to "In Progress"
        return year < todayYear || 
               (year === todayYear && month - 1 < todayMonth) ||
               (year === todayYear && month - 1 === todayMonth && day < todayDate);
      });

      // Update leads from "New" to "In Progress" if they're older than today
      for (const lead of leadsToUpdate) {
        try {
          await storage.updateLead(lead.id.toString(), { remarks: 'In Progress' });
        } catch (error) {
          console.error(`Failed to auto-update lead ${lead.id} from New to In Progress:`, error);
        }
      }
      
      res.json({
        overdue,
        dueToday,
        upcoming: allUpcoming, // Return all upcoming leads
        upcomingCount: allUpcoming.length, // Total count for reference
        newLeadsToday: newLeadsToday, // Return full lead objects
        soldToday: soldToday // Return full lead objects
      });
      
      // Debug logging for followups endpoint
      console.log(`[DEBUG] Followups endpoint for ${todayString}:`, {
        overdueCount: overdue.length,
        dueTodayCount: dueToday.length,
        upcomingCount: allUpcoming.length,
        totalPending: overdue.length + dueToday.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch follow-ups" });
    }
  });

  // Installation endpoints
  app.get("/api/installations", async (req, res) => {
    try {
      const username = req.query.username as string;
      console.log(`[DEBUG] Installations API received username: '${username}'`);
      
      let projectTypeFilter: string | null = null;
      
      // Apply role-based filtering
      if (username) {
        const user = await storage.getUserByUsername(username);
        console.log(`[DEBUG] Installations - Found user:`, user ? { username: user.username, role: user.role } : 'null');
        if (user && user.role === 'commercial_sales') {
          projectTypeFilter = 'Commercial';
          console.log(`[DEBUG] Installations - Applied Commercial filter for commercial_sales user`);
        }
      }
      
      const allLeads = await storage.getLeads();
      
      // Apply project type filtering if needed
      const filteredLeads = projectTypeFilter 
        ? allLeads.filter(lead => lead.project_type === projectTypeFilter)
        : allLeads;
      
      // Get completed projects to exclude them from upcoming installations
      let completedProjectLeadIds = new Set<number>();
      try {
        const completedProjects = await storage.getCompletedProjects();
        completedProjectLeadIds = new Set(completedProjects.map(project => project.lead_id));
      } catch (error) {
        console.log('Completed projects table not available, showing all installations');
      }
      
      const installations = filteredLeads.filter(lead => 
        lead.remarks === "Sold" && 
        lead.installation_date &&
        !completedProjectLeadIds.has(lead.id) // Exclude completed installations
      );

      res.json(installations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch installations" });
    }
  });

  // Complete Installation endpoint
  app.post("/api/installations/:id/complete", async (req, res) => {
    try {
      const installationId = req.params.id;
      
      // Get the installation (lead) first
      const installation = await storage.getLead(installationId);
      if (!installation) {
        return res.status(404).json({ message: "Installation not found" });
      }

      // Validate that this is actually an installation
      if (installation.remarks !== "Sold" || !installation.installation_date) {
        return res.status(400).json({ message: "This lead is not a valid installation" });
      }

      // Create completed project record
      const completedProject = {
        lead_id: installation.id,
        customer_name: installation.name,
        phone: installation.phone,
        email: installation.email,
        address: installation.address,
        project_amount: installation.project_amount,
        deposit_paid: installation.deposit_paid,
        balance_paid: installation.balance_paid,
        installation_date: installation.installation_date,
        completion_date: new Date(),
        assigned_installer: installation.assigned_installer,
        notes: installation.notes,
        original_lead_origin: installation.lead_origin === "Website" ? null : installation.lead_origin,
        original_date_created: installation.date_created,
        original_assigned_to: installation.assigned_to,
      };

      // Try to create the completed project record in the database
      let dbCreationSuccess = false;
      try {
        const createdProject = await storage.createCompletedProject(completedProject);
        console.log('Successfully created completed project:', createdProject);
        dbCreationSuccess = true;
      } catch (dbError) {
        console.error('Failed to create completed project in database:', dbError);
        console.log('This is expected if the completed_projects table does not exist yet.');
        console.log('The installation will still be marked as complete using the notes field.');
      }
      
      // Mark the lead with completion notes
      const completionNote = `[${new Date().toLocaleDateString()}] Installation completed and moved to completed projects.`;
      const updatedNotes = installation.notes 
        ? `${installation.notes}\n\n${completionNote}`
        : completionNote;
      
      const updatedAdditionalNotes = installation.additional_notes
        ? `${installation.additional_notes}\n${completionNote}`
        : completionNote;

      await storage.updateLead(installationId, {
        notes: updatedNotes,
        additional_notes: updatedAdditionalNotes
      });

      res.json({ 
        message: "Installation marked as completed successfully",
        completedProject: completedProject,
        dbCreationSuccess: dbCreationSuccess
      });
    } catch (error) {
      console.error("Error completing installation:", error);
      res.status(500).json({ message: "Failed to complete installation" });
    }
  });

  // Temporary endpoint to create completed_projects table
  app.post("/api/create-completed-projects-table", async (req, res) => {
    try {
      // Execute the table creation SQL directly
      await storage.db.execute(`
        CREATE TABLE IF NOT EXISTS completed_projects (
          id INT AUTO_INCREMENT PRIMARY KEY,
          lead_id INT NOT NULL,
          customer_name VARCHAR(100) NOT NULL,
          phone VARCHAR(20),
          email VARCHAR(100),
          address TEXT,
          project_amount DECIMAL(10,2),
          deposit_paid DECIMAL(10,2),
          balance_paid DECIMAL(10,2),
          installation_date DATE,
          completion_date DATETIME NOT NULL,
          assigned_installer VARCHAR(100),
          notes TEXT,
          original_lead_origin VARCHAR(50),
          original_date_created DATETIME,
          original_assigned_to VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_lead_id (lead_id),
          INDEX idx_completion_date (completion_date),
          INDEX idx_installer (assigned_installer)
        )
      `);
      
      res.json({ message: "completed_projects table created successfully" });
    } catch (error) {
      console.error("Error creating completed_projects table:", error);
      res.status(500).json({ 
        message: "Failed to create completed_projects table", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Temporary endpoint to create completed_projects table
  app.post("/api/create-completed-projects-table", async (req, res) => {
    try {
      // Execute the table creation SQL directly
      await storage.db.execute(`
        CREATE TABLE IF NOT EXISTS completed_projects (
          id INT AUTO_INCREMENT PRIMARY KEY,
          lead_id INT NOT NULL,
          customer_name VARCHAR(100) NOT NULL,
          phone VARCHAR(20),
          email VARCHAR(100),
          address TEXT,
          project_amount DECIMAL(10,2),
          deposit_paid DECIMAL(10,2),
          balance_paid DECIMAL(10,2),
          installation_date DATE,
          completion_date DATETIME NOT NULL,
          assigned_installer VARCHAR(100),
          notes TEXT,
          original_lead_origin VARCHAR(50),
          original_date_created DATETIME,
          original_assigned_to VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_lead_id (lead_id),
          INDEX idx_completion_date (completion_date),
          INDEX idx_installer (assigned_installer)
        )
      `);
      
      res.json({ message: "completed_projects table created successfully" });
    } catch (error) {
      console.error("Error creating completed_projects table:", error);
      res.status(500).json({ 
        message: "Failed to create completed_projects table", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Get completed projects endpoint
  app.get("/api/completed-projects", async (req, res) => {
    try {
      const { username } = req.query;
      console.log(`[DEBUG] Completed Projects API received username: '${username}'`);

      let completedProjects = await storage.getCompletedProjects();

      // Apply role-based filtering if username is provided
      if (username) {
        const user = await storage.getUserByUsername(username as string);
        console.log(`[DEBUG] Completed Projects - Found user:`, user ? { username: user.username, role: user.role } : 'null');

        if (user && user.role === 'commercial_sales') {
          console.log(`[DEBUG] Completed Projects - Applied Commercial filter for commercial_sales user`);
          completedProjects = completedProjects.filter((project: any) => project.project_type === 'Commercial');
        }
      }

      res.json(completedProjects);
    } catch (error) {
      console.error("Error fetching completed projects:", error);
      res.status(500).json({ message: "Failed to fetch completed projects" });
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
      console.log('=== SAMPLE BOOKLET CREATION START ===');
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      
      const bookletData = insertSampleBookletSchema.parse(req.body);
      console.log('Parsed booklet data:', JSON.stringify(bookletData, null, 2));
      
      const booklet = await storage.createSampleBooklet(bookletData);
      console.log('Created booklet:', JSON.stringify(booklet, null, 2));

      // Log activity
      await storage.logActivity(
        '1', // TODO: Get actual user ID from session/auth
        'CREATE_BOOKLET',
        'SAMPLE_BOOKLET',
        booklet.id.toString(),
        `Created sample booklet: ${booklet.order_number} for ${booklet.customer_name}`
      );

      res.status(201).json(booklet);
    } catch (error) {
      console.error('=== SAMPLE BOOKLET CREATION ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      
      if (error instanceof z.ZodError) {
        console.error("Booklet validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid booklet data", errors: error.errors });
      }
      
      res.status(500).json({ message: "Failed to create sample booklet", error: error.message });
    }
  });

  app.put("/api/sample-booklets/:id", async (req, res) => {
    try {
      console.log('PUT request body:', JSON.stringify(req.body, null, 2));
      const updates = updateSampleBookletSchema.parse(req.body);
      const booklet = await storage.updateSampleBooklet(req.params.id, updates);
      
      if (!booklet) {
        return res.status(404).json({ message: "Sample booklet not found" });
      }

      // Log activity
      await storage.logActivity(
        '1', // TODO: Get actual user ID from session/auth
        'UPDATE_BOOKLET',
        'SAMPLE_BOOKLET',
        req.params.id,
        `Updated sample booklet: ${booklet.order_number} - Changes: ${Object.keys(updates).join(', ')}`
      );
      
      res.json(booklet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Zod validation error:', error.errors);
        return res.status(400).json({ message: "Invalid booklet data", errors: error.errors });
      }
      console.error('Update error:', error);
      res.status(500).json({ message: "Failed to update sample booklet" });
    }
  });

  app.delete("/api/sample-booklets/:id", async (req, res) => {
    try {
      // Get booklet info before deletion for logging
      const booklet = await storage.getSampleBooklet(req.params.id);
      const deleted = await storage.deleteSampleBooklet(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Sample booklet not found" });
      }

      // Log activity
      await storage.logActivity(
        '1', // TODO: Get actual user ID from session/auth
        'DELETE_BOOKLET',
        'SAMPLE_BOOKLET',
        req.params.id,
        `Deleted sample booklet: ${booklet?.order_number || 'unknown'}`
      );
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete sample booklet" });
    }
  });

  // Send email for sample booklet
  app.post("/api/sample-booklets/:id/email", async (req, res) => {
    try {
      const bookletId = req.params.id;
      const { emailType } = req.body;
      
      const booklet = await storage.getSampleBooklet(bookletId);
      if (!booklet) {
        return res.status(404).json({ message: "Sample booklet not found" });
      }

      if (!booklet.email) {
        return res.status(400).json({ message: "No email address for this booklet" });
      }

      if (emailType === 'tracking_notification') {
        if (!booklet.tracking_number) {
          return res.status(400).json({ message: "No tracking number available" });
        }

        const success = await emailService.sendTrackingNotification(
          booklet.email,
          booklet.customer_name,
          booklet.order_number,
          booklet.tracking_number
        );

        if (success) {
          // Log the email activity
          await storage.logActivity(
            '1', // TODO: Get actual user ID from session/auth
            'EMAIL_SENT',
            'SAMPLE_BOOKLET',
            bookletId,
            `Sent tracking notification to ${booklet.email} for order ${booklet.order_number}`
          );
          
          res.json({ message: "Tracking notification sent successfully" });
        } else {
          res.status(500).json({ message: "Failed to send tracking notification" });
        }
      } else {
        res.status(400).json({ message: "Invalid email type" });
      }
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  // USPS Tracking endpoints
  app.get("/api/sample-booklets/:id/tracking", async (req, res) => {
    try {
      const booklet = await storage.getSampleBooklet(req.params.id);
      if (!booklet) {
        return res.status(404).json({ message: "Sample booklet not found" });
      }

      if (!booklet.tracking_number) {
        return res.status(400).json({ message: "No tracking number available for this booklet" });
      }

      const trackingInfo = await uspsService.trackPackage(booklet.tracking_number);
      
      // Update booklet status if it has changed
      if (trackingInfo.status !== booklet.status) {
        await storage.updateSampleBooklet(req.params.id, { 
          status: trackingInfo.status as any 
        });
      }

      res.json(trackingInfo);
    } catch (error) {
      console.error('Tracking error:', error);
      res.status(500).json({ message: "Failed to fetch tracking information" });
    }
  });

  app.post("/api/sample-booklets/sync-tracking", async (req, res) => {
    try {
      // Use the tracking scheduler for manual sync
      await trackingScheduler.manualSync();
      res.json({ message: "Manual tracking sync completed" });
    } catch (error) {
      console.error('Manual sync tracking error:', error);
      res.status(500).json({ message: "Failed to sync tracking information" });
    }
  });

  // Sample Booklets dashboard stats
  app.get("/api/sample-booklets/stats/dashboard", async (req, res) => {
    try {
      const allBooklets = await storage.getSampleBooklets();
      const pending = allBooklets.filter(b => b.status === "Pending").length;
      const shipped = allBooklets.filter(b => b.status === "Shipped").length;
      const inTransit = allBooklets.filter(b => b.status === "Shipped").length; // Use "Shipped" for in-transit
      const outForDelivery = allBooklets.filter(b => b.status === "Shipped").length; // Use "Shipped" for out-for-delivery
      const delivered = allBooklets.filter(b => b.status === "Delivered").length;
      const refunded = allBooklets.filter(b => b.status === "Delivered").length; // Use "Delivered" for refunded status
      const thisWeek = allBooklets.filter(b => {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return new Date(b.date_ordered) > weekAgo;
      }).length;

      res.json({
        totalOrders: allBooklets.length,
        pendingOrders: pending,
        shippedOrders: shipped,
        inTransitOrders: inTransit,
        outForDeliveryOrders: outForDelivery,
        deliveredOrders: delivered,
        refundedOrders: refunded,
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
      const soldLeads = filteredLeads.filter(lead => lead.remarks === 'Sold');
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
        if (lead.remarks === 'Sold') {
          acc[origin].sold += 1;
          acc[origin].revenue += parseFloat(lead.project_amount || '0');
        }
        return acc;
      }, {} as Record<string, { total: number; sold: number; revenue: number }>);
      
      const leadOriginPerformance = Object.entries(originStats).map(([origin, stats]: [string, { total: number; sold: number; revenue: number }]) => ({
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
        if (lead.remarks === 'Sold') {
          acc[member].sold += 1;
          acc[member].revenue += parseFloat(lead.project_amount || '0');
        }
        return acc;
      }, {} as Record<string, { total: number; sold: number; revenue: number }>);
      
      const teamPerformance = Object.entries(teamStats).map(([member, stats]: [string, { total: number; sold: number; revenue: number }]) => ({
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
      if (!month) {
        // Use specified year or default to current year for monthly breakdown
        const targetYear = year ? parseInt(year as string) : new Date().getFullYear();
        const yearLeads = allLeads.filter(lead => {
          const leadYear = new Date(lead.date_created).getFullYear();
          return leadYear === targetYear;
        });

        // Get sold dates for all sold leads from activity logs
        const soldLeads = yearLeads.filter(lead => lead.remarks === 'Sold');
        const soldDatesMap = new Map<string, string>();
        
        for (const lead of soldLeads) {
          const soldDate = await getSoldDateFromActivityLogs(lead.id.toString());
          if (soldDate) {
            soldDatesMap.set(lead.id.toString(), soldDate);
          }
        }
        
        monthlyBreakdown = Array.from({ length: 12 }, (_, monthIndex) => {
          // Count total leads by creation date (as before)
          const monthLeads = yearLeads.filter(lead => {
            const leadMonth = new Date(lead.date_created).getMonth();
            return leadMonth === monthIndex;
          });
          
          // Count sold leads by sold date (NEW LOGIC)
          const monthSoldLeads = soldLeads.filter(lead => {
            const soldDate = soldDatesMap.get(lead.id.toString());
            if (!soldDate) return false; // Skip if we can't find sold date
            
            const soldDateObj = new Date(soldDate);
            return soldDateObj.getFullYear() === targetYear && 
                   soldDateObj.getMonth() === monthIndex;
          });
          
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

  // Debug endpoint to check activity logs format
  app.get("/api/debug/activity-logs/:leadId", async (req, res) => {
    try {
      const leadId = parseInt(req.params.leadId);
      const activities = await storage.getActivityLogs({
        entity_type: 'Lead',
      });
      
      // Filter for this specific lead
      const leadActivities = activities.filter((a: any) => a.entity_id === leadId);
      
      res.json({
        leadId,
        totalActivities: activities.length,
        leadSpecificActivities: leadActivities.length,
        activities: leadActivities.map(a => ({
          id: a.id,
          entity_id: a.entity_id,
          action: a.action,
          details: a.details,
          created_at: a.created_at
        }))
      });
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
  });

  // Sold Projects for Month Report API
  app.get("/api/reports/sold-projects", async (req, res) => {
    try {
      const { year, month } = req.query;
      
      // Month mapping for display
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      // Get all leads
      const allLeads = await storage.getLeads();
      
      // Filter for sold leads
      const soldLeads = allLeads.filter(lead => lead.remarks === 'Sold');
      
      console.log(`🔍 [SOLD REPORT] Processing ${soldLeads.length} sold leads`);
      
      // Get sold dates for all sold leads from activity logs
      const soldProjectsWithDates = [];
      
      for (const lead of soldLeads) {
        const soldDate = await getSoldDateFromActivityLogs(lead.id.toString());
        if (soldDate) {
          const soldDateObj = new Date(soldDate);
          const soldYear = soldDateObj.getFullYear();
          const soldMonth = soldDateObj.getMonth() + 1; // Convert to 1-based month
          
          // Apply filters if provided
          let include = true;
          if (year && soldYear !== parseInt(year as string)) include = false;
          if (month && soldMonth !== parseInt(month as string)) include = false;
          
          if (include) {
            soldProjectsWithDates.push({
              id: lead.id,
              name: lead.name,
              phone: lead.phone,
              email: lead.email,
              leadOrigin: lead.lead_origin,
              assignedTo: lead.assigned_to,
              projectAmount: parseFloat(lead.project_amount || '0'),
              createdDate: lead.date_created,
              soldDate: soldDate,
              soldMonth: soldMonth,
              soldYear: soldYear,
              monthName: monthNames[soldMonth - 1]
            });
          }
        }
      }
      
      // Sort by sold date (most recent first)
      soldProjectsWithDates.sort((a, b) => new Date(b.soldDate).getTime() - new Date(a.soldDate).getTime());
      
      // Calculate summary statistics
      const totalProjects = soldProjectsWithDates.length;
      const totalRevenue = soldProjectsWithDates.reduce((sum, project) => sum + project.projectAmount, 0);
      const averageDealSize = totalProjects > 0 ? totalRevenue / totalProjects : 0;
      
      // Group by team member
      const teamStats = soldProjectsWithDates.reduce((acc, project) => {
        const member = project.assignedTo || 'unassigned';
        if (!acc[member]) {
          acc[member] = { count: 0, revenue: 0 };
        }
        acc[member].count += 1;
        acc[member].revenue += project.projectAmount;
        return acc;
      }, {} as Record<string, { count: number; revenue: number }>);
      
      console.log(`✅ [SOLD REPORT] Found ${totalProjects} sold projects for the period`);
      
      res.json({
        soldProjects: soldProjectsWithDates,
        summary: {
          totalProjects,
          totalRevenue,
          averageDealSize,
          teamStats
        },
        filterInfo: {
          year: year ? parseInt(year as string) : null,
          month: month ? parseInt(month as string) : null,
          period: !year && !month ? 'all-time' : year && month ? `${monthNames[(parseInt(month as string) - 1)]} ${year}` : year
        }
      });
    } catch (error) {
      console.error('Error fetching sold projects report:', error);
      res.status(500).json({ message: "Failed to fetch sold projects report" });
    }
  });

  // Commercial Analytics API - Only returns commercial leads data
  app.get("/api/reports/commercial-analytics", async (req, res) => {
    try {
      const { year, month, username } = req.query;
      console.log(`[DEBUG] Commercial Analytics API received username: '${username}'`);

      let allLeads = await storage.getLeads();

      // Apply role-based filtering if username is provided
      if (username) {
        const user = await storage.getUserByUsername(username as string);
        console.log(`[DEBUG] Commercial Analytics - Found user:`, user ? { username: user.username, role: user.role } : 'null');

        if (user && user.role === 'commercial_sales') {
          console.log(`[DEBUG] Commercial Analytics - Applied Commercial filter for commercial_sales user`);
          allLeads = allLeads.filter(lead => lead.project_type === 'Commercial');
        } else if (user && ['admin', 'owner'].includes(user.role)) {
          console.log(`[DEBUG] Commercial Analytics - Admin/Owner user can see all Commercial data`);
          allLeads = allLeads.filter(lead => lead.project_type === 'Commercial');
        }
        console.log(`[DEBUG] Commercial Analytics - After filtering: ${allLeads.length} leads found`);
      }

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

      const totalLeads = filteredLeads.length;
      const soldLeads = filteredLeads.filter(lead => lead.remarks === 'Sold').length;
      const conversionRate = totalLeads > 0 ? (soldLeads / totalLeads) * 100 : 0;

      // Calculate revenue and average deal size
      const soldLeadsWithAmount = filteredLeads.filter(lead => 
        lead.remarks === 'Sold' && lead.project_amount && parseFloat(lead.project_amount) > 0
      );
      const totalRevenue = soldLeadsWithAmount.reduce((sum, lead) => 
        sum + parseFloat(lead.project_amount || '0'), 0
      );
      const averageDealSize = soldLeadsWithAmount.length > 0 ? totalRevenue / soldLeadsWithAmount.length : 0;

      // Lead origin performance
      const originStats = {};
      filteredLeads.forEach(lead => {
        const origin = lead.lead_origin || 'unknown';
        if (!originStats[origin]) {
          originStats[origin] = {
            totalLeads: 0,
            soldLeads: 0,
            totalRevenue: 0,
            soldLeadsWithAmount: []
          };
        }
        originStats[origin].totalLeads++;
        if (lead.remarks === 'Sold') {
          originStats[origin].soldLeads++;
          if (lead.project_amount && parseFloat(lead.project_amount) > 0) {
            originStats[origin].totalRevenue += parseFloat(lead.project_amount);
            originStats[origin].soldLeadsWithAmount.push(lead);
          }
        }
      });

      const leadOriginPerformance = Object.entries(originStats).map(([origin, stats]: [string, any]) => ({
        origin,
        totalLeads: stats.totalLeads,
        soldLeads: stats.soldLeads,
        conversionRate: stats.totalLeads > 0 ? (stats.soldLeads / stats.totalLeads) * 100 : 0,
        totalRevenue: stats.totalRevenue,
        averageDealSize: stats.soldLeadsWithAmount.length > 0 ? stats.totalRevenue / stats.soldLeadsWithAmount.length : 0
      }));

      // Monthly breakdown
      const monthlyStats = {};
      filteredLeads.forEach(lead => {
        const createdDate = new Date(lead.date_created);
        const monthKey = createdDate.getMonth() + 1; // 1-12
        const monthName = createdDate.toLocaleDateString('en-US', { month: 'long' });
        
        if (!monthlyStats[monthKey]) {
          monthlyStats[monthKey] = {
            month: monthKey,
            monthName,
            totalLeads: 0,
            soldLeads: 0,
            totalRevenue: 0,
            soldLeadsWithAmount: []
          };
        }
        
        monthlyStats[monthKey].totalLeads++;
        if (lead.remarks === 'Sold') {
          monthlyStats[monthKey].soldLeads++;
          if (lead.project_amount && parseFloat(lead.project_amount) > 0) {
            monthlyStats[monthKey].totalRevenue += parseFloat(lead.project_amount);
            monthlyStats[monthKey].soldLeadsWithAmount.push(lead);
          }
        }
      });

      const monthlyBreakdown = Object.values(monthlyStats).map((stats: any) => ({
        month: stats.month,
        monthName: stats.monthName,
        totalLeads: stats.totalLeads,
        soldLeads: stats.soldLeads,
        conversionRate: stats.totalLeads > 0 ? (stats.soldLeads / stats.totalLeads) * 100 : 0,
        totalRevenue: stats.totalRevenue,
        averageDealSize: stats.soldLeadsWithAmount.length > 0 ? stats.totalRevenue / stats.soldLeadsWithAmount.length : 0
      }));

      // Sort monthly breakdown by month
      monthlyBreakdown.sort((a, b) => a.month - b.month);

      const result = {
        executiveDashboard: {
          totalLeads,
          soldLeads,
          conversionRate,
          totalRevenue,
          averageDealSize
        },
        leadOriginPerformance,
        monthlyBreakdown,
        filterInfo: {
          year: year ? parseInt(year as string) : null,
          month: month ? parseInt(month as string) : null,
          period: year && month ? `${year}-${month}` : year ? year as string : 'All time'
        }
      };

      res.json(result);
    } catch (error) {
      console.error('Error generating commercial analytics:', error);
      res.status(500).json({ error: 'Failed to generate commercial analytics' });
    }
  });

  // Installer Reports API
  app.get("/api/reports/installers", async (req, res) => {
    try {
      const { year, month } = req.query;
      
      // Get completed projects from the database
      const completedProjectsQuery = db.select().from(completedProjects);
      let completedProjectsData = await completedProjectsQuery;
      
      // Apply date filters if provided
      if (year) {
        const yearNum = parseInt(year as string);
        completedProjectsData = completedProjectsData.filter(project => {
          if (!project.completion_date) return false;
          const projectYear = new Date(project.completion_date).getFullYear();
          return projectYear === yearNum;
        });
      }
      
      if (month && year) {
        const monthNum = parseInt(month as string);
        completedProjectsData = completedProjectsData.filter(project => {
          if (!project.completion_date) return false;
          const projectMonth = new Date(project.completion_date).getMonth() + 1;
          return projectMonth === monthNum;
        });
      }
      
      // Group by installer and calculate metrics
      const installerMetrics = new Map<string, {
        installerName: string;
        totalInstallations: number;
        totalValue: number;
        averageProjectValue: number;
        completedInstallations: number;
        pendingInstallations: number;
        installations: Array<{
          projectId: number;
          customerName: string;
          projectValue: number;
          installationDate: string;
          status: 'completed' | 'pending';
        }>;
      }>();
      
      // Process completed projects
      for (const project of completedProjectsData) {
        if (!project.assigned_installer) continue;
        
        // Split comma-separated installer names into individual installers
        const installerNames = project.assigned_installer.split(',').map(name => name.trim()).filter(name => name.length > 0);
        
        for (const installerName of installerNames) {
          if (!installerMetrics.has(installerName)) {
            installerMetrics.set(installerName, {
              installerName,
              totalInstallations: 0,
              totalValue: 0,
              averageProjectValue: 0,
              completedInstallations: 0,
              pendingInstallations: 0,
              installations: []
            });
          }

          const installer = installerMetrics.get(installerName)!;
          installer.totalInstallations++;
          installer.completedInstallations++;
          // Split project value equally among all installers for this project
          const projectValue = parseFloat(project.project_amount?.toString() || '0');
          const valuePerInstaller = projectValue / installerNames.length;
          installer.totalValue += valuePerInstaller;
          installer.installations.push({
            projectId: project.id,
            customerName: project.customer_name,
            projectValue: valuePerInstaller,
            installationDate: project.completion_date?.toString() || '',
            status: 'completed'
          });
        }
      }
      
      // Calculate average project values
      for (const installer of Array.from(installerMetrics.values())) {
        installer.averageProjectValue = installer.totalInstallations > 0 
          ? installer.totalValue / installer.totalInstallations 
          : 0;
      }
      
      const installers = Array.from(installerMetrics.values());
      const totalInstallations = installers.reduce((sum, installer) => sum + installer.totalInstallations, 0);
      const totalValue = installers.reduce((sum, installer) => sum + installer.totalValue, 0);
      
      res.json({
        installers,
        totalInstallations,
        totalValue,
        filterInfo: {
          year: year ? parseInt(year as string) : null,
          month: month ? parseInt(month as string) : null,
          period: year ? (month ? `${year}-${String(month).padStart(2, '0')}` : year) : 'all-time'
        }
      });
    } catch (error) {
      console.error('Error fetching installer reports:', error);
      res.status(500).json({ message: "Failed to fetch installer reports data" });
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
        subject = `Wrap My Kitchen Installation Confirmation - ${formattedDate}`;
        emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wrap My Kitchen - Installation Confirmation</title>
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa;">
    
    <!-- Main Container Table -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e9ecef;">
        
        <!-- Logo Header -->
        <tr>
            <td style="padding: 30px 20px; text-align: center; background-color: #ffffff; border-bottom: 1px solid #e9ecef;">
                <h1 style="margin: 0; font-size: 36px; font-weight: bold; color: #2c3e50;">
                    WrapMy<span style="color: #007bff; font-weight: bold;">Kitchen</span>
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
                    We are pleased to confirm your kitchen installation appointment with <strong>Wrap My Kitchen</strong>. Our professional team is ready to transform your kitchen!
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
                                <strong>� Email</strong>
                            </td>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057; text-align: right;">
                                ${installation.email || 'Not provided'}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057;">
                                <strong>📍 Address</strong>
                            </td>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057; text-align: right;">
                                ${installation.address || 'Not provided'}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057;">
                                <strong>�💰 Project Value</strong>
                            </td>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057; text-align: right;">
                                ${installation.project_amount ? `$${parseInt(installation.project_amount).toLocaleString()}` : 'Contact office for details'}
                            </td>
                        </tr>
                        ${installation.selected_colors ? (() => {
                          try {
                            const colors = typeof installation.selected_colors === 'string' 
                              ? JSON.parse(installation.selected_colors) 
                              : installation.selected_colors;
                            
                            if (Array.isArray(colors) && colors.length > 0) {
                              return `
                        <tr>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057;">
                                <strong>🎨 Selected Colors</strong>
                            </td>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057; text-align: right;">
                                <strong style="color: #2c3e50; font-size: 14px;">${colors.join(', ')}</strong>
                            </td>
                        </tr>`;
                            }
                          } catch (e) {
                            console.error('Error parsing selected_colors:', e);
                          }
                          return '';
                        })() : ''}
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
                    Wrap My Kitchen
                </h4>
                <p style="margin: 8px 0;">Questions about your installation? We're here to help!</p>
                <p style="margin: 8px 0;"><strong>📞 Phone:</strong> (954) 799-6844</p>
                <p style="margin: 8px 0;">
                    <strong>📧 Email:</strong> 
                    <a href="mailto:info@wrapmykitchen.com" style="color: #007bff; text-decoration: none;">
                        info@wrapmykitchen.com
                    </a>
                </p>
                <p style="margin: 8px 0;">
                    <strong>🌐 Website:</strong> 
                    <a href="https://wrapmykitchen.com" style="color: #007bff; text-decoration: none;">
                        www.wrapmykitchen.com
                    </a>
                </p>
                <p style="margin-top: 20px; font-size: 13px; color: #bdc3c7;">
                    © 2025 Wrap My Kitchen. All rights reserved.<br>
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
        
        // Get installer email from database
        const installerData = await storage.getInstallers();
        const installer = installerData.find(inst => 
          installation.assigned_installer && inst.name.toLowerCase() === installation.assigned_installer.toLowerCase()
        );
        
        if (!installer || !installer.email) {
          return res.status(400).json({ 
            message: `No email address found for installer: ${installation.assigned_installer || 'unassigned'}` 
          });
        }
        
        recipient = installer.email;
        subject = `Wrap My Kitchen Installation Assignment - ${formattedDate} - ${installation.name}`;
        emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wrap My Kitchen - Installation Assignment</title>
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa;">
    
    <!-- Main Container Table -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e9ecef;">
        
        <!-- Logo Header -->
        <tr>
            <td style="padding: 30px 20px; text-align: center; background-color: #ffffff; border-bottom: 1px solid #e9ecef;">
                <h1 style="margin: 0; font-size: 36px; font-weight: bold; color: #2c3e50;">
                    WrapMy<span style="color: #fd7e14; font-weight: bold;">Kitchen</span>
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
                    You have been assigned a new kitchen installation for <strong>Wrap My Kitchen </strong>. Please review the details below and prepare accordingly.
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
                                <strong>� Address</strong>
                            </td>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057; text-align: right;">
                                ${installation.address || 'Not provided'}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057;">
                                <strong>�💰 Project Value</strong>
                            </td>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057; text-align: right;">
                                ${installation.project_amount ? `$${parseInt(installation.project_amount).toLocaleString()}` : 'Contact office'}
                            </td>
                        </tr>
                        ${installation.selected_colors ? (() => {
                          try {
                            const colors = typeof installation.selected_colors === 'string' 
                              ? JSON.parse(installation.selected_colors) 
                              : installation.selected_colors;
                            
                            if (Array.isArray(colors) && colors.length > 0) {
                              return `
                        <tr>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057;">
                                <strong>🎨 Selected Colors</strong>
                            </td>
                            <td style="padding: 15px; border-bottom: 1px solid #f1f3f4; color: #495057; text-align: right;">
                                ${colors.join(', ')}
                            </td>
                        </tr>`;
                            }
                          } catch (e) {
                            console.error('Error parsing selected_colors:', e);
                          }
                          return '';
                        })() : ''}
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
                                    <td style="text-align: left; color: white;">- Review project specifications and materials list</td>
                                </tr>
                                <tr>
                                    <td style="text-align: left; color: white;">- Confirm all materials are loaded and ready</td>
                                </tr>
                                <tr>
                                    <td style="text-align: left; color: white;">- Contact customer 24 hours prior to confirm</td>
                                </tr>
                                <tr>
                                    <td style="text-align: left; color: white;">- Verify access and parking availability</td>
                                </tr>
                                <tr>
                                    <td style="text-align: left; color: white;">- Ensure all tools and equipment are prepared</td>
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
                    Wrap My Kitchen Solutions - Installation Team
                </h4>
                <p style="margin: 8px 0;">Questions or support needed? Contact the office immediately.</p>
                <p style="margin: 8px 0;"><strong>📞 Office:</strong> (954) 799-6844</p>
                <p style="margin: 8px 0;">
                    <strong>📧 Email:</strong> 
                    <a href="mailto:info@wrapmykitchen.com" style="color: #fd7e14; text-decoration: none;">
                        info@wrapmykitchen.com
                    </a>
                </p>
                <p style="margin: 8px 0;">
                    <strong>🌐 Website:</strong> 
                    <a href="https://www.wrapmykitchen.com" style="color: #fd7e14; text-decoration: none;">
                        www.wrapmykitchen.com
                    </a>
                </p>
                <p style="margin-top: 20px; font-size: 13px; color: #bdc3c7;">
                    © 2025 Wrap My Kitchen. All rights reserved.<br>
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

  // =================== ADMIN ROUTES ===================
  
  // Admin middleware to check admin role
  const requireAdmin = (req: any, res: any, next: any) => {
    // For now, we'll skip real authentication and just check if admin role is in header
    const userRole = req.headers['x-user-role'];
    if (userRole !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };





  // Admin Settings Management
  app.get("/api/admin/settings", async (req, res) => {
    try {
      const settings = await storage.getAdminSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/admin/settings/:key", async (req, res) => {
    try {
      const { value } = req.body;
      const setting = await storage.updateAdminSetting(req.params.key, value);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  // WMK Colors API
  app.get("/api/wmk-colors", async (req, res) => {
    try {
      const colors = await db.select().from(wmkColors).where(eq(wmkColors.is_active, true)).orderBy(wmkColors.code);
      res.json(colors);
    } catch (error) {
      console.error('Error fetching WMK colors:', error);
      res.status(500).json({ message: "Failed to fetch WMK colors" });
    }
  });

  // Admin Installers Management
  app.get("/api/admin/installers", async (req, res) => {
    try {
      const installers = await storage.getInstallers();
      res.json(installers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch installers" });
    }
  });

  app.post("/api/admin/installers", async (req, res) => {
    try {
      const installerData = req.body;
      const installer = await storage.createInstaller(installerData);
      res.status(201).json(installer);
    } catch (error) {
      res.status(500).json({ message: "Failed to create installer" });
    }
  });

  app.put("/api/admin/installers/:id", async (req, res) => {
    try {
      const updates = req.body;
      const installer = await storage.updateInstaller(req.params.id, updates);
      if (!installer) {
        return res.status(404).json({ message: "Installer not found" });
      }
      res.json(installer);
    } catch (error) {
      res.status(500).json({ message: "Failed to update installer" });
    }
  });

  app.delete("/api/admin/installers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteInstaller(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Installer not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete installer" });
    }
  });



  // Admin Email Templates Management
  app.get("/api/admin/email-templates", async (req, res) => {
    try {
      const templates = await storage.getEmailTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch email templates" });
    }
  });

  app.post("/api/admin/email-templates", async (req, res) => {
    try {
      const templateData = req.body;
      const template = await storage.createEmailTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to create email template" });
    }
  });

  app.put("/api/admin/email-templates/:id", async (req, res) => {
    try {
      const updates = req.body;
      const template = await storage.updateEmailTemplate(req.params.id, updates);
      if (!template) {
        return res.status(404).json({ message: "Email template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to update email template" });
    }
  });

  app.delete("/api/admin/email-templates/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteEmailTemplate(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Email template not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete email template" });
    }
  });

  // Admin SMTP Settings Management (using config file)
  app.get("/api/admin/smtp-settings", async (req, res) => {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const configPath = path.join(process.cwd(), 'server', 'config', 'smtp-config.json');
      
      try {
        const configData = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(configData);
        
        // Transform to match frontend expectations
        const settings = [{
          id: 1,
          name: 'SMTP Configuration',
          host: config.host,
          port: config.port,
          secure: config.secure,
          username: config.auth.user,
          password: config.auth.pass,
          from_email: config.from.email,
          from_name: config.from.name,
          is_active: config.isActive,
          created_at: new Date().toISOString(),
          updated_at: config.lastUpdated
        }];
        
        res.json(settings);
      } catch (error) {
        // If config file doesn't exist, return empty array
        res.json([]);
      }
    } catch (error) {
      console.error('Error reading SMTP config:', error);
      res.status(500).json({ message: "Failed to fetch SMTP settings" });
    }
  });

  app.post("/api/admin/smtp-settings", async (req, res) => {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const configPath = path.join(process.cwd(), 'server', 'config', 'smtp-config.json');
      
      const settingsData = req.body;
      
      // Transform frontend data to config format
      const config = {
        host: settingsData.host,
        port: settingsData.port,
        secure: settingsData.secure,
        auth: {
          user: settingsData.username,
          pass: settingsData.password
        },
        from: {
          email: settingsData.from_email,
          name: settingsData.from_name
        },
        isActive: settingsData.is_active,
        lastUpdated: new Date().toISOString()
      };
      
      // Ensure config directory exists
      const configDir = path.dirname(configPath);
      await fs.mkdir(configDir, { recursive: true });
      
      // Write config file
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
      
      // Return the saved settings in frontend format
      const response = {
        id: 1,
        name: settingsData.name || 'SMTP Configuration',
        ...settingsData
      };
      
      res.status(201).json(response);
    } catch (error) {
      console.error('Error saving SMTP config:', error);
      res.status(500).json({ message: "Failed to create SMTP settings" });
    }
  });

  app.put("/api/admin/smtp-settings/:id", async (req, res) => {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const configPath = path.join(process.cwd(), 'server', 'config', 'smtp-config.json');
      
      const updates = req.body;
      
      // Transform frontend data to config format
      const config = {
        host: updates.host,
        port: updates.port,
        secure: updates.secure,
        auth: {
          user: updates.username,
          pass: updates.password
        },
        from: {
          email: updates.from_email,
          name: updates.from_name
        },
        isActive: updates.is_active,
        lastUpdated: new Date().toISOString()
      };
      
      // Ensure config directory exists
      const configDir = path.dirname(configPath);
      await fs.mkdir(configDir, { recursive: true });
      
      // Write config file
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
      
      // Return the updated settings in frontend format
      const response = {
        id: parseInt(req.params.id),
        name: updates.name || 'SMTP Configuration',
        ...updates
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error updating SMTP config:', error);
      res.status(500).json({ message: "Failed to update SMTP settings" });
    }
  });

  app.post("/api/admin/smtp-settings/test", async (req, res) => {
    try {
      const { test_email, ...smtpConfig } = req.body;
      
      if (!test_email) {
        return res.status(400).json({ message: "Test email address is required" });
      }

      // Save the config temporarily and send test email
      const fs = await import('fs/promises');
      const path = await import('path');
      const configPath = path.join(process.cwd(), 'server', 'config', 'smtp-config.json');
      
      // Update config with test data
      const config = {
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: {
          user: smtpConfig.username,
          pass: smtpConfig.password
        },
        from: {
          email: smtpConfig.from_email,
          name: smtpConfig.from_name
        },
        isActive: true,
        lastUpdated: new Date().toISOString()
      };

      // Ensure config directory exists
      const configDir = path.dirname(configPath);
      await fs.mkdir(configDir, { recursive: true });
      
      // Write config file
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));

      // Reinitialize email service to use new config
      const { emailService } = await import('./email-service');

      // Send test email
      await emailService.sendEmail({
        to: test_email,
        subject: 'SMTP Configuration Test - WMK CRM',
        text: `Hello!

This is a test email to verify your SMTP configuration for the WMK CRM system.

SMTP Settings:
- Host: ${smtpConfig.host}
- Port: ${smtpConfig.port}
- Secure: ${smtpConfig.secure ? 'Yes (SSL)' : 'No (TLS)'}
- From: ${smtpConfig.from_name} <${smtpConfig.from_email}>

If you received this email, your SMTP configuration is working correctly!

Best regards,
WMK CRM System`
      });

      res.json({ message: "Test email sent successfully" });
    } catch (error) {
      console.error('SMTP test error:', error);
      res.status(500).json({ 
        message: "Failed to send test email", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Admin Activity Log
  app.get("/api/admin/activity-logs", async (req, res) => {
    try {
      const { 
        search, 
        entity_type, 
        action, 
        days,
        limit = 50, 
        offset = 0 
      } = req.query;
      
      const activities = await storage.getActivityLogs({
        search: search as string,
        entity_type: entity_type as string,
        action: action as string,
        days: days ? parseInt(days as string) : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });
      
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  // Calendar Events API
  app.get("/api/calendar/events", async (req, res) => {
    try {
      // Prevent caching for this API endpoint
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      const events = await storage.getCalendarEvents();
      res.json(events);
    } catch (error) {
      console.error("Failed to fetch calendar events:", error);
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  // Debug endpoint to see all events with full details
  app.get("/api/calendar/events/debug", async (req, res) => {
    try {
      const events = await storage.getCalendarEvents();
      const debugInfo = events.map(event => ({
        id: event.id,
        title: event.title,
        start_date: event.start_date,
        end_date: event.end_date,
        google_event_id: event.google_event_id,
        year: event.start_date ? new Date(event.start_date).getFullYear() : 'Unknown'
      }));
      res.json({
        total: events.length,
        events: debugInfo,
        yearBreakdown: debugInfo.reduce((acc, event) => {
          const year = event.year;
          acc[year] = (acc[year] || 0) + 1;
          return acc;
        }, {} as Record<string | number, number>)
      });
    } catch (error) {
      console.error("Failed to fetch calendar events debug info:", error);
      res.status(500).json({ message: "Failed to fetch calendar events debug info" });
    }
  });

  // Clear all Google Calendar events from database
  app.delete("/api/calendar/events/google", async (req, res) => {
    try {
      const events = await storage.getCalendarEvents();
      const googleEvents = events.filter(e => e.google_event_id);
      
      let deletedCount = 0;
      for (const event of googleEvents) {
        const success = await storage.deleteCalendarEvent(event.id.toString());
        if (success) deletedCount++;
      }
      
      res.json({
        message: `Cleared ${deletedCount} Google Calendar events`,
        totalEvents: events.length,
        deletedCount
      });
    } catch (error) {
      console.error("Failed to clear Google Calendar events:", error);
      res.status(500).json({ message: "Failed to clear Google Calendar events" });
    }
  });

  app.post("/api/calendar/events", async (req, res) => {
    try {
      const eventData = insertCalendarEventSchema.parse(req.body);
      const event = await storage.createCalendarEvent(eventData);

      // Sync to Google Calendar if credentials are available
      try {
        console.log('Created event object:', event);
        
        // Get start and end times, providing defaults if needed
        const startTime = event.start_time || event.start_date;
        let endTime = event.end_time || event.end_date;
        
        // If no end time provided, default to 1 hour after start time
        if (!endTime && startTime) {
          const startDate = new Date(startTime);
          startDate.setHours(startDate.getHours() + 1);
          endTime = startDate;
          
          // Update the database with the calculated end time
          await storage.updateCalendarEvent(event.id!, { 
            end_time: endTime.toISOString(),
            end_date: endTime
          });
        }
        
        console.log('Attempting Google Calendar sync with:', {
          title: event.title,
          start: startTime,
          end: endTime
        });

        const googleEventId = await googleCalendarService.createEvent({
          title: event.title,
          description: event.description || '',
          start: startTime,
          end: endTime,
          location: event.location || ''
        });

        if (googleEventId) {
          // Update the event with Google Calendar ID
          await storage.updateCalendarEvent(event.id!, { 
            google_event_id: googleEventId 
          });
          console.log('✅ Event synced to Google Calendar:', googleEventId);
        }
      } catch (googleError) {
        console.warn('⚠️  Failed to sync to Google Calendar:', googleError);
        // Continue with local event creation even if Google sync fails
      }

      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      console.error("Failed to create calendar event:", error);
      res.status(500).json({ message: "Failed to create calendar event" });
    }
  });

  app.put("/api/calendar/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = updateCalendarEventSchema.parse(req.body);
      
      // Get the existing event first to check for Google Calendar ID
      const existingEvent = await storage.getCalendarEvent(id);
      const event = await storage.updateCalendarEvent(id, updates);
      
      if (!event) {
        return res.status(404).json({ message: "Calendar event not found" });
      }

      // Sync to Google Calendar if there's a Google event ID
      if (existingEvent?.google_event_id) {
        try {
          await googleCalendarService.updateEvent(existingEvent.google_event_id, {
            title: event.title,
            description: event.description || '',
            start: event.start_time,
            end: event.end_time,
            location: event.location || ''
          });
          console.log('✅ Event updated in Google Calendar:', existingEvent.google_event_id);
        } catch (googleError) {
          console.warn('⚠️  Failed to update Google Calendar event:', googleError);
        }
      }
      
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      console.error("Failed to update calendar event:", error);
      res.status(500).json({ message: "Failed to update calendar event" });
    }
  });

  app.delete("/api/calendar/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get the event first to check for Google Calendar ID BEFORE deleting it
      const existingEvent = await storage.getCalendarEvent(id);
      console.log('🗑️  Deleting event:', { id, existingEvent });
      
      if (!existingEvent) {
        return res.status(404).json({ message: "Calendar event not found" });
      }
      
      const success = await storage.deleteCalendarEvent(id);
      console.log('📋 Delete result from database:', success);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to delete calendar event from database" });
      }

      // Delete from Google Calendar if there's a Google event ID
      if (existingEvent.google_event_id) {
        console.log('🔄 Attempting to delete from Google Calendar:', existingEvent.google_event_id);
        try {
          const googleDeleteResult = await googleCalendarService.deleteEvent(existingEvent.google_event_id);
          console.log('✅ Event deleted from Google Calendar:', existingEvent.google_event_id, 'Result:', googleDeleteResult);
        } catch (googleError) {
          console.warn('⚠️  Failed to delete Google Calendar event:', googleError);
        }
      } else {
        console.log('ℹ️  No Google Calendar ID found, skipping Google Calendar deletion');
      }
      
      res.json({ message: "Calendar event deleted successfully" });
    } catch (error) {
      console.error("Failed to delete calendar event:", error);
      res.status(500).json({ message: "Failed to delete calendar event" });
    }
  });

  // Google Calendar sync endpoints
  app.post("/api/calendar/sync/test", async (req, res) => {
    try {
      const result = await googleCalendarService.testConnection();
      res.json({ 
        connected: result.success,
        message: result.message
      });
    } catch (error) {
      console.error("Failed to test Google Calendar connection:", error);
      res.status(500).json({ 
        connected: false, 
        message: "Failed to test Google Calendar connection",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/calendar/sync/import", async (req, res) => {
    try {
      const { timeMin, timeMax } = req.body;
      const googleEvents = await googleCalendarService.importEvents(timeMin, timeMax);
      
      // Import Google Calendar events to local database
      let importedCount = 0;
      for (const googleEvent of googleEvents) {
        if (googleEvent.summary && googleEvent.start && googleEvent.end) {
          try {
            await storage.createCalendarEvent({
              title: googleEvent.summary,
              description: googleEvent.description || null,
              start_time: googleEvent.start.dateTime || googleEvent.start.date,
              end_time: googleEvent.end.dateTime || googleEvent.end.date,
              location: googleEvent.location || null,
              type: 'meeting',
              assigned_to: 'Kim',
              google_event_id: googleEvent.id
            });
            importedCount++;
          } catch (err) {
            console.warn('Failed to import event:', googleEvent.summary, err);
          }
        }
      }
      
      res.json({ 
        message: `Successfully imported ${importedCount} events from Google Calendar`,
        importedCount,
        totalGoogleEvents: googleEvents.length
      });
    } catch (error) {
      console.error("Failed to import Google Calendar events:", error);
      res.status(500).json({ message: "Failed to import Google Calendar events" });
    }
  });

  // Get active users for assignment dropdowns
  app.get("/api/users/active", async (req, res) => {
    try {
      const users = await storage.getUsers();
      // Filter for active users and return minimal data needed for assignments
      const activeUsers = users
        .filter(user => user.is_active)
        .map(user => ({
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          role: user.role
        }));
      res.json(activeUsers);
    } catch (error) {
      console.error('Error fetching active users:', error);
      res.status(500).json({ message: "Failed to fetch active users" });
    }
  });

  // Admin User Management
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users.map(user => ({ ...user, password: undefined }))); // Don't send passwords
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get specific user by ID
  app.get("/api/admin/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password in response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/admin/users", async (req, res) => {
    try {
      const { username, password, full_name, email, role, permissions, is_active } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const newUser = await storage.createUser({
        username: username.toLowerCase(),
        password,
        full_name: full_name || username,
        email: email || null,
        role: role || 'sales_rep',
        permissions: permissions || [],
        is_active: is_active !== undefined ? is_active : true
      });

      // Log activity
      await storage.logActivity(
        '1', // TODO: Get actual user ID from session/auth
        'CREATE_USER',
        'USER',
        newUser.id.toString(),
        `Created user: ${username} with role: ${role}`
      );

      res.json(newUser);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/admin/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      console.log('Update user request:', { id, updates });
      
      const updatedUser = await storage.updateUser(id, updates);
      if (!updatedUser) {
        console.log('User not found:', id);
        return res.status(404).json({ message: "User not found" });
      }

      // Log activity
      await storage.logActivity(
        '1', // TODO: Get actual user ID from session/auth
        'UPDATE_USER',
        'USER',
        id,
        `Updated user: ${updatedUser.username} - Changes: ${Object.keys(updates).join(', ')}`
      );
      
      console.log('User updated successfully:', updatedUser);
      res.json(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get user info before deletion for logging
      const user = await storage.getUser(id);
      const deleted = await storage.deleteUser(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }

      // Log activity
      await storage.logActivity(
        '1', // TODO: Get actual user ID from session/auth
        'DELETE_USER',
        'USER',
        id,
        `Deleted user: ${user?.username || 'unknown'}`
      );
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Reset user password
  app.post("/api/admin/users/:id/reset-password", async (req, res) => {
    try {
      const { id } = req.params;
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }
      
      const updatedUser = await storage.updateUser(id, { password });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "Password reset successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Admin Dashboard Stats
  app.get("/api/admin/dashboard-stats", async (req, res) => {
    try {
      const users = await storage.getUsers();
      const installers = await storage.getInstallers();
      const leads = await storage.getLeads();
      const emailTemplates = await storage.getEmailTemplates();
      const leadOrigins = await storage.getLeadOrigins();
      
      const stats = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.role === 'sales_rep' && u.is_active !== false).length,
        adminUsers: users.filter(u => u.role === 'admin').length,
        totalInstallers: installers.length,
        activeInstallers: installers.filter(i => i.status === 'active').length,
        totalLeads: leads.length,
        totalEmailTemplates: emailTemplates.length,
        activeEmailTemplates: emailTemplates.filter(t => t.is_active).length,
        totalLeadOrigins: leadOrigins.length,
        activeLeadOrigins: leadOrigins.filter(o => o.is_active).length
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin dashboard stats" });
    }
  });

  // Repair Requests endpoints
  app.get("/api/repair-requests", async (req, res) => {
    try {
      const { username } = req.query;
      console.log(`[DEBUG] Repair Requests API received username: '${username}'`);

      let requests = await db.select().from(repairRequests).orderBy(desc(repairRequests.created_at));

      // Apply role-based filtering if username is provided
      if (username) {
        const user = await storage.getUserByUsername(username as string);
        console.log(`[DEBUG] Repair Requests - Found user:`, user ? { username: user.username, role: user.role } : 'null');

        if (user && user.role === 'commercial_sales') {
          console.log(`[DEBUG] Repair Requests - Applied Commercial filter for commercial_sales user`);
          requests = requests.filter((request: any) => request.project_type === 'Commercial');
        }
      }

      res.json(requests);
    } catch (error) {
      console.error('Error fetching repair requests:', error);
      res.status(500).json({ error: 'Failed to fetch repair requests' });
    }
  });

  app.post("/api/repair-requests", async (req, res) => {
    try {
      const validatedData = insertRepairRequestSchema.parse(req.body);
      
      const [newRequest] = await db.insert(repairRequests).values({
        ...validatedData,
        date_reported: new Date(validatedData.date_reported || new Date()),
      });

      res.json({ id: newRequest.insertId, ...validatedData });
    } catch (error) {
      console.error('Error creating repair request:', error);
      res.status(400).json({ error: 'Failed to create repair request' });
    }
  });

  app.put("/api/repair-requests/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      await db.update(repairRequests)
        .set({
          ...updates,
          updated_at: new Date(),
        })
        .where(eq(repairRequests.id, parseInt(id)));

      res.json({ message: 'Repair request updated successfully' });
    } catch (error) {
      console.error('Error updating repair request:', error);
      res.status(500).json({ error: 'Failed to update repair request' });
    }
  });

  app.delete("/api/repair-requests/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      await db.delete(repairRequests).where(eq(repairRequests.id, parseInt(id)));
      
      res.json({ message: 'Repair request deleted successfully' });
    } catch (error) {
      console.error('Error deleting repair request:', error);
      res.status(500).json({ error: 'Failed to delete repair request' });
    }
  });

  // Completed Projects Search endpoint
  app.get("/api/completed-projects/search", async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.json([]);
      }
      
      const searchTerm = q.trim();
      
      // Search for leads that are marked as "Sold" and have installation_date (completed projects)
      const results = await db.select()
        .from(leadsTable)
        .where(
          and(
            eq(leadsTable.remarks, 'Sold'),
            or(
              like(leadsTable.email, `%${searchTerm}%`),
              like(leadsTable.phone, `%${searchTerm}%`),
              like(leadsTable.name, `%${searchTerm}%`)
            )
          )
        )
        .orderBy(desc(leadsTable.installation_date))
        .limit(10);
      
      res.json(results);
    } catch (error) {
      console.error('Error searching completed projects:', error);
      res.status(500).json({ error: 'Failed to search completed projects' });
    }
  });

  // Google Calendar OAuth routes
  app.get("/auth/google", (req, res) => {
    try {
      console.log('📅 Google auth route called');
      console.log('📅 GoogleCalendarService:', !!googleCalendarService);
      console.log('📅 getAuthUrl method:', typeof googleCalendarService.getAuthUrl);
      
      const authUrl = googleCalendarService.getAuthUrl();
      console.log('📅 Generated auth URL:', authUrl);
      res.redirect(authUrl);
    } catch (error) {
      console.error('❌ Error generating auth URL:', error);
      res.status(500).json({ error: 'Failed to generate auth URL', details: error.message });
    }
  });

  app.get("/auth/google/callback", async (req, res) => {
    try {
      const { code } = req.query;
      
      if (!code) {
        return res.status(400).json({ error: 'Authorization code not provided' });
      }

      const tokens = await googleCalendarService.getAccessToken(code as string);
      
      // Redirect to dashboard with success message
      res.redirect('/dashboard?auth=success');
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      res.redirect('/dashboard?auth=error');
    }
  });

  app.post("/auth/google/callback", async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: 'Authorization code not provided' });
      }

      console.log('📅 Exchanging code for tokens...');
      const tokens = await googleCalendarService.getAccessToken(code);
      console.log('📅 Successfully obtained tokens');
      
      res.json({ success: true, message: 'Successfully authenticated with Google Calendar' });
    } catch (error) {
      console.error('❌ Error exchanging code for tokens:', error);
      res.status(500).json({ error: 'Failed to exchange code for tokens', details: error.message });
    }
  });

  app.get("/api/calendar/auth/status", (req, res) => {
    try {
      const isAuthenticated = googleCalendarService.isAuthenticated();
      res.json({ authenticated: isAuthenticated });
    } catch (error) {
      console.error('Error checking auth status:', error);
      res.status(500).json({ error: 'Failed to check auth status' });
    }
  });

  // Clear Google Calendar authentication tokens
  app.post("/api/calendar/auth/clear", (req, res) => {
    try {
      // This will be implemented in the Google Calendar service
      if (typeof googleCalendarService.clearTokens === 'function') {
        googleCalendarService.clearTokens();
        console.log('🗑️ Cleared Google Calendar authentication tokens');
        res.json({ success: true, message: 'Authentication tokens cleared' });
      } else {
        res.status(500).json({ error: 'Clear tokens function not available' });
      }
    } catch (error) {
      console.error('Error clearing auth tokens:', error);
      res.status(500).json({ error: 'Failed to clear auth tokens' });
    }
  });

  // Sync Google Calendar events to business calendar
  app.post("/api/calendar/sync", async (req, res) => {
    try {
      if (!googleCalendarService.isAuthenticated()) {
        return res.status(401).json({ error: 'Google Calendar not authenticated' });
      }

      const forceRefresh = req.query.force === 'true';
      console.log('🔄 Starting Google Calendar sync...', forceRefresh ? '(FORCE REFRESH)' : '');

      // If force refresh, clear existing Google Calendar events first
      if (forceRefresh) {
        console.log('🗑️  Clearing existing Google Calendar events...');
        const existingEvents = await storage.getCalendarEvents();
        const googleEvents = existingEvents.filter(e => e.google_event_id !== null);
        
        for (const event of googleEvents) {
          try {
            await storage.deleteCalendarEvent(event.id);
            console.log(`🗑️  Deleted existing event: "${event.title}"`);
          } catch (error) {
            console.error(`❌ Error deleting event ${event.id}:`, error);
          }
        }
        console.log(`🗑️  Cleared ${googleEvents.length} existing Google Calendar events`);
      }
      
      // Get events from Google Calendar for current year (2025)
      const currentYear = new Date().getFullYear();
      const startDate = `${currentYear}-01-01T00:00:00.000Z`;
      const endDate = `${currentYear}-12-31T23:59:59.999Z`;
      
      console.log(`📅 Fetching Google Calendar events for ${currentYear} (${startDate} to ${endDate})`);
      const googleEvents = await googleCalendarService.importEvents(startDate, endDate);
      console.log(`📅 Found ${googleEvents.length} events in Google Calendar for ${currentYear}`);

      let syncedCount = 0;
      let skippedCount = 0;
      const errors = [];

      // Get existing events to avoid duplicates
      const existingEvents = await storage.getCalendarEvents();
      const existingGoogleIds = new Set(
        existingEvents
          .map(e => e.google_event_id)
          .filter(id => id !== null)
      );

      for (const googleEvent of googleEvents) {
        try {
          // Skip if we already have this event (but show debug info)
          if (existingGoogleIds.has(googleEvent.id)) {
            console.log(`⏭️  Skipping existing event: "${googleEvent.summary}" (ID: ${googleEvent.id})`);
            skippedCount++;
            continue;
          }

          // Convert Google Calendar event to our format
          console.log('\n📅 Processing Google Event:');
          console.log('- Title:', googleEvent.title);
          console.log('- Start (raw):', googleEvent.start);
          console.log('- End (raw):', googleEvent.end);
          
          const convertGoogleDateTime = (googleDateTime: any) => {
            if (!googleDateTime) {
              console.log('❌ No datetime provided');
              return null;
            }
            
            // Google Calendar service already extracts the datetime string
            if (typeof googleDateTime === 'string') {
              const date = new Date(googleDateTime);
              console.log(`🕐 String conversion: ${googleDateTime} -> ${date}`);
              return date;
            }
            
            // For events with specific time (dateTime field) - fallback
            if (googleDateTime.dateTime) {
              const date = new Date(googleDateTime.dateTime);
              console.log(`🕐 DateTime conversion: ${googleDateTime.dateTime} -> ${date}`);
              return date;
            }
            
            // For all-day events (date field only) - fallback
            if (googleDateTime.date) {
              const date = new Date(googleDateTime.date + 'T00:00:00');
              console.log(`📅 Date conversion: ${googleDateTime.date} -> ${date}`);
              return date;
            }
            
            console.log('❌ No valid date/dateTime found');
            return null;
          };

          const startDate = convertGoogleDateTime(googleEvent.start);
          const endDate = convertGoogleDateTime(googleEvent.end) || startDate;
          
          console.log('✅ Final dates:');
          console.log('- Start:', startDate);
          console.log('- End:', endDate);

          const localEvent = {
            title: googleEvent.title,
            description: googleEvent.description || '',
            start_date: startDate,
            end_date: endDate,
            location: googleEvent.location || '',
            type: 'imported' as const,
            google_event_id: googleEvent.id,
            all_day: !googleEvent.start?.includes('T'), // All-day if no time component
            color: googleEvent.color || '#6B7280' // Use Google Calendar color or default gray
          };

          // Create event in local calendar
          await storage.createCalendarEvent(localEvent);
          syncedCount++;
          console.log(`✅ Synced event: ${localEvent.title}`);

        } catch (eventError) {
          console.error(`❌ Failed to sync event ${googleEvent.title}:`, eventError);
          errors.push(`Failed to sync "${googleEvent.title || 'Untitled'}": ${eventError.message}`);
        }
      }

      const result = {
        success: true,
        synced: syncedCount,
        skipped: skippedCount,
        total: googleEvents.length,
        errors: errors.length > 0 ? errors : undefined
      };

      console.log(`🎉 Sync complete: ${syncedCount} synced, ${skippedCount} skipped`);
      res.json(result);

    } catch (error: any) {
      console.error('❌ Google Calendar sync failed:', error);
      
      // Check for specific authentication errors
      if (error.message?.includes('invalid_grant') || 
          error.message?.includes('invalid_token') ||
          error.message?.includes('unauthorized')) {
        console.error('🔑 Authentication error detected - tokens may be expired');
        res.status(401).json({ 
          error: 'Authentication expired', 
          details: 'Google Calendar authentication has expired. Please re-authenticate.',
          requiresAuth: true
        });
      } else {
        res.status(500).json({ 
          error: 'Sync failed', 
          details: error.message 
        });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}