import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if we're in the right directory
const serverPath = join(__dirname, 'server/index.ts');
if (!fs.existsSync(serverPath)) {
  console.error(`Error: Cannot find server/index.ts at ${serverPath}`);
  console.error(`Current directory: ${__dirname}`);
  console.error(`Make sure you're running this from the project root directory.`);
  process.exit(1);
}

try {
  await build({
    entryPoints: [serverPath],
    bundle: true,
    platform: 'node',
    target: 'node18',
    outfile: join(__dirname, 'dist/index.js'), // Output to dist folder for deployment
    external: [
      'sqlite3',
      'mysql2',
      'pg',
      'pg-hstore', 
      'better-sqlite3',
      'lightningcss',
      '@babel/preset-typescript',
      'drizzle-orm',
      'express',
      'nodemailer',
      'puppeteer',
      'cheerio',
      'node-cron',
      'dotenv',
      'fs',
      'path',
      'url',
      'module',
      'googleapis',
      'fs/promises'
    ],
    format: 'esm'
  });
  
  // Copy Google Calendar credentials to the right locations
  const credentialsFileName = 'client_secret_1057574229248-gfrdb4give2mt8tpr6v09tl385reeafd.apps.googleusercontent.com.json';
  const sourcePath = join(__dirname, credentialsFileName);
  const distPath = join(__dirname, 'dist', credentialsFileName);
  
  if (fs.existsSync(sourcePath)) {
    console.log('📋 Copying Google Calendar credentials...');
    fs.copyFileSync(sourcePath, distPath);
    console.log('✅ Credentials copied to dist folder');
  } else {
    console.warn('⚠️  Google Calendar credentials not found - calendar features may not work');
  }
  
  console.log('Production server built successfully!');
  console.log(`Output: ${join(__dirname, 'dist/index.js')}`);
} catch (error) {
  console.error('Production server build failed:', error);
  process.exit(1);
}
