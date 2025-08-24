const Stripe = require('stripe');
const crypto = require('crypto');
const Store = require('electron-store');

// Initialize license store
const licenseStore = new Store({
  name: 'licenses',
  defaults: {
    purchases: [],
    currentLicense: null
  }
});

class PaymentProcessor {
  constructor() {
    this.stripe = null;
    this.initialized = false;
  }

  init(apiKey) {
    if (!apiKey || apiKey === 'your-stripe-secret-key-here') {
      console.log('Stripe: No valid API key provided, payments disabled');
      return false;
    }

    try {
      this.stripe = new Stripe(apiKey);
      this.initialized = true;
      console.log('Stripe: Initialized successfully');
      return true;
    } catch (error) {
      console.error('Stripe initialization failed:', error.message);
      return false;
    }
  }

  // Generate a unique license key
  generateLicenseKey() {
    const prefix = 'EPURE';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(8).toString('hex').toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  // Create a payment intent for $9 purchase
  async createPaymentIntent(customerEmail = null) {
    if (!this.initialized) {
      throw new Error('Stripe not initialized');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: 900, // $9.00 in cents
        currency: 'usd',
        metadata: {
          product: 'epure_license',
          version: require('../package.json').version,
          customer_email: customerEmail || 'unknown'
        },
        description: 'Épure - Image Converter License'
      });

      return paymentIntent;
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      throw error;
    }
  }

  // Verify payment and activate license
  async verifyPaymentAndActivate(paymentIntentId) {
    if (!this.initialized) {
      throw new Error('Stripe not initialized');
    }

    try {
      // Retrieve payment intent from Stripe
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        // Generate license key
        const licenseKey = this.generateLicenseKey();
        
        // Store purchase record
        const purchase = {
          id: paymentIntent.id,
          licenseKey: licenseKey,
          email: paymentIntent.metadata.customer_email,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          purchaseDate: new Date().toISOString(),
          activated: true
        };

        // Save to local store
        const purchases = licenseStore.get('purchases', []);
        purchases.push(purchase);
        licenseStore.set('purchases', purchases);
        licenseStore.set('currentLicense', licenseKey);

        console.log('License activated:', licenseKey);
        
        // Track successful purchase in analytics
        if (global.analytics) {
          global.analytics.track('License Purchased', {
            license_key: licenseKey,
            payment_method: 'stripe',
            amount: paymentIntent.amount / 100
          });
        }

        return {
          success: true,
          licenseKey: licenseKey,
          purchase: purchase
        };
      } else {
        throw new Error(`Payment not completed. Status: ${paymentIntent.status}`);
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
      throw error;
    }
  }

  // Check if app is licensed
  isLicensed() {
    const currentLicense = licenseStore.get('currentLicense');
    return !!currentLicense;
  }

  // Get current license info
  getLicenseInfo() {
    const currentLicense = licenseStore.get('currentLicense');
    const purchases = licenseStore.get('purchases', []);
    
    if (!currentLicense) {
      return null;
    }

    const purchase = purchases.find(p => p.licenseKey === currentLicense);
    return purchase || null;
  }

  // Manually activate license key (for customer support)
  activateLicenseKey(licenseKey) {
    try {
      // Basic validation
      if (!licenseKey || !licenseKey.startsWith('EPURE-')) {
        throw new Error('Invalid license key format');
      }

      // Create manual purchase record
      const purchase = {
        id: 'manual_' + Date.now(),
        licenseKey: licenseKey,
        email: 'manual_activation',
        amount: 900,
        currency: 'usd',
        purchaseDate: new Date().toISOString(),
        activated: true,
        manual: true
      };

      // Save to store
      const purchases = licenseStore.get('purchases', []);
      purchases.push(purchase);
      licenseStore.set('purchases', purchases);
      licenseStore.set('currentLicense', licenseKey);

      console.log('License manually activated:', licenseKey);
      return { success: true, licenseKey };
    } catch (error) {
      console.error('Manual activation failed:', error);
      throw error;
    }
  }

  // Remove license (for testing)
  removeLicense() {
    licenseStore.set('currentLicense', null);
    console.log('License removed');
  }
}

// Export singleton instance
const paymentProcessor = new PaymentProcessor();

// Initialize with API key from environment
const stripeKey = process.env.NODE_ENV === 'production' 
  ? process.env.STRIPE_SECRET_KEY 
  : process.env.STRIPE_TEST_SECRET_KEY || 'your-stripe-secret-key-here';
paymentProcessor.init(stripeKey);

module.exports = paymentProcessor;