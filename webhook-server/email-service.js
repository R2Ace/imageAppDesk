const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.setupTransporter();
  }

  setupTransporter() {
    if (process.env.SENDGRID_API_KEY) {
      // SendGrid configuration
      this.transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      });
    } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      // Gmail configuration
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      });
    } else {
      // Test account for development
      console.log('⚠️  No email credentials found. Using test mode - emails will be logged only.');
      this.transporter = null; // Disable email sending
    }
  }

  async sendLicenseEmail(email, licenseKey, paymentAmount) {
    const downloadUrlMac = process.env.APP_DOWNLOAD_URL_MAC || '#';
    const downloadUrlWindows = process.env.APP_DOWNLOAD_URL_WINDOWS || '#';
    const websiteUrl = process.env.WEBSITE_URL || 'https://epure.app';

    const emailHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Épure License Key</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 30px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; margin-bottom: 30px; }
        .logo { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
        .license-box { background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0; }
        .license-key { font-family: 'Monaco', 'Menlo', monospace; font-size: 24px; font-weight: bold; color: #2d3748; background: white; padding: 15px; border-radius: 8px; border: 1px solid #cbd5e0; letter-spacing: 2px; }
        .download-section { margin: 30px 0; }
        .download-button { display: inline-block; background: #4299e1; color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; margin: 10px; font-weight: 600; transition: background 0.3s; }
        .download-button:hover { background: #3182ce; }
        .instructions { background: #edf2f7; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 14px; }
        .highlight { background: #fed7d7; padding: 2px 6px; border-radius: 4px; color: #c53030; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">✨ Épure</div>
            <p>Thank you for your purchase!</p>
        </div>

        <h2>🎉 Welcome to Épure!</h2>
        <p>Thank you for purchasing Épure for <strong>$${(paymentAmount / 100).toFixed(2)}</strong>. Your license key is ready!</p>

        <div class="license-box">
            <h3>Your License Key</h3>
            <div class="license-key">${licenseKey}</div>
            <p><small>Keep this key safe - you'll need it to activate Épure</small></p>
        </div>

        <div class="download-section">
            <h3>📥 Download Épure</h3>
            <p>Choose your platform:</p>
            <a href="${downloadUrlMac}" class="download-button">📱 Download for Mac</a>
            <a href="${downloadUrlWindows}" class="download-button">💻 Download for Windows</a>
        </div>

        <div class="instructions">
            <h3>🚀 Quick Setup Guide</h3>
            <ol>
                <li><strong>Download</strong> the app for your platform above</li>
                <li><strong>Install</strong> Épure on your computer</li>
                <li><strong>Open</strong> the app and click the settings icon ⚙️</li>
                <li><strong>Enter</strong> your license key: <span class="highlight">${licenseKey}</span></li>
                <li><strong>Start</strong> converting images faster than ever! 🎨</li>
            </ol>
        </div>

        <div style="background: #e6fffa; padding: 20px; border-radius: 8px; border-left: 4px solid #38b2ac;">
            <h4>🎯 What you get with Épure:</h4>
            <ul>
                <li>✅ Unlimited image processing</li>
                <li>✅ 3x faster than web-based tools</li>
                <li>✅ Complete privacy - files never uploaded</li>
                <li>✅ All formats: HEIC, WebP, PNG, JPG, TIFF</li>
                <li>✅ Professional-grade compression</li>
                <li>✅ Lifetime updates</li>
            </ul>
        </div>

        <h3>💬 Need Help?</h3>
        <p>If you have any questions or need assistance:</p>
        <ul>
            <li>📧 Email us: <a href="mailto:r2thedev@gmail.com">r2thedev@gmail.com</a></li>
            <li>🌐 Visit: <a href="${websiteUrl}">${websiteUrl}</a></li>
        </ul>

        <div class="footer">
            <p>Thanks for choosing Épure!</p>
            <p>This email was sent because you purchased a license for Épure.<br>
            If you didn't make this purchase, please contact <a href="mailto:r2thedev@gmail.com">r2thedev@gmail.com</a></p>
        </div>
    </div>
</body>
</html>`;

    const emailText = `
🎉 Welcome to Épure!

Thank you for purchasing Épure for $${(paymentAmount / 100).toFixed(2)}!

Your License Key: ${licenseKey}

Download Links:
Mac: ${downloadUrlMac}
Windows: ${downloadUrlWindows}

Quick Setup:
1. Download the app for your platform
2. Install Épure on your computer  
3. Open the app and click settings ⚙️
4. Enter your license key: ${licenseKey}
5. Start converting images!

Need help? Email us at r2thedev@gmail.com

Thanks for choosing Épure!
`;

    const mailOptions = {
      from: process.env.SENDGRID_FROM_EMAIL || process.env.GMAIL_USER || 'noreply@epure.app',
      to: email,
      subject: '🎉 Your Épure License Key - Ready to Download!',
      text: emailText,
      html: emailHTML
    };

    try {
      if (this.transporter) {
        const result = await this.transporter.sendMail(mailOptions);
        console.log('✅ License email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
      } else {
        console.log('📧 Email would be sent to:', email);
        console.log('License Key:', licenseKey);
        return { success: true, messageId: 'test-mode' };
      }
    } catch (error) {
      console.error('❌ Failed to send license email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(email) {
    // Simple welcome email for ConvertKit integration
    const emailHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to Épure</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; }
        .container { max-width: 500px; margin: 0 auto; padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Welcome to Épure! ✨</h2>
        <p>Thanks for your interest in Épure - the fastest, most private image converter.</p>
        <p>Ready to upgrade from slow web tools to lightning-fast native performance?</p>
        <a href="${process.env.WEBSITE_URL || 'https://epure.app'}" style="background: #4299e1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Get Épure for $9</a>
    </div>
</body>
</html>`;

    const mailOptions = {
      from: process.env.SENDGRID_FROM_EMAIL || process.env.GMAIL_USER || 'noreply@epure.app',
      to: email,
      subject: 'Welcome to Épure! ✨',
      html: emailHTML
    };

    try {
      if (this.transporter) {
        const result = await this.transporter.sendMail(mailOptions);
        return { success: true, messageId: result.messageId };
      } else {
        console.log('📧 Welcome email would be sent to:', email);
        return { success: true, messageId: 'test-mode' };
      }
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      throw error;
    }
  }

  async sendFeedbackEmail(feedback) {
    const { type, title, message, email, timestamp, appVersion, platform } = feedback;
    
    const emailHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Épure Feedback</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .feedback-box { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .meta { color: #6c757d; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>📝 New Épure Feedback</h2>
        
        <div class="feedback-box">
            <h3>${title}</h3>
            <p><strong>Type:</strong> ${type}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
        </div>
        
        <div class="meta">
            <p><strong>From:</strong> ${email || 'No email provided'}</p>
            <p><strong>Platform:</strong> ${platform || 'Unknown'}</p>
            <p><strong>App Version:</strong> ${appVersion || 'Unknown'}</p>
            <p><strong>Timestamp:</strong> ${timestamp || new Date().toISOString()}</p>
        </div>
    </div>
</body>
</html>`;

    const emailText = `
New Épure Feedback

Title: ${title}
Type: ${type}
Message: ${message}

From: ${email || 'No email provided'}
Platform: ${platform || 'Unknown'}
App Version: ${appVersion || 'Unknown'}
Timestamp: ${timestamp || new Date().toISOString()}
`;

    const mailOptions = {
      from: process.env.SENDGRID_FROM_EMAIL || process.env.GMAIL_USER || 'noreply@epure.app',
      to: 'r2thedev@gmail.com',
      subject: `Épure Feedback: ${title}`,
      text: emailText,
      html: emailHTML
    };

    try {
      if (this.transporter) {
        const result = await this.transporter.sendMail(mailOptions);
        console.log('✅ Feedback email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
      } else {
        console.log('📧 Feedback email would be sent to r2thedev@gmail.com');
        console.log('Feedback:', { type, title, message, email, platform });
        return { success: true, messageId: 'test-mode' };
      }
    } catch (error) {
      console.error('❌ Failed to send feedback email:', error);
      throw error;
    }
  }
}

module.exports = EmailService;
