import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Build the server for production
await build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outdir: 'dist',
  external: [
    // External dependencies that should not be bundled
    'express',
    'mysql2',
    'postgres',
    'drizzle-orm',
    'nodemailer',
    'googleapis',
    'ws',
    'passport',
    'passport-local',
    'express-session',
    'memorystore',
    'dotenv',
    'node-fetch',
    'zod',
    'drizzle-zod',
    'zod-validation-error',
    // Development dependencies that should be excluded
    'vite',
    '@vitejs/plugin-react',
    'tsx',
    'typescript',
    'esbuild',
    '@replit/vite-plugin-runtime-error-modal',
    '@replit/vite-plugin-cartographer',
  ],
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  banner: {
    js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);'
  }
});

// Copy the start.js file to the dist directory
const startJsSource = path.join(__dirname, 'server', 'start.js');
const startJsDest = path.join(__dirname, 'dist', 'start.js');

try {
  fs.copyFileSync(startJsSource, startJsDest);
  console.log('✓ start.js copied to dist directory');
} catch (error) {
  console.warn('⚠ Could not copy start.js:', error.message);
}

console.log('✓ Server built successfully');
