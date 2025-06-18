const { ipcRenderer } = require('electron');

// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const formatButtons = document.querySelectorAll('.format-btn');
const sizeButtons = document.querySelectorAll('.size-btn');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const customWidth = document.getElementById('customWidth');
const customHeight = document.getElementById('customHeight');
const customSizeGroup = document.getElementById('customSizeGroup');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const processingState = document.getElementById('processingState');
const progressFill = document.getElementById('progressFill');
const currentFile = document.getElementById('currentFile');
const processedCount = document.getElementById('processedCount');
const totalCount = document.getElementById('totalCount');
const resultsDashboard = document.getElementById('resultsDashboard');
const resultsList = document.getElementById('resultsList');
const successCount = document.getElementById('successCount');
const spaceSaved = document.getElementById('spaceSaved');
const avgReduction = document.getElementById('avgReduction');
const processTime = document.getElementById('processTime');
const openFolderBtn = document.getElementById('openFolderBtn');
const processMoreBtn = document.getElementById('processMoreBtn');
const newConversionBtn = document.getElementById('newConversionBtn');

// Modal elements
const stripMetadata = document.getElementById('stripMetadata');
const autoOpenOutput = document.getElementById('autoOpenOutput');
const overwriteFiles = document.getElementById('overwriteFiles');
const outputPath = document.getElementById('outputPath');
const selectOutputDir = document.getElementById('selectOutputDir');
const defaultFormat = document.getElementById('defaultFormat');
const defaultResolution = document.getElementById('defaultResolution');
const saveSettings = document.getElementById('saveSettings');
const resetSettings = document.getElementById('resetSettings');

// State
let settings = {
    format: 'jpeg',
    quality: 80,
    preset: 'custom',
    customWidth: 1920,
    customHeight: 1080,
    stripMetadata: true,
    autoOpenOutput: true,
    overwriteFiles: false,
    outputDir: ''
};

let processStartTime = 0;

// Initialize
async function init() {
    await loadSettings();
    updateUI();
    setupEventListeners();
}

// Load settings from storage
async function loadSettings() {
    try {
        const savedSettings = await ipcRenderer.invoke('get-settings');
        if (savedSettings) {
            settings = { ...settings, ...savedSettings };
        }
        
        // Get output directory
        const outputDir = await ipcRenderer.invoke('get-output-dir');
        if (outputDir) {
            settings.outputDir = outputDir;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Update UI from settings
function updateUI() {
    // Format buttons
    formatButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.format === settings.format);
    });

    // Size buttons
    sizeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.preset === settings.preset);
    });

    // Custom size visibility
    if (settings.preset === 'custom') {
        customSizeGroup.classList.remove('hidden');
    } else {
        customSizeGroup.classList.add('hidden');
    }

    // Quality
    qualitySlider.value = settings.quality;
    qualityValue.textContent = `${settings.quality}%`;

    // Custom dimensions
    customWidth.value = settings.customWidth;
    customHeight.value = settings.customHeight;

    // Modal settings
    stripMetadata.checked = settings.stripMetadata;
    autoOpenOutput.checked = settings.autoOpenOutput;
    overwriteFiles.checked = settings.overwriteFiles;
    outputPath.value = settings.outputDir;
    defaultFormat.value = settings.format;
    defaultResolution.value = settings.preset;
}

// Save settings
async function saveSettingsToStorage() {
    try {
        await ipcRenderer.invoke('save-settings', settings);
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Drop zone
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);

    // Format buttons
    formatButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            formatButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            settings.format = btn.dataset.format;
            saveSettingsToStorage();
        });
    });

    // Size buttons
    sizeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            sizeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            settings.preset = btn.dataset.preset;
            
            if (settings.preset === 'custom') {
                customSizeGroup.classList.remove('hidden');
            } else {
                customSizeGroup.classList.add('hidden');
            }
            
            saveSettingsToStorage();
        });
    });

    // Quality slider
    qualitySlider.addEventListener('input', (e) => {
        settings.quality = parseInt(e.target.value);
        qualityValue.textContent = `${settings.quality}%`;
        saveSettingsToStorage();
    });

    // Custom dimensions
    customWidth.addEventListener('change', (e) => {
        settings.customWidth = parseInt(e.target.value) || 1920;
        saveSettingsToStorage();
    });

    customHeight.addEventListener('change', (e) => {
        settings.customHeight = parseInt(e.target.value) || 1080;
        saveSettingsToStorage();
    });

    // Settings modal
    settingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'flex';
    });

    closeSettings.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });

    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });

    // Modal form elements
    stripMetadata.addEventListener('change', (e) => {
        settings.stripMetadata = e.target.checked;
        saveSettingsToStorage();
    });

    autoOpenOutput.addEventListener('change', (e) => {
        settings.autoOpenOutput = e.target.checked;
        saveSettingsToStorage();
    });

    overwriteFiles.addEventListener('change', (e) => {
        settings.overwriteFiles = e.target.checked;
        saveSettingsToStorage();
    });

    selectOutputDir.addEventListener('click', async () => {
        const dir = await ipcRenderer.invoke('select-output-dir');
        if (dir) {
            settings.outputDir = dir;
            outputPath.value = dir;
            saveSettingsToStorage();
        }
    });

    defaultFormat.addEventListener('change', (e) => {
        settings.format = e.target.value;
        updateUI();
        saveSettingsToStorage();
    });

    defaultResolution.addEventListener('change', (e) => {
        settings.preset = e.target.value;
        updateUI();
        saveSettingsToStorage();
    });

    saveSettings.addEventListener('click', () => {
        settingsModal.style.display = 'none';
        showNotification('Settings saved successfully', 'success');
    });

    resetSettings.addEventListener('click', () => {
        settings = {
            format: 'jpeg',
            quality: 80,
            preset: 'custom',
            customWidth: 1920,
            customHeight: 1080,
            stripMetadata: true,
            autoOpenOutput: true,
            overwriteFiles: false,
            outputDir: ''
        };
        updateUI();
        saveSettingsToStorage();
        showNotification('Settings reset to defaults', 'info');
    });

    // Dashboard actions
    openFolderBtn.addEventListener('click', () => {
        if (settings.outputDir) {
            ipcRenderer.invoke('open-folder', settings.outputDir);
        }
    });

    processMoreBtn.addEventListener('click', () => {
        resetToDropZone();
        fileInput.click();
    });

    newConversionBtn.addEventListener('click', () => {
        resetToDropZone();
    });
}

// Drag and drop handlers
function handleDragOver(e) {
    e.preventDefault();
    dropZone.classList.add('drag-over');
}

function handleDragLeave(e) {
    if (!dropZone.contains(e.relatedTarget)) {
        dropZone.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
        processImages(files);
    }
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
        processImages(files);
    }
}

// Process images
async function processImages(files) {
    processStartTime = Date.now();
    
    // Hide drop zone and show processing
    dropZone.style.display = 'none';
    processingState.style.display = 'block';
    resultsDashboard.style.display = 'none';

    // Reset progress
    progressFill.style.width = '0%';
    processedCount.textContent = '0';
    totalCount.textContent = files.length;

    try {
        // Convert files to the format expected by main process
        const fileData = await Promise.all(files.map(async (file) => {
            const buffer = await file.arrayBuffer();
            return {
                name: file.name,
                size: file.size,
                buffer: new Uint8Array(buffer)
            };
        }));

        // Process images
        const results = await ipcRenderer.invoke('process-images', {
            files: fileData,
            settings
        });

        // Show results
        showResults(results, files.length);

    } catch (error) {
        console.error('Error processing images:', error);
        showNotification('Error processing images', 'error');
        resetToDropZone();
    }
}

// Show results dashboard
function showResults(results, totalFiles) {
    const endTime = Date.now();
    const processingTime = Math.round((endTime - processStartTime) / 1000);

    // Hide processing, show results
    processingState.style.display = 'none';
    resultsDashboard.style.display = 'block';

    // Calculate statistics
    const successful = results.filter(r => r.success).length;
    const totalSpaceSaved = results.reduce((acc, r) => {
        if (r.success) {
            return acc + (r.originalSize - r.newSize);
        }
        return acc;
    }, 0);

    const avgReductionPercent = results.length > 0 
        ? Math.round(results.reduce((acc, r) => {
            return acc + (r.savingsPercent || 0);
        }, 0) / results.length)
        : 0;

    // Update statistics
    successCount.textContent = successful;
    spaceSaved.textContent = formatFileSize(totalSpaceSaved);
    avgReduction.textContent = `${avgReductionPercent}%`;
    processTime.textContent = `${processingTime}s`;

    // Update results list
    resultsList.innerHTML = '';
    results.forEach(result => {
        const item = document.createElement('div');
        item.className = `result-item ${result.success ? 'success' : 'error'}`;
        
        if (result.success) {
            const savings = formatFileSize(result.originalSize - result.newSize);
            item.innerHTML = `
                <span class="result-filename">${result.name}</span>
                <span class="result-savings">-${savings} (${result.savingsPercent}%)</span>
            `;
        } else {
            item.innerHTML = `
                <span class="result-filename">${result.name}</span>
                <span class="result-error">${result.error}</span>
            `;
        }
        
        resultsList.appendChild(item);
    });

    // Auto-open folder if enabled
    if (settings.autoOpenOutput && settings.outputDir) {
        setTimeout(() => {
            ipcRenderer.invoke('open-folder', settings.outputDir);
        }, 1000);
    }
}

// Reset to drop zone
function resetToDropZone() {
    dropZone.style.display = 'block';
    processingState.style.display = 'none';
    resultsDashboard.style.display = 'none';
    fileInput.value = '';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Handle progress updates from main process
ipcRenderer.on('process-progress', (_, data) => {
    const progress = (data.current / data.total) * 100;
    progressFill.style.width = `${progress}%`;
    currentFile.textContent = data.file;
    processedCount.textContent = data.current;
});

// Initialize app
init(); 