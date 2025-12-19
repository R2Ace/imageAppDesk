/**
 * Audio Processor Module
 * Handles audio format conversion using FFmpeg
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Supported audio formats
const SUPPORTED_INPUT_FORMATS = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma', 'aiff'];
const SUPPORTED_OUTPUT_FORMATS = ['mp3', 'wav', 'flac', 'aac', 'ogg'];

// Audio quality presets
const QUALITY_PRESETS = {
  high: {
    mp3: { bitrate: '320k' },
    aac: { bitrate: '256k' },
    flac: { compression: '8' },
    wav: {},
    ogg: { quality: '10' }
  },
  medium: {
    mp3: { bitrate: '192k' },
    aac: { bitrate: '192k' },
    flac: { compression: '5' },
    wav: {},
    ogg: { quality: '6' }
  },
  low: {
    mp3: { bitrate: '128k' },
    aac: { bitrate: '128k' },
    flac: { compression: '0' },
    wav: {},
    ogg: { quality: '3' }
  }
};

/**
 * Get FFmpeg binary path
 * In production, FFmpeg would be bundled with the app
 */
function getFFmpegPath() {
  // Check if FFmpeg is available in PATH
  const isWindows = process.platform === 'win32';
  const ffmpegName = isWindows ? 'ffmpeg.exe' : 'ffmpeg';
  
  // For development, assume FFmpeg is in PATH
  // For production, you would bundle FFmpeg with the app
  return ffmpegName;
}

/**
 * Check if FFmpeg is available
 */
async function isFFmpegAvailable() {
  return new Promise((resolve) => {
    const ffmpeg = spawn(getFFmpegPath(), ['-version']);
    
    ffmpeg.on('error', () => {
      resolve(false);
    });
    
    ffmpeg.on('close', (code) => {
      resolve(code === 0);
    });
  });
}

/**
 * Get audio file metadata
 */
async function getAudioMetadata(filePath) {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn('ffprobe', [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      filePath
    ]);
    
    let output = '';
    
    ffprobe.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    ffprobe.on('error', (error) => {
      reject(new Error(`FFprobe error: ${error.message}`));
    });
    
    ffprobe.on('close', (code) => {
      if (code === 0) {
        try {
          const metadata = JSON.parse(output);
          const audioStream = metadata.streams?.find(s => s.codec_type === 'audio');
          resolve({
            duration: parseFloat(metadata.format?.duration || 0),
            bitrate: parseInt(metadata.format?.bit_rate || 0),
            sampleRate: parseInt(audioStream?.sample_rate || 0),
            channels: audioStream?.channels || 0,
            codec: audioStream?.codec_name || 'unknown',
            format: metadata.format?.format_name || 'unknown'
          });
        } catch (e) {
          reject(new Error('Failed to parse audio metadata'));
        }
      } else {
        reject(new Error(`FFprobe exited with code ${code}`));
      }
    });
  });
}

/**
 * Convert audio file
 * @param {string} inputPath - Path to input audio file
 * @param {string} outputFormat - Desired output format (mp3, wav, flac, aac, ogg)
 * @param {object} options - Conversion options
 * @returns {Promise<object>} - Conversion result
 */
async function convertAudio(inputPath, outputFormat, options = {}) {
  const {
    quality = 'high',
    outputDir = null,
    onProgress = null
  } = options;

  // Validate input
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const inputExt = path.extname(inputPath).toLowerCase().slice(1);
  if (!SUPPORTED_INPUT_FORMATS.includes(inputExt)) {
    throw new Error(`Unsupported input format: ${inputExt}`);
  }

  if (!SUPPORTED_OUTPUT_FORMATS.includes(outputFormat)) {
    throw new Error(`Unsupported output format: ${outputFormat}`);
  }

  // Check FFmpeg availability
  const ffmpegAvailable = await isFFmpegAvailable();
  if (!ffmpegAvailable) {
    throw new Error('FFmpeg is not installed. Please install FFmpeg to enable audio conversion.');
  }

  // Generate output path
  const inputName = path.basename(inputPath, path.extname(inputPath));
  const outputDirectory = outputDir || path.dirname(inputPath);
  const outputPath = path.join(outputDirectory, `${inputName}.${outputFormat}`);

  // Get quality settings
  const qualitySettings = QUALITY_PRESETS[quality]?.[outputFormat] || {};

  // Build FFmpeg arguments
  const args = [
    '-i', inputPath,
    '-y', // Overwrite output file
  ];

  // Add format-specific arguments
  switch (outputFormat) {
    case 'mp3':
      args.push('-codec:a', 'libmp3lame');
      if (qualitySettings.bitrate) {
        args.push('-b:a', qualitySettings.bitrate);
      }
      break;
      
    case 'aac':
      args.push('-codec:a', 'aac');
      if (qualitySettings.bitrate) {
        args.push('-b:a', qualitySettings.bitrate);
      }
      break;
      
    case 'flac':
      args.push('-codec:a', 'flac');
      if (qualitySettings.compression) {
        args.push('-compression_level', qualitySettings.compression);
      }
      break;
      
    case 'wav':
      args.push('-codec:a', 'pcm_s16le');
      break;
      
    case 'ogg':
      args.push('-codec:a', 'libvorbis');
      if (qualitySettings.quality) {
        args.push('-q:a', qualitySettings.quality);
      }
      break;
  }

  args.push(outputPath);

  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const ffmpeg = spawn(getFFmpegPath(), args);
    
    let stderr = '';
    let duration = 0;
    
    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
      
      // Parse duration from FFmpeg output
      const durationMatch = stderr.match(/Duration: (\d+):(\d+):(\d+)/);
      if (durationMatch && duration === 0) {
        duration = parseInt(durationMatch[1]) * 3600 + 
                   parseInt(durationMatch[2]) * 60 + 
                   parseInt(durationMatch[3]);
      }
      
      // Parse progress
      const timeMatch = data.toString().match(/time=(\d+):(\d+):(\d+)/);
      if (timeMatch && duration > 0 && onProgress) {
        const currentTime = parseInt(timeMatch[1]) * 3600 + 
                           parseInt(timeMatch[2]) * 60 + 
                           parseInt(timeMatch[3]);
        const progress = Math.min(100, Math.round((currentTime / duration) * 100));
        onProgress(progress);
      }
    });

    ffmpeg.on('error', (error) => {
      reject(new Error(`FFmpeg error: ${error.message}`));
    });

    ffmpeg.on('close', async (code) => {
      if (code === 0) {
        try {
          const stats = fs.statSync(outputPath);
          const inputStats = fs.statSync(inputPath);
          
          resolve({
            success: true,
            inputPath,
            outputPath,
            inputSize: inputStats.size,
            outputSize: stats.size,
            format: outputFormat,
            processingTime: Date.now() - startTime,
            savings: Math.round((1 - stats.size / inputStats.size) * 100)
          });
        } catch (e) {
          reject(new Error('Failed to get output file stats'));
        }
      } else {
        reject(new Error(`FFmpeg conversion failed with code ${code}: ${stderr}`));
      }
    });
  });
}

/**
 * Convert multiple audio files
 */
async function batchConvertAudio(inputPaths, outputFormat, options = {}) {
  const results = [];
  const { onFileProgress, onTotalProgress, ...convertOptions } = options;
  
  for (let i = 0; i < inputPaths.length; i++) {
    const inputPath = inputPaths[i];
    
    try {
      const result = await convertAudio(inputPath, outputFormat, {
        ...convertOptions,
        onProgress: (progress) => {
          if (onFileProgress) {
            onFileProgress(i, progress);
          }
        }
      });
      
      results.push(result);
    } catch (error) {
      results.push({
        success: false,
        inputPath,
        error: error.message
      });
    }
    
    if (onTotalProgress) {
      onTotalProgress(Math.round(((i + 1) / inputPaths.length) * 100));
    }
  }
  
  return results;
}

module.exports = {
  SUPPORTED_INPUT_FORMATS,
  SUPPORTED_OUTPUT_FORMATS,
  QUALITY_PRESETS,
  isFFmpegAvailable,
  getAudioMetadata,
  convertAudio,
  batchConvertAudio
};

