# Epure

A fast, private, offline file converter for macOS. Convert images, audio, and documents without uploading anything to the cloud.

**[Download for Mac](https://github.com/R2Ace/imageAppDesk/releases/latest)** (Apple Silicon, free)

---

## What it does

- **Images** — Convert between JPEG, PNG, WebP, AVIF, HEIC, and TIFF. Batch process 500+ files at once with quality and resolution controls.
- **Audio** — Convert between MP3, WAV, FLAC, AAC, and OGG (requires FFmpeg).
- **Documents** — Convert between PDF and DOCX.

Everything runs locally on your machine. No files are ever uploaded anywhere.

## Install

1. Download the DMG from [Releases](https://github.com/R2Ace/imageAppDesk/releases/latest)
2. Open the DMG and drag Epure to your Applications folder
3. Right-click the app and select **Open** (required once for unsigned apps)

**Requirements:** macOS 10.15+ (Catalina or later), Apple Silicon (M1/M2/M3/M4)

## Build from source

```bash
cd desktop-app
npm install
npm start          # development
npm run build:dmg  # production DMG
```

### Environment variables

Create a `.env` file in `desktop-app/` for optional integrations:

```
SENTRY_DSN=your-sentry-dsn
MIXPANEL_TOKEN=your-mixpanel-token
STRIPE_SECRET_KEY=your-stripe-key
```

None of these are required — the app works fully without them.

## Project structure

```
desktop-app/       Electron app (main process, renderer, preload)
website/           Marketing site (React + Vite, deployed on Vercel)
webhook-server/    License & payment webhook server (Node.js)
docs/              Internal documentation
```

## Tech stack

- **Desktop:** Electron 27, Sharp (image processing), pdf-lib, mammoth
- **Website:** React, Vite, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express, Stripe, SQLite
- **Monitoring:** Sentry (crash reporting), Mixpanel (anonymous analytics)

## Privacy

Epure is built privacy-first:

- All file processing happens on your machine — nothing is uploaded
- Analytics are anonymous and opt-in (no file paths or personal data collected)
- No account required to use the app
- Works fully offline after installation

## Security

See [SECURITY.md](SECURITY.md) for our vulnerability disclosure policy.

## License

Proprietary. See the [Releases](https://github.com/R2Ace/imageAppDesk/releases) page for the free download.
