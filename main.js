const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const Store = require('electron-store');

// Initialize settings store
const store = new Store({
  defaults: {
    outputDir: app.getPath('pictures'),
    settings: {
      format: 'jpeg',
      quality: 80,
      preset: 'custom', // 'custom', '1080p', '720p', '480p'
      customWidth: 1920,
      customHeight: 1080,
      stripMetadata: true,
      autoOpenOutput: true,
      overwriteFiles: false
    }
  }
});

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 400,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#f8fafc',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

// Get dimensions based on preset
function getPresetDimensions(preset) {
  const presets = {
    '1080p': { width: 1920, height: 1080 },
    '720p': { width: 1280, height: 720 },
    '480p': { width: 854, height: 480 }
  };
  return presets[preset] || null;
}

// Generate unique filename if file exists and overwrite is false
function getUniqueFilename(outputPath, overwrite = false) {
  if (overwrite || !fs.existsSync(outputPath)) {
    return outputPath;
  }
  
  const parsed = path.parse(outputPath);
  let counter = 1;
  let newPath;
  
  do {
    const suffix = ` (${counter})`;
    newPath = path.join(parsed.dir, `${parsed.name}${suffix}${parsed.ext}`);
    counter++;
  } while (fs.existsSync(newPath));
  
  return newPath;
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Handle settings
  ipcMain.handle('get-settings', () => store.get('settings'));
  ipcMain.handle('save-settings', (_, settings) => {
    store.set('settings', settings);
    return true;
  });

  // Handle output directory
  ipcMain.handle('get-output-dir', () => store.get('outputDir'));
  ipcMain.handle('set-output-dir', (_, dir) => {
    store.set('outputDir', dir);
    return true;
  });

  // Handle output directory selection
  ipcMain.handle('select-output-dir', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    
    if (!result.canceled) {
      const selectedDir = result.filePaths[0];
      store.set('outputDir', selectedDir);
      return selectedDir;
    }
    return null;
  });

  // Handle opening folders
  ipcMain.handle('open-folder', async (_, folderPath) => {
    try {
      await shell.openPath(folderPath);
      return true;
    } catch (error) {
      console.error('Error opening folder:', error);
      return false;
    }
  });

  // Handle image processing
  ipcMain.handle('process-images', async (_, { files, settings }) => {
    const outputDir = store.get('outputDir');
    const results = [];

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const buffer = Buffer.from(file.buffer);
        const filename = file.name;
        const fileInfo = path.parse(filename);
        const outputFilename = `${fileInfo.name}.${settings.format}`;
        let outputPath = path.join(outputDir, outputFilename);
        
        // Handle file conflicts
        outputPath = getUniqueFilename(outputPath, settings.overwriteFiles);

        let sharpInstance = sharp(buffer, { limitInputPixels: false });

        // Strip metadata if requested
        if (settings.stripMetadata) {
          sharpInstance = sharpInstance.withMetadata(false);
        }

        // Get dimensions based on preset or custom
        let dimensions;
        if (settings.preset === 'custom') {
          dimensions = {
            width: settings.customWidth,
            height: settings.customHeight
          };
        } else {
          dimensions = getPresetDimensions(settings.preset);
        }

        // Resize image
        if (dimensions) {
          sharpInstance = sharpInstance.resize({
            width: dimensions.width,
            height: dimensions.height,
            fit: 'inside',
            withoutEnlargement: true
          });
        }

        // Set output format and quality
        const formatOptions = { quality: settings.quality };
        
        switch (settings.format) {
          case 'jpeg':
            sharpInstance = sharpInstance.jpeg(formatOptions);
            break;
          case 'png':
            sharpInstance = sharpInstance.png({
              compressionLevel: Math.floor((100 - settings.quality) / 10)
            });
            break;
          case 'webp':
            sharpInstance = sharpInstance.webp(formatOptions);
            break;
        }

        // Process the image
        await sharpInstance.toFile(outputPath);

        // Get file sizes for reporting
        const originalSize = file.size;
        const newSize = fs.statSync(outputPath).size;
        const savingsPercent = Math.round((1 - newSize / originalSize) * 100);

        results.push({
          name: filename,
          success: true,
          originalSize,
          newSize,
          savingsPercent,
          outputPath
        });

        // Send progress update
        mainWindow.webContents.send('process-progress', {
          current: i + 1,
          total: files.length,
          file: filename
        });

      } catch (error) {
        console.error('Error processing file:', error);
        results.push({
          name: file.name,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}); 