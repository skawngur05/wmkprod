// Script to copy Google Calendar credentials to the correct location for production
const fs = require('fs');
const path = require('path');

const sourceFile = 'client_secret_1057574229248-gfrdb4give2mt8tpr6v09tl385reeafd.apps.googleusercontent.com.json';
const sourcePath = path.join(__dirname, sourceFile);
const distPath = path.join(__dirname, 'dist', sourceFile);

console.log('📋 Copying Google Calendar credentials...');
console.log('From:', sourcePath);
console.log('To:', distPath);

if (fs.existsSync(sourcePath)) {
  // Copy to dist folder
  fs.copyFileSync(sourcePath, distPath);
  console.log('✅ Credentials copied to dist folder');
  
  // Also copy to current directory (backup)
  console.log('✅ Credentials available in both locations');
} else {
  console.warn('⚠️  Source credentials file not found:', sourcePath);
}
