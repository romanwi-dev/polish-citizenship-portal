#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Copy HAC rules.json to dist directory for production deployment
const srcPath = path.join(__dirname, 'server/hac/rules.json');
const destPath = path.join(__dirname, 'dist/rules.json');

console.log('📋 Copying HAC rules.json for deployment...');

if (fs.existsSync(srcPath)) {
  // Ensure dist directory exists
  const distDir = path.dirname(destPath);
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  fs.copyFileSync(srcPath, destPath);
  console.log('✅ rules.json copied to dist/');
  process.exit(0);
} else {
  console.error('❌ Error: rules.json not found at server/hac/rules.json');
  process.exit(1);
}
