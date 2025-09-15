# Épure Webhook Server

A complete webhook server for handling Stripe payments, generating license keys, and delivering them via email.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd webhook-server
npm install
```

### 2. Environment Setup
Copy `env-example.txt` to `.env` and fill in your credentials:

```bash
cp env-example.txt .env
```

Edit `.env` with your actual values:
```bash
# Stripe (Required)
STRIPE_SECRET_KEY=sk_test_your_test_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Email (Pick one)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Server
PORT=3001
NODE_ENV=development
```

### 3. Start Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

### 4. Test Everything
```bash
npm test
```

## 📊 API Endpoints

### License Management
- `GET /api/validate-license/:key` - Validate a license key
- `POST /api/activate-license` - Activate a license on a device
- `GET /api/licenses/:email` - Find all licenses for an email

### Statistics
- `GET /api/stats` - Get license and revenue statistics
- `GET /health` - Server health check

### Webhooks
- `POST /webhook` - Stripe webhook endpoint

### Testing (Development Only)
- `POST /api/test/generate-license` - Generate a test license
- `POST /api/test/send-email` - Send a test email

## 🔧 Configuration

### Email Services

**Option 1: Gmail (Easiest for testing)**
1. Enable 2-factor authentication on your Gmail account
2. Generate an "App Password" for your account
3. Use those credentials in your `.env` file

**Option 2: SendGrid (Recommended for production)**
1. Sign up at SendGrid.com
2. Get your API key
3. Add it to your `.env` file

### Stripe Setup

1. **Get your keys** from your Stripe dashboard
2. **Create a webhook endpoint** pointing to `your-server.com/webhook`
3. **Subscribe to events:** `payment_intent.succeeded`, `payment_intent.payment_failed`
4. **Copy the webhook secret** to your `.env` file

## 🧪 Testing Flow

### 1. Test License Generation
```bash
curl -X POST http://localhost:3001/api/test/generate-license \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 2. Test License Validation
```bash
curl http://localhost:3001/api/validate-license/EPURE-ABC123-DEF456-GHI789
```

### 3. Test Email Sending
```bash
curl -X POST http://localhost:3001/api/test/send-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "type": "license"}'
```

## 🗄️ Database

The server uses SQLite for simplicity. All data is stored in `licenses.db`.

### Tables:
- **licenses** - License keys and purchase info
- **license_activations** - Track where licenses are activated

## 🔐 Security Features

- ✅ Webhook signature verification
- ✅ License key format validation
- ✅ Secure random key generation
- ✅ SQL injection protection
- ✅ Error handling and logging

## 📈 Production Deployment

### Option 1: Heroku
```bash
git add .
git commit -m "Initial webhook server"
heroku create your-app-name
git push heroku main
```

### Option 2: DigitalOcean/AWS/Vercel
Deploy as a Node.js application with the environment variables configured.

### Important: Set Webhook URL
In your Stripe dashboard, set the webhook URL to:
`https://your-server.com/webhook`

## 🎯 Integration with Desktop App

Your desktop app should call:
```javascript
// Validate license
const response = await fetch('https://your-server.com/api/validate-license/EPURE-ABC123-DEF456-GHI789');
const { valid, info } = await response.json();

// Activate license
const activation = await fetch('https://your-server.com/api/activate-license', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    licenseKey: 'EPURE-ABC123-DEF456-GHI789',
    machineId: 'unique-machine-id',
    platform: 'darwin',
    appVersion: '1.0.0'
  })
});
```

## 📧 Email Templates

The server includes beautiful HTML email templates with:
- License key prominently displayed
- Download links for Mac/Windows
- Setup instructions
- Professional branding

## 🐛 Troubleshooting

### Common Issues:

1. **Webhook signature verification failed**
   - Check your `STRIPE_WEBHOOK_SECRET` is correct
   - Ensure raw body parsing is working

2. **Email not sending**
   - Verify your email credentials
   - Check Gmail App Password setup

3. **License validation failing**
   - Ensure license key format is correct
   - Check database connection

### Logs:
The server provides detailed logging for debugging. Check console output for:
- ✅ Success messages
- ❌ Error details
- 📧 Email sending status

## 🚀 Ready to Launch!

This webhook server is production-ready and handles:
- Automatic license generation
- Email delivery
- License validation
- Usage tracking
- Error handling

Perfect for your 5-day launch timeline! 🎉
