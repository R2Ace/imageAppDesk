// Payment processing utilities - Lemon Squeezy

export const CHECKOUT_URL = 'https://epure.lemonsqueezy.com/checkout/buy/c8f3c0d4-1450-426a-9a86-77963db04332';

export const initiatePayment = () => {
  // Track payment attempt
  import('./mixpanel').then(({ trackEvent }) => {
    trackEvent('Payment Initiated', {
      product: 'Épure - File Converter',
      amount: 9,
      source: 'website',
      provider: 'lemonsqueezy'
    });
  });

  // Open Lemon Squeezy checkout
  window.open(CHECKOUT_URL, '_blank');
};

export default { CHECKOUT_URL, initiatePayment };
