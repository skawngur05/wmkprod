// Entry point for cPanel Node.js hosting
// This handles the async module loading properly

// Set production environment
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Import and start the application
(async () => {
  try {
    // Use dynamic import for the ES module
    await import('./index.js');
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
})();
