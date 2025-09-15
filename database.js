const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, 'licenses.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize database tables
db.serialize(() => {
  // Licenses table
  db.run(`CREATE TABLE IF NOT EXISTS licenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    license_key TEXT UNIQUE NOT NULL,
    payment_intent_id TEXT UNIQUE NOT NULL,
    customer_email TEXT NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    activated_at DATETIME,
    is_active BOOLEAN DEFAULT 1,
    activation_count INTEGER DEFAULT 0,
    last_used_at DATETIME
  )`);

  // License activations table (track where licenses are used)
  db.run(`CREATE TABLE IF NOT EXISTS license_activations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    license_key TEXT NOT NULL,
    machine_id TEXT,
    platform TEXT,
    app_version TEXT,
    activated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (license_key) REFERENCES licenses (license_key)
  )`);

  console.log('Database tables initialized');
});

// License operations
const licenseDB = {
  // Store a new license
  async storeLicense(licenseKey, paymentIntentId, customerEmail, amount, currency) {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO licenses (license_key, payment_intent_id, customer_email, amount, currency)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      stmt.run([licenseKey, paymentIntentId, customerEmail, amount, currency], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, licenseKey });
        }
      });
      
      stmt.finalize();
    });
  },

  // Find license by key
  async findLicense(licenseKey) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM licenses WHERE license_key = ? AND is_active = 1`,
        [licenseKey],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  },

  // Find license by email
  async findLicensesByEmail(email) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM licenses WHERE customer_email = ? AND is_active = 1 ORDER BY created_at DESC`,
        [email],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  },

  // Activate license (track when first used)
  async activateLicense(licenseKey, machineId = null, platform = null, appVersion = null) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        // Update license
        db.run(
          `UPDATE licenses SET activated_at = CURRENT_TIMESTAMP, 
           activation_count = activation_count + 1, 
           last_used_at = CURRENT_TIMESTAMP 
           WHERE license_key = ?`,
          [licenseKey]
        );

        // Record activation
        const stmt = db.prepare(`
          INSERT INTO license_activations (license_key, machine_id, platform, app_version)
          VALUES (?, ?, ?, ?)
        `);
        
        stmt.run([licenseKey, machineId, platform, appVersion], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ success: true, activationId: this.lastID });
          }
        });
        
        stmt.finalize();
      });
    });
  },

  // Get license statistics
  async getStats() {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          COUNT(*) as total_licenses,
          COUNT(CASE WHEN activated_at IS NOT NULL THEN 1 END) as activated_licenses,
          SUM(amount) as total_revenue,
          COUNT(DISTINCT customer_email) as unique_customers
        FROM licenses 
        WHERE is_active = 1
      `, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows[0]);
        }
      });
    });
  },

  // Close database connection
  close() {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  }
};

module.exports = licenseDB;
