#!/bin/bash

echo "📦 Building Vite project..."
npm run build

echo "📁 Copying extension files to dist/"
cp manifest.json dist/
cp inject.js dist/
cp content.js dist/
cp fetch-api.js dist/
cp public/icon.png dist/
cp background.js dist/

echo "✅ Done! You can now load ./dist into chrome://extensions"