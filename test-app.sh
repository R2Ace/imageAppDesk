#!/bin/bash

echo "🧪 Testing Épure App Installation"
echo "================================="

# Check if DMG exists
if [ -f "desktop-app/dist/Épure-1.0.0-arm64.dmg" ]; then
    echo "✅ DMG file found (ARM64 version for Apple Silicon Macs)"
    
    # Start DMG server in background
    echo "🚀 Starting DMG server..."
    node serve-dmg.js &
    DMG_SERVER_PID=$!
    
    # Wait a moment for server to start
    sleep 2
    
    # Open the DMG
    echo "📦 Opening DMG file..."
    open "desktop-app/dist/Épure-1.0.0-arm64.dmg"
    
    echo "✅ DMG opened! Follow the installation prompts."
    echo "📱 After installation, you can find Épure in your Applications folder."
    echo "🌐 DMG server running on http://localhost:3002"
    
else
    echo "❌ DMG file not found at desktop-app/dist/Épure-1.0.0.dmg"
    echo "Please build the app first with: npm run build:mac"
fi

echo ""
echo "🔍 To test the app:"
echo "1. Install from the DMG"
echo "2. Open Épure from Applications"
echo "3. Try converting some images"
echo "4. Test the feedback form"
echo "5. Check all features work properly"
echo ""
echo "🌐 For localhost testing:"
echo "1. Start the website: cd website && npm run dev"
echo "2. Start DMG server: node serve-dmg.js"
echo "3. Click the download button on localhost"
echo ""
echo "Press Ctrl+C to stop the DMG server when done"
