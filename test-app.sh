#!/bin/bash

echo "🧪 Testing Épure App Installation"
echo "================================="

# Check if DMG exists
if [ -f "desktop-app/dist/Épure-1.0.0.dmg" ]; then
    echo "✅ DMG file found"
    
    # Open the DMG
    echo "📦 Opening DMG file..."
    open "desktop-app/dist/Épure-1.0.0.dmg"
    
    echo "✅ DMG opened! Follow the installation prompts."
    echo "📱 After installation, you can find Épure in your Applications folder."
    
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
