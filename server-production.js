const express = require('express');
const path = require('path');

// Import your existing routes
const { createServer } = require('./dist/server/index.js');

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from the built client
app.use(express.static(path.join(__dirname, 'dist/public')));

// API routes - prefix all your existing API routes with /api
app.use('/api', createServer());

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  // Don't redirect API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Production server running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'dist/public')}`);
  console.log(`🔗 API routes available at: /api/*`);
});
