const { contextBridge, ipcRenderer } = require('electron');

// Enhanced logging for preload script
const log = {
  info: (message, ...args) => {
    console.log(`[PRELOAD] ${new Date().toISOString()} - ${message}`, ...args);
  },
  error: (message, ...args) => {
    console.error(`[PRELOAD ERROR] ${new Date().toISOString()} - ${message}`, ...args);
  },
  debug: (message, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[PRELOAD DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }
};

log.info('Preload script loaded');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Settings management
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  
  // Output directory management
  getOutputDir: () => ipcRenderer.invoke('get-output-dir'),
  setOutputDir: (dir) => ipcRenderer.invoke('set-output-dir', dir),
  selectOutputDir: () => ipcRenderer.invoke('select-output-dir'),
  
  // File operations
  openFolder: (path) => ipcRenderer.invoke('open-folder', path),
  
  // Image processing
  processImages: (data) => {
    // Clone the data to ensure it can be properly serialized
    const clonedData = {
      files: data.files.map(file => ({
        name: file.name,
        size: file.size,
        buffer: Array.from(file.buffer) // Convert Uint8Array to regular array for IPC
      })),
      settings: data.settings
    };
    return ipcRenderer.invoke('process-images', clonedData);
  },
  
  // Progress tracking
  onProcessProgress: (callback) => {
    ipcRenderer.on('process-progress', (event, data) => callback(data));
  },
  removeProgressListener: () => {
    ipcRenderer.removeAllListeners('process-progress');
  },

  // Payment and licensing
  checkLicense: () => ipcRenderer.invoke('check-license'),
  createPayment: (customerEmail) => ipcRenderer.invoke('create-payment', customerEmail),
  verifyPayment: (paymentIntentId) => ipcRenderer.invoke('verify-payment', paymentIntentId),
  activateLicense: (licenseKey) => ipcRenderer.invoke('activate-license', licenseKey),
  openPaymentUrl: (url) => ipcRenderer.invoke('open-payment-url', url),
  
  // External links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // Audio processing
  checkFFmpeg: () => ipcRenderer.invoke('check-ffmpeg'),
  getAudioMetadata: (filePath) => ipcRenderer.invoke('get-audio-metadata', filePath),
  convertAudio: (inputPath, outputFormat, options) => 
    ipcRenderer.invoke('convert-audio', { inputPath, outputFormat, options }),
  batchConvertAudio: (inputPaths, outputFormat, options) => 
    ipcRenderer.invoke('batch-convert-audio', { inputPaths, outputFormat, options }),
  getAudioFormats: () => ipcRenderer.invoke('get-audio-formats'),
  
  // Audio conversion progress listeners
  onAudioProgress: (callback) => {
    ipcRenderer.on('audio-conversion-progress', (event, data) => callback(data));
  },
  onAudioBatchProgress: (callback) => {
    ipcRenderer.on('audio-batch-progress', (event, data) => callback(data));
  },
  removeAudioProgressListeners: () => {
    ipcRenderer.removeAllListeners('audio-conversion-progress');
    ipcRenderer.removeAllListeners('audio-batch-progress');
  }
}); 