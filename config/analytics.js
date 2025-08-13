const Mixpanel = require('mixpanel');

class Analytics {
  constructor() {
    this.mixpanel = null;
    this.enabled = false;
    this.userOptedIn = false;
  }

  init(token) {
    if (!token || token === 'your-mixpanel-token-here') {
      console.log('Analytics: No valid token provided, analytics disabled');
      return;
    }

    this.mixpanel = Mixpanel.init(token);
    this.enabled = true;
    console.log('Analytics: Initialized successfully');
  }

  setUserOptIn(optedIn) {
    this.userOptedIn = optedIn;
    console.log(`Analytics: User opt-in status: ${optedIn}`);
  }

  track(eventName, properties = {}) {
    if (!this.enabled || !this.userOptedIn || !this.mixpanel) {
      return;
    }

    // Add common properties
    const enrichedProperties = {
      ...properties,
      app_version: require('../package.json').version,
      platform: process.platform,
      arch: process.arch,
      timestamp: new Date().toISOString()
    };

    // Remove any potentially sensitive data
    const sanitizedProperties = this.sanitizeProperties(enrichedProperties);

    this.mixpanel.track(eventName, sanitizedProperties);
  }

  sanitizeProperties(properties) {
    const sanitized = { ...properties };
    
    // Remove file paths and names for privacy
    if (sanitized.filePath) delete sanitized.filePath;
    if (sanitized.fileName) delete sanitized.fileName;
    if (sanitized.outputPath) delete sanitized.outputPath;
    
    // Keep only the file extension for format tracking
    if (sanitized.fileType && sanitized.fileType.includes('/')) {
      sanitized.fileType = sanitized.fileType.split('/')[1];
    }

    return sanitized;
  }

  // Common events for Épure
  trackAppLaunched() {
    this.track('App Launched');
  }

  trackFileConverted(format, fromFormat, fileSize, compressionRatio) {
    this.track('File Converted', {
      output_format: format,
      input_format: fromFormat,
      file_size_category: this.getFileSizeCategory(fileSize),
      compression_ratio: compressionRatio ? Math.round(compressionRatio * 100) / 100 : null
    });
  }

  trackBatchProcessing(fileCount, totalSize) {
    this.track('Batch Processing Started', {
      file_count: fileCount,
      total_size_category: this.getFileSizeCategory(totalSize)
    });
  }

  trackError(errorType, errorMessage) {
    this.track('Error Occurred', {
      error_type: errorType,
      error_message: errorMessage ? errorMessage.substring(0, 100) : null // Limit length
    });
  }

  getFileSizeCategory(bytes) {
    if (bytes < 1024 * 1024) return 'small'; // < 1MB
    if (bytes < 10 * 1024 * 1024) return 'medium'; // < 10MB
    if (bytes < 100 * 1024 * 1024) return 'large'; // < 100MB
    return 'very_large'; // >= 100MB
  }
}

// Export singleton instance
const analytics = new Analytics();

// Initialize with token from environment variable
analytics.init(process.env.MIXPANEL_TOKEN || '464423c2d50d3113073d05faa473d76f');

module.exports = analytics;