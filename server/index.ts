import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { trackingScheduler } from "./tracking-scheduler";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables
dotenv.config();

// Conditional imports for development vs production
let setupVite: ((app: express.Express, server: any) => Promise<void>) | undefined;
let serveStatic: (app: express.Express) => void;
let log: (message: string, source?: string) => void;

// Production logging function
log = (message: string, source = "express") => {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
};

// Production static file serving
serveStatic = (app: express.Express) => {
  // Check if we're running from the dist directory
  const currentDir = process.cwd();
  const isInDistDir = currentDir.endsWith("dist") || currentDir.endsWith("dist\\");
  
  const distPath = isInDistDir 
    ? path.resolve(currentDir, "public")
    : path.resolve(currentDir, "dist", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Add cache-busting headers for static files
  app.use(express.static(distPath, {
    setHeaders: (res, path) => {
      // Set cache headers based on file type
      if (path.endsWith('.html')) {
        // Don't cache HTML files
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      } else if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
        // In production: Cache static assets for 1 hour but allow revalidation
        // In development: More aggressive cache busting
        const cacheControl = process.env.NODE_ENV === 'production' 
          ? 'public, max-age=3600, must-revalidate'
          : 'no-cache, must-revalidate';
        res.setHeader('Cache-Control', cacheControl);
      }
    }
  }));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    // Add cache-busting headers to the main HTML file
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.resolve(distPath, "index.html"));
  });
};

// Function to load Vite in development
async function loadViteInDevelopment() {
  if (process.env.NODE_ENV === "development") {
    try {
      const viteModule = await import("./vite.js");
      setupVite = viteModule.setupVite;
      serveStatic = viteModule.serveStatic;
      log = viteModule.log;
    } catch (error) {
      console.log("Vite not available, using production static serving");
    }
  }
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Development cache-busting middleware
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    // Add cache-busting headers for all responses in development
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });
}

// Debugging middleware (after body parsing)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body ? `Body: ${JSON.stringify(req.body)}` : 'No body');
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Load Vite conditionally in development
  await loadViteInDevelopment();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development" && setupVite) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 3001 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '3001', 10);
  
  const serverInstance = server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // Start the automatic USPS tracking scheduler only if database is properly configured
    if (process.env.DISABLE_TRACKING !== 'true') {
      try {
        trackingScheduler.start();
      } catch (error) {
        log(`Failed to start tracking scheduler: ${error instanceof Error ? error.message : 'Unknown error'}`, 'warning');
      }
    } else {
      log('Tracking scheduler disabled via DISABLE_TRACKING environment variable');
    }
  });

  // Graceful shutdown handling for cPanel
  const gracefulShutdown = (signal: string) => {
    log(`Received ${signal}. Shutting down gracefully...`);
    
    // Stop the tracking scheduler
    trackingScheduler.stop();
    
    // Close the server
    serverInstance.close((err) => {
      if (err) {
        log(`Error during server shutdown: ${err.message}`);
        process.exit(1);
      }
      log('Server closed successfully');
      process.exit(0);
    });
    
    // Force exit after 10 seconds if graceful shutdown fails
    setTimeout(() => {
      log('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  // Handle process termination signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // cPanel specific
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    log(`Uncaught Exception: ${err.message}`);
    gracefulShutdown('uncaughtException');
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    log(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    gracefulShutdown('unhandledRejection');
  });
})();
