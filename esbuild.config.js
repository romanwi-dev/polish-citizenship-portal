import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import esbuild from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Plugin to copy rules.json after build
const copyRulesPlugin = {
  name: 'copy-rules',
  setup(build) {
    build.onEnd(() => {
      const srcPath = path.join(__dirname, 'server/hac/rules.json');
      const destPath = path.join(__dirname, 'dist/rules.json');
      
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log('✅ rules.json copied to dist/');
      } else {
        console.warn('⚠️ Warning: rules.json not found');
      }
    });
  },
};

// Build configuration
esbuild.build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outdir: 'dist',
  plugins: [copyRulesPlugin],
}).catch(() => process.exit(1));
