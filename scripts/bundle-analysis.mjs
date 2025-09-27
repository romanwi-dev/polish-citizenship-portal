#!/usr/bin/env node

/**
 * Bundle Size Analysis Script
 * Analyzes current bundle size and identifies optimization opportunities
 */

import fs from 'fs/promises';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

async function analyzeBundleSize() {
  console.log('📊 BUNDLE SIZE ANALYSIS');
  console.log('=====================================');
  
  try {
    const distPath = 'dist/public';
    
    try {
      const stats = await fs.stat(distPath);
      if (!stats.isDirectory()) {
        console.log('⚠️  Build directory not found. Run `npm run build` first.');
        process.exit(1);
      }
    } catch (error) {
      console.log('⚠️  Build directory not found. Run `npm run build` first.');
      process.exit(1);
    }
    
    const files = await analyzeDirectory(distPath);
    
    let totalSize = 0;
    let jsSize = 0;
    let cssSize = 0;
    let imageSize = 0;
    
    console.log('\n📁 FILES BY TYPE:');
    console.log('=====================================');
    
    const filesByType = {
      js: [],
      css: [],
      images: [],
      fonts: [],
      other: []
    };
    
    for (const file of files) {
      const size = file.size;
      totalSize += size;
      
      const ext = path.extname(file.name).toLowerCase();
      const sizeKB = Math.round(size / 1024);
      
      if (['.js', '.mjs'].includes(ext)) {
        jsSize += size;
        filesByType.js.push({ ...file, sizeKB });
      } else if (ext === '.css') {
        cssSize += size;
        filesByType.css.push({ ...file, sizeKB });
      } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif'].includes(ext)) {
        imageSize += size;
        filesByType.images.push({ ...file, sizeKB });
      } else if (['.woff', '.woff2', '.ttf', '.eot'].includes(ext)) {
        filesByType.fonts.push({ ...file, sizeKB });
      } else {
        filesByType.other.push({ ...file, sizeKB });
      }
    }
    
    // Sort by size and show top files
    for (const [type, fileList] of Object.entries(filesByType)) {
      if (fileList.length > 0) {
        fileList.sort((a, b) => b.size - a.size);
        console.log(`\n📄 ${type.toUpperCase()} FILES:`);
        fileList.slice(0, 5).forEach(file => {
          console.log(`  ${file.name}: ${file.sizeKB}KB`);
        });
        if (fileList.length > 5) {
          console.log(`  ... and ${fileList.length - 5} more files`);
        }
      }
    }
    
    console.log('\n📈 SIZE BREAKDOWN:');
    console.log('=====================================');
    console.log(`📜 JavaScript: ${Math.round(jsSize / 1024)}KB (${Math.round(jsSize/totalSize*100)}%)`);
    console.log(`🎨 CSS: ${Math.round(cssSize / 1024)}KB (${Math.round(cssSize/totalSize*100)}%)`);
    console.log(`🖼️  Images: ${Math.round(imageSize / 1024)}KB (${Math.round(imageSize/totalSize*100)}%)`);
    console.log(`📦 Total: ${Math.round(totalSize / 1024)}KB`);
    
    // Recommendations
    console.log('\n💡 OPTIMIZATION RECOMMENDATIONS:');
    console.log('=====================================');
    
    if (jsSize > 200 * 1024) {
      console.log('⚠️  JavaScript bundle > 200KB - consider code splitting');
    } else {
      console.log('✅ JavaScript bundle size is acceptable');
    }
    
    if (cssSize > 50 * 1024) {
      console.log('⚠️  CSS bundle > 50KB - consider unused CSS removal');
    } else {
      console.log('✅ CSS bundle size is acceptable');
    }
    
    if (imageSize > 1024 * 1024) {
      console.log('⚠️  Images > 1MB - consider WebP/AVIF conversion');
    } else {
      console.log('✅ Image sizes are acceptable');
    }
    
    // Gzip estimates (typical compression is ~70-80%)
    const estimatedGzipped = Math.round(totalSize * 0.25 / 1024);
    console.log(`\n📦 Estimated Gzipped: ~${estimatedGzipped}KB`);
    
    return {
      totalSize: Math.round(totalSize / 1024),
      jsSize: Math.round(jsSize / 1024),
      cssSize: Math.round(cssSize / 1024),
      imageSize: Math.round(imageSize / 1024),
      estimatedGzipped,
      files: files.length
    };
    
  } catch (error) {
    console.error('❌ ERROR analyzing bundle:', error.message);
    process.exit(1);
  }
}

async function analyzeDirectory(dirPath) {
  const files = [];
  
  async function walkDir(currentPath, relativePath = '') {
    const entries = await fs.readdir(currentPath);
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry);
      const relPath = path.join(relativePath, entry);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        await walkDir(fullPath, relPath);
      } else {
        files.push({
          name: relPath,
          size: stat.size,
          path: fullPath
        });
      }
    }
  }
  
  await walkDir(dirPath);
  return files;
}

analyzeBundleSize().then(results => {
  console.log('\n📋 BUNDLE ANALYSIS SUMMARY:');
  console.log(JSON.stringify(results, null, 2));
  
  // Exit with error if bundle is too large
  const isOptimal = results.jsSize <= 200 && results.totalSize <= 500;
  process.exit(isOptimal ? 0 : 1);
});