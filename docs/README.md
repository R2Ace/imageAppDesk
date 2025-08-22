# Image Batch Processor

A desktop application built with Electron and Sharp.js for resizing, converting, and optimizing images in batch.

## Features

- Drag and drop multiple images (JPG, PNG, WebP, HEIC)
- Resize images by fixed width or percentage
- Convert to various formats (JPG, PNG, WebP)
- Adjust quality for better compression
- Strip EXIF metadata for privacy
- Save processed images to a specified output folder
- Clean, modern UI with progress tracking

## Tech Stack

- Electron: Cross-platform desktop framework
- Sharp.js: High-performance image processing library
- HTML/CSS/JavaScript: For the user interface

## Development Setup

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/R2Ace/imageAppDesk.git
   cd imageAppDesk
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Building for Production

### Building for macOS

```bash
npm run build:mac
```

### Building for Windows

```bash
npm run build:win
```

The packaged application will be available in the `dist` directory.

## Application Structure

- `main.js`: Electron main process file
- `preload.js`: Secure bridge between main and renderer processes
- `index.html`: Application UI structure
- `renderer.js`: UI logic and interactions
- `styles.css`: Application styling

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or need assistance, please open an issue on the repository.
