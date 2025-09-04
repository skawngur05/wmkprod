import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if shared folder exists
const sharedPath = join(__dirname, 'shared/schema.ts');
if (!fs.existsSync(sharedPath)) {
  console.error(`Error: Cannot find shared/schema.ts at ${sharedPath}`);
  console.error('Make sure the shared folder is uploaded to production.');
  process.exit(1);
}

console.log(`Found shared schema at: ${sharedPath}`);

try {
  await build({
    entryPoints: [join(__dirname, 'server/index.ts')],
    bundle: true,
    platform: 'node',
    target: 'node18',
    outfile: join(__dirname, 'dist/index.js'),
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
    format: 'cjs', // Use CommonJS instead of ESM
    resolveExtensions: ['.ts', '.js', '.json'],
    alias: {
      '@shared/schema': sharedPath
    },
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    loader: {
      '.ts': 'ts'
    }
  });
  
  console.log('Server built successfully with CommonJS format!');
} catch (error) {
  console.error('Server build failed:', error);
  process.exit(1);
}
