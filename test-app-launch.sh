#!/bin/bash

echo "🧪 Testing Épure App Launch"
echo "============================"

# Check if the app exists in Applications
if [ -d "/Applications/Épure.app" ]; then
    echo "✅ Épure.app found in Applications"
    
    # Try to launch the app and capture any errors
    echo "🚀 Launching Épure..."
    
    # Launch the app in the background and capture output
    /Applications/Épure.app/Contents/MacOS/Épure 2>&1 &
    APP_PID=$!
    
    # Wait a moment to see if it crashes
    sleep 3
    
    # Check if the process is still running
    if ps -p $APP_PID > /dev/null; then
        echo "✅ App launched successfully (PID: $APP_PID)"
        echo "📱 Check your dock or applications - Épure should be running"
        
        # Wait a bit more and then kill it
        sleep 5
        kill $APP_PID 2>/dev/null
        echo "🛑 App closed for testing"
    else
        echo "❌ App crashed immediately after launch"
        echo "🔍 Check Console.app for crash logs"
    fi
    
else
    echo "❌ Épure.app not found in Applications"
    echo "📦 Please install the app from the DMG first"
fi

echo ""
echo "🔍 If the app crashes, check:"
echo "1. Console.app > Crash Reports"
echo "2. Console.app > System Log > Épure"
echo "3. Try running: /Applications/Épure.app/Contents/MacOS/Épure"
