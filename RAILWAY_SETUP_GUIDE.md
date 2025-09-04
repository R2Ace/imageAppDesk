# 🚂 Railway Deployment Setup Guide

## ⚠️ Current Issue: Missing Environment Variables

Your webhook server is deployed but missing required environment variables in Railway.

## 🔧 Fix Steps

### 1. Set Environment Variables in Railway

Go to your Railway project dashboard and add these variables:

```bash
NODE_ENV=production
STRIPE_SECRET_KEY=sk_live_51R3AvQA8Xjc7tVUmvSd3c4h8U4u2oyl65iEIlcfpiy38jD66vxoSowFeRTZitwbgAUSLuCtbeOdIvDLjE
STRIPE_PUBLISHABLE_KEY=pk_live_51R3AvQA8Xjc7tVUmcB8mnHKzB4da5dpBWdHz0FruInXipeUhEcFi7KrypPM8UoGKPDfbNuVDPjph
STRIPE_WEBHOOK_SECRET=we_1S35MoA8Xjc7tVUmF63eKke2
GMAIL_USER=aizanrob7@gmail.com
GMAIL_APP_PASSWORD=olrb gfoy ljjf idji
PORT=3001
APP_DOWNLOAD_URL_MAC=https://your-download-site.com/downloads/epure-mac.dmg
APP_DOWNLOAD_URL_WINDOWS=https://your-download-site.com/downloads/epure-windows.exe
WEBSITE_URL=https://epure-jrgzo2soz-r2aces-projects.vercel.app
```

### 2. Deploy Changes

After setting environment variables in Railway:

```bash
# Push the updated server code
cd webhook-server
git add .
git commit -m "Fix webhook server error handling"
git push
```

### 3. Test the Fix

```bash
# Test the debug endpoint
curl https://epure-webhook-production.up.railway.app/debug/env

# Test checkout session creation
curl -X POST https://epure-webhook-production.up.railway.app/api/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"successUrl":"https://test.com/success","cancelUrl":"https://test.com/cancel"}'
```

## 🎯 Expected Results

After fixing the environment variables, you should see:

✅ **Debug endpoint returns:**
```json
{
  "nodeEnv": "production",
  "hasStripeKey": true,
  "stripeKeyLength": 107,
  "port": "3001"
}
```

✅ **Checkout session returns:**
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_live_..."
}
```

## 🔍 Current Problem

The Railway deployment doesn't have access to your `.env` file. Environment variables must be set directly in the Railway dashboard.

### How to Set Variables in Railway:

1. Go to [railway.app](https://railway.app)
2. Open your project: `epure-webhook-production`
3. Go to **Variables** tab
4. Add each environment variable one by one
5. Deploy will automatically restart

## 🚨 Security Note

Your Stripe keys are live production keys. Make sure Railway project access is restricted to you only.

## 🔄 Alternative: Quick Fix

If you need immediate access, you can temporarily hardcode the Stripe key in the server code (NOT RECOMMENDED for production):

```javascript
// TEMPORARY FIX - NOT FOR PRODUCTION
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_live_51R3AvQA8Xjc7tVUm...');
```

But this is insecure. Always use environment variables in production.

## ✅ Next Steps

1. Set Railway environment variables
2. Test the payment flow
3. Remove debug endpoint after verification
4. Monitor webhook logs for any other issues
