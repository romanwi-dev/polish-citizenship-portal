#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function summarizeSizes() {
  const distPath = path.resolve(__dirname, '../dist/public/assets');
  
  if (!fs.existsSync(distPath)) {
    return {
      total: 0,
      totalGzipped: 0,
      files: [],
      error: 'dist/public/assets directory not found'
    };
  }

  const files = [];
  let totalSize = 0;
  let totalGzipped = 0;

  try {
    const assetFiles = fs.readdirSync(distPath);
    
    for (const file of assetFiles) {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isFile()) {
        const size = stats.size;
        totalSize += size;
        
        // Try to find corresponding .gz file
        const gzPath = filePath + '.gz';
        let gzSize = null;
        if (fs.existsSync(gzPath)) {
          gzSize = fs.statSync(gzPath).size;
          totalGzipped += gzSize;
        }
        
        files.push({
          name: file,
          size: size,
          gzSize: gzSize,
          sizeFormatted: formatBytes(size),
          gzSizeFormatted: gzSize ? formatBytes(gzSize) : null
        });
      }
    }

    // Sort by size descending and take top 5
    files.sort((a, b) => b.size - a.size);
    const top5 = files.slice(0, 5);

    return {
      total: totalSize,
      totalFormatted: formatBytes(totalSize),
      totalGzipped: totalGzipped || null,
      totalGzippedFormatted: totalGzipped ? formatBytes(totalGzipped) : null,
      fileCount: files.length,
      top5: top5,
      files: files
    };
  } catch (error) {
    return {
      total: 0,
      totalGzipped: 0,
      files: [],
      error: error.message
    };
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Allow direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(summarizeSizes(), null, 2));
}