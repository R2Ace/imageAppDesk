const { contextBridge, ipcRenderer, shell } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronAPI', {
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
    selectOutputDir: () => ipcRenderer.invoke('select-output-dir'),
    processImages: (data) => {
      // Clone the data to ensure it can be properly serialized
      const clonedData = {
        files: data.files,
        settings: data.settings
      };
      return ipcRenderer.invoke('process-images', clonedData);
    },
    onProcessProgress: (callback) => ipcRenderer.on('process-progress', callback),
    removeProgressListener: () => ipcRenderer.removeAllListeners('process-progress'),
    openFolder: (path) => ipcRenderer.invoke('open-folder', path)
  }
); 