#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('🔨 Building project...');

try {
  // Step 1: Build client with Vite
  console.log('📦 Building client...');
  execSync('vite build', { cwd: rootDir, stdio: 'inherit' });

  // Step 2: Build server with esbuild
  console.log('📦 Building server...');
  execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { 
    cwd: rootDir, 
    stdio: 'inherit' 
  });

  // Step 3: Copy rules.json to dist
  console.log('📋 Copying HAC rules.json...');
  const srcPath = path.join(rootDir, 'server/hac/rules.json');
  const destPath = path.join(rootDir, 'dist/rules.json');
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log('✅ rules.json copied to dist/');
  } else {
    console.warn('⚠️ Warning: rules.json not found at server/hac/rules.json');
  }

  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
