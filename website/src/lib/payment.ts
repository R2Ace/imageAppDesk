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
    // For now, direct to a temporary checkout
    // In production, this would create a Stripe Checkout session
    
    // Track payment attempt
    import('./mixpanel').then(({ trackEvent }) => {
      trackEvent('Payment Initiated', {
        product: config.productName,
        amount: config.amount,
        source: 'website'
      });
    });

    // Temporary solution: Open mailto for manual processing
    const subject = encodeURIComponent('Épure Purchase Request');
    const body = encodeURIComponent(
      `Hi! I'd like to purchase Épure for $${config.amount}.\n\n` +
      `Please send me payment instructions and download link.\n\n` +
      `Platform: ${navigator.platform}\n` +
      `User Agent: ${navigator.userAgent}`
    );
    
    window.open(`mailto:r2thedev@gmail.com?subject=${subject}&body=${body}`, '_blank');
    
    // Show user-friendly message
    alert(
      `We're setting up automated payments! 🚀\n\n` +
      `For now, we've opened your email client.\n` +
      `We'll send you payment instructions and your download link within 24 hours.\n\n` +
      `Thank you for your interest in Épure!`
    );

    return { success: true, method: 'email' };
    
  } catch (error) {
    console.error('Payment initiation failed:', error);
    
    // Track payment error
    import('./mixpanel').then(({ trackEvent }) => {
      trackEvent('Payment Error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'website'
      });
    });
    
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
