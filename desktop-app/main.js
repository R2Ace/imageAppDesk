// Load environment variables first
require('dotenv').config();

// Initialize Sentry crash reporting first
const { initSentry } = require('./config/sentry');
initSentry();

// Initialize analytics
const analytics = require('./config/analytics');

// Make analytics globally available for payment tracking
global.analytics = analytics;

// Initialize payment processor
const paymentProcessor = require('./config/stripe');

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
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
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
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

  // Track app launch
  analytics.trackAppLaunched();

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
    const startTime = Date.now();
    const outputDir = store.get('outputDir');
    const results = [];
    let totalOriginalSize = 0;
    let totalNewSize = 0;
    let successCount = 0;

    // Track batch processing start
    analytics.trackBatchProcessing(files.length, files.reduce((sum, f) => sum + f.size, 0));

    try {
      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        try {
          fs.mkdirSync(outputDir, { recursive: true });
        } catch (dirError) {
          const errorMsg = `Unable to create output directory: ${dirError.message}`;
          analytics.trackError('directory_creation_failed', errorMsg);
          throw new Error(errorMsg);
        }
      }

      // Process files with improved error handling
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filename = file.name;
        
        try {
          // Validate file
          if (!file.buffer || file.size === 0) {
            throw new Error('File is empty or corrupted');
          }

          if (file.size > 100 * 1024 * 1024) { // 100MB limit
            throw new Error('File size exceeds 100MB limit');
          }

          const buffer = Buffer.from(file.buffer);
          const fileInfo = path.parse(filename);
          const inputFormat = fileInfo.ext.toLowerCase().replace('.', '');
          
          // Validate input format
          const supportedFormats = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'tiff', 'tif'];
          if (!supportedFormats.includes(inputFormat)) {
            throw new Error(`Unsupported file format: ${inputFormat}`);
          }

          const outputFilename = `${fileInfo.name}.${settings.format}`;
          let outputPath = path.join(outputDir, outputFilename);
          
          // Handle file conflicts
          outputPath = getUniqueFilename(outputPath, settings.overwriteFiles);

          // Create Sharp instance with better error handling
          let sharpInstance;
          try {
            sharpInstance = sharp(buffer, { 
              limitInputPixels: false,
              failOnError: false // Don't fail on minor corruption
            });
          } catch (sharpError) {
            throw new Error(`Unable to read image: ${sharpError.message}`);
          }

          // Strip metadata if requested
          if (settings.stripMetadata) {
            sharpInstance = sharpInstance.withMetadata(false);
          } else {
            // Keep essential metadata but remove location data for privacy
            sharpInstance = sharpInstance.withMetadata({
              exif: { IFD0: { Copyright: 'Processed with Épure' } }
            });
          }

          // Get dimensions based on preset or custom
          let dimensions;
          if (settings.preset === 'custom') {
            dimensions = {
              width: Math.max(1, Math.min(50000, settings.customWidth)), // Clamp values
              height: Math.max(1, Math.min(50000, settings.customHeight))
            };
          } else {
            dimensions = getPresetDimensions(settings.preset);
          }

          // Resize image with better options
          if (dimensions) {
            sharpInstance = sharpInstance.resize({
              width: dimensions.width,
              height: dimensions.height,
              fit: 'inside',
              withoutEnlargement: true,
              kernel: sharp.kernel.lanczos3 // Better quality
            });
          }

          // Set output format and quality with validation
          const quality = Math.max(1, Math.min(100, settings.quality));
          
          switch (settings.format) {
            case 'jpeg':
              sharpInstance = sharpInstance.jpeg({ 
                quality,
                progressive: true,
                mozjpeg: true // Better compression
              });
              break;
            case 'png':
              sharpInstance = sharpInstance.png({
                compressionLevel: Math.max(0, Math.min(9, Math.floor((100 - quality) / 11))),
                progressive: true
              });
              break;
            case 'webp':
              sharpInstance = sharpInstance.webp({ 
                quality,
                effort: 4 // Good balance of compression and speed
              });
              break;
            case 'avif':
              sharpInstance = sharpInstance.avif({ quality });
              break;
            default:
              throw new Error(`Unsupported output format: ${settings.format}`);
          }

          // Process the image with timeout
          const processPromise = sharpInstance.toFile(outputPath);
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Processing timeout (30s exceeded)')), 30000);
          });

          await Promise.race([processPromise, timeoutPromise]);

          // Get file sizes for reporting
          const originalSize = file.size;
          const newSize = fs.statSync(outputPath).size;
          const compressionRatio = newSize / originalSize;
          const savingsPercent = Math.round((1 - compressionRatio) * 100);

          totalOriginalSize += originalSize;
          totalNewSize += newSize;
          successCount++;

          // Track successful conversion
          analytics.trackFileConverted(settings.format, inputFormat, originalSize, compressionRatio);

          results.push({
            name: filename,
            success: true,
            originalSize,
            newSize,
            savingsPercent,
            outputPath,
            processingTime: Date.now() - startTime
          });

        } catch (error) {
          console.error(`Error processing file ${filename}:`, error);
          
          // Track error with context
          analytics.trackError('file_processing_failed', `${filename}: ${error.message}`);
          
          // Provide user-friendly error messages
          let userMessage = error.message;
          if (error.message.includes('Input buffer contains unsupported image format')) {
            userMessage = 'This file format is not supported. Please use JPG, PNG, WebP, HEIC, or TIFF files.';
          } else if (error.message.includes('timeout')) {
            userMessage = 'File processing took too long. Try reducing the file size or image dimensions.';
          } else if (error.message.includes('memory')) {
            userMessage = 'Not enough memory to process this file. Try closing other applications or using a smaller file.';
          }

          results.push({
            name: file.name,
            success: false,
            error: userMessage,
            originalError: error.message // For debugging
          });
        }

        // Send progress update
        mainWindow.webContents.send('process-progress', {
          current: i + 1,
          total: files.length,
          file: filename,
          successRate: Math.round((successCount / (i + 1)) * 100)
        });
      }

      // Track batch completion
      const totalTime = Date.now() - startTime;
      const avgTimePerFile = totalTime / files.length;
      
      console.log(`Batch processing completed: ${successCount}/${files.length} files in ${totalTime}ms`);

    } catch (error) {
      console.error('Critical error in batch processing:', error);
      analytics.trackError('batch_processing_failed', error.message);
      
      // Return error for entire batch
      return {
        success: false,
        error: error.message,
        results: []
      };
    }

    return {
      success: true,
      results,
      stats: {
        totalFiles: files.length,
        successCount,
        totalOriginalSize,
        totalNewSize,
        totalSavingsPercent: totalOriginalSize > 0 ? Math.round((1 - totalNewSize / totalOriginalSize) * 100) : 0,
        processingTime: Date.now() - startTime
      }
    };
  });

  // Handle license checking
  ipcMain.handle('check-license', () => {
    return {
      isLicensed: paymentProcessor.isLicensed(),
      licenseInfo: paymentProcessor.getLicenseInfo()
    };
  });

  // Handle payment intent creation
  ipcMain.handle('create-payment', async (_, customerEmail) => {
    try {
      const paymentIntent = await paymentProcessor.createPaymentIntent(customerEmail);
      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      console.error('Payment creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Handle payment verification and license activation
  ipcMain.handle('verify-payment', async (_, paymentIntentId) => {
    try {
      const result = await paymentProcessor.verifyPaymentAndActivate(paymentIntentId);
      return result;
    } catch (error) {
      console.error('Payment verification failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Handle manual license activation (for customer support)
  ipcMain.handle('activate-license', async (_, licenseKey) => {
    try {
      const result = await paymentProcessor.activateLicenseKey(licenseKey);
      return result;
    } catch (error) {
      console.error('License activation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Handle opening payment URL in browser
  ipcMain.handle('open-payment-url', async (_, url) => {
    try {
      await shell.openExternal(url);
      return { success: true };
    } catch (error) {
      console.error('Failed to open payment URL:', error);
      return { success: false, error: error.message };
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Auto-updater functionality
app.on('ready', () => {
  // Check for updates only in production
  if (process.env.NODE_ENV === 'production') {
    // Check for updates after 5 seconds to let the app load first
    setTimeout(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 5000);
    
    // Check for updates every hour
    setInterval(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 60 * 60 * 1000);
  }
});

// Auto-updater events
autoUpdater.on('update-available', () => {
  console.log('Update available');
});

autoUpdater.on('update-downloaded', () => {
  console.log('Update downloaded');
  // Silently install and restart
  autoUpdater.quitAndInstall();
}); 