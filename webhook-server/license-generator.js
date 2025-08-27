const crypto = require('crypto');

class LicenseGenerator {
  // Generate a unique license key in format: EPURE-XXXXX-XXXXX-XXXXX
  static generateLicenseKey() {
    const prefix = 'EPURE';
    
    // Generate timestamp-based segment
    const timestamp = Date.now().toString(36).toUpperCase().padStart(6, '0');
    
    // Generate random segments
    const random1 = crypto.randomBytes(3).toString('hex').toUpperCase();
    const random2 = crypto.randomBytes(3).toString('hex').toUpperCase();
    
    // Combine into license key
    const licenseKey = `${prefix}-${timestamp}-${random1}-${random2}`;
    
    return licenseKey;
  }

  // Validate license key format
  static validateLicenseKeyFormat(licenseKey) {
    const pattern = /^EPURE-[A-Z0-9]{6}-[A-Z0-9]{6}-[A-Z0-9]{6}$/;
    return pattern.test(licenseKey);
  }

  // Generate machine ID for license binding (optional)
  static generateMachineId() {
    const os = require('os');
    const data = `${os.hostname()}-${os.platform()}-${os.arch()}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
  }

  // Check if license key has valid checksum (future enhancement)
  static validateLicenseChecksum(licenseKey) {
    // For now, just validate format
    return this.validateLicenseKeyFormat(licenseKey);
  }
}

module.exports = LicenseGenerator;
