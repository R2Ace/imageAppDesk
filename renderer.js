// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileList = document.getElementById('fileList');
const selectFilesBtn = document.getElementById('selectFilesBtn');
const outputDirBtn = document.getElementById('outputDirBtn');
const outputDirInput = document.getElementById('outputDir');
const processBtn = document.getElementById('processBtn');
const clearBtn = document.getElementById('clearBtn');
const progressOverlay = document.getElementById('progressOverlay');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const currentFileText = document.getElementById('currentFileText');
const resultsOverlay = document.getElementById('resultsOverlay');
const resultsList = document.getElementById('resultsList');
const processedCount = document.getElementById('processedCount');
const successCount = document.getElementById('successCount');
const errorCount = document.getElementById('errorCount');
const totalSaved = document.getElementById('totalSaved');
const openFolderBtn = document.getElementById('openFolderBtn');
const closeResultsBtn = document.getElementById('closeResultsBtn');
const widthSetting = document.getElementById('widthSetting');
const percentageSetting = document.getElementById('percentageSetting');
const widthInput = document.getElementById('width');
const percentageInput = document.getElementById('percentage');
const formatSelect = document.getElementById('format');
const qualityInput = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const stripMetadataCheckbox = document.getElementById('stripMetadata');
const resizeTypeRadios = document.querySelectorAll('input[name="resizeType"]');

// State variables
let selectedFiles = [];
let settings = {};

// Initialize the app
async function initApp() {
  // Load settings
  const storedSettings = await window.electronAPI.getSettings();
  settings = storedSettings.lastUsedSettings;
  outputDirInput.value = storedSettings.outputDir;
  
  // Apply settings to UI
  updateUIFromSettings();
  
  // Set up event listeners
  setupEventListeners();
}

// Update UI elements from settings
function updateUIFromSettings() {
  // Set resize method
  document.querySelector(`input[name="resizeType"][value="${settings.resizeType}"]`).checked = true;
  toggleResizeSettings();
  
  // Set width and percentage values
  widthInput.value = settings.width;
  percentageInput.value = settings.percentage;
  
  // Set format
  formatSelect.value = settings.format;
  
  // Set quality
  qualityInput.value = settings.quality;
  qualityValue.textContent = `${settings.quality}%`;
  updateQualitySlider();
  
  // Set strip metadata checkbox
  stripMetadataCheckbox.checked = settings.stripMetadata;
  
  // Update format-dependent UI
  handleFormatChange();
}

// Set up all event listeners
function setupEventListeners() {
  // Drag and drop events
  dropZone.addEventListener('dragover', handleDragOver);
  dropZone.addEventListener('dragleave', handleDragLeave);
  dropZone.addEventListener('drop', handleDrop);
  
  // Button click events
  selectFilesBtn.addEventListener('click', handleFileSelect);
  outputDirBtn.addEventListener('click', handleOutputDirSelect);
  processBtn.addEventListener('click', handleProcess);
  clearBtn.addEventListener('click', handleClear);
  openFolderBtn.addEventListener('click', handleOpenFolder);
  closeResultsBtn.addEventListener('click', () => resultsOverlay.classList.add('hidden'));
  
  // Settings change events
  resizeTypeRadios.forEach(radio => {
    radio.addEventListener('change', toggleResizeSettings);
  });
  
  qualityInput.addEventListener('input', handleQualityChange);
  
  // Save settings on change
  const settingsInputs = [widthInput, percentageInput, formatSelect, qualityInput, stripMetadataCheckbox];
  settingsInputs.forEach(input => {
    input.addEventListener('change', updateSettingsFromUI);
  });
  resizeTypeRadios.forEach(radio => {
    radio.addEventListener('change', updateSettingsFromUI);
  });
  
  // Setup progress update listener
  window.electronAPI.onProcessProgress(handleProgressUpdate);
  
  // Format change
  formatSelect.addEventListener('change', handleFormatChange);
}

// Handle file drag over
function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.add('active');
}

// Handle file drag leave
function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('active');
}

// Handle file drop
function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('active');
  
  if (e.dataTransfer.files.length > 0) {
    handleFiles(e.dataTransfer.files);
  }
}

// Handle file selection via button
function handleFileSelect() {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  input.accept = 'image/*';
  
  input.onchange = (e) => {
    if (e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };
  
  input.click();
}

// Process selected files
function handleFiles(fileList) {
  const supportedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.tiff', '.tif', '.gif', '.svg', '.heif'];
  
  const newFiles = Array.from(fileList).filter(file => {
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    
    // Check by MIME type
    if (fileType.includes('image')) {
      return true;
    }
    
    // If MIME type is not detected, check by extension
    return supportedExtensions.some(ext => fileName.endsWith(ext));
  });
  
  if (newFiles.length === 0) {
    alert('Please select valid image files (JPG, PNG, WebP, HEIC, TIFF, GIF, SVG, HEIF)');
    return;
  }
  
  // Add files to our selected files array
  selectedFiles = [...selectedFiles, ...newFiles];
  
  // Update UI
  updateFileList();
  processBtn.disabled = selectedFiles.length === 0;
}

// Update the file list UI
function updateFileList() {
  fileList.innerHTML = '';
  
  if (selectedFiles.length > 0) {
    fileList.classList.remove('hidden');
    
    selectedFiles.forEach((file, index) => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      
      const fileName = document.createElement('div');
      fileName.className = 'file-name';
      fileName.textContent = file.name;
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'file-remove';
      removeBtn.innerHTML = '&times;';
      removeBtn.addEventListener('click', () => removeFile(index));
      
      fileItem.appendChild(fileName);
      fileItem.appendChild(removeBtn);
      fileList.appendChild(fileItem);
    });
  } else {
    fileList.classList.add('hidden');
  }
}

// Remove a file from the list
function removeFile(index) {
  selectedFiles.splice(index, 1);
  updateFileList();
  processBtn.disabled = selectedFiles.length === 0;
}

// Toggle resize settings based on the selected resize type
function toggleResizeSettings() {
  const resizeType = document.querySelector('input[name="resizeType"]:checked').value;
  
  if (resizeType === 'width') {
    widthSetting.classList.remove('hidden');
    percentageSetting.classList.add('hidden');
  } else {
    widthSetting.classList.add('hidden');
    percentageSetting.classList.remove('hidden');
  }
}

// Handle quality slider change
function handleQualityChange() {
  const quality = qualityInput.value;
  qualityValue.textContent = `${quality}%`;
  updateQualitySlider();
}

// Update quality slider gradient
function updateQualitySlider() {
  const value = qualityInput.value;
  qualityInput.style.background = `linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ${value}%, var(--border-color) ${value}%, var(--border-color) 100%)`;
}

// Handle output directory selection
async function handleOutputDirSelect() {
  const dir = await window.electronAPI.selectOutputDir();
  if (dir) {
    outputDirInput.value = dir;
  }
}

// Update settings object from UI values
function updateSettingsFromUI() {
  settings = {
    resizeType: document.querySelector('input[name="resizeType"]:checked').value,
    width: parseInt(widthInput.value) || 800,
    percentage: parseInt(percentageInput.value) || 50,
    format: formatSelect.value,
    quality: parseInt(qualityInput.value) || 80,
    stripMetadata: stripMetadataCheckbox.checked
  };
  
  // Save the settings
  window.electronAPI.saveSettings({
    lastUsedSettings: settings
  });
}

// Handle process button click
async function handleProcess() {
  if (selectedFiles.length === 0) return;
  
  // Show progress overlay
  progressOverlay.classList.remove('hidden');
  progressBar.style.width = '0%';
  progressText.textContent = `Processing 0 of ${selectedFiles.length}`;
  currentFileText.textContent = 'Starting...';
  
  // Update settings from UI
  updateSettingsFromUI();
  
  try {
    // Create an array of file objects
    const files = [];
    for (const file of selectedFiles) {
      // Create a blob copy of the file that can be sent to the main process
      const arrayBuffer = await file.arrayBuffer();
      files.push({
        name: file.name,
        type: file.type,
        size: file.size,
        buffer: Array.from(new Uint8Array(arrayBuffer))
      });
    }
    
    // Process images
    const results = await window.electronAPI.processImages({
      files,
      settings
    });
    
    // Show results
    showResults(results);
  } catch (error) {
    console.error('Error processing images:', error);
    alert('An error occurred while processing images. Please try again.');
    progressOverlay.classList.add('hidden');
  }
}

// Handle progress updates
function handleProgressUpdate(event, data) {
  const percent = Math.round((data.current / data.total) * 100);
  progressBar.style.width = `${percent}%`;
  progressText.textContent = `Processing ${data.current} of ${data.total}`;
  currentFileText.textContent = `Current: ${data.file}`;
}

// Show results overlay
function showResults(results) {
  // Hide progress overlay
  progressOverlay.classList.add('hidden');
  
  // Calculate stats
  const processed = results.length;
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  let totalSizeOriginal = 0;
  let totalSizeNew = 0;
  
  results.forEach(result => {
    if (result.success) {
      totalSizeOriginal += result.originalSize;
      totalSizeNew += result.newSize;
    }
  });
  
  const savedBytes = totalSizeOriginal - totalSizeNew;
  const savedPercent = totalSizeOriginal > 0 ? Math.round((savedBytes / totalSizeOriginal) * 100) : 0;
  
  // Update UI
  processedCount.textContent = processed;
  successCount.textContent = successful;
  errorCount.textContent = failed;
  totalSaved.textContent = savedPercent > 0 ? `${savedPercent}%` : '0%';
  
  // Populate results list
  resultsList.innerHTML = '';
  
  results.forEach(result => {
    const resultItem = document.createElement('div');
    resultItem.className = 'result-item';
    
    const resultIcon = document.createElement('div');
    resultIcon.className = result.success ? 'result-icon success' : 'result-icon error';
    resultIcon.innerHTML = result.success ? '✓' : '✗';
    
    const resultDetails = document.createElement('div');
    resultDetails.className = 'result-details';
    
    const resultName = document.createElement('div');
    resultName.className = 'result-name';
    resultName.textContent = result.name;
    
    const resultStats = document.createElement('div');
    resultStats.className = 'result-stats';
    
    if (result.success) {
      const originalSize = formatFileSize(result.originalSize);
      const newSize = formatFileSize(result.newSize);
      resultStats.textContent = `${originalSize} → ${newSize} (${result.savingsPercent}% saved)`;
    } else {
      resultStats.textContent = `Error: ${result.error}`;
    }
    
    resultDetails.appendChild(resultName);
    resultDetails.appendChild(resultStats);
    
    resultItem.appendChild(resultIcon);
    resultItem.appendChild(resultDetails);
    resultsList.appendChild(resultItem);
  });
  
  // Show results overlay
  resultsOverlay.classList.remove('hidden');
}

// Format file size to human-readable format
function formatFileSize(bytes) {
  if (bytes < 1024) {
    return bytes + ' B';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  } else {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}

// Handle clear button click
function handleClear() {
  selectedFiles = [];
  updateFileList();
  processBtn.disabled = true;
}

// Handle open folder button click
async function handleOpenFolder() {
  if (outputDirInput.value) {
    await window.electronAPI.openFolder(outputDirInput.value);
  }
}

// Handle format change
function handleFormatChange() {
  const format = formatSelect.value;
  
  // Find the quality setting container
  const qualityContainer = document.querySelector('.setting-group .range-container').closest('.setting-group');
  
  // GIF doesn't support quality settings in the same way as other formats
  if (format === 'gif') {
    qualityContainer.classList.add('disabled');
    qualityInput.disabled = true;
  } else {
    qualityContainer.classList.remove('disabled');
    qualityInput.disabled = false;
  }
  
  updateSettingsFromUI();
}

// Initialize the app
document.addEventListener('DOMContentLoaded', initApp); 