#!/bin/bash -x

echo "📦 Building Vite project..."
npm run build

echo "📁 Copying extension files to dist/"
cp -v manifest.json dist/
cp -v inject.js dist/
cp -v content.js dist/
cp -v fetch-api.js dist/
cp -v public/icon.png dist/
cp -v background.js dist/

# Verify files were copied
echo "🔍 Verifying files in dist directory:"
ls -la dist/

echo "✅ Done! You can now load ./dist into chrome://extensions"