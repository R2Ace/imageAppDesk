// Download utilities (payment disabled for free launch — infrastructure kept for future Pro tier)

// Lemon Squeezy checkout URL preserved for future Pro tier
// export const CHECKOUT_URL = 'https://epure.lemonsqueezy.com/checkout/buy/c8f3c0d4-1450-426a-9a86-77963db04332';

export const DOWNLOAD_URL = 'https://github.com/R2Ace/imageAppDesk/releases/download/v1.0.0-free/Epure-1.0.0-arm64.dmg';

export const initiateDownload = () => {
  import('./mixpanel').then(({ trackEvent }) => {
    trackEvent('Download Initiated', {
      product: 'Épure - File Converter',
      amount: 0,
      source: 'website',
      platform: 'mac'
    });
  });

  window.open(DOWNLOAD_URL, '_blank');
};

export default { DOWNLOAD_URL, initiateDownload };
