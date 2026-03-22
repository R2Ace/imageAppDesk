# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Epure, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, please email **r2thedev@gmail.com** with:

- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

You will receive an acknowledgment within 48 hours, and we will work with you to understand and address the issue before any public disclosure.

## Scope

This policy applies to:

- The Epure desktop application (`desktop-app/`)
- The Epure website (`website/`)
- The webhook server (`webhook-server/`)

## Security Practices

- All file processing happens locally on the user's machine — no files are uploaded to any server
- Environment secrets are never committed to version control
- Stripe webhook signatures are verified server-side
- License keys use cryptographically secure random generation
- The desktop app uses Electron's context isolation and a strict Content Security Policy
- No user file paths or personal data are collected in analytics

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.0.x   | Yes       |
