#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('📋 Post-build: Copying HAC data files...');

const filesToCopy = [
  { src: 'server/hac/rules.json', dest: 'dist/rules.json', name: 'rules.json' },
  { src: 'server/hac/mockCase.json', dest: 'dist/mockCase.json', name: 'mockCase.json' }
];

for (const file of filesToCopy) {
  const srcPath = path.join(rootDir, file.src);
  const destPath = path.join(rootDir, file.dest);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ ${file.name} copied to dist/`);
  } else {
    console.error(`❌ Error: ${file.name} not found at ${file.src}`);
    process.exit(1);
  }
}

console.log('✅ Post-build completed!');
