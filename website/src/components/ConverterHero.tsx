import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, Check, FileImage, Zap, RefreshCw, ArrowRight, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface FileWithPreview extends File {
  preview: string;
}

interface ConvertedFile {
  downloadUrl: string;
  name: string;
  preview: string;
}

const ConverterHero = () => {
  const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(null);
  const [outputFormat, setOutputFormat] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isConverted, setIsConverted] = useState<boolean>(false);
  const [convertedFile, setConvertedFile] = useState<ConvertedFile | null>(null);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

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
      const fileWithPreview = Object.assign(file, {
        preview: URL.createObjectURL(file)
      }) as FileWithPreview;
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
    if (!selectedFile || !outputFormat) return;
    
    setIsProcessing(true);
    
    try {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Could not get canvas context');
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = selectedFile.preview;
      });
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const blob = await new Promise<Blob | null>((resolve) => {
        const mimeType = outputFormat === 'jpg' || outputFormat === 'jpeg' 
          ? 'image/jpeg' 
          : outputFormat === 'png' 
          ? 'image/png' 
          : outputFormat === 'webp' 
          ? 'image/webp' 
          : `image/${outputFormat}`;
        
        canvas.toBlob((result) => {
          if (result) {
            resolve(result);
          } else {
            canvas.toBlob((fallbackResult) => resolve(fallbackResult), 'image/png', 0.8);
          }
        }, mimeType, 0.8);
      });
      
      if (blob) {
        const url = URL.createObjectURL(blob);
        const newFileName = `${selectedFile.name.split('.')[0]}.${outputFormat === 'jpeg' ? 'jpg' : outputFormat}`;
        
        setConvertedFile({
          downloadUrl: url,
          name: newFileName,
          preview: url
        });
        setIsConverted(true);
      }
    } catch (error) {
      console.error('Conversion failed:', error);
      alert(`Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = () => {
    if (convertedFile) {
      const link = document.createElement('a');
      link.href = convertedFile.downloadUrl;
      link.download = convertedFile.name;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    
    // Track signup attempt
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track('Waitlist Signup', {
        source: 'Hero Section',
        email: email
      });
    }

    // Form submission handled via onSubmit
    try {
      // The form action will handle the actual submission
      setIsSubmitted(true);
    } catch (error) {
      console.error('Signup failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-warm/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-6 lg:px-8 relative z-10 pt-16 pb-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Try it free — no signup required
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
              Convert files in
              <br />
              <span className="text-gradient">3 simple steps</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The fastest, most private file converter. Works right in your browser — 
              your files never leave your device.
            </p>
          </motion.div>

          {/* 3-Step Converter */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col xl:flex-row items-center justify-center gap-6 lg:gap-8 mb-16"
          >
            {/* Step 1: Upload */}
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-center mb-3">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-semibold">
                  <div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  Upload
                </div>
              </div>
              
              <Card className="w-72 h-72 p-0 overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div
                  className={`
                    h-full border-2 border-dashed rounded-2xl p-6 
                    flex flex-col items-center justify-center transition-all duration-300 cursor-pointer
                    ${selectedFile 
                      ? 'border-emerald-400 bg-emerald-50/50' 
                      : 'border-border bg-card hover:border-primary/40 hover:bg-primary/5'
                    }
                  `}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  onClick={() => !selectedFile && fileInputRef.current?.click()}
                >
                  {!selectedFile ? (
                    <>
                      <Upload size={48} className="text-muted-foreground mb-4" />
                      <p className="text-foreground font-medium text-center mb-1">
                        Drop file here
                      </p>
                      <p className="text-muted-foreground text-sm text-center mb-3">
                        or click to browse
                      </p>
                      <div className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                        <FileImage size={10} />
                        JPG, PNG, WebP
                      </div>
                    </>
                  ) : (
                    <motion.div 
                      className="text-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="relative mb-3">
                        <img
                          src={selectedFile.preview}
                          alt="Preview"
                          className="w-24 h-24 object-cover rounded-xl border-2 border-emerald-400 shadow-md"
                        />
                        <motion.div 
                          className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1.5 shadow-md"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <Check size={12} />
                        </motion.div>
                      </div>
                      <p className="font-medium text-foreground truncate max-w-48 text-sm mb-1">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        {formatFileSize(selectedFile.size)}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          resetConverter();
                        }}
                        className="text-xs"
                      >
                        <RefreshCw size={12} className="mr-1" />
                        Change
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

            {/* Arrow */}
            <div className="hidden xl:block">
              <ArrowRight className="w-8 h-8 text-muted-foreground/30" />
            </div>

            {/* Step 2: Convert */}
            <motion.div 
              className="flex flex-col items-center"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-center mb-3">
                <div className="inline-flex items-center gap-2 bg-accent-warm/10 text-accent-warm px-3 py-1.5 rounded-full text-sm font-semibold">
                  <div className="w-5 h-5 bg-accent-warm text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  Convert
                </div>
              </div>
              
              {!isConverted ? (
                <Card className="p-6 w-72 border-2 border-transparent hover:border-accent-warm/20 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-base font-semibold">Output Format</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-4">
                    <select
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value)}
                      className="w-full p-3 border-2 border-input rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background text-sm"
                    >
                      <option value="">Select format...</option>
                      <option value="jpeg">JPEG — Smaller size</option>
                      <option value="png">PNG — Transparency</option>
                      <option value="webp">WebP — Best compression</option>
                    </select>

                    <Button
                      onClick={convertImage}
                      disabled={!selectedFile || !outputFormat || isProcessing}
                      variant="premium"
                      className="w-full group"
                    >
                      {isProcessing ? (
                        <>
                          <motion.div 
                            className="mr-2"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <RefreshCw size={16} />
                          </motion.div>
                          Converting...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                          Convert Now
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="p-6 bg-emerald-50/50 border-2 border-emerald-200 w-72 shadow-lg">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                      className="flex justify-center mb-3"
                    >
                      <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                    </motion.div>
                    <CardTitle className="text-emerald-800 text-center text-base mb-1">
                      Done!
                    </CardTitle>
                    <CardDescription className="text-emerald-700 text-center text-sm">
                      Ready to download
                    </CardDescription>
                  </Card>
                </motion.div>
              )}
            </motion.div>

            {/* Arrow */}
            <div className="hidden xl:block">
              <ArrowRight className="w-8 h-8 text-muted-foreground/30" />
            </div>

            {/* Step 3: Download */}
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-center mb-3">
                <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                  <div className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  Download
                </div>
              </div>
              
              <Card className="w-72 h-72 p-0 overflow-hidden border-2 border-transparent hover:border-emerald-200 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="h-full border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center">
                  {!isConverted ? (
                    <>
                      <Download size={48} className="text-muted-foreground mb-4 transition-transform duration-300" />
                      <p className="text-muted-foreground text-center text-sm mb-3">
                        Your converted file will appear here
                      </p>
                      {selectedFile && outputFormat && (
                        <div className="text-center">
                          <div className="w-16 h-16 bg-secondary rounded-lg border border-border flex items-center justify-center overflow-hidden mx-auto mb-2">
                            <img
                              src={selectedFile.preview}
                              alt="Output preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground font-medium">
                            → {outputFormat.toUpperCase()}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <motion.div 
                      className="text-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="relative mb-4">
                        <img
                          src={convertedFile?.preview || ''}
                          alt="Converted"
                          className="w-24 h-24 object-cover rounded-xl border-2 border-emerald-400 shadow-md mx-auto"
                        />
                        <motion.div 
                          className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1.5 shadow-md"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <Check size={12} />
                        </motion.div>
                      </div>
                      
                      <p className="font-medium text-foreground mb-3 truncate max-w-48 text-sm">
                        {convertedFile?.name || ''}
                      </p>
                      
                      <Button
                        onClick={downloadFile}
                        variant="premium"
                        className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
                      >
                        <Download size={16} className="mr-2" />
                        Download
                      </Button>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Convert Another + Waitlist CTA */}
          <motion.div variants={itemVariants} className="text-center">
            {isConverted && (
              <motion.div 
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Button
                  onClick={resetConverter}
                  variant="outline"
                  size="lg"
                  className="group"
                >
                  <RefreshCw size={16} className="mr-2 group-hover:rotate-180 transition-transform duration-500" />
                  Convert Another File
                </Button>
              </motion.div>
            )}

            {/* Waitlist CTA */}
            <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-primary/5 via-background to-accent-warm/5 border-2 border-primary/10 shadow-xl">
              <div className="text-center">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-warm/10 text-accent-warm text-sm font-semibold mb-4"
                >
                  <Zap className="w-4 h-4" />
                  Desktop App Coming Soon
                </motion.div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  Want 10x more power?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                  The desktop app includes batch processing, HEIC support, 20+ formats, 
                  audio conversion, and works completely offline.
                </p>

                {!isSubmitted ? (
                  <>
                  <iframe name="loops-frame" style={{ display: 'none' }} />
                  <form 
                    action="https://app.loops.so/api/newsletter-form/cmjdc4wv302yk0iyy9lc0nbol"
                    method="POST"
                    target="loops-frame"
                    onSubmit={() => {
                      setIsSubmitting(true);
                      // Show success state after form submits to hidden iframe
                      setTimeout(() => {
                        setIsSubmitted(true);
                        setIsSubmitting(false);
                      }, 1000);
                    }}
                    className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                  >
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="flex-1 px-4 py-3 border-2 border-input rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background text-foreground"
                    />
                    <Button
                      type="submit"
                      disabled={isSubmitting || !email}
                      variant="premium"
                      className="group whitespace-nowrap"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </form>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center gap-2 text-emerald-600 font-medium"
                  >
                    <Check className="w-5 h-5" />
                    You're on the list! Check your email.
                  </motion.div>
                )}

                <p className="text-xs text-muted-foreground mt-4">
                  Be among the first to get access. No spam, ever.
                </p>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ConverterHero;
