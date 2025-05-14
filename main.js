const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const Store = require('electron-store');

// Initialize settings store
const store = new Store({
  defaults: {
    outputDir: app.getPath('pictures'),
    lastUsedSettings: {
      width: 800,
      resizeType: 'width', // 'width', 'percentage'
      percentage: 50,
      format: 'jpg',
      quality: 80,
      stripMetadata: true
    }
  }
});

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    icon: path.join(__dirname, 'assets/icon.png')
  });

  mainWindow.loadFile('index.html');

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Handle settings loading
  ipcMain.handle('get-settings', async () => {
    return {
      outputDir: store.get('outputDir'),
      lastUsedSettings: store.get('lastUsedSettings')
    };
  });

  // Handle settings update
  ipcMain.handle('save-settings', async (_, settings) => {
    if (settings.outputDir) {
      store.set('outputDir', settings.outputDir);
    }
    if (settings.lastUsedSettings) {
      store.set('lastUsedSettings', settings.lastUsedSettings);
    }
    return true;
  });

  // Handle output directory selection
  ipcMain.handle('select-output-dir', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Select Output Directory'
    });

    if (!result.canceled) {
      const dir = result.filePaths[0];
      store.set('outputDir', dir);
      return dir;
    }
    return null;
  });

  // Handle image processing
  ipcMain.handle('process-images', async (_, { files, settings }) => {
    // Save the settings for next time
    store.set('lastUsedSettings', settings);

    const outputDir = store.get('outputDir');
    const results = [];

    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Convert array back to Buffer for Sharp
        const buffer = Buffer.from(file.buffer);
        
        // Get file info
        const filename = file.name;
        const fileInfo = path.parse(filename);
        const outputFilename = `${fileInfo.name}.${settings.format}`;
        const outputPath = path.join(outputDir, outputFilename);

        // Process with Sharp
        let sharpInstance = sharp(buffer);

        // Strip metadata if requested
        if (settings.stripMetadata) {
          sharpInstance = sharpInstance.withMetadata(false);
        }

        // Resize image based on settings
        if (settings.resizeType === 'width' && settings.width > 0) {
          sharpInstance = sharpInstance.resize({
            width: parseInt(settings.width),
            withoutEnlargement: true
          });
        } else if (settings.resizeType === 'percentage' && settings.percentage > 0) {
          // For percentage resize, we need to get original dimensions first
          const metadata = await sharp(buffer).metadata();
          const newWidth = Math.round((metadata.width * settings.percentage) / 100);
          sharpInstance = sharpInstance.resize({
            width: newWidth,
            withoutEnlargement: true
          });
        }

        // Set output format and quality
        let formatOptions = {};
        if (settings.format === 'jpg' || settings.format === 'jpeg') {
          formatOptions = { quality: parseInt(settings.quality) };
          sharpInstance = sharpInstance.jpeg(formatOptions);
        } else if (settings.format === 'png') {
          formatOptions = { compressionLevel: Math.floor((100 - parseInt(settings.quality)) / 10) };
          sharpInstance = sharpInstance.png(formatOptions);
        } else if (settings.format === 'webp') {
          formatOptions = { quality: parseInt(settings.quality) };
          sharpInstance = sharpInstance.webp(formatOptions);
        } else if (settings.format === 'tiff') {
          formatOptions = { quality: parseInt(settings.quality) };
          sharpInstance = sharpInstance.tiff(formatOptions);
        } else if (settings.format === 'gif') {
          // GIF doesn't support quality settings in the same way
          sharpInstance = sharpInstance.gif();
        } else if (settings.format === 'heif') {
          formatOptions = { quality: parseInt(settings.quality) };
          sharpInstance = sharpInstance.heif(formatOptions);
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
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        results.push({
          name: file.name,
          success: false,
          error: error.message
        });
      }

      // Send progress update
      mainWindow.webContents.send('process-progress', {
        current: i + 1,
        total: files.length,
        file: file.name
      });
    }

    return results;
  });

  // Handle folder opening
  ipcMain.handle('open-folder', async (_, folderPath) => {
    if (folderPath) {
      await shell.openPath(folderPath);
      return true;
    }
    return false;
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
}); 