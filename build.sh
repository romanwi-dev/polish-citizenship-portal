#!/bin/bash
set -e

echo "🔨 Running custom build script..."

# Build with npm
npm run build

# Copy HAC JSON files
echo "📋 Copying HAC data files..."
cp server/hac/rules.json dist/rules.json
cp server/hac/mockCase.json dist/mockCase.json

echo "✅ Build completed with JSON files copied!"
