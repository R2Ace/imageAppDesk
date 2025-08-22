# Épure - Image Processing App

A beautiful, minimalist image processing app for macOS that resizes and converts images locally.

## 🏗️ Project Structure

```
imageAppDesk/
├── 📱 desktop-app/           # Electron Desktop Application
│   ├── main.js              # Electron main process
│   ├── renderer.js          # App UI logic
│   ├── preload.js           # Secure IPC bridge
│   ├── index.html           # App interface
│   ├── styles.css           # App styling
│   ├── build/               # Build configurations
│   ├── assets/              # Icons and images
│   └── dist/                # Built application output
├── 🌐 website/              # Landing Page & Marketing Site
│   ├── index.html           # Website homepage
│   ├── css/                 # Website styles
│   ├── js/                  # Website scripts
│   └── images/              # Website assets
├── 📄 docs/                 # Documentation
│   ├── MVP_SETUP_GUIDE.md   # Development setup guide
│   ├── MIXPANEL_SETUP.md    # Analytics configuration
│   └── WEBPAGE_IMPROVEMENTS.md # Website enhancement notes
└── package.json             # Workspace configuration
```

## 🚀 Quick Start

### Desktop App (Electron)
```bash
# Install dependencies and start desktop app
npm run start

# Development mode with hot reload
npm run dev

# Build DMG for distribution
npm run build:dmg
```

### Website (Landing Page)
```bash
# Start website development server
npm run website:start

# Website will open at http://localhost:3000
npm run website:dev
```

### Workspace Commands
```bash
# Install all dependencies (root + desktop-app + website)
npm run install:all

# Clean all node_modules and build files
npm run clean
```

## 📱 Desktop App Features

- **Drag & Drop Interface** - Simple image processing
- **Multiple Formats** - JPEG, PNG, WebP, HEIC, TIFF support
- **Batch Processing** - Handle multiple images at once
- **Preview Stage** - See images before processing
- **Results Celebration** - Instant feedback with stats
- **Privacy First** - All processing done locally

## 🌐 Website Features

- **Professional Landing Page** - Modern, responsive design
- **Dark/Light Mode** - User preference toggle
- **Pricing Integration** - Ready for Stripe checkout
- **FAQ Section** - Common user questions
- **Mobile Responsive** - Works on all devices

## 🔧 Development

This is a **workspace project** with two main applications:

1. **Desktop App** (`desktop-app/`) - Electron application
2. **Website** (`website/`) - Static landing page

Each has its own `package.json` and can be developed independently.

## 📦 Building & Distribution

- **Desktop App**: Builds to `desktop-app/dist/`
- **Website**: Static files, no build process needed
- **Code Signing**: Requires Apple Developer Account for distribution

## 🎯 Current Status

- ✅ **Desktop App**: Feature complete, security hardened
- ✅ **Website**: Professional design, navigation complete
- ⏳ **Business Setup**: Need Stripe integration for sales
- ⏳ **Distribution**: Need Apple Developer account for signing

---

**Ready to launch!** Just need business infrastructure (Stripe + Apple Developer) to start selling.
