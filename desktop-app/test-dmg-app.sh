#!/bin/bash

# Test script for DMG-mounted Épure app
echo "Testing DMG-mounted Épure app..."

# Wait for DMG to mount
sleep 2

# Find the mounted app
APP_PATH="/Volumes/Épure/Épure.app"

if [ -d "$APP_PATH" ]; then
    echo "Found mounted app: $APP_PATH"
    
    # Create logs directory
    mkdir -p logs
    
    echo "Starting app with logging..."
    echo "Logs will be saved to logs/dmg-app.log"
    echo "Press Ctrl+C to stop monitoring"
    
    # Run the app and capture output
    "$APP_PATH/Contents/MacOS/Épure" 2>&1 | tee logs/dmg-app.log &
    
    # Get the PID
    APP_PID=$!
    echo "App started with PID: $APP_PID"
    
    # Wait a bit for the app to start
    sleep 3
    
    # Check if app is still running
    if ps -p $APP_PID > /dev/null; then
        echo "✅ App is running successfully!"
        echo "Check the logs below:"
        echo "=============================================="
        tail -f logs/dmg-app.log
    else
        echo "❌ App crashed or failed to start"
        echo "Last 20 lines of logs:"
        echo "=============================================="
        tail -20 logs/dmg-app.log
    fi
else
    echo "❌ App not found at $APP_PATH"
    echo "Available files in /Volumes/Épure/:"
    ls -la "/Volumes/Épure/"
fi
