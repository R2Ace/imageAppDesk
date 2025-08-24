# Windows Support Setup

Your Electron app now supports Windows builds! 🎉

## What's Been Added

### 1. Windows Build Configuration
- Added Windows build scripts to `package.json`:
  - `npm run build:win` - Build for Windows
  - `npm run dist:win` - Build and package for Windows distribution
- Added Windows configuration in the `build` section of `package.json`
- Windows installer (NSIS) configuration

### 2. Generated Files
The Windows build creates:
- `dist/Épure Setup 1.0.0.exe` - Windows installer
- `dist/win-arm64-unpacked/` - Unpacked Windows application files

## How to Build for Windows

```bash
# Build Windows version
npm run build:win

# Or build without publishing
npm run dist:win
```

## Important Notes

### Icon Configuration
Currently, the app uses the default Electron icon for Windows builds. To add a custom icon:

1. **Create a proper app icon:**
   - Design your icon as a PNG file (256x256 pixels minimum)
   - Use an online converter to create a `.ico` file:
     - [Convertio.co](https://convertio.co/png-ico/)
     - [Favicon.io](https://favicon.io/favicon-converter/)
     - [Online-Convert.com](https://image.online-convert.com/convert-to-ico)

2. **Save the icon:**
   - Save the `.ico` file as `build/icon.ico`

3. **Update the configuration:**
   - In `package.json`, update the Windows config:
   ```json
   "win": {
     "target": "nsis",
     "icon": "build/icon.ico"
   }
   ```

### Cross-Platform Building
- **From macOS:** Can build for Windows (current setup)
- **From Windows:** Can build for Windows natively
- **From Linux:** Can build for Windows

### Distribution
The generated `Épure Setup 1.0.0.exe` file is a complete Windows installer that users can download and run to install your app.

## Build Targets

The current configuration builds for:
- **Windows:** NSIS installer (.exe)
- **macOS:** DMG and ZIP files

## Customizing Windows Build

You can customize the Windows build by modifying the `win` section in `package.json`:

```json
"win": {
  "target": [
    {
      "target": "nsis",
      "arch": ["x64", "ia32"]
    }
  ],
  "icon": "build/icon.ico",
  "requestedExecutionLevel": "asInvoker"
}
```

For more configuration options, see the [electron-builder documentation](https://www.electron.build/configuration/win).

## Auto-Updates
The app is configured for auto-updates via GitHub releases. When you publish a release, both macOS and Windows users will receive update notifications.
