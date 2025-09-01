# 🚀 Production Environment Variables Setup

## Required for Desktop App

Create a `.env` file in the `desktop-app` folder:

```bash
# Stripe Configuration (Production)
STRIPE_SECRET_KEY=sk_live_your_live_secret_key_here
STRIPE_TEST_SECRET_KEY=sk_test_your_test_key_here
NODE_ENV=production

# Sentry Error Reporting
SENTRY_DSN=https://your-actual-dsn@sentry.io/project-id

# Analytics (Already Configured)
MIXPANEL_TOKEN=464423c2d50d3113073d05faa473d76f
```

## Required for Webhook Server

Create a `.env` file in the `webhook-server` folder:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_live_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_live_your_webhook_secret_here

# Email Configuration (Use your email)
GMAIL_USER=r2thedev@gmail.com
GMAIL_APP_PASSWORD=your_app_password_here

# Server Configuration
PORT=3001
NODE_ENV=production

# App URLs (Update with your domain)
APP_DOWNLOAD_URL_MAC=https://yourdomain.com/downloads/epure-mac.dmg
APP_DOWNLOAD_URL_WINDOWS=https://yourdomain.com/downloads/epure-windows.exe
WEBSITE_URL=https://yourdomain.com
```

## Required for Website

Create a `.env.local` file in the `website` folder:

```bash
# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key_here
REACT_APP_STRIPE_PRICE_ID=price_your_price_id_here

# Analytics (Already Configured)
REACT_APP_MIXPANEL_TOKEN=464423c2d50d3113073d05faa473d76f
```

## How to Get These Values

### Stripe Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Switch to Live mode (toggle in sidebar)
3. Go to Developers > API Keys
4. Copy your Live Publishable Key and Secret Key
5. Go to Developers > Webhooks
6. Create a new webhook endpoint for your production server
7. Copy the webhook signing secret

### Gmail App Password
1. Go to [Google Account Settings](https://myaccount.google.com)
2. Enable 2-Factor Authentication
3. Go to Security > App Passwords
4. Generate a new app password for "Mail"
5. Use this password (not your regular Gmail password)

### Sentry DSN
1. Go to [Sentry.io](https://sentry.io)
2. Create a new project for Electron
3. Copy the DSN from project settings

## Security Checklist

- [ ] Never commit `.env` files to git
- [ ] Use different keys for test and production
- [ ] Rotate keys if they're ever exposed
- [ ] Monitor Sentry for security issues
- [ ] Test webhook endpoints before going live

## Deployment Notes

### Webhook Server Deployment
- Deploy to Heroku, Railway, or DigitalOcean
- Set all environment variables in the hosting platform
- Update Stripe webhook URL to point to your production server

### Desktop App
- Build with production environment variables
- Test builds on clean machines
- Ensure auto-updater works with your GitHub releases

### Website
- Deploy to Vercel, Netlify, or similar
- Set environment variables in deployment platform
- Test payment flow end-to-end

