const { init } = require('@sentry/electron');

// Sentry configuration for Épure
const initSentry = () => {
  init({
    // Your actual Sentry DSN from sentry.io
    dsn: process.env.SENTRY_DSN || 'https://01b12cfe719611f08c5d727433647405@o4509788717514752.ingest.us.sentry.io/4509788718891008',
    
    // App version for tracking
    release: require('../package.json').version,
    
    // Environment
    environment: process.env.NODE_ENV || 'production',
    
    // Only send crashes in production to avoid noise during development
    enabled: process.env.NODE_ENV === 'production',
    
    // Capture unhandled promise rejections
    captureUnhandledRejections: true,
    
    // Sample rate for performance monitoring
    tracesSampleRate: 1.0,
    
    // Privacy-first: Don't capture screenshots or user data
    beforeSend(event) {
      // Remove any potentially sensitive data
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      
      // Remove file paths from breadcrumbs for privacy
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
          if (breadcrumb.data && breadcrumb.data.path) {
            breadcrumb.data.path = '[REDACTED]';
          }
          return breadcrumb;
        });
      }
      
      return event;
    },
    
    // Tag events with app info
    initialScope: {
      tags: {
        app: 'epure',
        platform: process.platform,
        arch: process.arch
      }
    }
  });
};

module.exports = { initSentry };