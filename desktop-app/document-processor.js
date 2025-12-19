/**
 * Document Processor Module
 * Handles document conversion: PDF, DOCX, TXT
 * Uses pdf-lib for PDF manipulation and mammoth for Word documents
 */

const path = require('path');
const fs = require('fs').promises;
const log = require('electron-log');

// We'll lazy-load these to avoid startup delays
let PDFDocument = null;
let mammoth = null;

/**
 * Initialize dependencies (lazy loading)
 */
async function initDependencies() {
  if (!PDFDocument) {
    try {
      const pdfLib = require('pdf-lib');
      PDFDocument = pdfLib.PDFDocument;
      log.info('pdf-lib loaded successfully');
    } catch (error) {
      log.warn('pdf-lib not installed. PDF features will be limited.');
    }
  }
  
  if (!mammoth) {
    try {
      mammoth = require('mammoth');
      log.info('mammoth loaded successfully');
    } catch (error) {
      log.warn('mammoth not installed. DOCX features will be limited.');
    }
  }
}

/**
 * Get supported document formats
 */
function getSupportedFormats() {
  return {
    input: ['pdf', 'docx', 'doc', 'txt', 'rtf'],
    output: {
      pdf: ['txt', 'images'],
      docx: ['pdf', 'html', 'txt'],
      txt: ['pdf'],
      rtf: ['txt']
    }
  };
}

/**
 * Check if a file is a supported document
 */
function isDocumentFile(filePath) {
  const ext = path.extname(filePath).toLowerCase().slice(1);
  return getSupportedFormats().input.includes(ext);
}

/**
 * Get document metadata
 */
async function getDocumentMetadata(filePath) {
  await initDependencies();
  
  const ext = path.extname(filePath).toLowerCase().slice(1);
  const stats = await fs.stat(filePath);
  
  const metadata = {
    name: path.basename(filePath),
    path: filePath,
    size: stats.size,
    type: ext.toUpperCase(),
    createdAt: stats.birthtime,
    modifiedAt: stats.mtime
  };
  
  try {
    if (ext === 'pdf' && PDFDocument) {
      const buffer = await fs.readFile(filePath);
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      metadata.pageCount = pdfDoc.getPageCount();
      metadata.title = pdfDoc.getTitle() || null;
      metadata.author = pdfDoc.getAuthor() || null;
    } else if (ext === 'docx' && mammoth) {
      // mammoth doesn't provide metadata, so we just note it's a docx
      metadata.type = 'DOCX';
    } else if (ext === 'txt') {
      const content = await fs.readFile(filePath, 'utf-8');
      metadata.characterCount = content.length;
      metadata.lineCount = content.split('\n').length;
    }
  } catch (error) {
    log.warn(`Could not extract metadata from ${filePath}:`, error.message);
  }
  
  return metadata;
}

/**
 * Convert DOCX to HTML
 */
async function docxToHtml(filePath, outputDir) {
  await initDependencies();
  
  if (!mammoth) {
    throw new Error('mammoth is not installed. Run: npm install mammoth');
  }
  
  const buffer = await fs.readFile(filePath);
  const result = await mammoth.convertToHtml({ buffer });
  
  const baseName = path.basename(filePath, path.extname(filePath));
  const outputPath = path.join(outputDir, `${baseName}.html`);
  
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${baseName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      line-height: 1.6;
      color: #333;
    }
    h1, h2, h3 { color: #1a1a1a; }
    img { max-width: 100%; height: auto; }
    table { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid #ddd; padding: 8px; }
  </style>
</head>
<body>
${result.value}
</body>
</html>`;
  
  await fs.writeFile(outputPath, htmlContent, 'utf-8');
  
  return {
    success: true,
    outputPath,
    warnings: result.messages
  };
}

/**
 * Convert DOCX to plain text
 */
async function docxToText(filePath, outputDir) {
  await initDependencies();
  
  if (!mammoth) {
    throw new Error('mammoth is not installed. Run: npm install mammoth');
  }
  
  const buffer = await fs.readFile(filePath);
  const result = await mammoth.extractRawText({ buffer });
  
  const baseName = path.basename(filePath, path.extname(filePath));
  const outputPath = path.join(outputDir, `${baseName}.txt`);
  
  await fs.writeFile(outputPath, result.value, 'utf-8');
  
  return {
    success: true,
    outputPath,
    characterCount: result.value.length
  };
}

/**
 * Convert text to PDF
 */
async function textToPdf(filePath, outputDir, options = {}) {
  await initDependencies();
  
  if (!PDFDocument) {
    throw new Error('pdf-lib is not installed. Run: npm install pdf-lib');
  }
  
  const { PDFDocument: Doc, StandardFonts, rgb } = require('pdf-lib');
  
  const text = await fs.readFile(filePath, 'utf-8');
  const lines = text.split('\n');
  
  const pdfDoc = await Doc.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  const fontSize = options.fontSize || 12;
  const margin = options.margin || 50;
  const pageWidth = 612; // Letter size
  const pageHeight = 792;
  const lineHeight = fontSize * 1.4;
  const maxWidth = pageWidth - (margin * 2);
  
  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - margin;
  
  for (const line of lines) {
    // Word wrap
    const words = line.split(' ');
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      
      if (width > maxWidth && currentLine) {
        // Draw current line and start new one
        if (yPosition < margin + lineHeight) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          yPosition = pageHeight - margin;
        }
        
        currentPage.drawText(currentLine, {
          x: margin,
          y: yPosition,
          size: fontSize,
          font,
          color: rgb(0, 0, 0)
        });
        
        yPosition -= lineHeight;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    // Draw remaining text
    if (currentLine) {
      if (yPosition < margin + lineHeight) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        yPosition = pageHeight - margin;
      }
      
      currentPage.drawText(currentLine, {
        x: margin,
        y: yPosition,
        size: fontSize,
        font,
        color: rgb(0, 0, 0)
      });
    }
    
    yPosition -= lineHeight;
  }
  
  const baseName = path.basename(filePath, path.extname(filePath));
  const outputPath = path.join(outputDir, `${baseName}.pdf`);
  
  const pdfBytes = await pdfDoc.save();
  await fs.writeFile(outputPath, pdfBytes);
  
  return {
    success: true,
    outputPath,
    pageCount: pdfDoc.getPageCount()
  };
}

/**
 * Extract text from PDF
 */
async function pdfToText(filePath, outputDir) {
  await initDependencies();
  
  // Note: pdf-lib doesn't support text extraction
  // For full text extraction, you'd need pdf-parse or similar
  // This is a placeholder that returns a message
  
  const baseName = path.basename(filePath, path.extname(filePath));
  const outputPath = path.join(outputDir, `${baseName}.txt`);
  
  // Try to use pdf-parse if available
  try {
    const pdfParse = require('pdf-parse');
    const buffer = await fs.readFile(filePath);
    const data = await pdfParse(buffer);
    
    await fs.writeFile(outputPath, data.text, 'utf-8');
    
    return {
      success: true,
      outputPath,
      pageCount: data.numpages,
      characterCount: data.text.length
    };
  } catch (error) {
    log.warn('pdf-parse not installed, cannot extract text from PDF');
    throw new Error('PDF text extraction requires pdf-parse. Run: npm install pdf-parse');
  }
}

/**
 * Main conversion function
 */
async function convertDocument(filePath, outputFormat, outputDir, options = {}) {
  await initDependencies();
  
  const inputExt = path.extname(filePath).toLowerCase().slice(1);
  const outputExt = outputFormat.toLowerCase();
  
  log.info(`Converting ${inputExt} to ${outputExt}: ${filePath}`);
  
  try {
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });
    
    // Route to appropriate converter
    if (inputExt === 'docx' || inputExt === 'doc') {
      if (outputExt === 'html') {
        return await docxToHtml(filePath, outputDir);
      } else if (outputExt === 'txt') {
        return await docxToText(filePath, outputDir);
      } else if (outputExt === 'pdf') {
        // Convert to text first, then to PDF
        const tempResult = await docxToText(filePath, outputDir);
        const pdfResult = await textToPdf(tempResult.outputPath, outputDir, options);
        // Clean up temp file
        await fs.unlink(tempResult.outputPath);
        return pdfResult;
      }
    } else if (inputExt === 'txt') {
      if (outputExt === 'pdf') {
        return await textToPdf(filePath, outputDir, options);
      }
    } else if (inputExt === 'pdf') {
      if (outputExt === 'txt') {
        return await pdfToText(filePath, outputDir);
      }
    }
    
    throw new Error(`Conversion from ${inputExt} to ${outputExt} is not supported`);
    
  } catch (error) {
    log.error(`Document conversion failed: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Batch convert documents
 */
async function batchConvertDocuments(files, outputFormat, outputDir, progressCallback) {
  const results = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    if (progressCallback) {
      progressCallback({
        current: i + 1,
        total: files.length,
        file: path.basename(file)
      });
    }
    
    const result = await convertDocument(file, outputFormat, outputDir);
    results.push({
      ...result,
      name: path.basename(file),
      originalPath: file
    });
  }
  
  return results;
}

/**
 * Check if required dependencies are installed
 */
async function checkDependencies() {
  const status = {
    pdfLib: false,
    mammoth: false,
    pdfParse: false
  };
  
  try {
    require('pdf-lib');
    status.pdfLib = true;
  } catch (e) { /* not installed */ }
  
  try {
    require('mammoth');
    status.mammoth = true;
  } catch (e) { /* not installed */ }
  
  try {
    require('pdf-parse');
    status.pdfParse = true;
  } catch (e) { /* not installed */ }
  
  return status;
}

module.exports = {
  getSupportedFormats,
  isDocumentFile,
  getDocumentMetadata,
  convertDocument,
  batchConvertDocuments,
  checkDependencies,
  docxToHtml,
  docxToText,
  textToPdf,
  pdfToText
};

