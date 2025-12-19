// Enhanced logging system
let logFile = null;

const log = {
  info: (message, ...args) => {
    if (args.length > 0) {
      const logMessage = `[INFO] ${new Date().toISOString()} - ${message} ${JSON.stringify(args)}\n`;
      console.log(logMessage.trim());
      if (logFile) logFile.write(logMessage);
    } else {
      const logMessage = `[INFO] ${new Date().toISOString()} - ${message}\n`;
      console.log(logMessage.trim());
      if (logFile) logFile.write(logMessage);
    }
  },
  error: (message, ...args) => {
    if (args.length > 0) {
      const logMessage = `[ERROR] ${new Date().toISOString()} - ${message} ${JSON.stringify(args)}\n`;
      console.error(logMessage.trim());
      if (logFile) logFile.write(logMessage);
    } else {
      const logMessage = `[ERROR] ${new Date().toISOString()} - ${message}\n`;
      console.error(logMessage.trim());
      if (logFile) logFile.write(logMessage);
    }
  },
  warn: (message, ...args) => {
    if (args.length > 0) {
      const logMessage = `[WARN] ${new Date().toISOString()} - ${message} ${JSON.stringify(args)}\n`;
      console.warn(logMessage.trim());
      if (logFile) logFile.write(logMessage);
    } else {
      const logMessage = `[WARN] ${new Date().toISOString()} - ${message}\n`;
      console.warn(logMessage.trim());
      if (logFile) logFile.write(logMessage);
    }
  },
  debug: (message, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      if (args.length > 0) {
        const logMessage = `[DEBUG] ${new Date().toISOString()} - ${message} ${JSON.stringify(args)}\n`;
        console.log(logMessage.trim());
        if (logFile) logFile.write(logMessage);
      } else {
        const logMessage = `[DEBUG] ${new Date().toISOString()} - ${message}\n`;
        console.log(logMessage.trim());
        if (logFile) logFile.write(logMessage);
      }
    }
  }
};

log.info('Starting Épure application...');
log.info('Node version:', process.version);
log.info('Platform:', process.platform);
log.info('Architecture:', process.arch);

// Load environment variables first (only in development)
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config();
    log.info('Environment variables loaded');
  } catch (error) {
    log.warn('dotenv not available in production build:', error.message);
  }
}

// Initialize Sentry crash reporting first (with error handling)
let initSentry;
try {
  log.info('Loading Sentry configuration...');
  const sentryModule = require('./config/sentry');
  initSentry = sentryModule.initSentry;
  initSentry();
  log.info('Sentry initialized successfully');
} catch (error) {
  log.error('Sentry initialization failed:', error.message);
  log.error('Sentry error stack:', error.stack);
}

// Initialize analytics (with error handling)
let analytics;
try {
  log.info('Loading analytics configuration...');
  analytics = require('./config/analytics');
  global.analytics = analytics;
  log.info('Analytics initialized successfully');
} catch (error) {
  log.error('Analytics initialization failed:', error.message);
  log.error('Analytics error stack:', error.stack);
  // Create a dummy analytics object
  analytics = {
    trackAppLaunched: () => { log.debug('Analytics: trackAppLaunched called (dummy)'); },
    trackFileConverted: () => { log.debug('Analytics: trackFileConverted called (dummy)'); },
    trackBatchProcessing: () => { log.debug('Analytics: trackBatchProcessing called (dummy)'); },
    trackError: () => { log.debug('Analytics: trackError called (dummy)'); }
  };
  global.analytics = analytics;
}

// Initialize payment processor (with error handling)
let paymentProcessor;
try {
  log.info('Loading payment processor configuration...');
  paymentProcessor = require('./config/stripe');
  log.info('Payment processor initialized successfully');
} catch (error) {
  log.error('Payment processor initialization failed:', error.message);
  log.error('Payment processor error stack:', error.stack);
  // Create a dummy payment processor
  paymentProcessor = {
    isLicensed: () => { 
      log.debug('Payment: isLicensed called (dummy)');
      return false; 
    },
    getLicenseInfo: () => { 
      log.debug('Payment: getLicenseInfo called (dummy)');
      return null; 
    },
    createPaymentIntent: () => { 
      log.debug('Payment: createPaymentIntent called (dummy)');
      return Promise.reject(new Error('Payment not available')); 
    },
    verifyPaymentAndActivate: () => { 
      log.debug('Payment: verifyPaymentAndActivate called (dummy)');
      return Promise.reject(new Error('Payment not available')); 
    },
    activateLicenseKey: () => { 
      log.debug('Payment: activateLicenseKey called (dummy)');
      return Promise.reject(new Error('Payment not available')); 
    }
  };
}

log.info('Loading Electron modules...');
const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

// Detect if we're in a packaged app
const isPackaged = app.isPackaged || process.resourcesPath !== undefined || process.env.NODE_ENV === 'production';
const isProduction = process.env.NODE_ENV === 'production' || isPackaged;

log.info('Environment:', isProduction ? 'production' : 'development');
log.info('Is packaged:', isPackaged);

log.info('Loading additional dependencies...');
let sharp, Store;
try {
  sharp = require('sharp');
  log.info('Sharp loaded successfully');
} catch (error) {
  log.error('Sharp loading failed:', error.message);
  log.error('Sharp error stack:', error.stack);
  throw new Error('Sharp is required for image processing');
}

try {
  Store = require('electron-store');
  log.info('Electron-store loaded successfully');
} catch (error) {
  log.error('Electron-store loading failed:', error.message);
  log.error('Electron-store error stack:', error.stack);
  throw new Error('Electron-store is required for settings');
}

// ✅ IMPORTANT: Store will be initialized AFTER app is ready
let store;
let mainWindow;

function createWindow() {
  log.info('Creating main window...');
  try {
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
    log.info('Main window created successfully');

    log.info('Loading index.html...');
    mainWindow.loadFile('index.html');
    log.info('index.html loaded successfully');

    // Only open dev tools in development mode and when explicitly enabled
    if (!isProduction && process.env.ENABLE_DEV_TOOLS === 'true') {
      log.info('Opening developer tools...');
      mainWindow.webContents.openDevTools();
    }

    // Add error handling for window events
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      log.error('Page failed to load:', { errorCode, errorDescription, validatedURL });
    });

    mainWindow.webContents.on('render-process-gone', (event, details) => {
      log.error('Render process gone:', details);
    });

    mainWindow.on('closed', () => {
      log.info('Main window closed');
      mainWindow = null;
    });

    // Track app launch
    if (analytics && analytics.trackAppLaunched) {
      analytics.trackAppLaunched();
      log.info('App launch tracked');
    }

    log.info('Main window setup completed successfully');
  } catch (error) {
    log.error('Failed to create main window:', error.message);
    log.error('Main window error stack:', error.stack);
    throw error;
  }
}

// Initialize store AFTER app is ready
function initializeStore() {
  log.info('Initializing settings store...');
  try {
    store = new Store({
      defaults: {
        outputDir: app.getPath('pictures'), // ✅ Now app is available
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
    log.info('Settings store initialized successfully');
  } catch (error) {
    log.error('Failed to initialize store:', error.message);
    log.error('Store error stack:', error.stack);
    throw error;
  }
}

// App ready handler
app.whenReady().then(() => {
  log.info('App is ready');
  
  // Initialize store first (now that app is ready)
  initializeStore();
  
  // Then create window
  createWindow();
  
  // Set up menus, etc.
  setupApplicationMenu();
});

// App event handlers
app.on('activate', () => {
  log.info('App activated');
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  log.info('All windows closed');
  if (process.platform !== 'darwin') {
    log.info('Quitting app (non-macOS platform)');
    app.quit();
  }
});

// Add crash handlers
app.on('renderer-process-crashed', (event, webContents, killed) => {
  log.error('Renderer process crashed:', { killed });
});

app.on('child-process-gone', (event, details) => {
  log.error('Child process gone:', details);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log.error('Uncaught exception:', error.message);
  log.error('Uncaught exception stack:', error.stack);
  // Don't exit the process, just log the error
});

process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled promise rejection:', reason);
  log.error('Promise:', promise);
});

// Auto-updater functionality
app.on('ready', () => {
  // Check for updates only in production
  if (isProduction) {
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

// IPC handlers (moved to separate function for organization)
function setupIPCHandlers() {
  // Settings management
  ipcMain.handle('get-settings', () => {
    try {
      return store.get('settings');
    } catch (error) {
      log.error('Failed to get settings:', error.message);
      return null;
    }
  });

  ipcMain.handle('save-settings', (event, settings) => {
    try {
      store.set('settings', settings);
      log.info('Settings saved successfully');
      return true;
    } catch (error) {
      log.error('Failed to save settings:', error.message);
      return false;
    }
  });

  // Output directory management
  ipcMain.handle('get-output-dir', () => {
    try {
      return store.get('outputDir');
    } catch (error) {
      log.error('Failed to get output directory:', error.message);
      return app.getPath('pictures');
    }
  });

  ipcMain.handle('set-output-dir', (event, dir) => {
    try {
      store.set('outputDir', dir);
      log.info('Output directory set:', dir);
      return true;
    } catch (error) {
      log.error('Failed to set output directory:', error.message);
      return false;
    }
  });

  ipcMain.handle('select-output-dir', async () => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
      });
      
      if (!result.canceled && result.filePaths.length > 0) {
        const selectedPath = result.filePaths[0];
        store.set('outputDir', selectedPath);
        log.info('Output directory selected and saved:', selectedPath);
        return selectedPath;
      }
      return null;
    } catch (error) {
      log.error('Failed to select output directory:', error.message);
      return null;
    }
  });

  // License checking
  ipcMain.handle('check-license', async () => {
    try {
      // Check for stored license key
      const storedLicenseKey = store.get('licenseKey');
      
      if (!storedLicenseKey) {
        log.info('No license key found');
        return { 
          licensed: false, 
          message: 'No license key found. Please enter your license key.' 
        };
      }

      // Validate against server
      const apiUrl = process.env.API_URL || 'https://epure-api.railway.app';
      
      try {
        const https = require('https');
        const response = await new Promise((resolve, reject) => {
          const req = https.get(`${apiUrl}/api/validate-license/${storedLicenseKey}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              try {
                resolve(JSON.parse(data));
              } catch {
                resolve({ valid: false });
              }
            });
          });
          req.on('error', reject);
          req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Timeout'));
          });
        });

        if (response.valid) {
          log.info('License validated successfully');
          return { 
            licensed: true, 
            message: 'License activated',
            licenseInfo: response.info
          };
        } else {
          log.warn('License validation failed:', response.error);
          return { 
            licensed: false, 
            message: response.error || 'Invalid license key' 
          };
        }
      } catch (networkError) {
        // If offline, trust stored license (grace period)
        log.warn('Network error during license check, using cached status:', networkError.message);
        return { 
          licensed: true, 
          message: 'Offline mode - license cached',
          offline: true
        };
      }
    } catch (error) {
      log.error('Failed to check license:', error.message);
      return { 
        licensed: false, 
        message: 'License check failed' 
      };
    }
  });

  // License activation
  ipcMain.handle('activate-license', async (event, licenseKey) => {
    try {
      const apiUrl = process.env.API_URL || 'https://epure-api.railway.app';
      const https = require('https');
      
      const response = await new Promise((resolve, reject) => {
        const req = https.get(`${apiUrl}/api/validate-license/${licenseKey}`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch {
              resolve({ valid: false });
            }
          });
        });
        req.on('error', reject);
        req.setTimeout(10000, () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
      });

      if (response.valid) {
        // Store the license key
        store.set('licenseKey', licenseKey);
        log.info('License activated and stored');
        return { 
          success: true, 
          message: 'License activated successfully!' 
        };
      } else {
        log.warn('License activation failed:', response.error);
        return { 
          success: false, 
          message: response.error || 'Invalid license key' 
        };
      }
    } catch (error) {
      log.error('Failed to activate license:', error.message);
      return { 
        success: false, 
        message: 'Could not verify license. Please check your internet connection.' 
      };
    }
  });

  // Image processing
  ipcMain.handle('process-images', async (event, { files, settings }) => {
    try {
      log.info('Processing images request received:', files.length, 'files');
      
      // For now, return a mock response
      // In production, this would use the actual image processing logic
      const results = files.map((file, index) => ({
        id: file.id || index,
        name: file.name,
        originalSize: file.size,
        processedSize: Math.floor(file.size * 0.7), // Mock 30% reduction
        status: 'completed',
        savings: 30
      }));
      
      log.info('Image processing completed:', results.length, 'files processed');
      return { success: true, results };
    } catch (error) {
      log.error('Failed to process images:', error.message);
      return { 
        success: false, 
        error: error.message 
      };
    }
  });

  // Audio processing handlers
  let audioProcessor;
  try {
    audioProcessor = require('./audio-processor');
    log.info('Audio processor loaded successfully');
  } catch (error) {
    log.warn('Audio processor not available:', error.message);
    audioProcessor = null;
  }

  // Check if FFmpeg is available
  ipcMain.handle('check-ffmpeg', async () => {
    try {
      if (!audioProcessor) {
        return { available: false, message: 'Audio processor not loaded' };
      }
      const available = await audioProcessor.isFFmpegAvailable();
      return { 
        available, 
        message: available ? 'FFmpeg is available' : 'FFmpeg is not installed'
      };
    } catch (error) {
      log.error('FFmpeg check failed:', error.message);
      return { available: false, message: error.message };
    }
  });

  // Get audio file metadata
  ipcMain.handle('get-audio-metadata', async (event, filePath) => {
    try {
      if (!audioProcessor) {
        throw new Error('Audio processor not available');
      }
      const metadata = await audioProcessor.getAudioMetadata(filePath);
      return { success: true, metadata };
    } catch (error) {
      log.error('Failed to get audio metadata:', error.message);
      return { success: false, error: error.message };
    }
  });

  // Convert single audio file
  ipcMain.handle('convert-audio', async (event, { inputPath, outputFormat, options = {} }) => {
    try {
      if (!audioProcessor) {
        throw new Error('Audio processor not available');
      }
      
      log.info('Audio conversion requested:', { inputPath, outputFormat });
      
      const result = await audioProcessor.convertAudio(inputPath, outputFormat, {
        ...options,
        outputDir: options.outputDir || store.get('outputDir'),
        onProgress: (progress) => {
          // Send progress to renderer
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('audio-conversion-progress', { progress });
          }
        }
      });
      
      log.info('Audio conversion completed:', result);
      
      // Track analytics
      if (analytics && analytics.trackFileConverted) {
        analytics.trackFileConverted({
          type: 'audio',
          inputFormat: path.extname(inputPath).slice(1),
          outputFormat,
          inputSize: result.inputSize,
          outputSize: result.outputSize
        });
      }
      
      return result;
    } catch (error) {
      log.error('Audio conversion failed:', error.message);
      return { success: false, error: error.message };
    }
  });

  // Batch convert audio files
  ipcMain.handle('batch-convert-audio', async (event, { inputPaths, outputFormat, options = {} }) => {
    try {
      if (!audioProcessor) {
        throw new Error('Audio processor not available');
      }
      
      log.info('Batch audio conversion requested:', { count: inputPaths.length, outputFormat });
      
      const results = await audioProcessor.batchConvertAudio(inputPaths, outputFormat, {
        ...options,
        outputDir: options.outputDir || store.get('outputDir'),
        onTotalProgress: (progress) => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('audio-batch-progress', { progress });
          }
        }
      });
      
      log.info('Batch audio conversion completed:', results.length, 'files');
      
      // Track analytics
      if (analytics && analytics.trackBatchProcessing) {
        analytics.trackBatchProcessing({
          type: 'audio',
          count: inputPaths.length,
          outputFormat,
          successCount: results.filter(r => r.success).length
        });
      }
      
      return { success: true, results };
    } catch (error) {
      log.error('Batch audio conversion failed:', error.message);
      return { success: false, error: error.message };
    }
  });

  // Get supported audio formats
  ipcMain.handle('get-audio-formats', () => {
    if (!audioProcessor) {
      return { 
        input: [], 
        output: [] 
      };
    }
    return {
      input: audioProcessor.SUPPORTED_INPUT_FORMATS,
      output: audioProcessor.SUPPORTED_OUTPUT_FORMATS
    };
  });

  // Document processing handlers
  let documentProcessor;
  try {
    documentProcessor = require('./document-processor');
    log.info('Document processor loaded successfully');
  } catch (error) {
    log.warn('Document processor not available:', error.message);
    documentProcessor = null;
  }

  // Check document dependencies
  ipcMain.handle('check-document-deps', async () => {
    try {
      if (!documentProcessor) {
        return { available: false, message: 'Document processor not loaded' };
      }
      const status = await documentProcessor.checkDependencies();
      return { available: true, status };
    } catch (error) {
      log.error('Document dependency check failed:', error.message);
      return { available: false, message: error.message };
    }
  });

  // Get document metadata
  ipcMain.handle('get-document-metadata', async (event, filePath) => {
    try {
      if (!documentProcessor) {
        throw new Error('Document processor not available');
      }
      const metadata = await documentProcessor.getDocumentMetadata(filePath);
      return { success: true, metadata };
    } catch (error) {
      log.error('Failed to get document metadata:', error.message);
      return { success: false, error: error.message };
    }
  });

  // Convert single document
  ipcMain.handle('convert-document', async (event, { inputPath, outputFormat, options = {} }) => {
    try {
      if (!documentProcessor) {
        throw new Error('Document processor not available');
      }
      
      log.info('Document conversion requested:', { inputPath, outputFormat });
      
      const outputDir = options.outputDir || store.get('outputDir');
      const result = await documentProcessor.convertDocument(inputPath, outputFormat, outputDir, options);
      
      log.info('Document conversion completed:', result);
      
      // Track analytics
      if (analytics && analytics.trackFileConverted) {
        analytics.trackFileConverted({
          type: 'document',
          inputFormat: path.extname(inputPath).slice(1),
          outputFormat
        });
      }
      
      return result;
    } catch (error) {
      log.error('Document conversion failed:', error.message);
      return { success: false, error: error.message };
    }
  });

  // Batch convert documents
  ipcMain.handle('batch-convert-documents', async (event, { inputPaths, outputFormat, options = {} }) => {
    try {
      if (!documentProcessor) {
        throw new Error('Document processor not available');
      }
      
      log.info('Batch document conversion requested:', { count: inputPaths.length, outputFormat });
      
      const outputDir = options.outputDir || store.get('outputDir');
      const results = await documentProcessor.batchConvertDocuments(
        inputPaths, 
        outputFormat, 
        outputDir,
        (progress) => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('document-conversion-progress', progress);
          }
        }
      );
      
      log.info('Batch document conversion completed:', results.length, 'files');
      
      // Track analytics
      if (analytics && analytics.trackBatchProcessing) {
        analytics.trackBatchProcessing({
          type: 'document',
          count: inputPaths.length,
          outputFormat,
          successCount: results.filter(r => r.success).length
        });
      }
      
      return { success: true, results };
    } catch (error) {
      log.error('Batch document conversion failed:', error.message);
      return { success: false, error: error.message };
    }
  });

  // Get supported document formats
  ipcMain.handle('get-document-formats', () => {
    if (!documentProcessor) {
      return { input: [], output: {} };
    }
    return documentProcessor.getSupportedFormats();
  });

  // Check if file is a document
  ipcMain.handle('is-document-file', (event, filePath) => {
    if (!documentProcessor) {
      return false;
    }
    return documentProcessor.isDocumentFile(filePath);
  });
}

// Application menu setup
function setupApplicationMenu() {
  const template = [
    {
      label: 'Épure',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'File',
      submenu: [
        { role: 'close' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Initialize IPC handlers when app is ready
app.whenReady().then(() => {
  setupIPCHandlers();
});