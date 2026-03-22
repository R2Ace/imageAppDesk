const log = {
  info: (message, ...args) => {
    console.log(`[RENDERER] ${new Date().toISOString()} - ${message}`, ...args);
  },
  error: (message, ...args) => {
    console.error(`[RENDERER ERROR] ${new Date().toISOString()} - ${message}`, ...args);
  },
  debug: (message, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[RENDERER DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }
};

log.info('Renderer script loaded');

// ═══════════════════════════════════════
// STATE
// ═══════════════════════════════════════
let settings = {
  format: 'jpeg',
  preset: 'custom',
  customWidth: 1920,
  customHeight: 1080,
  quality: 80,
  outputDir: null,
  stripMetadata: false,
  autoOpenOutput: true,
  overwriteFiles: false
};

let selectedFiles = [];
let processStartTime = 0;

// ═══════════════════════════════════════
// DOM REFS (populated in setupElements)
// ═══════════════════════════════════════
let dropZone, fileInput, settingsModal;
let uploadIdle, uploadActive, fileThumb, fileName, fileSize, fileListScroll, changeFileBtn, browseLink;
let flowFormatSelect, flowQuality, flowQualityValue, convertBtn, convertBtnText;
let downloadIdle, downloadActive, resultIcon, resultName, resultStats, resultListScroll;
let openFolderBtn, newConversionBtn;

// Settings modal refs
const stripMetadata = document.getElementById('stripMetadata');
const autoOpenOutput = document.getElementById('autoOpenOutput');
const overwriteFiles = document.getElementById('overwriteFiles');
const outputPath = document.getElementById('outputPath');
const selectOutputDir = document.getElementById('selectOutputDir');
const defaultFormat = document.getElementById('defaultFormat');
const defaultResolution = document.getElementById('defaultResolution');
const saveSettings = document.getElementById('saveSettings');
const resetSettings = document.getElementById('resetSettings');

// ═══════════════════════════════════════
// INIT
// ═══════════════════════════════════════
async function init() {
  log.info('Initializing renderer...');
  try {
    await loadSettings();
    setupElements();
    setupEventListeners();
    updateSettingsUI();
    await checkLicenseStatus();
    log.info('Renderer initialization completed successfully');
  } catch (error) {
    log.error('Failed to initialize renderer:', error.message);
    throw error;
  }
}

async function loadSettings() {
  try {
    const savedSettings = await window.electronAPI.getSettings();
    if (savedSettings) settings = { ...settings, ...savedSettings };
    const outputDir = await window.electronAPI.getOutputDir();
    if (outputDir) settings.outputDir = outputDir;
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

function updateSettingsUI() {
  document.getElementById('qualitySlider').value = settings.quality;
  document.getElementById('qualityValue').textContent = `${settings.quality}%`;
  document.getElementById('customWidth').value = settings.customWidth;
  document.getElementById('customHeight').value = settings.customHeight;

  if (stripMetadata) stripMetadata.checked = settings.stripMetadata;
  if (autoOpenOutput) autoOpenOutput.checked = settings.autoOpenOutput;
  if (overwriteFiles) overwriteFiles.checked = settings.overwriteFiles;
  if (outputPath) outputPath.value = settings.outputDir || '';
  if (defaultFormat) defaultFormat.value = settings.format;
  if (defaultResolution) defaultResolution.value = settings.preset;

  if (flowQuality) flowQuality.value = settings.quality;
  if (flowQualityValue) flowQualityValue.textContent = `${settings.quality}%`;
}

async function saveSettingsToStorage() {
  try { await window.electronAPI.saveSettings(settings); }
  catch (error) { console.error('Error saving settings:', error); }
}

// ═══════════════════════════════════════
// SETUP ELEMENTS
// ═══════════════════════════════════════
function setupElements() {
  dropZone = document.getElementById('dropZone');
  fileInput = document.getElementById('fileInput');
  settingsModal = document.getElementById('settingsModal');

  uploadIdle = document.getElementById('uploadIdle');
  uploadActive = document.getElementById('uploadActive');
  fileThumb = document.getElementById('fileThumb');
  fileName = document.getElementById('fileName');
  fileSize = document.getElementById('fileSize');
  fileListScroll = document.getElementById('fileListScroll');
  changeFileBtn = document.getElementById('changeFileBtn');
  browseLink = document.getElementById('browseLink');

  flowFormatSelect = document.getElementById('flowFormatSelect');
  flowQuality = document.getElementById('flowQuality');
  flowQualityValue = document.getElementById('flowQualityValue');
  convertBtn = document.getElementById('convertBtn');
  convertBtnText = document.getElementById('convertBtnText');

  downloadIdle = document.getElementById('downloadIdle');
  downloadActive = document.getElementById('downloadActive');
  resultIcon = document.getElementById('resultIcon');
  resultName = document.getElementById('resultName');
  resultStats = document.getElementById('resultStats');
  resultListScroll = document.getElementById('resultListScroll');
  openFolderBtn = document.getElementById('openFolderBtn');
  newConversionBtn = document.getElementById('newConversionBtn');
}

// ═══════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════
function setupEventListeners() {
  // Upload column
  dropZone.addEventListener('click', (e) => {
    if (e.target.closest('#changeFileBtn')) return;
    if (selectedFiles.length === 0) fileInput.click();
  });
  dropZone.addEventListener('dragover', handleDragOver);
  dropZone.addEventListener('dragleave', handleDragLeave);
  dropZone.addEventListener('drop', handleDrop);
  fileInput.addEventListener('change', handleFileSelect);
  if (browseLink) browseLink.addEventListener('click', (e) => { e.stopPropagation(); fileInput.click(); });
  if (changeFileBtn) changeFileBtn.addEventListener('click', (e) => { e.stopPropagation(); resetConverter(); fileInput.click(); });

  // Convert column
  flowFormatSelect.addEventListener('change', updateConvertBtnState);
  flowQuality.addEventListener('input', (e) => {
    flowQualityValue.textContent = `${e.target.value}%`;
  });
  convertBtn.addEventListener('click', startConversion);

  // Download column
  openFolderBtn.addEventListener('click', () => {
    if (settings.outputDir) window.electronAPI.openFolder(settings.outputDir);
  });
  newConversionBtn.addEventListener('click', resetConverter);

  // Settings modal
  document.getElementById('settingsBtn').addEventListener('click', () => { settingsModal.style.display = 'flex'; });
  document.getElementById('closeSettings').addEventListener('click', () => { settingsModal.style.display = 'none'; });
  settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) settingsModal.style.display = 'none'; });
  document.getElementById('showHelpTour').addEventListener('click', () => { settingsModal.style.display = 'none'; showOnboardingFromMenu(); });

  if (stripMetadata) stripMetadata.addEventListener('change', (e) => { settings.stripMetadata = e.target.checked; saveSettingsToStorage(); });
  if (autoOpenOutput) autoOpenOutput.addEventListener('change', (e) => { settings.autoOpenOutput = e.target.checked; saveSettingsToStorage(); });
  if (overwriteFiles) overwriteFiles.addEventListener('change', (e) => { settings.overwriteFiles = e.target.checked; saveSettingsToStorage(); });
  if (selectOutputDir) selectOutputDir.addEventListener('click', async () => {
    const dir = await window.electronAPI.selectOutputDir();
    if (dir) { settings.outputDir = dir; outputPath.value = dir; saveSettingsToStorage(); }
  });
  if (defaultFormat) defaultFormat.addEventListener('change', (e) => { settings.format = e.target.value; saveSettingsToStorage(); });
  if (defaultResolution) defaultResolution.addEventListener('change', (e) => { settings.preset = e.target.value; saveSettingsToStorage(); });
  if (saveSettings) saveSettings.addEventListener('click', () => { settingsModal.style.display = 'none'; showNotification('Settings saved successfully', 'success'); });
  if (resetSettings) resetSettings.addEventListener('click', () => {
    settings = { format: 'jpeg', quality: 80, preset: 'custom', customWidth: 1920, customHeight: 1080, stripMetadata: false, autoOpenOutput: true, overwriteFiles: false, outputDir: '' };
    updateSettingsUI();
    saveSettingsToStorage();
    showNotification('Settings reset to defaults', 'info');
  });

  // Quality slider (hidden compat)
  document.getElementById('qualitySlider').addEventListener('input', (e) => {
    settings.quality = parseInt(e.target.value);
    document.getElementById('qualityValue').textContent = `${settings.quality}%`;
    saveSettingsToStorage();
  });
  document.getElementById('customWidth').addEventListener('change', (e) => { settings.customWidth = parseInt(e.target.value) || 1920; saveSettingsToStorage(); });
  document.getElementById('customHeight').addEventListener('change', (e) => { settings.customHeight = parseInt(e.target.value) || 1080; saveSettingsToStorage(); });
}

// ═══════════════════════════════════════
// DRAG / DROP / FILE SELECT
// ═══════════════════════════════════════
function handleDragOver(e) {
  e.preventDefault();
  dropZone.classList.add('drag-over');
}

function handleDragLeave(e) {
  if (!dropZone.contains(e.relatedTarget)) dropZone.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const valid = filterValidImages(Array.from(e.dataTransfer.files));
  if (valid.length > 0) setFiles(valid);
  else showNotification('No supported images found. Use JPG, PNG, WebP, HEIC, or TIFF.', 'error');
}

function handleFileSelect(e) {
  const valid = filterValidImages(Array.from(e.target.files));
  if (valid.length > 0) setFiles(valid);
  else if (e.target.files.length > 0) showNotification('No supported image formats selected.', 'error');
}

const SUPPORTED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'tiff', 'tif', 'avif'];
const SUPPORTED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/tiff', 'image/avif'];

function filterValidImages(files) {
  return files.filter(file => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    return SUPPORTED_MIME.includes(file.type?.toLowerCase()) || SUPPORTED_EXT.includes(ext);
  });
}

// ═══════════════════════════════════════
// COLUMN STATE UPDATES
// ═══════════════════════════════════════
function setFiles(files) {
  // Clean up previous object URLs
  cleanUploadThumbs();
  selectedFiles = files;
  const totalBytes = files.reduce((s, f) => s + f.size, 0);

  if (files.length === 1) {
    // Single file: show thumbnail
    fileThumb.innerHTML = '';
    fileThumb.style.display = '';
    const img = document.createElement('img');
    img.src = URL.createObjectURL(files[0]);
    img.alt = files[0].name;
    img.onerror = () => { img.style.display = 'none'; fileThumb.textContent = '📷'; };
    fileThumb.appendChild(img);
    fileName.textContent = files[0].name;
    fileSize.textContent = formatFileSize(files[0].size);
    fileListScroll.innerHTML = '';
    fileListScroll.style.display = 'none';
  } else {
    // Multiple files: show count + scrollable list
    fileThumb.innerHTML = '';
    fileThumb.style.display = 'none';
    fileName.textContent = `${files.length} files selected`;
    fileSize.textContent = formatFileSize(totalBytes);
    fileListScroll.innerHTML = '';
    fileListScroll.style.display = '';
    files.forEach(f => {
      const row = document.createElement('div');
      row.className = 'file-list-item';
      row.innerHTML = `<span class="fli-name">${f.name}</span><span class="fli-size">${formatFileSize(f.size)}</span>`;
      fileListScroll.appendChild(row);
    });
  }

  uploadIdle.style.display = 'none';
  uploadActive.style.display = 'flex';
  dropZone.classList.add('completed');

  flowFormatSelect.disabled = false;
  updateConvertBtnState();
  showDownloadIdle();
}

function cleanUploadThumbs() {
  const imgs = fileThumb ? fileThumb.querySelectorAll('img') : [];
  imgs.forEach(img => { if (img.src.startsWith('blob:')) URL.revokeObjectURL(img.src); });
}

function updateConvertBtnState() {
  const hasFormat = flowFormatSelect.value !== '';
  convertBtn.disabled = !(selectedFiles.length > 0 && hasFormat);
}

function showDownloadIdle() {
  downloadIdle.style.display = 'flex';
  downloadActive.style.display = 'none';
  resultListScroll.innerHTML = '';
  const card = downloadIdle.closest('.step-card');
  if (card) card.classList.remove('completed');
}

function showDownloadResults(results) {
  downloadIdle.style.display = 'none';
  downloadActive.style.display = 'flex';

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const totalSaved = successful.reduce((s, r) => s + (r.originalSize - r.newSize), 0);
  const avgPct = successful.length > 0
    ? Math.round(successful.reduce((s, r) => s + (r.savingsPercent || 0), 0) / successful.length)
    : 0;

  if (results.length === 1 && successful.length === 1) {
    resultName.textContent = successful[0].name;
    resultStats.textContent = `${formatFileSize(successful[0].newSize)} · -${successful[0].savingsPercent || 0}% saved`;
  } else {
    resultName.textContent = `${successful.length} of ${results.length} converted`;
    const parts = [];
    if (totalSaved > 0) parts.push(`${formatFileSize(totalSaved)} saved`);
    if (avgPct > 0) parts.push(`-${avgPct}% avg`);
    resultStats.textContent = parts.join(' · ') || 'Done';
  }

  // Build per-file result list
  resultListScroll.innerHTML = '';
  if (results.length > 1) {
    resultListScroll.style.display = '';
    results.forEach(r => {
      const row = document.createElement('div');
      row.className = `result-list-item ${r.success ? 'success' : 'error'}`;
      if (r.success) {
        row.innerHTML = `<span class="rli-name">${r.name}</span><span class="rli-stat">-${r.savingsPercent || 0}%</span>`;
      } else {
        row.innerHTML = `<span class="rli-name">${r.name}</span><span class="rli-stat">failed</span>`;
      }
      resultListScroll.appendChild(row);
    });
  } else {
    resultListScroll.style.display = 'none';
  }

  const card = downloadActive.closest('.step-card');
  if (card) card.classList.add('completed');
}

function resetConverter() {
  cleanUploadThumbs();
  selectedFiles = [];

  uploadIdle.style.display = 'flex';
  uploadActive.style.display = 'none';
  dropZone.classList.remove('completed');
  fileInput.value = '';
  fileListScroll.innerHTML = '';

  flowFormatSelect.value = '';
  flowFormatSelect.disabled = true;
  convertBtn.disabled = true;
  convertBtnText.textContent = 'Convert Now';
  convertBtn.querySelector('.spinner')?.remove();
  const icon = convertBtn.querySelector('svg');
  if (icon) icon.style.display = '';

  showDownloadIdle();
}

// ═══════════════════════════════════════
// CONVERSION
// ═══════════════════════════════════════
async function startConversion() {
  if (selectedFiles.length === 0 || !flowFormatSelect.value) return;

  processStartTime = Date.now();
  const format = flowFormatSelect.value;
  const quality = parseInt(flowQuality.value);
  const total = selectedFiles.length;

  // UI: show spinner in button
  convertBtn.disabled = true;
  const icon = convertBtn.querySelector('svg');
  if (icon) icon.style.display = 'none';
  const spinner = document.createElement('div');
  spinner.className = 'spinner';
  convertBtn.insertBefore(spinner, convertBtnText);
  convertBtnText.textContent = total > 1 ? `Converting 0/${total}...` : 'Converting...';

  const allResults = [];

  try {
    const fileSettings = {
      format,
      quality,
      preset: settings.preset,
      customWidth: settings.customWidth,
      customHeight: settings.customHeight,
      stripMetadata: settings.stripMetadata,
      autoOpenOutput: settings.autoOpenOutput,
      overwriteFiles: settings.overwriteFiles
    };

    for (let i = 0; i < total; i++) {
      const file = selectedFiles[i];
      if (total > 1) convertBtnText.textContent = `Converting ${i + 1}/${total}...`;

      try {
        const buffer = await file.arrayBuffer();
        const fileData = [{ name: file.name, size: file.size, buffer: new Uint8Array(buffer) }];
        const response = await window.electronAPI.processImages({ files: fileData, settings: fileSettings });

        let result = null;
        if (response && response.success && Array.isArray(response.results) && response.results.length > 0) {
          result = response.results[0];
        } else if (Array.isArray(response) && response.length > 0) {
          result = response[0];
        }
        allResults.push(result || { name: file.name, success: false, error: 'No result returned' });
      } catch (fileErr) {
        allResults.push({ name: file.name, success: false, error: fileErr.message });
      }
    }

    const successful = allResults.filter(r => r.success);
    if (successful.length > 0) {
      showDownloadResults(allResults);
      const msg = total === 1 ? 'Conversion complete!' : `${successful.length} of ${total} files converted!`;
      showNotification(msg, 'success');
      if (settings.autoOpenOutput && settings.outputDir) {
        setTimeout(() => window.electronAPI.openFolder(settings.outputDir), 1500);
      }
    } else {
      showNotification('All conversions failed.', 'error');
    }
  } catch (error) {
    console.error('Error processing images:', error);
    let errorMessage = 'Error processing images';
    if (error.message) {
      if (error.message.includes('ENOSPC')) errorMessage = 'Not enough disk space.';
      else if (error.message.includes('EACCES') || error.message.includes('EPERM')) errorMessage = 'Permission denied.';
      else if (error.message.includes('timeout')) errorMessage = 'Processing timed out.';
      else if (error.message.includes('memory')) errorMessage = 'Out of memory.';
    }
    showNotification(errorMessage, 'error');
  } finally {
    spinner.remove();
    if (icon) icon.style.display = '';
    convertBtnText.textContent = 'Convert Now';
    convertBtn.disabled = false;
  }
}

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => { notification.style.opacity = '1'; notification.style.transform = 'translateY(0)'; }, 100);
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    setTimeout(() => { document.body.removeChild(notification); }, 300);
  }, 3000);
}

// Progress updates from main process
window.electronAPI.onProcessProgress((data) => {
  log.debug('Progress:', data);
  if (data.file && convertBtnText) {
    convertBtnText.textContent = `Converting: ${data.file}`;
  }
});

// ═══════════════════════════════════════
// LICENSE / PAYWALL (disabled for free launch — infrastructure kept for future Pro tier)
// ═══════════════════════════════════════
async function checkLicenseStatus() {
  enableFullApp();
}

function updateLicenseDisplay(licenseInfo) {
  const statusIndicator = document.getElementById('statusIndicator');
  const licenseText = document.getElementById('licenseText');
  if (statusIndicator && licenseText) {
    statusIndicator.style.color = '#10b981';
    statusIndicator.textContent = '●';
    licenseText.textContent = `Licensed (${licenseInfo.licenseKey})`;
    licenseText.style.color = '#10b981';
  }
}

function enableFullApp() {
  const paywall = document.getElementById('paywall-modal');
  if (paywall) paywall.remove();
  const mainContainer = document.querySelector('.app-container');
  if (mainContainer) { mainContainer.style.opacity = '1'; mainContainer.style.pointerEvents = 'auto'; }
}

// ═══════════════════════════════════════
// FEEDBACK
// ═══════════════════════════════════════
async function submitFeedback(feedback) {
  const webhookUrl = 'https://epure-webhook-production.up.railway.app/api/feedback';
  const response = await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(feedback) });
  if (!response.ok) throw new Error('Feedback submission failed');
  return await response.json();
}

// ═══════════════════════════════════════
// ONBOARDING
// ═══════════════════════════════════════
const onboardingSteps = [
  { target: '#dropZone', title: 'Drop your files here', description: 'Drag and drop an image or click to browse. Supports JPG, PNG, WebP, HEIC, TIFF, and AVIF.', position: 'bottom' },
  { target: '.sidebar', title: 'Navigation', description: 'Use the sidebar to switch between converting files, settings, and feedback.', position: 'right' },
  { target: '#themeToggleBtn', title: 'Customize your theme', description: 'Click to cycle through themes — Dark, Light, Midnight, Sunset, and Forest.', position: 'right' }
];

let currentOnboardingStep = 0;
let onboardingActive = false;
let onboardingOverlay, onboardingTooltip, tooltipTitle, tooltipDescription;
let currentStepSpan, totalStepsSpan, nextStepBtn, prevStepBtn, skipTourBtn, closeOnboardingBtn;

function initOnboarding() {
  onboardingOverlay = document.getElementById('onboardingOverlay');
  onboardingTooltip = document.getElementById('onboardingTooltip');
  tooltipTitle = document.getElementById('tooltipTitle');
  tooltipDescription = document.getElementById('tooltipDescription');
  currentStepSpan = document.getElementById('currentStep');
  totalStepsSpan = document.getElementById('totalSteps');
  nextStepBtn = document.getElementById('nextStep');
  prevStepBtn = document.getElementById('prevStep');
  skipTourBtn = document.getElementById('skipTour');
  closeOnboardingBtn = document.getElementById('closeOnboarding');
  totalStepsSpan.textContent = onboardingSteps.length;
  nextStepBtn.addEventListener('click', nextOnboardingStep);
  prevStepBtn.addEventListener('click', prevOnboardingStep);
  skipTourBtn.addEventListener('click', skipOnboarding);
  closeOnboardingBtn.addEventListener('click', skipOnboarding);
  const hasSeenOnboarding = localStorage.getItem('epure_onboarding_completed');
  if (!hasSeenOnboarding) setTimeout(() => startOnboarding(), 1000);
}

function startOnboarding() { onboardingActive = true; currentOnboardingStep = 0; onboardingOverlay.style.display = 'block'; showOnboardingStep(0); }

function showOnboardingStep(stepIndex) {
  const step = onboardingSteps[stepIndex];
  const targetElement = document.querySelector(step.target);
  if (!targetElement) return;
  document.querySelectorAll('.onboarding-highlight').forEach(el => el.classList.remove('onboarding-highlight'));
  targetElement.classList.add('onboarding-highlight');
  targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  tooltipTitle.textContent = step.title;
  tooltipDescription.textContent = step.description;
  currentStepSpan.textContent = stepIndex + 1;
  positionTooltip(targetElement, step.position);
  prevStepBtn.disabled = stepIndex === 0;
  nextStepBtn.textContent = stepIndex === onboardingSteps.length - 1 ? 'Finish' : 'Next';
}

function positionTooltip(targetElement, position) {
  const targetRect = targetElement.getBoundingClientRect();
  const tooltipRect = onboardingTooltip.getBoundingClientRect();
  let left, top;
  switch (position) {
    case 'bottom': left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2); top = targetRect.bottom + 20; break;
    case 'top': left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2); top = targetRect.top - tooltipRect.height - 20; break;
    case 'left': left = targetRect.left - tooltipRect.width - 20; top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2); break;
    case 'right': left = targetRect.right + 20; top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2); break;
    default: left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2); top = targetRect.bottom + 20;
  }
  const w = window.innerWidth, h = window.innerHeight;
  if (left < 10) left = 10; if (left + tooltipRect.width > w - 10) left = w - tooltipRect.width - 10;
  if (top < 10) top = 10; if (top + tooltipRect.height > h - 10) top = h - tooltipRect.height - 10;
  onboardingTooltip.style.left = left + 'px';
  onboardingTooltip.style.top = top + 'px';
}

function nextOnboardingStep() { if (currentOnboardingStep < onboardingSteps.length - 1) { currentOnboardingStep++; showOnboardingStep(currentOnboardingStep); } else finishOnboarding(); }
function prevOnboardingStep() { if (currentOnboardingStep > 0) { currentOnboardingStep--; showOnboardingStep(currentOnboardingStep); } }
function skipOnboarding() { localStorage.setItem('epure_onboarding_completed', 'true'); hideOnboarding(); }
function finishOnboarding() { localStorage.setItem('epure_onboarding_completed', 'true'); hideOnboarding(); }
function hideOnboarding() { onboardingActive = false; onboardingOverlay.style.display = 'none'; document.querySelectorAll('.onboarding-highlight').forEach(el => el.classList.remove('onboarding-highlight')); }
function showOnboardingFromMenu() { localStorage.removeItem('epure_onboarding_completed'); startOnboarding(); }

// ═══════════════════════════════════════
// THEME SYSTEM
// ═══════════════════════════════════════
const THEMES = ['dark', 'light', 'midnight', 'sunset', 'forest'];
const THEME_ICONS = {
  dark: `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`,
  light: `<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`,
  midnight: `<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"/>`,
  sunset: `<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>`,
  forest: `<path d="M12 2L2 22h20L12 2z"/>`
};

function initTheme() { applyTheme(localStorage.getItem('epure_theme') || 'dark'); }
function applyTheme(theme) { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('epure_theme', theme); const icon = document.getElementById('themeIcon'); if (icon) icon.innerHTML = THEME_ICONS[theme] || THEME_ICONS.dark; }
function cycleTheme() { const current = localStorage.getItem('epure_theme') || 'dark'; const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length]; applyTheme(next); showNotification(`Theme: ${next.charAt(0).toUpperCase() + next.slice(1)}`, 'info'); }

// ═══════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════
function initSidebar() {
  document.querySelectorAll('.sidebar-btn[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.view === 'settings') settingsModal.style.display = 'flex';
      else if (btn.dataset.view === 'feedback') document.getElementById('feedbackModal').style.display = 'flex';
    });
  });
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) themeBtn.addEventListener('click', cycleTheme);
  const userBtn = document.getElementById('userBtn');
  if (userBtn) userBtn.addEventListener('click', () => { settingsModal.style.display = 'flex'; });
}

// ═══════════════════════════════════════
// BOOTSTRAP
// ═══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  init();
  initOnboarding();
  initSidebar();

  const feedbackModal = document.getElementById('feedbackModal');
  const closeFeedback = document.getElementById('closeFeedback');
  const cancelFeedback = document.getElementById('cancelFeedback');
  const submitFeedbackBtn = document.getElementById('submitFeedback');

  if (closeFeedback) closeFeedback.addEventListener('click', () => feedbackModal.style.display = 'none');
  if (cancelFeedback) cancelFeedback.addEventListener('click', () => feedbackModal.style.display = 'none');

  if (submitFeedbackBtn) {
    submitFeedbackBtn.addEventListener('click', async () => {
      const type = document.getElementById('feedbackType')?.value || 'other';
      const title = document.getElementById('feedbackTitle')?.value || '';
      const message = document.getElementById('feedbackMessage')?.value || '';
      const email = document.getElementById('feedbackEmail')?.value || '';
      if (!title.trim() || !message.trim()) { showNotification('Please fill in the title and message fields', 'error'); return; }
      const feedback = { type, title: title.trim(), message: message.trim(), email: email.trim(), timestamp: new Date().toISOString(), appVersion: '1.0.0', platform: navigator.platform };
      try {
        await submitFeedback(feedback);
        showNotification('Thank you for your feedback!', 'success');
      } catch (error) {
        const feedbackText = `Type: ${feedback.type}\nTitle: ${feedback.title}\nMessage: ${feedback.message}\nEmail: ${feedback.email}`;
        navigator.clipboard.writeText(feedbackText).then(() => showNotification('Feedback copied. Email to r2thedev@gmail.com', 'info')).catch(() => showNotification('Email feedback to r2thedev@gmail.com', 'info'));
      }
      document.getElementById('feedbackTitle').value = '';
      document.getElementById('feedbackMessage').value = '';
      document.getElementById('feedbackEmail').value = '';
      feedbackModal.style.display = 'none';
    });
  }

  if (feedbackModal) feedbackModal.addEventListener('click', (e) => { if (e.target === feedbackModal) feedbackModal.style.display = 'none'; });
});
