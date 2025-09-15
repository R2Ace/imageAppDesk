require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Initialize Stripe with error handling
let stripe;
try {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  console.log('✅ Stripe initialized successfully');
} catch (error) {
  console.error('❌ Stripe initialization failed:', error.message);
  stripe = null;
}

// Import our modules
const LicenseGenerator = require('./license-generator');
const EmailService = require('./email-service');
const licenseDB = require('./database');

const app = express();
const emailService = new EmailService();

// Middleware
app.use(cors());
app.use(express.json());

// Raw body parser for Stripe webhooks (must be before other middleware)
app.use('/webhook', express.raw({ type: 'application/json' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    hasGmailUser: !!process.env.GMAIL_USER
  });
});

// Debug endpoint for environment variables
app.get('/debug/env', (req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    stripeKeyLength: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.length : 0,
    hasGmailUser: !!process.env.GMAIL_USER,
    hasGmailPass: !!process.env.GMAIL_APP_PASSWORD,
    port: process.env.PORT,
    timestamp: new Date().toISOString()
  });
});

// Statistics endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await licenseDB.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// License validation endpoint
app.get('/api/validate-license/:key', async (req, res) => {
  try {
    const licenseKey = req.params.key;
    
    // Validate format first
    if (!LicenseGenerator.validateLicenseKeyFormat(licenseKey)) {
      return res.json({ valid: false, error: 'Invalid license key format' });
    }

    // Check database
    const license = await licenseDB.findLicense(licenseKey);
    
    if (license) {
      res.json({ 
        valid: true, 
        info: {
          licenseKey: license.license_key,
          createdAt: license.created_at,
          activatedAt: license.activated_at,
          isActive: license.is_active,
          activationCount: license.activation_count
        }
      });
    } else {
      res.json({ valid: false, error: 'License not found or inactive' });
    }
  } catch (error) {
    console.error('Error validating license:', error);
    res.status(500).json({ valid: false, error: 'Validation error' });
  }
});

// License activation endpoint
app.post('/api/activate-license', async (req, res) => {
  try {
    const { licenseKey, machineId, platform, appVersion } = req.body;
    
    // Validate license exists
    const license = await licenseDB.findLicense(licenseKey);
    if (!license) {
      return res.status(404).json({ success: false, error: 'License not found' });
    }

    // Activate license
    await licenseDB.activateLicense(licenseKey, machineId, platform, appVersion);
    
    res.json({ 
      success: true, 
      message: 'License activated successfully',
      licenseInfo: {
        licenseKey: license.license_key,
        customerEmail: license.customer_email,
        createdAt: license.created_at
      }
    });
  } catch (error) {
    console.error('Error activating license:', error);
    res.status(500).json({ success: false, error: 'Activation failed' });
  }
});

// Find licenses by email
app.get('/api/licenses/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const licenses = await licenseDB.findLicensesByEmail(email);
    
    res.json({ 
      success: true, 
      licenses: licenses.map(license => ({
        licenseKey: license.license_key,
        createdAt: license.created_at,
        activatedAt: license.activated_at,
        amount: license.amount,
        currency: license.currency
      }))
    });
  } catch (error) {
    console.error('Error finding licenses:', error);
    res.status(500).json({ success: false, error: 'Search failed' });
  }
});

// Feedback submission endpoint
app.post('/api/feedback', async (req, res) => {
  try {
    const { type, title, message, email, timestamp, appVersion, platform } = req.body;
    
    console.log('📝 Feedback received:', { type, title, email, platform });
    
    // Send feedback email
    await emailService.sendFeedbackEmail({
      type,
      title,
      message,
      email,
      timestamp,
      appVersion,
      platform
    });
    
    res.json({ 
      success: true, 
      message: 'Feedback submitted successfully' 
    });
  } catch (error) {
    console.error('Error processing feedback:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit feedback' 
    });
  }
});

// Create Stripe Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { successUrl, cancelUrl } = req.body;
    
    // Enhanced logging for debugging
    console.log('Creating checkout session with:', { successUrl, cancelUrl });
    console.log('Stripe key present:', !!process.env.STRIPE_SECRET_KEY);
    console.log('Environment:', process.env.NODE_ENV);
    
    // Validate required environment variables
    if (!process.env.STRIPE_SECRET_KEY || !stripe) {
      console.error('STRIPE_SECRET_KEY not found in environment or Stripe not initialized');
      return res.status(500).json({ 
        error: 'Payment system temporarily unavailable. Please contact r2thedev@gmail.com to purchase Épure for $9.',
        details: 'Stripe not configured'
      });
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Épure - Image Converter',
              description: 'Professional image processing app for Mac and Windows',
            },
            unit_amount: 900, // $9.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || 'https://epure-jrgzo2soz-r2aces-projects.vercel.app/success',
      cancel_url: cancelUrl || 'https://epure-jrgzo2soz-r2aces-projects.vercel.app/',
      metadata: {
        product: 'epure_license'
      }
    });

    console.log('Checkout session created successfully:', session.id);
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      stripeKeyPresent: !!process.env.STRIPE_SECRET_KEY,
      stripeKeyLength: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.length : 0
    });
    res.status(500).json({ 
      error: 'Payment system temporarily unavailable. Please contact r2thedev@gmail.com to purchase Épure for $9.',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Stripe configuration error'
    });
  }
});

// Stripe webhook endpoint
app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('📥 Webhook received:', event.type);

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// Handle successful payment
async function handlePaymentSuccess(paymentIntent) {
  try {
    console.log('💰 Payment succeeded:', paymentIntent.id);
    
    const customerEmail = paymentIntent.metadata?.customer_email || 
                         paymentIntent.receipt_email ||
                         'unknown@example.com';
    
    // Generate license key
    const licenseKey = LicenseGenerator.generateLicenseKey();
    console.log('🔑 Generated license:', licenseKey);
    
    // Store in database
    await licenseDB.storeLicense(
      licenseKey,
      paymentIntent.id,
      customerEmail,
      paymentIntent.amount,
      paymentIntent.currency
    );
    
    // Send license email
    await emailService.sendLicenseEmail(
      customerEmail,
      licenseKey,
      paymentIntent.amount
    );
    
    console.log('✅ License generated and emailed successfully');
    
  } catch (error) {
    console.error('❌ Error handling payment success:', error);
    // In production, you might want to retry or alert administrators
  }
}

// Handle failed payment
async function handlePaymentFailed(paymentIntent) {
  console.log('❌ Payment failed:', paymentIntent.id);
  // Could send failure notification email here
}

// Test license generation endpoint (development only)
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/test/generate-license', async (req, res) => {
    try {
      const { email } = req.body;
      const licenseKey = LicenseGenerator.generateLicenseKey();
      
      // Store test license
      await licenseDB.storeLicense(
        licenseKey,
        'test_' + Date.now(),
        email || 'test@example.com',
        900, // $9.00
        'usd'
      );
      
      // Send test email
      await emailService.sendLicenseEmail(
        email || 'test@example.com',
        licenseKey,
        900
      );
      
      res.json({ 
        success: true, 
        licenseKey,
        message: 'Test license generated and email sent'
      });
    } catch (error) {
      console.error('Test license generation failed:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Test email endpoint
  app.post('/api/test/send-email', async (req, res) => {
    try {
      const { email, type } = req.body;
      
      if (type === 'welcome') {
        await emailService.sendWelcomeEmail(email);
      } else {
        await emailService.sendLicenseEmail(email, 'EPURE-TEST-123456-ABCDEF', 900);
      }
      
      res.json({ success: true, message: 'Test email sent' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Statistics: http://localhost:${PORT}/api/stats`);
  console.log(`🔑 Stripe key present: ${!!process.env.STRIPE_SECRET_KEY}`);
  console.log(`📧 Gmail user present: ${!!process.env.GMAIL_USER}`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🧪 Test endpoints available in development mode`);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n📴 Shutting down webhook server...');
  licenseDB.close();
  process.exit(0);
});

module.exports = app;
