#!/bin/bash

# Test script for built Épure app
echo "Testing built Épure app..."

# Find the built app
APP_PATH=""
if [ -d "dist/mac/Épure.app" ]; then
    APP_PATH="dist/mac/Épure.app"
    echo "Found Intel Mac app: $APP_PATH"
elif [ -d "dist/mac-arm64/Épure.app" ]; then
    APP_PATH="dist/mac-arm64/Épure.app"
    echo "Found ARM Mac app: $APP_PATH"
else
    echo "No built app found in dist/ directory"
    exit 1
fi

# Create logs directory
mkdir -p logs

# Run the app with logging
echo "Starting app with logging..."
echo "Logs will be saved to logs/app.log"
echo "Press Ctrl+C to stop the app and view logs"

# Run the app and capture output
open -a "$APP_PATH" 2>&1 | tee logs/app.log &

# Wait a bit for the app to start
sleep 5

echo ""
echo "App should be running now. Check the logs below:"
echo "=============================================="
tail -f logs/app.log
