  // Handle image processing
  ipcMain.handle('process-images', async (_, { files, settings }) => {
    log.info('IPC: process-images called with', files.length, 'files');
    const startTime = Date.now();
    
    try {
      const outputDir = store.get('outputDir');
      log.debug('Output directory:', outputDir);
      
      const results = [];
      let totalOriginalSize = 0;
      let totalNewSize = 0;
      let successCount = 0;

      // Track batch processing start
      try {
        analytics.trackBatchProcessing(files.length, files.reduce((sum, f) => sum + f.size, 0));
        log.debug('Batch processing tracked');
      } catch (error) {
        log.error('Failed to track batch processing:', error.message);
      }

      // Ensure output directory exists
      log.debug('Checking output directory:', outputDir);
      if (!fs.existsSync(outputDir)) {
        log.info('Output directory does not exist, creating:', outputDir);
        try {
          fs.mkdirSync(outputDir, { recursive: true });
          log.info('Output directory created successfully');
        } catch (dirError) {
          const errorMsg = `Unable to create output directory: ${dirError.message}`;
          log.error('Directory creation failed:', errorMsg);
          try {
            analytics.trackError('directory_creation_failed', errorMsg);
          } catch (analyticsError) {
            log.error('Failed to track directory creation error:', analyticsError.message);
          }
          throw new Error(errorMsg);
        }
      } else {
        log.debug('Output directory exists');
      }

      // Process files with improved error handling
      log.info('Starting to process', files.length, 'files');
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filename = file.name;
        
        log.debug(`Processing file ${i + 1}/${files.length}:`, filename);
        
        try {
          // Validate file
          if (!file.buffer || file.size === 0) {
            throw new Error('File is empty or corrupted');
          }

          if (file.size > 100 * 1024 * 1024) { // 100MB limit
            throw new Error('File size exceeds 100MB limit');
          }

          const buffer = Buffer.from(file.buffer);
          const fileInfo = path.parse(filename);
          const inputFormat = fileInfo.ext.toLowerCase().replace('.', '');
          
          // Validate input format
          const supportedFormats = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'tiff', 'tif'];
          if (!supportedFormats.includes(inputFormat)) {
            throw new Error(`Unsupported file format: ${inputFormat}`);
          }

          const outputFilename = `${fileInfo.name}.${settings.format}`;
          let outputPath = path.join(outputDir, outputFilename);
          
          // Handle file conflicts
          outputPath = getUniqueFilename(outputPath, settings.overwriteFiles);

          // Create Sharp instance with better error handling
          let sharpInstance;
          try {
            sharpInstance = sharp(buffer, { 
              limitInputPixels: false,
              failOnError: false // Don't fail on minor corruption
            });
          } catch (sharpError) {
            throw new Error(`Unable to read image: ${sharpError.message}`);
          }

          // Strip metadata if requested
          if (settings.stripMetadata) {
            sharpInstance = sharpInstance.withMetadata(false);
          } else {
            // Keep essential metadata but remove location data for privacy
            sharpInstance = sharpInstance.withMetadata({
              exif: { IFD0: { Copyright: 'Processed with Épure' } }
            });
          }

          // Get dimensions based on preset or custom
          let dimensions;
          if (settings.preset === 'custom') {
            dimensions = {
              width: Math.max(1, Math.min(50000, settings.customWidth)), // Clamp values
              height: Math.max(1, Math.min(50000, settings.customHeight))
            };
          } else {
            dimensions = getPresetDimensions(settings.preset);
          }

          // Resize image with better options
          if (dimensions) {
            sharpInstance = sharpInstance.resize({
              width: dimensions.width,
              height: dimensions.height,
              fit: 'inside',
              withoutEnlargement: true,
              kernel: sharp.kernel.lanczos3 // Better quality
            });
          }

          // Set output format and quality with validation
          const quality = Math.max(1, Math.min(100, settings.quality));
          
          switch (settings.format) {
            case 'jpeg':
              sharpInstance = sharpInstance.jpeg({ 
                quality,
                progressive: true,
                mozjpeg: true // Better compression
              });
              break;
            case 'png':
              sharpInstance = sharpInstance.png({
                compressionLevel: Math.max(0, Math.min(9, Math.floor((100 - quality) / 11))),
                progressive: true
              });
              break;
            case 'webp':
              sharpInstance = sharpInstance.webp({ 
                quality,
                effort: 4 // Good balance of compression and speed
              });
              break;
            case 'avif':
              sharpInstance = sharpInstance.avif({ quality });
              break;
            default:
              throw new Error(`Unsupported output format: ${settings.format}`);
          }

          // Process the image with timeout
          const processPromise = sharpInstance.toFile(outputPath);
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Processing timeout (30s exceeded)')), 30000);
          });

          await Promise.race([processPromise, timeoutPromise]);

          // Get file sizes for reporting
          const originalSize = file.size;
          const newSize = fs.statSync(outputPath).size;
          const compressionRatio = newSize / originalSize;
          const savingsPercent = Math.round((1 - compressionRatio) * 100);

          totalOriginalSize += originalSize;
          totalNewSize += newSize;
          successCount++;

          // Track successful conversion
          analytics.trackFileConverted(settings.format, inputFormat, originalSize, compressionRatio);

          results.push({
            name: filename,
            success: true,
            originalSize,
            newSize,
            savingsPercent,
            outputPath,
            processingTime: Date.now() - startTime
          });

        } catch (error) {
          console.error(`Error processing file ${filename}:`, error);
          
          // Track error with context
          analytics.trackError('file_processing_failed', `${filename}: ${error.message}`);
          
          // Provide user-friendly error messages
          let userMessage = error.message;
          if (error.message.includes('Input buffer contains unsupported image format')) {
            userMessage = 'This file format is not supported. Please use JPG, PNG, WebP, HEIC, or TIFF files.';
          } else if (error.message.includes('timeout')) {
            userMessage = 'File processing took too long. Try reducing the file size or image dimensions.';
          } else if (error.message.includes('memory')) {
            userMessage = 'Not enough memory to process this file. Try closing other applications or using a smaller file.';
          }

          results.push({
            name: file.name,
            success: false,
            error: userMessage,
            originalError: error.message // For debugging
          });
        }

        // Send progress update
        mainWindow.webContents.send('process-progress', {
          current: i + 1,
          total: files.length,
          file: filename,
          successRate: Math.round((successCount / (i + 1)) * 100)
        });
      }

      // Track batch completion
      const totalTime = Date.now() - startTime;
      const avgTimePerFile = totalTime / files.length;
      
      console.log(`Batch processing completed: ${successCount}/${files.length} files in ${totalTime}ms`);

      return {
        success: true,
        results,
        stats: {
          totalFiles: files.length,
          successCount,
          totalOriginalSize,
          totalNewSize,
          totalSavingsPercent: totalOriginalSize > 0 ? Math.round((1 - totalNewSize / totalOriginalSize) * 100) : 0,
          processingTime: Date.now() - startTime
        }
      };

    } catch (error) {
      log.error('Critical error in batch processing:', error.message);
      log.error('Batch processing error stack:', error.stack);
      
      try {
        analytics.trackError('batch_processing_failed', error.message);
      } catch (analyticsError) {
        log.error('Failed to track batch processing error:', analyticsError.message);
      }
      
      // Return error for entire batch
      return {
        success: false,
        error: error.message,
        results: []
      };
    }
  });
