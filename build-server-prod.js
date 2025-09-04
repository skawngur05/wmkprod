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
    outfile: join(__dirname, 'index.js'), // Output directly to root
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
      'node-cron'
    ],
    format: 'esm',
    banner: {
      js: `
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
`
    }
  });
  
  console.log('Production server built successfully!');
  console.log(`Output: ${join(__dirname, 'index.js')}`);
} catch (error) {
  console.error('Production server build failed:', error);
  process.exit(1);
}
