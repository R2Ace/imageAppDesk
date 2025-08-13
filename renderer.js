// const { ipcRenderer } = require('electron');

// DOM Elements
let dropZone, fileInput, processingState, resultsDashboard, settingsModal;
let filePreviewStage, fileList, fileCount, totalSize, outputFormat;
let startProcessingBtn, cancelProcessingBtn;
let progressFill, currentFile, processedCount, totalCount;
let successCount, spaceSaved, avgReduction, processTime, resultsList;
let openFolderBtn, processMoreBtn, newConversionBtn;
let resultsPopup, popupSuccessCount, popupSpaceSaved, popupAvgReduction;
let viewDetailsBtn, openFolderPopupBtn, closeResultsPopupBtn;

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
let processStartTime = 0;
let pendingFiles = [];
let currentResults = null;
let settings = {
    format: 'jpeg',
    preset: 'custom',
    customWidth: 1920,
    customHeight: 1080,
    quality: 80,
    outputDir: null,
    stripMetadata: true,
    autoOpenOutput: true,
    overwriteFiles: false
};

// Initialize
async function init() {
    await loadSettings();
    setupElements();
    setupEventListeners();
    updateUI();
    
    // Check license status and show paywall if needed
    await checkLicenseStatus();
}

// Load settings from storage
async function loadSettings() {
    try {
        const savedSettings = await window.electronAPI.getSettings();
        if (savedSettings) {
            settings = { ...settings, ...savedSettings };
        }
        
        // Get output directory
        const outputDir = await window.electronAPI.getOutputDir();
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
    document.querySelectorAll('.format-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.format === settings.format);
    });

    // Size buttons
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.preset === settings.preset);
    });

    // Custom size visibility
    const customSizeGroup = document.getElementById('customSizeGroup');
    customSizeGroup.style.display = settings.preset === 'custom' ? 'flex' : 'none';

    // Quality
    document.getElementById('qualitySlider').value = settings.quality;
    document.getElementById('qualityValue').textContent = `${settings.quality}%`;

    // Custom dimensions
    document.getElementById('customWidth').value = settings.customWidth;
    document.getElementById('customHeight').value = settings.customHeight;

    // Modal settings
    stripMetadata.checked = settings.stripMetadata;
    autoOpenOutput.checked = settings.autoOpenOutput;
    overwriteFiles.checked = settings.overwriteFiles;
    outputPath.value = settings.outputDir;
    defaultFormat.value = settings.format;
    defaultResolution.value = settings.preset;

    // Update output format in preview
    if (outputFormat) {
        outputFormat.textContent = settings.format.toUpperCase();
    }
}

// Save settings
async function saveSettingsToStorage() {
    try {
        await window.electronAPI.saveSettings(settings);
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
    document.querySelectorAll('.format-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            settings.format = btn.dataset.format;
            saveSettingsToStorage();
        });
    });

    // Size buttons
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            settings.preset = btn.dataset.preset;
            
            if (settings.preset === 'custom') {
                customSizeGroup.style.display = 'flex';
            } else {
                customSizeGroup.style.display = 'none';
            }
            
            saveSettingsToStorage();
        });
    });

    // Quality slider
    document.getElementById('qualitySlider').addEventListener('input', (e) => {
        settings.quality = parseInt(e.target.value);
        document.getElementById('qualityValue').textContent = `${settings.quality}%`;
        saveSettingsToStorage();
    });

    // Custom dimensions
    document.getElementById('customWidth').addEventListener('change', (e) => {
        settings.customWidth = parseInt(e.target.value) || 1920;
        saveSettingsToStorage();
    });

    document.getElementById('customHeight').addEventListener('change', (e) => {
        settings.customHeight = parseInt(e.target.value) || 1080;
        saveSettingsToStorage();
    });

    // Settings modal
    document.getElementById('settingsBtn').addEventListener('click', () => {
        settingsModal.style.display = 'flex';
    });

    document.getElementById('closeSettings').addEventListener('click', () => {
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
        const dir = await window.electronAPI.selectOutputDir();
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
            window.electronAPI.openFolder(settings.outputDir);
        }
    });

    processMoreBtn.addEventListener('click', () => {
        resetToDropZone();
        fileInput.click();
    });

    newConversionBtn.addEventListener('click', () => {
        resetToDropZone();
    });

    // Preview stage actions
    startProcessingBtn.addEventListener('click', () => {
        if (pendingFiles.length > 0) {
            processImages(pendingFiles);
        }
    });

    cancelProcessingBtn.addEventListener('click', () => {
        resetToDropZone();
    });

    // Results popup actions
    viewDetailsBtn.addEventListener('click', () => {
        resultsPopup.style.display = 'none';
        // The detailed results dashboard is already visible
    });

    openFolderPopupBtn.addEventListener('click', () => {
        if (settings.outputDir) {
            window.electronAPI.openFolder(settings.outputDir);
        }
    });

    closeResultsPopupBtn.addEventListener('click', () => {
        resultsPopup.style.display = 'none';
    });

    // Click outside popup to close
    resultsPopup.addEventListener('click', (e) => {
        if (e.target === resultsPopup) {
            resultsPopup.style.display = 'none';
        }
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
        showPreviewStage(files);
    }
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
        showPreviewStage(files);
    }
}

// Show preview stage
function showPreviewStage(files) {
    pendingFiles = files;
    
    // Hide drop zone, show preview
    dropZone.style.display = 'none';
    filePreviewStage.style.display = 'block';
    processingState.style.display = 'none';
    resultsDashboard.style.display = 'none';

    // Clear previous file list
    fileList.innerHTML = '';

    // Calculate total size
    let totalBytes = 0;
    
    // Populate file list with image previews
    files.forEach(file => {
        totalBytes += file.size;
        
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const fileExt = file.name.split('.').pop().toUpperCase();
        
        // Create object URL for image preview
        const imageUrl = URL.createObjectURL(file);
        
        fileItem.innerHTML = `
            <div class="file-info">
                <div class="file-preview">
                    <img src="${imageUrl}" alt="${file.name}" onerror="this.style.display='none'; this.parentNode.innerHTML='📷';">
                </div>
                <div class="file-details">
                    <h4>${file.name}</h4>
                    <p>${formatFileSize(file.size)} • ${fileExt}</p>
                </div>
            </div>
        `;
        
        fileList.appendChild(fileItem);
    });

    // Update summary
    fileCount.textContent = files.length;
    totalSize.textContent = formatFileSize(totalBytes);
    outputFormat.textContent = settings.format.toUpperCase();
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
        const results = await window.electronAPI.processImages({
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

    // Show popup immediately with key stats
    popupSuccessCount.textContent = successful;
    popupSpaceSaved.textContent = formatFileSize(totalSpaceSaved);
    popupAvgReduction.textContent = `${avgReductionPercent}%`;
    
    // Display popup modal
    resultsPopup.style.display = 'flex';

    // Prepare detailed results dashboard in background
    processingState.style.display = 'none';
    resultsDashboard.style.display = 'block';

    // Update detailed statistics
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

    // Auto-open folder if enabled (but delayed so popup shows first)
    if (settings.autoOpenOutput && settings.outputDir) {
        setTimeout(() => {
            window.electronAPI.openFolder(settings.outputDir);
        }, 2000); // Increased delay to let users see the popup
    }

    currentResults = results;
}

// Reset to drop zone
function resetToDropZone() {
    // Clean up object URLs to prevent memory leaks
    const previews = fileList.querySelectorAll('.file-preview img');
    previews.forEach(img => {
        if (img.src.startsWith('blob:')) {
            URL.revokeObjectURL(img.src);
        }
    });
    
    dropZone.style.display = 'block';
    filePreviewStage.style.display = 'none';
    processingState.style.display = 'none';
    resultsDashboard.style.display = 'none';
    fileInput.value = '';
    pendingFiles = [];
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
window.electronAPI.onProcessProgress((data) => {
    const progress = (data.current / data.total) * 100;
    progressFill.style.width = `${progress}%`;
    currentFile.textContent = data.file;
    processedCount.textContent = data.current;
});

function setupElements() {
    // Main elements
    dropZone = document.getElementById('dropZone');
    fileInput = document.getElementById('fileInput');
    processingState = document.getElementById('processingState');
    resultsDashboard = document.getElementById('resultsDashboard');
    settingsModal = document.getElementById('settingsModal');

    // Preview stage elements
    filePreviewStage = document.getElementById('filePreviewStage');
    fileList = document.getElementById('fileList');
    fileCount = document.getElementById('fileCount');
    totalSize = document.getElementById('totalSize');
    outputFormat = document.getElementById('outputFormat');
    startProcessingBtn = document.getElementById('startProcessing');
    cancelProcessingBtn = document.getElementById('cancelProcessing');

    // Processing elements
    progressFill = document.getElementById('progressFill');
    currentFile = document.getElementById('currentFile');
    processedCount = document.getElementById('processedCount');
    totalCount = document.getElementById('totalCount');

    // Results elements
    successCount = document.getElementById('successCount');
    spaceSaved = document.getElementById('spaceSaved');
    avgReduction = document.getElementById('avgReduction');
    processTime = document.getElementById('processTime');
    resultsList = document.getElementById('resultsList');
    openFolderBtn = document.getElementById('openFolderBtn');
    processMoreBtn = document.getElementById('processMoreBtn');
    newConversionBtn = document.getElementById('newConversionBtn');

    // Results popup elements
    resultsPopup = document.getElementById('resultsPopup');
    popupSuccessCount = document.getElementById('popupSuccessCount');
    popupSpaceSaved = document.getElementById('popupSpaceSaved');
    popupAvgReduction = document.getElementById('popupAvgReduction');
    viewDetailsBtn = document.getElementById('viewDetailsBtn');
    openFolderPopupBtn = document.getElementById('openFolderPopupBtn');
    closeResultsPopupBtn = document.getElementById('closeResultsPopupBtn');
}

// License and paywall functions
async function checkLicenseStatus() {
    try {
        const licenseResult = await window.electronAPI.checkLicense();
        
        if (!licenseResult.isLicensed) {
            showPaywall();
        } else {
            console.log('License active:', licenseResult.licenseInfo.licenseKey);
            // App is licensed, show full functionality
            enableFullApp();
        }
    } catch (error) {
        console.error('Error checking license:', error);
        // On error, assume unlicensed and show paywall
        showPaywall();
    }
}

function showPaywall() {
    // Create paywall modal
    const paywall = document.createElement('div');
    paywall.id = 'paywall-modal';
    paywall.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(10px);
    `;
    
    paywall.innerHTML = `
        <div style="
            background: white;
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            max-width: 500px;
            margin: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        ">
            <h2 style="margin: 0 0 16px 0; color: #1e293b; font-size: 28px;">Welcome to Épure!</h2>
            <p style="margin: 0 0 24px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                The native Mac app that converts images 3x faster than web tools.<br>
                <strong>$9 once</strong> vs. $24+ monthly subscriptions.
            </p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
                <h3 style="margin: 0 0 12px 0; color: #059669;">✅ What you get:</h3>
                <ul style="text-align: left; margin: 0; padding-left: 20px; color: #374151;">
                    <li>Lightning-fast local processing</li>
                    <li>Complete privacy - files never uploaded</li>
                    <li>All image formats (HEIC, PNG, JPG, WebP)</li>
                    <li>Batch conversion</li>
                    <li>Lifetime updates</li>
                </ul>
            </div>
            
            <div style="display: flex; gap: 12px; margin-top: 24px;">
                <button id="buy-now-btn" style="
                    flex: 1;
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                    border: none;
                    padding: 16px 24px;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s;
                " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    Buy for $9
                </button>
                <button id="activate-license-btn" style="
                    background: #f1f5f9;
                    color: #64748b;
                    border: 2px solid #e2e8f0;
                    padding: 16px 24px;
                    border-radius: 12px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                " onmouseover="this.style.borderColor='#3b82f6'" onmouseout="this.style.borderColor='#e2e8f0'">
                    Have a license?
                </button>
            </div>
            
            <p style="margin: 16px 0 0 0; color: #94a3b8; font-size: 12px;">
                30-day money-back guarantee • No subscriptions
            </p>
        </div>
    `;
    
    document.body.appendChild(paywall);
    
    // Add event listeners
    document.getElementById('buy-now-btn').addEventListener('click', startPurchaseFlow);
    document.getElementById('activate-license-btn').addEventListener('click', showLicenseActivation);
    
    // Disable main app functionality
    disableMainApp();
}

function enableFullApp() {
    // Remove paywall if present
    const paywall = document.getElementById('paywall-modal');
    if (paywall) {
        paywall.remove();
    }
    
    // Enable all functionality
    const mainContainer = document.querySelector('.app-container');
    if (mainContainer) {
        mainContainer.style.opacity = '1';
        mainContainer.style.pointerEvents = 'auto';
    }
}

function disableMainApp() {
    // Dim and disable main app
    const mainContainer = document.querySelector('.app-container');
    if (mainContainer) {
        mainContainer.style.opacity = '0.5';
        mainContainer.style.pointerEvents = 'none';
    }
}

async function startPurchaseFlow() {
    const buyBtn = document.getElementById('buy-now-btn');
    buyBtn.textContent = 'Opening payment...';
    buyBtn.disabled = true;
    
    try {
        // Open Stripe payment URL in browser for now
        // In a real implementation, you'd integrate Stripe Elements
        const stripeUrl = 'https://buy.stripe.com/test_your_payment_link_here';
        await window.electronAPI.openPaymentUrl(stripeUrl);
        
        // Show message about completing payment in browser
        buyBtn.textContent = 'Complete payment in browser';
        
        // For testing, add a button to manually activate license
        setTimeout(() => {
            buyBtn.textContent = 'Payment completed? Click here';
            buyBtn.disabled = false;
            buyBtn.onclick = () => testLicenseActivation();
        }, 3000);
        
    } catch (error) {
        console.error('Payment flow error:', error);
        buyBtn.textContent = 'Try again';
        buyBtn.disabled = false;
    }
}

function showLicenseActivation() {
    const licenseKey = prompt('Enter your license key:');
    if (licenseKey) {
        activateLicenseKey(licenseKey);
    }
}

async function activateLicenseKey(licenseKey) {
    try {
        const result = await window.electronAPI.activateLicense(licenseKey);
        if (result.success) {
            alert('License activated successfully!');
            enableFullApp();
        } else {
            alert('Invalid license key: ' + result.error);
        }
    } catch (error) {
        console.error('License activation error:', error);
        alert('Error activating license: ' + error.message);
    }
}

// For testing - generate and activate a test license
async function testLicenseActivation() {
    const testLicense = 'EPURE-TEST-' + Date.now().toString(36).toUpperCase();
    await activateLicenseKey(testLicense);
}

// Initialize app
init(); 