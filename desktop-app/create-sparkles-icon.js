#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('✨ Creating Épure App Icon with Sparkles...');

const buildDir = path.join(__dirname, 'build');
const assetsDir = path.join(__dirname, 'assets');

// Create build directory if it doesn't exist
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Create the SVG file with sparkles icon
const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 24 24" fill="none">
  <defs>
    <linearGradient id="sparklesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#8b5cf6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="12" cy="12" r="11" fill="url(#sparklesGradient)" stroke="none"/>
  
  <!-- Sparkles icon -->
  <g fill="white" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
    <path d="M20 3v4"/>
    <path d="M22 5h-4"/>
    <path d="M4 17v2"/>
    <path d="M5 18H3"/>
  </g>
</svg>`;

// Write SVG file
const svgPath = path.join(assetsDir, 'sparkles-icon.svg');
fs.writeFileSync(svgPath, svgContent);
console.log('✅ Created sparkles-icon.svg');

// Convert SVG to PNG using sips
const pngPath = path.join(buildDir, 'icon.png');
try {
  execSync(`sips -s format png -z 1024 1024 "${svgPath}" --out "${pngPath}"`, { stdio: 'pipe' });
  console.log('✅ Converted SVG to PNG (1024x1024)');
} catch (error) {
  console.error('❌ Failed to convert SVG to PNG:', error.message);
  console.log('💡 Make sure you have sips available (comes with macOS)');
  process.exit(1);
}

// Create different sizes for the .icns file
const sizes = [16, 32, 64, 128, 256, 512, 1024];
const tempDir = path.join(__dirname, 'temp-icons');

// Create temp directory
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true });
}
fs.mkdirSync(tempDir, { recursive: true });

console.log('📐 Generating icon sizes...');

// Generate different sizes
sizes.forEach(size => {
  try {
    const outputPath = path.join(tempDir, `icon-${size}.png`);
    execSync(`sips -z ${size} ${size} "${pngPath}" --out "${outputPath}"`, { stdio: 'pipe' });
    console.log(`✅ Generated ${size}x${size} icon`);
  } catch (error) {
    console.error(`❌ Failed to generate ${size}x${size} icon:`, error.message);
  }
});

// Create .icns file using iconutil
console.log('🔧 Creating .icns file...');

try {
  // Create iconset directory
  const iconsetDir = path.join(tempDir, 'icon.iconset');
  fs.mkdirSync(iconsetDir, { recursive: true });
  
  // Copy icons to iconset with proper naming
  const iconMappings = [
    { size: 16, name: 'icon_16x16.png' },
    { size: 32, name: 'icon_16x16@2x.png' },
    { size: 32, name: 'icon_32x32.png' },
    { size: 64, name: 'icon_32x32@2x.png' },
    { size: 128, name: 'icon_128x128.png' },
    { size: 256, name: 'icon_128x128@2x.png' },
    { size: 256, name: 'icon_256x256.png' },
    { size: 512, name: 'icon_256x256@2x.png' },
    { size: 512, name: 'icon_512x512.png' },
    { size: 1024, name: 'icon_512x512@2x.png' }
  ];
  
  iconMappings.forEach(mapping => {
    const sourcePath = path.join(tempDir, `icon-${mapping.size}.png`);
    const destPath = path.join(iconsetDir, mapping.name);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ Copied ${mapping.size}x${mapping.size} as ${mapping.name}`);
    }
  });
  
  // Create .icns file
  const icnsPath = path.join(buildDir, 'icon.icns');
  execSync(`iconutil -c icns "${iconsetDir}" -o "${icnsPath}"`, { stdio: 'pipe' });
  
  console.log('✅ Created icon.icns successfully');
  
  // Clean up temp directory
  fs.rmSync(tempDir, { recursive: true });
  
  // Clean up SVG file
  fs.unlinkSync(svgPath);
  
  console.log('🎉 Sparkles icon creation complete!');
  console.log('📱 Your app will now have a beautiful sparkles icon!');
  
} catch (error) {
  console.error('❌ Failed to create .icns file:', error.message);
  console.log('💡 Make sure you have Xcode command line tools installed');
  console.log('   Run: xcode-select --install');
  
  // Clean up temp directory
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
  }
  
  process.exit(1);
}
