// Payment processing utilities
export interface PaymentConfig {
  stripePublishableKey: string;
  priceId: string;
  productName: string;
  amount: number;
}

// Stripe configuration - uses environment variables only
const config: PaymentConfig = {
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  priceId: import.meta.env.VITE_STRIPE_PRICE_ID || '',
  productName: 'Épure - Image Converter',
  amount: 9.00
};

export const initiatePayment = async () => {
  try {
    // Track payment attempt
    import('./mixpanel').then(({ trackEvent }) => {
      trackEvent('Payment Initiated', {
        product: config.productName,
        amount: config.amount,
        source: 'website'
      });
    });

    // Create direct Stripe checkout session
    const response = await fetch('https://epure-webhook-production.up.railway.app/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: config.priceId || 'price_1OXf4JA8Xjc7tVUm9K8j1234', // Your Stripe price ID
        productName: config.productName,
        successUrl: window.location.origin + '/success',
        cancelUrl: window.location.origin + '/cancel'
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const session = await response.json();
    
    if (session.url) {
      // Redirect to Stripe Checkout
      window.location.href = session.url;
      return { success: true, method: 'stripe' };
    } else {
      throw new Error('No checkout URL received');
    }
    
  } catch (error) {
    console.error('Payment initiation failed:', error);
    
    // Track payment error
    import('./mixpanel').then(({ trackEvent }) => {
      trackEvent('Payment Error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'website'
      });
    });
    
    // Fallback to email if Stripe fails
    alert('Payment system temporarily unavailable. Please contact r2thedev@gmail.com to purchase Épure for $9.');
    
    throw error;
  }
};

// Future Stripe implementation
export const createStripeCheckoutSession = async () => {
  // This will be implemented when Stripe is fully set up
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: config.priceId,
        productName: config.productName,
      }),
    });

    const session = await response.json();
    
    if (session.url) {
      window.location.href = session.url;
    }
    
    return session;
  } catch (error) {
    console.error('Stripe checkout failed:', error);
    throw error;
  }
};

export default config;
