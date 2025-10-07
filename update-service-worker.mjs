import fs from 'fs';
import path from 'path';

// Generate timestamp for cache busting
const timestamp = Date.now();
console.log('🔄 Updating service worker with build timestamp:', timestamp);

// Path to the built service worker
const serviceWorkerPath = path.join(process.cwd(), 'dist', 'public', 'service-worker.js');

// Check if service worker exists
if (fs.existsSync(serviceWorkerPath)) {
  // Read the service worker
  let content = fs.readFileSync(serviceWorkerPath, 'utf8');
  
  // Replace the placeholder with actual timestamp
  content = content.replace('{{BUILD_TIMESTAMP}}', timestamp.toString());
  
  // Write back to file
  fs.writeFileSync(serviceWorkerPath, content);
  
  console.log('✅ Service worker updated with cache version:', timestamp);
} else {
  console.log('⚠️  Service worker not found at:', serviceWorkerPath);
  console.log('📁 Available files in dist/public:');
  try {
    const files = fs.readdirSync(path.join(process.cwd(), 'dist', 'public'));
    console.log(files);
  } catch (error) {
    console.log('❌ Could not read dist/public directory');
  }
}
