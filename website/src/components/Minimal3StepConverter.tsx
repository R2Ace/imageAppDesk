import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, ArrowDown, Check, FileImage, Zap, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { fadeInUp, staggerContainer } from '../lib/utils';

interface FileWithPreview extends File {
  preview: string;
}

interface ConvertedFile {
  downloadUrl: string;
  name: string;
  preview: string;
}

const Minimal3StepConverter = () => {
  const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(null);
  const [outputFormat, setOutputFormat] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isConverted, setIsConverted] = useState<boolean>(false);
  const [convertedFile, setConvertedFile] = useState<ConvertedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset converter state
  const resetConverter = () => {
    setSelectedFile(null);
    setOutputFormat('');
    setIsConverted(false);
    setConvertedFile(null);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle file selection
  const handleFileSelect = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      const fileWithPreview: FileWithPreview = {
        ...file,
        preview: URL.createObjectURL(file)
      } as FileWithPreview;
      setSelectedFile(fileWithPreview);
      setIsConverted(false);
      setConvertedFile(null);
    }
  };

  // Drag and drop handlers
  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  }, []);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  // Convert image using Canvas API
  const convertImage = async () => {
    console.log('Convert image called', { selectedFile, outputFormat });
    
    if (!selectedFile || !outputFormat) {
      console.warn('Missing file or format', { selectedFile: !!selectedFile, outputFormat });
      return;
    }
    
    setIsProcessing(true);
    console.log('Processing started');
    
    try {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      console.log('Canvas created, loading image from:', selectedFile.preview);
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          console.log('Image loaded successfully', { width: img.width, height: img.height });
          resolve();
        };
        img.onerror = (error) => {
          console.error('Image load error:', error);
          reject(new Error('Failed to load image'));
        };
        img.src = selectedFile.preview;
      });
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      console.log('Image drawn to canvas, creating blob with format:', outputFormat);
      
      const blob = await new Promise<Blob | null>((resolve) => {
        // Map format to proper MIME type
        const mimeType = outputFormat === 'jpg' || outputFormat === 'jpeg' 
          ? 'image/jpeg' 
          : outputFormat === 'png' 
          ? 'image/png' 
          : outputFormat === 'webp' 
          ? 'image/webp' 
          : `image/${outputFormat}`;
          
        console.log('Creating blob with MIME type:', mimeType);
        
        // Try to create blob, with fallback for unsupported formats
        try {
          canvas.toBlob((result) => {
            if (result) {
              console.log('Blob created successfully:', result);
              resolve(result);
            } else {
              console.log('Blob creation failed, trying fallback to PNG');
              // Fallback to PNG if the format is not supported
              canvas.toBlob((fallbackResult) => {
                console.log('Fallback blob created:', fallbackResult);
                resolve(fallbackResult);
              }, 'image/png', 0.8);
            }
          }, mimeType, 0.8);
        } catch (error) {
          console.error('Error creating blob:', error);
          // Final fallback to PNG
          canvas.toBlob((fallbackResult) => {
            console.log('Final fallback blob created:', fallbackResult);
            resolve(fallbackResult);
          }, 'image/png', 0.8);
        }
      });
      
      if (blob) {
        const url = URL.createObjectURL(blob);
        const newFileName = `${selectedFile.name.split('.')[0]}.${outputFormat === 'jpeg' ? 'jpg' : outputFormat}`;
        
        console.log('Conversion successful', { fileName: newFileName, blobSize: blob.size });
        
        setConvertedFile({
          downloadUrl: url,
          name: newFileName,
          preview: url
        });
        setIsConverted(true);
      } else {
        throw new Error('Failed to create blob from canvas');
      }
    } catch (error) {
      console.error('Conversion failed:', error);
      // Add user-friendly error handling
      alert(`Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      console.log('Processing ended');
    }
  };

  const downloadFile = () => {
    if (convertedFile) {
      console.log('Downloading file:', convertedFile.name);
      const link = document.createElement('a');
      link.href = convertedFile.downloadUrl;
      link.download = convertedFile.name;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('Download initiated');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden" id="demo" data-tour="converter">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-glow opacity-30"></div>
      
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.div 
            className="relative inline-block mb-6"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="flex items-center justify-center text-primary font-semibold text-lg bg-primary/10 px-4 py-2 rounded-full">
              <ArrowDown className="w-5 h-5 mr-2 animate-bounce" />
              Give it a try!
            </div>
          </motion.div>
          
          <h2 className="text-4xl lg:text-6xl font-bold text-foreground mb-4">
            Convert Files in <span className="text-gradient">3 Simple Steps</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the power of instant, private file conversion right in your browser
          </p>
        </motion.div>

        {/* Main Conversion Interface */}
        <motion.div
          className="flex flex-col xl:flex-row items-center justify-center gap-8 lg:gap-12 mb-16"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          
          {/* Step 1: Upload */}
          <motion.div variants={fadeInUp} className="relative">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-semibold">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                Upload File
              </div>
            </div>
            
            <Card className="w-80 h-80 p-0 overflow-hidden group cursor-pointer">
              <div
                className={`
                  h-full border-2 border-dashed rounded-2xl p-8 
                  flex flex-col items-center justify-center transition-all duration-300
                  ${selectedFile 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-border bg-card hover:border-primary hover:bg-primary/5'
                  }
                `}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onClick={() => !selectedFile && fileInputRef.current?.click()}
              >
                {!selectedFile ? (
                  <>
                    <Upload 
                      size={64} 
                      className="text-muted-foreground mb-6 group-hover:text-primary transition-colors duration-300" 
                    />
                    <p className="text-foreground font-semibold text-center mb-2">
                      Drag 'n' drop files here
                    </p>
                    <p className="text-muted-foreground text-sm text-center mb-4">
                      or click to select files
                    </p>
                    <div className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                      <FileImage size={12} />
                      JPG, PNG, WebP supported
                    </div>
                  </>
                ) : (
                  <motion.div 
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative mb-4">
                      <img
                        src={selectedFile.preview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-xl border-2 border-green-400 shadow-lg"
                      />
                      <motion.div 
                        className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-2 shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                      >
                        <Check size={16} />
                      </motion.div>
                    </div>
                    <p className="font-semibold text-foreground truncate max-w-64 mb-1">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      {formatFileSize(selectedFile.size)}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetConverter();
                      }}
                    >
                      <RefreshCw size={14} className="mr-2" />
                      Change file
                    </Button>
                  </motion.div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onFileInputChange}
                  className="hidden"
                />
              </div>
            </Card>
          </motion.div>

          {/* Step 2: Convert */}
          <motion.div variants={fadeInUp} className="flex flex-col items-center">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-full font-semibold">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                Convert
              </div>
            </div>
            
            {!isConverted ? (
              <div className="text-center space-y-4">
                {/* Format Selection */}
                <Card className="p-6 w-64">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-lg">Output Format</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <select
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value)}
                      className="w-full p-3 border-2 border-input rounded-xl focus:border-primary focus:ring focus:ring-primary/20 transition-all duration-200 bg-background"
                    >
                      <option value="">Select format...</option>
                      <option value="jpeg">JPEG - Smaller size</option>
                      <option value="png">PNG - Transparency</option>
                      <option value="webp">WebP - Best compression</option>
                    </select>
                  </CardContent>
                </Card>

                <Button
                  onClick={convertImage}
                  disabled={!selectedFile || !outputFormat || isProcessing}
                  variant="premium"
                  size="xl"
                  className="group"
                >
                  {isProcessing ? (
                    <>
                      <motion.div 
                        className="mr-3"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <RefreshCw size={20} />
                      </motion.div>
                      Converting...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                      Convert Now
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="p-6 bg-green-50 border-green-200">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  >
                    <Check className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  </motion.div>
                  <CardTitle className="text-green-800 text-lg">
                    Conversion Complete!
                  </CardTitle>
                  <CardDescription className="text-green-700 mt-2">
                    Your image has been successfully converted
                  </CardDescription>
                </Card>
              </motion.div>
            )}
          </motion.div>

          {/* Step 3: Download */}
          <motion.div variants={fadeInUp} className="relative">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                Download
              </div>
            </div>
            
            <Card className="w-80 h-80 p-0 overflow-hidden">
              <div className="h-full border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center">
                  {!isConverted ? (
                    <>
                      <Download size={64} className="text-muted-foreground mb-6" />
                    
                    <p className="text-muted-foreground text-center mb-4">
                      Your converted file will appear here
                    </p>
                    
                    {selectedFile && outputFormat && (
                      <motion.div 
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                        <div className="w-20 h-20 bg-secondary rounded-lg border-2 border-border flex items-center justify-center overflow-hidden">
                          <img
                            src={selectedFile.preview}
                            alt="Output preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">
                          Output: {outputFormat.toUpperCase()}
                        </p>
                      </motion.div>
                    )}
                  </>
                ) : (
                  <motion.div 
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative mb-6">
                      <img
                        src={convertedFile?.preview || ''}
                        alt="Converted"
                        className="w-32 h-32 object-cover rounded-xl border-2 border-green-400 shadow-lg"
                      />
                      <motion.div 
                        className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-2 shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                      >
                        <Check size={16} />
                      </motion.div>
                    </div>
                    
                    <p className="font-semibold text-foreground mb-4 truncate max-w-64">
                      {convertedFile?.name || ''}
                    </p>
                    
                    <Button
                      onClick={downloadFile}
                      variant="premium"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      <Download size={18} className="mr-2" />
                      Download File
                    </Button>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Reset Action */}
        {isConverted && (
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <p className="text-muted-foreground mb-4 text-lg">
              Want to convert another file?
            </p>
            <Button
              onClick={resetConverter}
              variant="secondary_premium"
              size="lg"
            >
              <RefreshCw size={18} className="mr-2" />
              Convert Another File
            </Button>
          </motion.div>
        )}

        {/* Upgrade CTA */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 shadow-strong">
            <CardHeader className="text-center pb-4">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <CardTitle className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
                  ⚡ Love the simplicity? Get the full experience!
                </CardTitle>
              </motion.div>
              <CardDescription className="text-lg text-muted-foreground">
                The desktop app is 3x faster with HEIC support, batch processing, metadata removal, and 20+ formats.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="text-center">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: Zap, text: "Batch Processing" },
                  { icon: FileImage, text: "HEIC Support" },
                  { icon: Download, text: "20+ Formats" },
                  { icon: Check, text: "Privacy First" }
                ].map((feature, index) => (
                  <motion.div 
                    key={feature.text}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/50"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <feature.icon size={20} className="text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {feature.text}
                    </span>
                  </motion.div>
                ))}
              </div>
              
              <Button 
                variant="premium"
                size="xl"
                className="group"
                onClick={() => {
                  // Track upgrade interest
                  if (typeof window !== 'undefined' && (window as any).mixpanel) {
                    (window as any).mixpanel.track('Desktop App CTA Clicked', {
                      source: 'Browser Converter',
                      has_converted: isConverted
                    });
                  }
                  // Scroll to pricing section
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Download className="mr-2 h-5 w-5 group-hover:animate-bounce-subtle" />
                Get Desktop App - $9 Lifetime
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default Minimal3StepConverter;