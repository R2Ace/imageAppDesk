#!/usr/bin/env node

const express = require('express');
const path = require('path');
const app = express();
const PORT = 3002;

// Serve the DMG file (ARM64 version for Apple Silicon Macs)
app.get('/Épure-1.0.0.dmg', (req, res) => {
  const dmgPath = path.join(__dirname, 'desktop-app/dist/Épure-1.0.0-arm64.dmg');
  res.download(dmgPath, 'Épure-1.0.0.dmg');
});

app.listen(PORT, () => {
  console.log(`🚀 DMG server running on http://localhost:${PORT}`);
  console.log(`📦 Download URL: http://localhost:${PORT}/Épure-1.0.0.dmg`);
});
