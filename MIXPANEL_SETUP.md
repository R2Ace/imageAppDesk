# 🔑 How to Find Your Mixpanel Token

## Steps:
1. **Log into Mixpanel** (mixpanel.com)
2. **Go to Project Settings** (gear icon in top right)
3. **Click "Project Settings"** in the dropdown
4. **Look for "Project Token"** - it will be a string like: `abc123def456ghi789`
5. **Copy that token**

## Then update your app:
```bash
# Create a .env file in your project root:
echo "MIXPANEL_TOKEN=your_actual_token_here" > .env

# Make sure .env is in your .gitignore:
echo ".env" >> .gitignore
```

## Alternative: Set it directly in the code
If you can't find the token, you can set it directly in `config/analytics.js` line 73:
```javascript
analytics.init('your_actual_token_here');
```

**Note**: We're using the Node.js SDK for Electron, not the browser SDK they showed you.